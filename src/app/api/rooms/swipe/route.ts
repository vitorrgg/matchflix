import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getMovieDetails } from "@/lib/tmdb";
import { friendlyError } from "../_helpers";

// POST — record swipe + check for match
export async function POST(req: NextRequest) {
  try {
    const { roomId, userId, movieId, direction } = await req.json();

    if (!roomId || !userId || !movieId || !direction) {
      return NextResponse.json(
        { error: "Campos obrigatorios: roomId, userId, movieId, direction" },
        { status: 400 },
      );
    }

    const supabase = getSupabase();

    const { error } = await supabase.from("swipes").upsert(
      {
        room_id: roomId,
        user_id: userId,
        movie_id: movieId,
        direction,
      },
      { onConflict: "room_id,user_id,movie_id" },
    );

    if (error) {
      return NextResponse.json(
        { error: friendlyError(error) },
        { status: 500 },
      );
    }

    // Check for match only on right swipes
    if (direction === "right") {
      const { count: participantCount } = await supabase
        .from("room_participants")
        .select("*", { count: "exact", head: true })
        .eq("room_id", roomId);

      const { count: likeCount } = await supabase
        .from("swipes")
        .select("*", { count: "exact", head: true })
        .eq("room_id", roomId)
        .eq("movie_id", movieId)
        .eq("direction", "right");

      if (
        participantCount &&
        likeCount &&
        participantCount > 1 &&
        likeCount >= participantCount
      ) {
        // It's a match — fetch movie info
        try {
          const movie = await getMovieDetails(movieId);
          return NextResponse.json({
            matched: true,
            matchedMovie: {
              movieId,
              title: movie.title,
              posterPath: movie.poster_path,
            },
          });
        } catch {
          return NextResponse.json({
            matched: true,
            matchedMovie: { movieId, title: "Filme", posterPath: null },
          });
        }
      }
    }

    return NextResponse.json({ matched: false });
  } catch (e) {
    return NextResponse.json({ error: friendlyError(e) }, { status: 500 });
  }
}
