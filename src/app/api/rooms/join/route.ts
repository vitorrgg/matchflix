import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { friendlyError } from "../_helpers";

// POST — join a room { roomId, userId, nickname }
export async function POST(req: NextRequest) {
  try {
    const { roomId, userId, nickname } = await req.json();

    if (!roomId || !userId || !nickname) {
      return NextResponse.json(
        { error: "roomId, userId e nickname obrigatorios" },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("room_participants")
      .upsert(
        { room_id: roomId, user_id: userId, nickname },
        { onConflict: "room_id,user_id" },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: friendlyError(error) },
        { status: 500 },
      );
    }
    return NextResponse.json({ participant: data });
  } catch (e) {
    return NextResponse.json({ error: friendlyError(e) }, { status: 500 });
  }
}
