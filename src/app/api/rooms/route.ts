import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { friendlyError } from "./_helpers";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// POST — create a new room
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const expectedCount = Math.min(10, Math.max(2, Number(body.expectedCount) || 2));
    const movieCount = Math.min(30, Math.max(10, Number(body.movieCount) || 20));

    const supabase = getSupabase();
    const code = generateCode();

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        code,
        expected_count: expectedCount,
        movie_count: movieCount,
        status: "waiting",
        movie_ids: [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: friendlyError(error) },
        { status: 500 },
      );
    }
    return NextResponse.json({ room: data });
  } catch (e) {
    return NextResponse.json({ error: friendlyError(e) }, { status: 500 });
  }
}

// GET — find room by code (?code=ABC123)
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Codigo obrigatorio" }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("rooms")
      .select()
      .eq("code", code.toUpperCase())
      .single();

    return NextResponse.json({ room: data ?? null });
  } catch (e) {
    return NextResponse.json({ error: friendlyError(e) }, { status: 500 });
  }
}
