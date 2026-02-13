// --- TMDB API response shapes ---

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  video: boolean;
}

export interface TMDBMovieDetail {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genres: TMDBGenre[];
  runtime: number | null;
  status: string;
  tagline: string | null;
  budget: number;
  revenue: number;
  homepage: string | null;
  imdb_id: string | null;
  original_language: string;
  adult: boolean;
  production_companies: TMDBProductionCompany[];
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
}

export interface TMDBWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface TMDBWatchProvidersResult {
  link?: string;
  flatrate?: TMDBWatchProvider[];
  rent?: TMDBWatchProvider[];
  buy?: TMDBWatchProvider[];
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// --- App-level types ---

export type SwipeDirection = "left" | "right";

export interface FilterState {
  genreIds: number[];
  durationRange: [number, number]; // min, max in minutes
  vibe: VibeFilter;
  minRating: number; // 0-10, 0 = no filter
}

export type VibeFilter = "any" | "fun" | "intense" | "thoughtful" | "romantic";

export const DURATION_MIN = 0;
export const DURATION_MAX = 240;

// --- Supabase / Room types ---

export interface Room {
  id: string;
  code: string;
  created_at: string;
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  nickname: string;
  joined_at: string;
}

export interface Swipe {
  id: string;
  room_id: string;
  user_id: string;
  movie_id: number;
  direction: SwipeDirection;
  created_at: string;
}

export interface MatchedMovie {
  movieId: number;
  title: string;
  posterPath: string | null;
}
