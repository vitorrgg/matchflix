"use client";

import { useState, useEffect, useCallback } from "react";
import { PROVIDERS_STORAGE_KEY } from "@/lib/constants";

export function useProviders() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROVIDERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSelectedIds(parsed);
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(PROVIDERS_STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds, loaded]);

  const toggle = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }, []);

  const clear = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Pipe-separated string for TMDB API
  const providerParam = selectedIds.length > 0 ? selectedIds.join("|") : "";

  return { selectedIds, providerParam, toggle, clear, loaded };
}
