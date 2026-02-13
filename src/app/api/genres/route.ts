import { NextResponse } from "next/server";
import { getGenres } from "@/lib/tmdb";

export async function GET() {
  try {
    const genres = await getGenres();
    return NextResponse.json(genres);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 },
    );
  }
}
