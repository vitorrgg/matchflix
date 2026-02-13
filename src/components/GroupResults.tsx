"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MatchedMovie } from "@/types";
import { MovieDetailModal } from "./MovieDetailModal";

interface GroupResultsProps {
  matches: MatchedMovie[];
  onLeave: () => void;
}

export function GroupResults({ matches, onLeave }: GroupResultsProps) {
  const [modalMovieId, setModalMovieId] = useState<number | null>(null);
  const hasMatches = matches.length > 0;

  return (
    <motion.div
      className="flex flex-1 flex-col items-center gap-6 px-4 py-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {hasMatches ? (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              {matches.length === 1 ? "Voces tem um Match!" : `${matches.length} Matches!`}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {matches.length === 1
                ? "Todo mundo curtiu esse filme"
                : "Todo mundo curtiu esses filmes"}
            </p>
          </div>

          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            {matches.map((m, i) => (
              <motion.button
                key={m.movieId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setModalMovieId(m.movieId)}
                className="overflow-hidden rounded-xl bg-card text-left transition-transform active:scale-[0.97]"
              >
                {m.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${m.posterPath}`}
                    alt={m.title}
                    className="aspect-[2/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center bg-card text-xs text-muted">
                    Sem imagem
                  </div>
                )}
                <div className="p-2">
                  <p className="line-clamp-2 text-xs font-medium text-white">
                    {m.title}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <svg className="h-8 w-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Nenhum Match</h2>
            <p className="mt-1 text-sm text-muted">
              Ninguem curtiu os mesmos filmes dessa vez. Tente novamente!
            </p>
          </div>
        </>
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onLeave}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white"
        >
          Voltar ao inicio
        </button>
      </div>

      <MovieDetailModal
        movieId={modalMovieId}
        onClose={() => setModalMovieId(null)}
      />
    </motion.div>
  );
}
