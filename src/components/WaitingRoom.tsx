"use client";

import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import type { RoomParticipant } from "@/types";

interface WaitingRoomProps {
  participants: RoomParticipant[];
  roomCode: string;
  shareUrl: string;
  expectedCount: number;
  onLeave: () => void;
}

export function WaitingRoom({
  participants,
  roomCode,
  shareUrl,
  expectedCount,
  onLeave,
}: WaitingRoomProps) {
  const readyCount = participants.filter((p) => p.filters_ready).length;
  const joinedCount = participants.length;

  return (
    <motion.div
      className="flex flex-1 flex-col items-center gap-6 px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Spinner */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-white">Esperando o grupo</h2>
        <p className="mt-2 text-sm text-muted">
          {joinedCount < expectedCount
            ? `${joinedCount} de ${expectedCount} entraram na sala`
            : `${readyCount} de ${expectedCount} definiram seus filtros`}
        </p>
      </div>

      {/* Room code + QR */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Sala
          </span>
          <span className="rounded bg-primary/20 px-3 py-1 font-mono text-lg font-bold text-primary">
            {roomCode}
          </span>
        </div>

        {shareUrl && (
          <div className="rounded-xl bg-white p-3">
            <QRCodeSVG value={shareUrl} size={140} />
          </div>
        )}

        <button
          onClick={() => {
            navigator.clipboard.writeText(shareUrl);
          }}
          className="rounded-full bg-white/10 px-5 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/15"
        >
          Copiar link
        </button>
      </div>

      {/* Participants list */}
      <div className="w-full max-w-xs">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Participantes
        </p>
        <div className="flex flex-col gap-2">
          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5"
            >
              <span className="text-sm font-medium text-white/80">
                {p.nickname}
              </span>
              {p.filters_ready ? (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pronto
                </span>
              ) : (
                <span className="text-xs text-white/40">Escolhendo filtros...</span>
              )}
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, expectedCount - joinedCount) }).map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center rounded-xl border border-dashed border-white/10 px-4 py-2.5"
              >
                <span className="text-xs text-white/30">
                  Esperando entrar...
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      <button
        onClick={onLeave}
        className="mt-2 text-xs text-red-400 hover:text-red-300"
      >
        Sair da sala
      </button>
    </motion.div>
  );
}
