import type {
  TMDBMovie,
  TMDBMovieDetail,
  TMDBGenre,
  TMDBVideo,
  TMDBWatchProvider,
  TMDBWatchProvidersResult,
  TMDBPaginatedResponse,
} from "@/types";

const BASE_URL = "https://api.themoviedb.org/3";
const WATCH_REGION = "BR";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY is not set in environment variables");
  }
  return key;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("language", "pt-BR");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// --- Public API functions ---

export interface DiscoverParams {
  page?: number;
  genres?: string;
  providers?: string;
  runtimeGte?: number;
  runtimeLte?: number;
  voteGte?: number;
}

export async function discoverMovies(
  params: DiscoverParams = {},
): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  const query: Record<string, string> = {
    sort_by: "popularity.desc",
    page: String(params.page ?? 1),
    watch_region: WATCH_REGION,
  };

  if (params.genres) query.with_genres = params.genres;
  if (params.providers) query.with_watch_providers = params.providers;
  if (params.runtimeGte) query["with_runtime.gte"] = String(params.runtimeGte);
  if (params.runtimeLte) query["with_runtime.lte"] = String(params.runtimeLte);
  if (params.voteGte) query["vote_average.gte"] = String(params.voteGte);

  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>("/discover/movie", query);
}

export async function getPopularMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>("/movie/popular", {
    page: String(page),
  });
}

export async function getMovieDetails(movieId: number): Promise<TMDBMovieDetail> {
  return tmdbFetch<TMDBMovieDetail>(`/movie/${movieId}`);
}

export async function getGenres(): Promise<TMDBGenre[]> {
  const data = await tmdbFetch<{ genres: TMDBGenre[] }>("/genre/movie/list");
  return data.genres;
}

export async function getMovieVideos(movieId: number): Promise<TMDBVideo[]> {
  const data = await tmdbFetch<{ results: TMDBVideo[] }>(
    `/movie/${movieId}/videos`,
  );
  return data.results;
}

export async function getMovieWatchProviders(
  movieId: number,
): Promise<TMDBWatchProvidersResult | null> {
  const data = await tmdbFetch<{
    results: Record<string, TMDBWatchProvidersResult>;
  }>(`/movie/${movieId}/watch/providers`);
  return data.results[WATCH_REGION] ?? null;
}

export async function getAvailableProviders(): Promise<TMDBWatchProvider[]> {
  const data = await tmdbFetch<{ results: TMDBWatchProvider[] }>(
    "/watch/providers/movie",
    { watch_region: WATCH_REGION },
  );
  return data.results;
}

export function getTrailerKey(videos: TMDBVideo[]): string | null {
  const trailer =
    videos.find(
      (v) => v.site === "YouTube" && v.type === "Trailer" && v.official,
    ) ??
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
    videos.find((v) => v.site === "YouTube");
  return trailer?.key ?? null;
}

// --- Image URL helpers ---

const IMAGE_BASE = "https://image.tmdb.org/t/p";

export function posterURL(path: string | null, size: "w342" | "w500" | "w780" = "w500"): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

export function backdropURL(path: string | null, size: "w780" | "w1280" | "original" = "w1280"): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

export function providerLogoURL(path: string, size: "w45" | "w92" | "w154" = "w92"): string {
  return `${IMAGE_BASE}/${size}${path}`;
}
