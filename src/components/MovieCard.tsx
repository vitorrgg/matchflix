"use client";

import { useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import type { TMDBMovie, TMDBGenre, TMDBWatchProvider } from "@/types";
import { posterURL, providerLogoURL } from "@/lib/tmdb";
import { SWIPE_THRESHOLD, SWIPE_VELOCITY } from "@/lib/constants";

interface MovieCardProps {
  movie: TMDBMovie;
  genres: TMDBGenre[];
  providers?: TMDBWatchProvider[];
  onSwipe: (direction: "left" | "right") => void;
  onClick: () => void;
}

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round(rating / 2);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < stars ? "text-yellow-400" : "text-white/20"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm font-medium text-white/80">
        {rating.toFixed(1)}
      </span>
      <span className="ml-1 rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/50">
        TMDB
      </span>
    </div>
  );
}

export function MovieCard({ movie, genres, providers, onSwipe, onClick }: MovieCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const dislikeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const [exiting, setExiting] = useState(false);

  const poster = posterURL(movie.poster_path, "w780");
  const movieGenres = genres.filter((g) => movie.genre_ids.includes(g.id));

  function handleDragEnd(_: unknown, info: PanInfo) {
    const swipedRight =
      info.offset.x > SWIPE_THRESHOLD || info.velocity.x > SWIPE_VELOCITY;
    const swipedLeft =
      info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY;

    if (swipedRight || swipedLeft) {
      setExiting(true);
      const dir = swipedRight ? "right" : "left";
      setTimeout(() => onSwipe(dir), 300);
    }
  }

  return (
    <motion.div
      className="absolute h-full w-full cursor-grab touch-none active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={
        exiting ? { x: x.get() > 0 ? 500 : -500, opacity: 0 } : undefined
      }
      transition={{ type: "spring", damping: 40, stiffness: 300 }}
      onClick={(e) => {
        if (Math.abs(x.get()) < 5) onClick();
        e.stopPropagation();
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Poster */}
        {poster ? (
          <Image
            src={poster}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 90vw, 380px"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-card text-muted">
            Sem imagem
          </div>
        )}

        {/* Provider icons (top-right) */}
        {providers && providers.length > 0 && (
          <div className="absolute right-3 top-3 z-10 flex gap-1.5">
            {providers.slice(0, 4).map((p) => (
              <Image
                key={p.provider_id}
                src={providerLogoURL(p.logo_path, "w45")}
                alt={p.provider_name}
                width={28}
                height={28}
                className="rounded-md shadow-lg ring-1 ring-black/30"
              />
            ))}
          </div>
        )}

        {/* Swipe indicators */}
        <motion.div
          className="absolute left-4 top-6 z-10 rounded-lg border-4 border-green-500 px-4 py-2 font-extrabold text-green-500"
          style={{ opacity: likeOpacity, rotate: -12 }}
        >
          MATCH!
        </motion.div>
        <motion.div
          className="absolute right-4 top-6 z-10 rounded-lg border-4 border-red-500 px-4 py-2 font-extrabold text-red-500"
          style={{ opacity: dislikeOpacity, rotate: 12 }}
        >
          NEXT
        </motion.div>

        {/* Bottom gradient overlay with info */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent px-5 pb-6 pt-20">
          <h3 className="text-2xl font-bold leading-tight text-white drop-shadow-lg">
            {movie.title}
          </h3>

          <div className="mt-2">
            <StarRating rating={movie.vote_average} />
          </div>

          {movieGenres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {movieGenres.slice(0, 3).map((g) => (
                <span
                  key={g.id}
                  className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white/90 backdrop-blur-sm"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {movie.overview && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/70">
              {movie.overview}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
