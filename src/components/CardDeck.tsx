"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import type {
  TMDBMovie,
  TMDBGenre,
  TMDBWatchProvider,
  FilterState,
  SwipeDirection,
} from "@/types";
import { DURATION_MIN, DURATION_MAX } from "@/types";
import { VIBE_GENRE_MAP } from "@/lib/constants";
import { providerLogoURL } from "@/lib/tmdb";
import { MovieCard } from "./MovieCard";
import { MovieDetailModal } from "./MovieDetailModal";
import { FilterBar } from "./FilterBar";
import { SwipeButtons } from "./SwipeButtons";

interface CardDeckProps {
  /** Filters for solo mode discovery */
  filters?: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
  onSwipe?: (movie: TMDBMovie, direction: SwipeDirection) => void;
  likedMovies?: TMDBMovie[];
  showSummary?: boolean;
  onRestart?: () => void;
  /** Shared movie IDs for room mode — overrides local discovery */
  sharedMovieIds?: number[];
  /** Callback when user finishes all shared movies */
  onAllSwiped?: () => void;
}

export function CardDeck({
  filters: externalFilters,
  onFiltersChange,
  onSwipe,
  likedMovies = [],
  showSummary = false,
  onRestart,
  sharedMovieIds,
  onAllSwiped,
}: CardDeckProps) {
  const isSharedMode = !!sharedMovieIds && sharedMovieIds.length > 0;

  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [movieProviders, setMovieProviders] = useState<
    Record<number, TMDBWatchProvider[]>
  >({});
  const [index, setIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [modalMovieId, setModalMovieId] = useState<number | null>(null);
  const [allDone, setAllDone] = useState(false);

  // Internal filters for solo mode (used when no external filters provided)
  const [internalFilters, setInternalFilters] = useState<FilterState>({
    genreIds: [],
    durationRange: [DURATION_MIN, DURATION_MAX],
    vibe: "any",
    minRating: 0,
    providerIds: [],
  });

  const filters = externalFilters ?? internalFilters;
  const setFilters = onFiltersChange ?? setInternalFilters;
  const providerParam = filters.providerIds.length > 0 ? filters.providerIds.join("|") : "";

  const fetchingRef = useRef(false);

  // Fetch genres once
  useEffect(() => {
    fetch("/api/genres")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setGenres(data);
      })
      .catch(() => {});
  }, []);

  // --- Shared mode: fetch movie details by ID ---
  useEffect(() => {
    if (!isSharedMode) return;

    setLoading(true);
    setAllDone(false);
    setIndex(0);

    const fetchDetails = async () => {
      const results: TMDBMovie[] = [];
      for (const id of sharedMovieIds!) {
        try {
          const res = await fetch(`/api/movies/${id}`);
          if (res.ok) {
            const data = await res.json();
            // Map TMDBMovieDetail to TMDBMovie shape for the card
            results.push({
              id: data.id,
              title: data.title,
              original_title: data.original_title,
              overview: data.overview,
              poster_path: data.poster_path,
              backdrop_path: data.backdrop_path,
              release_date: data.release_date,
              vote_average: data.vote_average,
              vote_count: data.vote_count,
              popularity: data.popularity,
              genre_ids: data.genres?.map((g: { id: number }) => g.id) ?? [],
              adult: data.adult,
              original_language: data.original_language,
              video: false,
            });
          }
        } catch {
          // skip failed fetches
        }
      }
      setMovies(results);
      setLoading(false);
      setNoResults(results.length === 0);
    };

    fetchDetails();
  }, [isSharedMode, sharedMovieIds]);

  // --- Solo mode: discover movies ---
  const getGenreParam = useCallback(() => {
    const ids = new Set<number>();
    for (const id of filters.genreIds) ids.add(id);
    for (const id of VIBE_GENRE_MAP[filters.vibe]) ids.add(id);
    return ids.size > 0 ? Array.from(ids).join(",") : "";
  }, [filters.genreIds, filters.vibe]);

  const fetchMovies = useCallback(
    async (pageNum: number, append: boolean) => {
      if (isSharedMode) return;
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setLoading(true);
      try {
        const genreParam = getGenreParam();
        const qs = new URLSearchParams({ page: String(pageNum) });
        if (genreParam) qs.set("genre", genreParam);
        if (providerParam) qs.set("providers", providerParam);

        const [dMin, dMax] = filters.durationRange;
        if (dMin > DURATION_MIN) qs.set("runtime_gte", String(dMin));
        if (dMax < DURATION_MAX) qs.set("runtime_lte", String(dMax));
        if (filters.minRating > 0) qs.set("vote_gte", String(filters.minRating));

        const res = await fetch(`/api/movies?${qs}`);
        if (!res.ok) {
          if (!append) {
            setMovies([]);
            setIndex(0);
            setNoResults(true);
          }
          return;
        }

        const data = await res.json();

        if (data.results && data.results.length > 0) {
          setMovies((prev) =>
            append ? [...prev, ...data.results] : data.results,
          );
          if (!append) {
            setIndex(0);
            setNoResults(false);
          }
          setExhausted(false);
        } else {
          if (!append) {
            setMovies([]);
            setIndex(0);
            setNoResults(true);
          } else {
            setExhausted(true);
          }
        }
      } catch {
        if (!append) {
          setMovies([]);
          setIndex(0);
          setNoResults(true);
        } else {
          setExhausted(true);
        }
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [isSharedMode, getGenreParam, providerParam, filters.durationRange, filters.minRating],
  );

  // Solo: reset when filters change
  useEffect(() => {
    if (isSharedMode) return;
    setPage(1);
    setMovieProviders({});
    setExhausted(false);
    setNoResults(false);
    fetchMovies(1, false);
  }, [isSharedMode, filters, providerParam, fetchMovies]);

  // Solo: load more when running low
  useEffect(() => {
    if (isSharedMode) return;
    if (exhausted || noResults) return;
    if (index >= movies.length - 3 && !loading && movies.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage, true);
    }
  }, [isSharedMode, index, movies.length, loading, page, fetchMovies, exhausted, noResults]);

  // Fetch watch providers for the current and next card
  useEffect(() => {
    const idsToFetch = [movies[index], movies[index + 1]]
      .filter(Boolean)
      .map((m) => m.id)
      .filter((id) => !(id in movieProviders));

    if (idsToFetch.length === 0) return;

    for (const movieId of idsToFetch) {
      fetch(`/api/movies/${movieId}`)
        .then((r) => r.json())
        .then((data) => {
          const flatrate = data.watchProviders?.flatrate;
          if (flatrate) {
            setMovieProviders((prev) => ({ ...prev, [movieId]: flatrate }));
          } else {
            setMovieProviders((prev) => ({ ...prev, [movieId]: [] }));
          }
        })
        .catch(() => {});
    }
  }, [index, movies, movieProviders]);

  function handleSwipe(direction: SwipeDirection) {
    const movie = movies[index];
    if (movie) {
      onSwipe?.(movie, direction);
    }
    const newIndex = index + 1;
    setIndex(newIndex);

    // In shared mode, check if all movies are done
    if (isSharedMode && newIndex >= movies.length) {
      setAllDone(true);
      onAllSwiped?.();
    }
  }

  const current = movies[index];
  const next = movies[index + 1];

  // Shared mode: waiting for others after finishing
  if (isSharedMode && allDone) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-white/60">
          Esperando os outros terminarem...
        </p>
        <p className="text-xs text-white/30">
          Voce avaliou todos os {movies.length} filmes
        </p>
      </div>
    );
  }

  // Show summary of liked movies (solo mode)
  if (showSummary && likedMovies.length > 0) {
    return (
      <>
        <div className="flex flex-col gap-4 px-4 py-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Seus Matches</h2>
            <p className="mt-1 text-sm text-muted">
              Filmes que voce curtiu nessa sessao
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {likedMovies.map((m) => {
              const providers = movieProviders[m.id];
              return (
                <button
                  key={m.id}
                  onClick={() => setModalMovieId(m.id)}
                  className="overflow-hidden rounded-xl bg-card text-left transition-transform active:scale-[0.97]"
                >
                  <div className="relative">
                    {m.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w342${m.poster_path}`}
                        alt={m.title}
                        className="aspect-[2/3] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[2/3] items-center justify-center bg-card text-xs text-muted">
                        Sem imagem
                      </div>
                    )}
                    {providers && providers.length > 0 && (
                      <div className="absolute bottom-1.5 left-1.5 flex gap-1">
                        {providers.slice(0, 3).map((p) => (
                          <Image
                            key={p.provider_id}
                            src={providerLogoURL(p.logo_path, "w45")}
                            alt={p.provider_name}
                            width={22}
                            height={22}
                            className="rounded shadow ring-1 ring-black/30"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-1 text-xs font-medium text-white">
                      {m.title}
                    </p>
                    <p className="text-[10px] text-muted">
                      TMDB {m.vote_average.toFixed(1)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col items-center gap-3">
            {onRestart && (
              <button
                onClick={onRestart}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white"
              >
                Continuar Descobrindo
              </button>
            )}
          </div>
        </div>
        <MovieDetailModal
          movieId={modalMovieId}
          onClose={() => setModalMovieId(null)}
        />
      </>
    );
  }

  return (
    <>
      {/* Solo mode: show inline filter bar */}
      {!isSharedMode && (
        <FilterBar genres={genres} filters={filters} onChange={setFilters} />
      )}

      {/* Progress indicator for shared mode */}
      {isSharedMode && movies.length > 0 && (
        <div className="px-4 py-2 text-center">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60">
            {Math.min(index + 1, movies.length)} de {movies.length}
          </span>
        </div>
      )}

      {/* Card stack */}
      <div className="relative mx-auto aspect-[2/3] w-full max-w-[340px] sm:max-w-[380px]">
        {loading && movies.length === 0 && !noResults ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          </div>
        ) : noResults || (!current && !loading) ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-card px-6 text-center">
            <svg className="h-12 w-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-white/50">
              Essa combinacao de filtros nao retornou nenhum resultado
            </p>
            {!isSharedMode && (
              <button
                onClick={() =>
                  setFilters({
                    genreIds: [],
                    durationRange: [DURATION_MIN, DURATION_MAX],
                    vibe: "any",
                    minRating: 0,
                    providerIds: [],
                  })
                }
                className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-white"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        ) : current ? (
          <AnimatePresence>
            {next && (
              <div
                key={next.id}
                className="absolute h-full w-full scale-[0.96] overflow-hidden rounded-2xl bg-card opacity-60"
              />
            )}
            <MovieCard
              key={current.id}
              movie={current}
              genres={genres}
              providers={movieProviders[current.id]}
              onSwipe={handleSwipe}
              onClick={() => setModalMovieId(current.id)}
            />
          </AnimatePresence>
        ) : null}
      </div>

      {current && <SwipeButtons onSwipe={handleSwipe} />}

      <MovieDetailModal
        movieId={modalMovieId}
        onClose={() => setModalMovieId(null)}
      />
    </>
  );
}
