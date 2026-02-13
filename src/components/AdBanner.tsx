"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AdBannerProps {
  visible: boolean;
  onDismiss: () => void;
  onRemoveAds: () => void;
}

export function AdBanner({ visible, onDismiss, onRemoveAds }: AdBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            className="relative z-10 mx-4 w-full max-w-sm overflow-hidden rounded-3xl bg-card shadow-2xl"
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Ad content placeholder */}
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/20 via-card to-purple-900/20 p-6 text-center">
              <div className="rounded-full bg-primary/20 p-4">
                <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">
                Curtindo o Matchflix?
              </h3>
              <p className="text-sm text-white/60">
                Remova os anuncios e tenha uma experiencia sem interrupcoes
              </p>
            </div>

            <div className="flex flex-col gap-2 p-4">
              <button
                onClick={onRemoveAds}
                className="rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:scale-[0.98]"
              >
                Remover Anuncios — R$10
              </button>
              <button
                onClick={onDismiss}
                className="rounded-xl py-2.5 text-sm text-muted transition-colors hover:text-white/60 active:scale-[0.98]"
              >
                Continuar com anuncios
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Ad state management ---

const AD_FREE_KEY = "matchflix_ad_free";
const AD_INTERVAL = 10;

export function isAdFree(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AD_FREE_KEY) === "true";
}

export function setAdFree(value: boolean): void {
  localStorage.setItem(AD_FREE_KEY, String(value));
}

export function shouldShowAd(swipeCount: number): boolean {
  if (isAdFree()) return false;
  return swipeCount > 0 && swipeCount % AD_INTERVAL === 0;
}
