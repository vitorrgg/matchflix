import { NextResponse } from "next/server";
import {
  getMovieDetails,
  getMovieVideos,
  getMovieWatchProviders,
  getTrailerKey,
} from "@/lib/tmdb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const [detail, videos, watchProviders] = await Promise.all([
      getMovieDetails(Number(id)),
      getMovieVideos(Number(id)),
      getMovieWatchProviders(Number(id)),
    ]);

    return NextResponse.json({
      ...detail,
      trailerKey: getTrailerKey(videos),
      watchProviders: watchProviders ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch movie details" },
      { status: 500 },
    );
  }
}
