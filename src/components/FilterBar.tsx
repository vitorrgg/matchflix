"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TMDBGenre, FilterState, VibeFilter } from "@/types";
import { DURATION_MIN, DURATION_MAX } from "@/types";
import { VIBE_OPTIONS } from "@/lib/constants";

interface FilterBarProps {
  genres: TMDBGenre[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

function DurationRangeSlider({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const [min, max] = value;
  const pctMin = ((min - DURATION_MIN) / (DURATION_MAX - DURATION_MIN)) * 100;
  const pctMax = ((max - DURATION_MIN) / (DURATION_MAX - DURATION_MIN)) * 100;

  function formatTime(m: number) {
    if (m >= DURATION_MAX) return "4h+";
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? `${h}h${r}` : `${h}h`;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-white/70">
        <span>{formatTime(min)}</span>
        <span>{formatTime(max)}</span>
      </div>
      <div className="relative h-6">
        {/* Track background */}
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/10" />
        {/* Active range */}
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={DURATION_MIN}
          max={DURATION_MAX}
          step={10}
          value={min}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v < max) onChange([v, max]);
          }}
          className="range-thumb absolute inset-0 w-full appearance-none bg-transparent"
        />
        {/* Max thumb */}
        <input
          type="range"
          min={DURATION_MIN}
          max={DURATION_MAX}
          step={10}
          value={max}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v > min) onChange([min, v]);
          }}
          className="range-thumb absolute inset-0 w-full appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}

export function FilterBar({ genres, filters, onChange }: FilterBarProps) {
  const [open, setOpen] = useState(false);

  const activeCount =
    filters.genreIds.length +
    (filters.vibe !== "any" ? 1 : 0) +
    (filters.durationRange[0] > DURATION_MIN || filters.durationRange[1] < DURATION_MAX ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0);

  function toggleGenre(id: number) {
    const ids = filters.genreIds.includes(id)
      ? filters.genreIds.filter((g) => g !== id)
      : [...filters.genreIds, id];
    onChange({ ...filters, genreIds: ids });
  }

  function resetFilters() {
    onChange({
      genreIds: [],
      durationRange: [DURATION_MIN, DURATION_MAX],
      vibe: "any",
      minRating: 0,
    });
  }

  return (
    <>
      {/* Compact trigger bar */}
      <div className="flex items-center gap-2 px-4 py-2">
        <button
          onClick={() => setOpen(true)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activeCount > 0
              ? "bg-primary/20 text-primary"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
          {activeCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>

        {/* Quick active filter pills */}
        {filters.genreIds.length > 0 && (
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {filters.genreIds.slice(0, 3).map((id) => {
              const g = genres.find((g) => g.id === id);
              return g ? (
                <span
                  key={id}
                  className="shrink-0 rounded-full bg-white/8 px-2.5 py-1 text-[10px] text-white/60"
                >
                  {g.name}
                </span>
              ) : null;
            })}
            {filters.genreIds.length > 3 && (
              <span className="shrink-0 rounded-full bg-white/8 px-2.5 py-1 text-[10px] text-white/60">
                +{filters.genreIds.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filter drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="relative z-10 flex h-full w-full max-w-xs flex-col bg-card shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h3 className="text-lg font-bold text-white">Filtros</h3>
                <div className="flex items-center gap-2">
                  {activeCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                    >
                      Limpar
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {/* Genres (multi-select) */}
                <div className="mb-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Generos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g) => {
                      const selected = filters.genreIds.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          onClick={() => toggleGenre(g.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            selected
                              ? "bg-primary text-white"
                              : "bg-white/8 text-white/60 hover:bg-white/15"
                          }`}
                        >
                          {g.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration range */}
                <div className="mb-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Duracao
                  </p>
                  <DurationRangeSlider
                    value={filters.durationRange}
                    onChange={(v) => onChange({ ...filters, durationRange: v })}
                  />
                </div>

                {/* Min rating */}
                <div className="mb-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Nota minima (TMDB)
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="text-center text-sm font-medium text-white/80">
                      {filters.minRating > 0 ? filters.minRating.toFixed(1) : "Sem filtro"}
                    </div>
                    <div className="relative h-6">
                      <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/10" />
                      <div
                        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
                        style={{ width: `${(filters.minRating / 10) * 100}%` }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={filters.minRating}
                        onChange={(e) =>
                          onChange({ ...filters, minRating: Number(e.target.value) })
                        }
                        className="range-thumb absolute inset-0 w-full appearance-none bg-transparent"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/40">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>

                {/* Vibe */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Vibe
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {VIBE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          onChange({ ...filters, vibe: opt.value as VibeFilter })
                        }
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          filters.vibe === opt.value
                            ? "bg-primary text-white"
                            : "bg-white/8 text-white/60 hover:bg-white/15"
                        }`}
                      >
                        {opt.emoji} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 px-4 py-3">
                <button
                  onClick={() => setOpen(false)}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:scale-[0.98]"
                >
                  Aplicar Filtros
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
