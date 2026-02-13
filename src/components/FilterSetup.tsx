"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { TMDBGenre, TMDBWatchProvider, FilterState, VibeFilter } from "@/types";
import { DURATION_MIN, DURATION_MAX } from "@/types";
import { VIBE_OPTIONS, POPULAR_PROVIDERS } from "@/lib/constants";
import { providerLogoURL } from "@/lib/tmdb";

interface FilterSetupProps {
  mode: "solo" | "room";
  onConfirm: (filters: FilterState) => void;
  loading?: boolean;
  /** Room mode: how many participants are ready */
  readyCount?: number;
  /** Room mode: expected participant count */
  expectedCount?: number;
}

function DurationMaxSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - DURATION_MIN) / (DURATION_MAX - DURATION_MIN)) * 100;

  function formatTime(m: number) {
    if (m >= DURATION_MAX) return "4h+";
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? `${h}h${r}` : `${h}h`;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center text-sm font-medium text-white/80">
        {value >= DURATION_MAX ? "Sem limite" : `Ate ${formatTime(value)}`}
      </div>
      <div className="relative h-6">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={DURATION_MIN}
          max={DURATION_MAX}
          step={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range-thumb absolute inset-0 w-full appearance-none bg-transparent"
        />
      </div>
      <div className="flex justify-between text-[10px] text-white/40">
        <span>0min</span>
        <span>2h</span>
        <span>4h+</span>
      </div>
    </div>
  );
}

export function FilterSetup({
  mode,
  onConfirm,
  loading,
  readyCount,
  expectedCount,
}: FilterSetupProps) {
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [providers, setProviders] = useState<TMDBWatchProvider[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    genreIds: [],
    durationRange: [DURATION_MIN, DURATION_MAX],
    vibe: "any",
    minRating: 0,
    providerIds: [],
  });

  // Load from localStorage for solo mode
  useEffect(() => {
    if (mode === "solo") {
      try {
        const stored = localStorage.getItem("matchflix_providers");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setFilters((f) => ({ ...f, providerIds: parsed }));
          }
        }
      } catch {
        // ignore
      }
    }
  }, [mode]);

  // Fetch genres
  useEffect(() => {
    fetch("/api/genres")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setGenres(data);
      })
      .catch(() => {});
  }, []);

  // Fetch providers
  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProviders(data);
      })
      .catch(() => {});
  }, []);

  function toggleGenre(id: number) {
    setFilters((f) => ({
      ...f,
      genreIds: f.genreIds.includes(id)
        ? f.genreIds.filter((g) => g !== id)
        : [...f.genreIds, id],
    }));
  }

  function toggleProvider(id: number) {
    setFilters((f) => ({
      ...f,
      providerIds: f.providerIds.includes(id)
        ? f.providerIds.filter((p) => p !== id)
        : [...f.providerIds, id],
    }));
  }

  function handleConfirm() {
    // Persist providers to localStorage for solo
    if (mode === "solo") {
      localStorage.setItem(
        "matchflix_providers",
        JSON.stringify(filters.providerIds),
      );
    }
    onConfirm(filters);
  }

  const popularIds = new Set<number>(POPULAR_PROVIDERS.map((p) => p.id));
  const popularProviders = providers.filter((p) =>
    popularIds.has(p.provider_id),
  );
  const otherProviders = providers
    .filter((p) => !popularIds.has(p.provider_id))
    .sort((a, b) => a.display_priority - b.display_priority)
    .slice(0, 12);

  return (
    <motion.div
      className="flex flex-1 flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="px-4 pt-6 pb-2 text-center">
        <h2 className="text-xl font-bold text-white">
          {mode === "solo" ? "O que voce quer assistir?" : "Suas preferencias"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {mode === "solo"
            ? "Defina seus filtros para comecar"
            : "Escolha seus filtros para a sessao em grupo"}
        </p>
        {mode === "room" &&
          readyCount !== undefined &&
          expectedCount !== undefined && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs text-white/70">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              {readyCount} de {expectedCount} prontos
            </div>
          )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Genres */}
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

        {/* Vibe */}
        <div className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Vibe
          </p>
          <div className="flex flex-wrap gap-2">
            {VIBE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    vibe: opt.value as VibeFilter,
                  }))
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

        {/* Duration (max only) */}
        <div className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Duracao maxima
          </p>
          <DurationMaxSlider
            value={filters.durationRange[1]}
            onChange={(v) => setFilters((f) => ({ ...f, durationRange: [DURATION_MIN, v] }))}
          />
        </div>

        {/* Min rating */}
        <div className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Nota minima (TMDB)
          </p>
          <div className="flex flex-col gap-3">
            <div className="text-center text-sm font-medium text-white/80">
              {filters.minRating > 0
                ? filters.minRating.toFixed(1)
                : "Sem filtro"}
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
                  setFilters((f) => ({
                    ...f,
                    minRating: Number(e.target.value),
                  }))
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

        {/* Streaming */}
        <div className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Streamings populares
          </p>
          {popularProviders.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {popularProviders.map((p) => {
                const selected = filters.providerIds.includes(p.provider_id);
                return (
                  <button
                    key={p.provider_id}
                    onClick={() => toggleProvider(p.provider_id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all ${
                      selected
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Image
                      src={providerLogoURL(p.logo_path)}
                      alt={p.provider_name}
                      width={36}
                      height={36}
                      className="rounded-lg"
                    />
                    <span className="line-clamp-1 text-[10px] leading-tight text-white/70">
                      {p.provider_name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {POPULAR_PROVIDERS.map((p) => {
                const selected = filters.providerIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleProvider(p.id)}
                    className={`flex items-center justify-center rounded-xl px-2 py-3 text-xs font-medium transition-all ${
                      selected
                        ? "bg-primary/20 text-primary ring-2 ring-primary"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          )}
          {otherProviders.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-muted">
                Outros
              </p>
              <div className="grid grid-cols-4 gap-2">
                {otherProviders.map((p) => {
                  const selected = filters.providerIds.includes(p.provider_id);
                  return (
                    <button
                      key={p.provider_id}
                      onClick={() => toggleProvider(p.provider_id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all ${
                        selected
                          ? "bg-primary/20 ring-2 ring-primary"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <Image
                        src={providerLogoURL(p.logo_path)}
                        alt={p.provider_name}
                        width={36}
                        height={36}
                        className="rounded-lg"
                      />
                      <span className="line-clamp-1 text-[10px] leading-tight text-white/70">
                        {p.provider_name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          <p className="mt-2 text-center text-[10px] text-white/40">
            {filters.providerIds.length === 0
              ? "Nenhum selecionado — mostrando todos os filmes"
              : `${filters.providerIds.length} servico${filters.providerIds.length > 1 ? "s" : ""} selecionado${filters.providerIds.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Confirm button */}
      <div className="border-t border-white/10 px-4 py-3">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:scale-[0.98] disabled:opacity-40"
        >
          {loading
            ? "Salvando..."
            : mode === "solo"
              ? "Comecar"
              : "Estou Pronto"}
        </button>
      </div>
    </motion.div>
  );
}
