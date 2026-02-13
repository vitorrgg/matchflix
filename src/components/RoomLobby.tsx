"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RoomLobbyProps {
  loading: boolean;
  error: string | null;
  onCreateRoom: (nickname: string, expectedCount: number, movieCount: number) => void;
  onJoinRoom: (code: string, nickname: string) => void;
  /** Pre-fill code from URL param — auto-switches to join mode */
  initialCode?: string;
  /** Skip the menu and go directly to create or join */
  initialMode?: "create" | "join";
}

export function RoomLobby({
  loading,
  error,
  onCreateRoom,
  onJoinRoom,
  initialCode,
  initialMode,
}: RoomLobbyProps) {
  const hasInitialCode = !!initialCode;
  const [mode, setMode] = useState<"menu" | "create" | "join">(
    hasInitialCode ? "join" : initialMode ?? "menu",
  );
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState(initialCode?.toUpperCase() ?? "");
  const [expectedCount, setExpectedCount] = useState(2);
  const [movieCount, setMovieCount] = useState(20);

  function handleCreate() {
    if (!nickname.trim()) return;
    onCreateRoom(nickname.trim(), expectedCount, movieCount);
  }

  function handleJoin() {
    if (!nickname.trim() || !code.trim()) return;
    onJoinRoom(code.trim().toUpperCase(), nickname.trim());
  }

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
            />

            {/* Expected participants */}
            <div className="rounded-xl bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Participantes</span>
                <span className="text-sm font-bold text-white">{expectedCount}</span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                value={expectedCount}
                onChange={(e) => setExpectedCount(Number(e.target.value))}
                className="range-thumb mt-2 w-full appearance-none bg-transparent"
              />
              <div className="flex justify-between text-[10px] text-white/30">
                <span>2</span>
                <span>10</span>
              </div>
            </div>

            {/* Movie count */}
            <div className="rounded-xl bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Filmes por rodada</span>
                <span className="text-sm font-bold text-white">{movieCount}</span>
              </div>
              <input
                type="range"
                min={10}
                max={30}
                step={5}
                value={movieCount}
                onChange={(e) => setMovieCount(Number(e.target.value))}
                className="range-thumb mt-2 w-full appearance-none bg-transparent"
              />
              <div className="flex justify-between text-[10px] text-white/30">
                <span>10</span>
                <span>30</span>
              </div>
            </div>

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
