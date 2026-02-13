import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { friendlyError } from "../_helpers";

// POST — record swipe (match detection moved to poll/results)
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

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: friendlyError(e) }, { status: 500 });
  }
}
