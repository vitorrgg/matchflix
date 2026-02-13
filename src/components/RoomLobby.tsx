"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RoomParticipant } from "@/types";

interface RoomLobbyProps {
  participants: RoomParticipant[];
  roomCode: string;
  shareUrl: string;
  loading: boolean;
  error: string | null;
  onCreateRoom: (nickname: string) => void;
  onJoinRoom: (code: string, nickname: string) => void;
  onLeave: () => void;
  /** If set, skip the create/join screen and go straight to the room */
  inRoom: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/20 active:scale-95"
    >
      {copied ? "Copiado!" : "Copiar link"}
    </button>
  );
}

export function RoomLobby({
  participants,
  roomCode,
  shareUrl,
  loading,
  error,
  onCreateRoom,
  onJoinRoom,
  onLeave,
  inRoom,
}: RoomLobbyProps) {
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");

  function handleCreate() {
    if (!nickname.trim()) return;
    onCreateRoom(nickname.trim());
  }

  function handleJoin() {
    if (!nickname.trim() || !code.trim()) return;
    onJoinRoom(code.trim().toUpperCase(), nickname.trim());
  }

  // In-room view: show participants and share link
  if (inRoom) {
    return (
      <div className="mx-4 rounded-2xl bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Sala
            </span>
            <span className="ml-2 rounded bg-primary/20 px-2 py-0.5 font-mono text-sm font-bold text-primary">
              {roomCode}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={shareUrl} />
            <button
              onClick={onLeave}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted">Participantes:</span>
          <div className="flex flex-wrap gap-1.5">
            {participants.map((p) => (
              <span
                key={p.id}
                className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80"
              >
                {p.nickname}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Create/Join menu
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8">
      <h2 className="text-xl font-bold">Assistir em grupo</h2>
      <p className="max-w-xs text-center text-sm text-muted">
        Crie uma sala e convide seus amigos. Quando todos derem Like no mesmo
        filme, e um Match!
      </p>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <AnimatePresence mode="wait">
        {mode === "menu" && (
          <motion.div
            key="menu"
            className="flex w-full max-w-xs flex-col gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <button
              onClick={() => setMode("create")}
              className="rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Criar Sala
            </button>
            <button
              onClick={() => setMode("join")}
              className="rounded-xl bg-white/10 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/15"
            >
              Entrar com Codigo
            </button>
          </motion.div>
        )}

        {mode === "create" && (
          <motion.div
            key="create"
            className="flex w-full max-w-xs flex-col gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <input
              type="text"
              placeholder="Seu apelido"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={loading || !nickname.trim()}
              className="rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
            >
              {loading ? "Criando..." : "Criar Sala"}
            </button>
            <button
              onClick={() => setMode("menu")}
              className="text-xs text-muted hover:text-white/60"
            >
              Voltar
            </button>
          </motion.div>
        )}

        {mode === "join" && (
          <motion.div
            key="join"
            className="flex w-full max-w-xs flex-col gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <input
              type="text"
              placeholder="Seu apelido"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              placeholder="Codigo da sala (ex: ABC123)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="rounded-xl bg-white/10 px-4 py-3 text-center font-mono text-lg tracking-widest text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            <button
              onClick={handleJoin}
              disabled={loading || !nickname.trim() || code.length < 6}
              className="rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
            >
              {loading ? "Entrando..." : "Entrar na Sala"}
            </button>
            <button
              onClick={() => setMode("menu")}
              className="text-xs text-muted hover:text-white/60"
            >
              Voltar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
