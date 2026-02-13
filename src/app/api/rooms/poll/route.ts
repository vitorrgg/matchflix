import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getMovieDetails } from "@/lib/tmdb";
import { friendlyError } from "../_helpers";

// GET — poll participants + detect new matches
// ?room_id=X&dismissed=movieId1,movieId2
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

    // Fetch participants
    const { data: participants } = await supabase
      .from("room_participants")
      .select()
      .eq("room_id", roomId)
      .order("joined_at");

    const participantCount = participants?.length ?? 0;

    // Check for matches (only if 2+ participants)
    let match = null;
    if (participantCount >= 2) {
      const dismissed =
        req.nextUrl.searchParams
          .get("dismissed")
          ?.split(",")
          .filter(Boolean)
          .map(Number) ?? [];

      const { data: rightSwipes } = await supabase
        .from("swipes")
        .select("movie_id")
        .eq("room_id", roomId)
        .eq("direction", "right");

      // Count likes per movie
      const counts: Record<number, number> = {};
      for (const s of rightSwipes ?? []) {
        counts[s.movie_id] = (counts[s.movie_id] ?? 0) + 1;
      }

      // Find first non-dismissed match
      for (const [movieIdStr, count] of Object.entries(counts)) {
        const id = Number(movieIdStr);
        if (count >= participantCount && !dismissed.includes(id)) {
          try {
            const movie = await getMovieDetails(id);
            match = {
              movieId: id,
              title: movie.title,
              posterPath: movie.poster_path,
            };
          } catch {
            match = { movieId: id, title: "Filme", posterPath: null };
          }
          break;
        }
      }
    }

    return NextResponse.json({
      participants: participants ?? [],
      match,
    });
  } catch (e) {
    return NextResponse.json({ error: friendlyError(e) }, { status: 500 });
  }
}
