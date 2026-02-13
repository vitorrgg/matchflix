"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { TMDBMovieDetail, TMDBWatchProvidersResult } from "@/types";
import { posterURL, providerLogoURL } from "@/lib/tmdb";

interface MovieDetailModalProps {
  movieId: number | null;
  onClose: () => void;
}

type DetailWithExtras = TMDBMovieDetail & {
  trailerKey: string | null;
  watchProviders: TMDBWatchProvidersResult | null;
};

export function MovieDetailModal({ movieId, onClose }: MovieDetailModalProps) {
  const [movie, setMovie] = useState<DetailWithExtras | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!movieId) {
      setMovie(null);
      return;
    }

    setLoading(true);
    fetch(`/api/movies/${movieId}`)
      .then((r) => r.json())
      .then((data) => setMovie(data))
      .catch(() => setMovie(null))
      .finally(() => setLoading(false));
  }, [movieId]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const open = movieId !== null;
  const flatrate = movie?.watchProviders?.flatrate;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-card sm:rounded-3xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="overflow-y-auto">
              {loading && (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}

              {!loading && movie && (
                <>
                  {movie.trailerKey ? (
                    <div className="relative aspect-video w-full">
                      <iframe
                        src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=0&rel=0`}
                        title={`${movie.title} trailer`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    movie.poster_path && (
                      <div className="relative aspect-video w-full">
                        <Image
                          src={posterURL(movie.poster_path, "w780")!}
                          alt={movie.title}
                          fill
                          className="object-cover"
                          sizes="512px"
                        />
                      </div>
                    )
                  )}

                  <div className="flex flex-col gap-4 p-5">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {movie.title}
                      </h2>
                      {movie.tagline && (
                        <p className="mt-1 text-sm italic text-muted">
                          {movie.tagline}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                      {movie.release_date && (
                        <span>{movie.release_date.slice(0, 4)}</span>
                      )}
                      {movie.runtime && <span>{movie.runtime} min</span>}
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>

                    {movie.genres.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {movie.genres.map((g) => (
                          <span
                            key={g.id}
                            className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Streaming providers + Deep Link */}
                    {flatrate && flatrate.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                          Disponivel em
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {flatrate.map((p) => (
                            <div
                              key={p.provider_id}
                              className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5"
                            >
                              <Image
                                src={providerLogoURL(p.logo_path, "w45")}
                                alt={p.provider_name}
                                width={24}
                                height={24}
                                className="rounded"
                              />
                              <span className="text-xs text-white/70">
                                {p.provider_name}
                              </span>
                            </div>
                          ))}
                        </div>

                        {movie.watchProviders?.link && (
                          <a
                            href={movie.watchProviders.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:scale-[0.98]"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Assistir Agora
                          </a>
                        )}
                      </div>
                    )}

                    {movie.overview && (
                      <p className="text-sm leading-relaxed text-white/70">
                        {movie.overview}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
