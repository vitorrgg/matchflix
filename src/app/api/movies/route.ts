import { NextRequest, NextResponse } from "next/server";
import { discoverMovies, getPopularMovies } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const genre = searchParams.get("genre");
  const providers = searchParams.get("providers");
  const runtimeGte = searchParams.get("runtime_gte");
  const runtimeLte = searchParams.get("runtime_lte");
  const voteGte = searchParams.get("vote_gte");
  const page = Number(searchParams.get("page") ?? "1");

  try {
    // Use discover endpoint when any filter is active
    const hasFilters = genre || providers || runtimeGte || runtimeLte || voteGte;

    const data = hasFilters
      ? await discoverMovies({
          page,
          genres: genre ?? undefined,
          providers: providers ?? undefined,
          runtimeGte: runtimeGte ? Number(runtimeGte) : undefined,
          runtimeLte: runtimeLte ? Number(runtimeLte) : undefined,
          voteGte: voteGte ? Number(voteGte) : undefined,
        })
      : await getPopularMovies(page);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 },
    );
  }
}
