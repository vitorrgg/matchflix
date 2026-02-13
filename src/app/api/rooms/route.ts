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
export async function POST() {
  try {
    const supabase = getSupabase();
    const code = generateCode();

    const { data, error } = await supabase
      .from("rooms")
      .insert({ code })
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
