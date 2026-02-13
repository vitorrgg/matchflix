"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getUserId } from "@/lib/supabase";
import type {
  Room,
  RoomParticipant,
  SwipeDirection,
  MatchedMovie,
  TMDBMovie,
} from "@/types";

const POLL_INTERVAL = 4000;

interface UseRoomReturn {
  room: Room | null;
  participants: RoomParticipant[];
  shareUrl: string;
  matchedMovie: MatchedMovie | null;
  loading: boolean;
  error: string | null;
  handleCreateRoom: (nickname: string) => Promise<void>;
  handleJoinRoom: (code: string, nickname: string) => Promise<void>;
  handleSwipe: (movie: TMDBMovie, direction: SwipeDirection) => Promise<void>;
  dismissMatch: () => void;
  leaveRoom: () => void;
}

export function useRoom(): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [matchedMovie, setMatchedMovie] = useState<MatchedMovie | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dismissedRef = useRef<Set<number>>(new Set());

  // Poll participants + match detection while in a room
  useEffect(() => {
    if (!room) return;

    async function poll() {
      try {
        const dismissed = Array.from(dismissedRef.current).join(",");
        const qs = new URLSearchParams({ room_id: room!.id });
        if (dismissed) qs.set("dismissed", dismissed);

        const res = await fetch(`/api/rooms/poll?${qs}`);
        if (!res.ok) return;

        const data = await res.json();
        setParticipants(data.participants ?? []);

        if (data.match && !dismissedRef.current.has(data.match.movieId)) {
          setMatchedMovie(data.match);
        }
      } catch {
        // silently ignore polling errors
      }
    }

    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [room]);

  const handleCreateRoom = useCallback(async (nickname: string) => {
    setLoading(true);
    setError(null);
    try {
      const createRes = await fetch("/api/rooms", { method: "POST" });
      const createData = await createRes.json();
      if (createData.error) throw new Error(createData.error);

      const newRoom = createData.room as Room;

      const userId = getUserId();
      const joinRes = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: newRoom.id, userId, nickname }),
      });
      const joinData = await joinRes.json();
      if (joinData.error) throw new Error(joinData.error);

      setRoom(newRoom);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao criar sala";
      if (
        msg.includes("schema cache") ||
        msg.includes("relation") ||
        msg.includes("does not exist")
      ) {
        setError(
          "Tabelas do Supabase nao configuradas. Execute o migration.sql no SQL Editor do Supabase.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleJoinRoom = useCallback(async (code: string, nickname: string) => {
    setLoading(true);
    setError(null);
    try {
      const findRes = await fetch(
        `/api/rooms?code=${encodeURIComponent(code)}`,
      );
      const findData = await findRes.json();
      if (findData.error) throw new Error(findData.error);
      if (!findData.room) {
        setError("Sala nao encontrada");
        return;
      }

      const foundRoom = findData.room as Room;

      const userId = getUserId();
      const joinRes = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: foundRoom.id, userId, nickname }),
      });
      const joinData = await joinRes.json();
      if (joinData.error) throw new Error(joinData.error);

      setRoom(foundRoom);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao entrar na sala";
      if (
        msg.includes("schema cache") ||
        msg.includes("relation") ||
        msg.includes("does not exist")
      ) {
        setError(
          "Tabelas do Supabase nao configuradas. Execute o migration.sql no SQL Editor do Supabase.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSwipe = useCallback(
    async (movie: TMDBMovie, direction: SwipeDirection) => {
      if (!room) return;
      try {
        const userId = getUserId();
        const res = await fetch("/api/rooms/swipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: room.id,
            userId,
            movieId: movie.id,
            direction,
          }),
        });
        const data = await res.json();
        if (data.matched && data.matchedMovie) {
          setMatchedMovie(data.matchedMovie);
        }
      } catch {
        // swipe recording is best-effort
      }
    },
    [room],
  );

  const dismissMatch = useCallback(() => {
    if (matchedMovie) {
      dismissedRef.current.add(matchedMovie.movieId);
    }
    setMatchedMovie(null);
  }, [matchedMovie]);

  const leaveRoom = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    dismissedRef.current.clear();
    setRoom(null);
    setParticipants([]);
    setMatchedMovie(null);
  }, []);

  const shareUrl = room
    ? `${typeof window !== "undefined" ? window.location.origin : ""}?room=${room.code}`
    : "";

  return {
    room,
    participants,
    shareUrl,
    matchedMovie,
    loading,
    error,
    handleCreateRoom,
    handleJoinRoom,
    handleSwipe,
    dismissMatch,
    leaveRoom,
  };
}
