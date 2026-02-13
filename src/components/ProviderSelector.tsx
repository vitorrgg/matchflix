"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { TMDBWatchProvider } from "@/types";
import { providerLogoURL } from "@/lib/tmdb";
import { POPULAR_PROVIDERS } from "@/lib/constants";

interface ProviderSelectorProps {
  open: boolean;
  onClose: () => void;
  selectedIds: number[];
  onToggle: (id: number) => void;
  onClear: () => void;
}

export function ProviderSelector({
  open,
  onClose,
  selectedIds,
  onToggle,
  onClear,
}: ProviderSelectorProps) {
  const [providers, setProviders] = useState<TMDBWatchProvider[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || providers.length > 0) return;
    setLoading(true);
    fetch("/api/providers")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProviders(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, providers.length]);

  // Show popular providers first, then the rest
  const popularIds = new Set<number>(POPULAR_PROVIDERS.map((p) => p.id));
  const popular = providers.filter((p) => popularIds.has(p.provider_id));
  const others = providers
    .filter((p) => !popularIds.has(p.provider_id))
    .sort((a, b) => a.display_priority - b.display_priority)
    .slice(0, 20);

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
            className="relative z-10 flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-card sm:rounded-3xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Meus Streamings
                </h2>
                <p className="text-xs text-muted">
                  Selecione os servicos que voce assina
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedIds.length > 0 && (
                  <button
                    onClick={onClear}
                    className="rounded-lg px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    Limpar
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-5 py-4">
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}

              {!loading && popular.length > 0 && (
                <>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Populares
                  </p>
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {popular.map((p) => (
                      <ProviderChip
                        key={p.provider_id}
                        provider={p}
                        selected={selectedIds.includes(p.provider_id)}
                        onToggle={onToggle}
                      />
                    ))}
                  </div>
                </>
              )}

              {!loading && others.length > 0 && (
                <>
                  <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-muted">
                    Outros
                  </p>
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {others.map((p) => (
                      <ProviderChip
                        key={p.provider_id}
                        provider={p}
                        selected={selectedIds.includes(p.provider_id)}
                        onToggle={onToggle}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer count */}
            <div className="border-t border-white/10 px-5 py-3 text-center text-xs text-muted">
              {selectedIds.length === 0
                ? "Nenhum filtro — mostrando todos os filmes"
                : `${selectedIds.length} servico${selectedIds.length > 1 ? "s" : ""} selecionado${selectedIds.length > 1 ? "s" : ""}`}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProviderChip({
  provider,
  selected,
  onToggle,
}: {
  provider: TMDBWatchProvider;
  selected: boolean;
  onToggle: (id: number) => void;
}) {
  return (
    <button
      onClick={() => onToggle(provider.provider_id)}
      className={`flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all ${
        selected
          ? "bg-primary/20 ring-2 ring-primary"
          : "bg-white/5 hover:bg-white/10"
      }`}
    >
      <Image
        src={providerLogoURL(provider.logo_path)}
        alt={provider.provider_name}
        width={40}
        height={40}
        className="rounded-lg"
      />
      <span className="line-clamp-1 text-[10px] leading-tight text-white/70">
        {provider.provider_name}
      </span>
    </button>
  );
}
