"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { MatchedMovie } from "@/types";
import { posterURL } from "@/lib/tmdb";

interface MatchCelebrationProps {
  match: MatchedMovie | null;
  onDismiss: () => void;
}

// Confetti particle component
function Confetti({ delay, x }: { delay: number; x: number }) {
  const colors = ["#e50914", "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      className="absolute top-0 h-3 w-2 rounded-sm"
      style={{ left: `${x}%`, backgroundColor: color }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: "100vh",
        opacity: [1, 1, 0],
        rotate: Math.random() * 720 - 360,
        x: (Math.random() - 0.5) * 200,
      }}
      transition={{
        duration: 2.5 + Math.random(),
        delay,
        ease: "easeIn",
      }}
    />
  );
}

export function MatchCelebration({ match, onDismiss }: MatchCelebrationProps) {
  const poster = match ? posterURL(match.posterPath, "w342") : null;

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* Confetti */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 40 }, (_, i) => (
              <Confetti
                key={i}
                delay={i * 0.05}
                x={Math.random() * 100}
              />
            ))}
          </div>

          {/* Card */}
          <motion.div
            className="relative z-10 flex max-w-sm flex-col items-center gap-6 px-6 text-center"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute -inset-8 rounded-full bg-primary/20 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <motion.h2
              className="relative text-5xl font-black text-primary drop-shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              MATCH!
            </motion.h2>

            <p className="relative text-lg text-white/80">
              Todo mundo curtiu o mesmo filme!
            </p>

            {/* Movie poster */}
            {poster && (
              <motion.div
                className="relative aspect-[2/3] w-48 overflow-hidden rounded-2xl shadow-2xl ring-2 ring-primary/50"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Image
                  src={poster}
                  alt={match.title}
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              </motion.div>
            )}

            <motion.p
              className="relative text-xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {match.title}
            </motion.p>

            <motion.button
              onClick={onDismiss}
              className="relative mt-2 rounded-full bg-primary px-8 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-primary-hover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Continuar
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
