"use client";

// Monetization disabled for now — keep imports for future activation
// import { useState, useEffect } from "react";
// import { isAdFree, setAdFree } from "./AdBanner";

interface SettingsPageProps {
  streamingCount: number;
  onStreamingClick: () => void;
}

export function SettingsPage({ streamingCount, onStreamingClick }: SettingsPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <h2 className="text-xl font-bold text-white">Ajustes</h2>

      {/* Streaming Services */}
      <button
        onClick={onStreamingClick}
        className="flex items-center gap-4 rounded-2xl bg-card p-4 text-left transition-colors active:bg-white/5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/20">
          <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white">Streamings populares</p>
          <p className="text-xs text-muted">
            {streamingCount > 0
              ? `${streamingCount} servico${streamingCount > 1 ? "s" : ""} selecionado${streamingCount > 1 ? "s" : ""}`
              : "Nenhum servico selecionado"}
          </p>
        </div>
        <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* About */}
      <div className="rounded-2xl bg-card p-4">
        <p className="font-semibold text-white">Sobre</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Matchflix e um recomendador de filmes para voce e seus amigos.
          Deslize para a direita nos filmes que curte e encontre o match perfeito
          para a noite de cinema.
        </p>
        <p className="mt-3 text-[10px] text-white/30">
          Dados fornecidos por TMDB. Este produto usa a API do TMDB mas nao e
          endossado ou certificado pelo TMDB.
        </p>
      </div>
    </div>
  );
}
