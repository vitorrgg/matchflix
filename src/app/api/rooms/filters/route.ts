import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { discoverMovies } from "@/lib/tmdb";
import { VIBE_GENRE_MAP } from "@/lib/constants";
import { friendlyError } from "../_helpers";
import type { VibeFilter } from "@/types";

interface FilterData {
  genreIds: number[];
  vibe: VibeFilter;
  durationRange: [number, number];
  minRating: number;
  providerIds: number[];
}

function mergeFilters(filters: FilterData[]): {
  genres: string;
  providers: string;
  runtimeGte?: number;
  runtimeLte?: number;
  voteGte?: number;
} {
  const genreSet = new Set<number>();
  const providerSet = new Set<number>();
  let durationMin = 240;
  let durationMax = 0;
  let minRating = 10;

  for (const f of filters) {
    for (const id of f.genreIds) genreSet.add(id);
    for (const id of VIBE_GENRE_MAP[f.vibe] ?? []) genreSet.add(id);
    for (const id of f.providerIds) providerSet.add(id);
    durationMin = Math.min(durationMin, f.durationRange[0]);
    durationMax = Math.max(durationMax, f.durationRange[1]);
    minRating = Math.min(minRating, f.minRating);
  }

  return {
    genres: genreSet.size > 0 ? Array.from(genreSet).join(",") : "",
    providers: providerSet.size > 0 ? Array.from(providerSet).join("|") : "",
    runtimeGte: durationMin > 0 ? durationMin : undefined,
    runtimeLte: durationMax < 240 ? durationMax : undefined,
    voteGte: minRating > 0 ? minRating : undefined,
  };
}

// POST — submit filters for a participant
export async function POST(req: NextRequest) {
  try {
    const { roomId, userId, filterData } = await req.json();

    if (!roomId || !userId || !filterData) {
      return NextResponse.json(
        { error: "Campos obrigatorios: roomId, userId, filterData" },
        { status: 400 },
      );
    }

    const supabase = getSupabase();

    // Update participant's filters
    const { error: updateError } = await supabase
      .from("room_participants")
      .update({ filter_data: filterData, filters_ready: true })
      .eq("room_id", roomId)
      .eq("user_id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: friendlyError(updateError) },
        { status: 500 },
      );
    }

    // Check if all participants are ready
    const { data: room } = await supabase
      .from("rooms")
      .select()
      .eq("id", roomId)
      .single();

    if (!room || room.status !== "waiting") {
      return NextResponse.json({ ready: room?.status === "swiping" });
    }

    const { data: participants } = await supabase
      .from("room_participants")
      .select()
      .eq("room_id", roomId);

    const readyCount = (participants ?? []).filter(
      (p: { filters_ready: boolean }) => p.filters_ready,
    ).length;
    const totalJoined = participants?.length ?? 0;

    if (
      totalJoined >= room.expected_count &&
      readyCount >= room.expected_count
    ) {
      // All ready — merge filters, fetch movies, start swiping
      const allFilters = (participants ?? [])
        .filter((p: { filters_ready: boolean }) => p.filters_ready)
        .map((p: { filter_data: FilterData }) => p.filter_data as FilterData);

      const merged = mergeFilters(allFilters);

      // Fetch enough movies
      const movieIds: number[] = [];
      const targetCount = room.movie_count as number;
      let page = 1;
      const maxPages = 3;

      while (movieIds.length < targetCount && page <= maxPages) {
        const data = await discoverMovies({
          page,
          genres: merged.genres || undefined,
          providers: merged.providers || undefined,
          runtimeGte: merged.runtimeGte,
          runtimeLte: merged.runtimeLte,
          voteGte: merged.voteGte,
        });

        for (const movie of data.results) {
          if (movieIds.length >= targetCount) break;
          movieIds.push(movie.id);
        }

        if (page >= data.total_pages) break;
        page++;
      }

      // Transition room to swiping (conditional to avoid race)
      await supabase
        .from("rooms")
        .update({ status: "swiping", movie_ids: movieIds })
        .eq("id", roomId)
        .eq("status", "waiting");

      return NextResponse.json({ ready: true });
    }

    return NextResponse.json({
      ready: false,
      readyCount,
      expectedCount: room.expected_count,
      totalJoined,
    });
  } catch (e) {
    return NextResponse.json({ error: friendlyError(e) }, { status: 500 });
  }
}
