import type { VibeFilter } from "@/types";

export const APP_NAME = "Matchflix";
export const APP_DESCRIPTION = "Descubra filmes que combinam com você";

export const SWIPE_THRESHOLD = 120;
export const SWIPE_VELOCITY = 500;

export const VIBE_OPTIONS: { value: VibeFilter; label: string; emoji: string }[] = [
  { value: "any", label: "Qualquer", emoji: "🎬" },
  { value: "fun", label: "Diversão", emoji: "😂" },
  { value: "intense", label: "Intenso", emoji: "🔥" },
  { value: "thoughtful", label: "Reflexivo", emoji: "🧠" },
  { value: "romantic", label: "Romântico", emoji: "💕" },
];

// Well-known streaming providers (TMDB IDs for BR region)
export const POPULAR_PROVIDERS = [
  { id: 8,   name: "Netflix" },
  { id: 119, name: "Amazon Prime Video" },
  { id: 337, name: "Disney+" },
  { id: 384, name: "Max" },
  { id: 350, name: "Apple TV+" },
  { id: 307, name: "Globoplay" },
  { id: 531, name: "Paramount+" },
  { id: 283, name: "Crunchyroll" },
] as const;

export const PROVIDERS_STORAGE_KEY = "matchflix_providers";

// TMDB genre IDs mapped to vibes
export const VIBE_GENRE_MAP: Record<VibeFilter, number[]> = {
  any: [],
  fun: [35, 16, 10751],       // Comedy, Animation, Family
  intense: [28, 53, 27],      // Action, Thriller, Horror
  thoughtful: [18, 99, 36],   // Drama, Documentary, History
  romantic: [10749, 18],       // Romance, Drama
};
