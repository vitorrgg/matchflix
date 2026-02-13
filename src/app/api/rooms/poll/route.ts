import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getMovieDetails } from "@/lib/tmdb";
import { friendlyError } from "../_helpers";

// GET — poll room state, participants, and matches
// ?room_id=X
export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get("room_id");
  if (!roomId) {
    return NextResponse.json(
      { error: "room_id obrigatorio" },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabase();

    // Fetch room
    const { data: room } = await supabase
      .from("rooms")
      .select()
      .eq("id", roomId)
      .single();

    if (!room) {
      return NextResponse.json({ error: "Sala nao encontrada" }, { status: 404 });
    }

    // Fetch participants (with filters_ready)
    const { data: participants } = await supabase
      .from("room_participants")
      .select("id, room_id, user_id, nickname, joined_at, filters_ready")
      .eq("room_id", roomId)
      .order("joined_at");

    const participantList = participants ?? [];
    const participantCount = participantList.length;

    // Check for transition: swiping → results
    let matches: { movieId: number; title: string; posterPath: string | null }[] | null = null;

    if (room.status === "swiping" && participantCount >= room.expected_count) {
      const movieIds: number[] = room.movie_ids ?? [];
      const movieCount = movieIds.length;

      // Count swipes per user
      const { data: swipes } = await supabase
        .from("swipes")
        .select("user_id, movie_id, direction")
        .eq("room_id", roomId);

      const swipeList = swipes ?? [];
      const swipeCountPerUser: Record<string, number> = {};
      for (const s of swipeList) {
        swipeCountPerUser[s.user_id] = (swipeCountPerUser[s.user_id] ?? 0) + 1;
      }

      // Check if all participants have swiped all movies
      const allDone = participantList.every(
        (p: { user_id: string }) => (swipeCountPerUser[p.user_id] ?? 0) >= movieCount,
      );

      if (allDone && movieCount > 0) {
        // Transition to results
        await supabase
          .from("rooms")
          .update({ status: "results" })
          .eq("id", roomId)
          .eq("status", "swiping");

        room.status = "results";
      }
    }

    // Compute matches when in results state
    if (room.status === "results") {
      const movieIds: number[] = room.movie_ids ?? [];

      const { data: rightSwipes } = await supabase
        .from("swipes")
        .select("movie_id, user_id")
        .eq("room_id", roomId)
        .eq("direction", "right");

      // Count right-swipes per movie
      const likeCounts: Record<number, number> = {};
      for (const s of rightSwipes ?? []) {
        likeCounts[s.movie_id] = (likeCounts[s.movie_id] ?? 0) + 1;
      }

      // A match = all participants swiped right
      const matchedIds = movieIds.filter(
        (id) => (likeCounts[id] ?? 0) >= participantCount,
      );

      matches = [];
      for (const id of matchedIds) {
        try {
          const movie = await getMovieDetails(id);
          matches.push({
            movieId: id,
            title: movie.title,
            posterPath: movie.poster_path,
          });
        } catch {
          matches.push({ movieId: id, title: "Filme", posterPath: null });
        }
      }
    }

    return NextResponse.json({
      participants: participantList,
      room: {
        status: room.status,
        expected_count: room.expected_count,
        movie_count: room.movie_count,
        movie_ids: room.movie_ids ?? [],
      },
      matches,
    });
  } catch (e) {
    return NextResponse.json({ error: friendlyError(e) }, { status: 500 });
  }
}
