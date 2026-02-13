"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getUserId } from "@/lib/supabase";
import type {
  Room,
  RoomParticipant,
  RoomStatus,
  SwipeDirection,
  MatchedMovie,
  TMDBMovie,
  FilterState,
} from "@/types";

const POLL_INTERVAL = 4000;

interface RoomInfo {
  status: RoomStatus;
  expected_count: number;
  movie_count: number;
  movie_ids: number[];
}

interface UseRoomReturn {
  room: Room | null;
  roomInfo: RoomInfo | null;
  participants: RoomParticipant[];
  shareUrl: string;
  matches: MatchedMovie[] | null;
  myFiltersReady: boolean;
  loading: boolean;
  error: string | null;
  handleCreateRoom: (nickname: string, expectedCount: number, movieCount: number) => Promise<void>;
  handleJoinRoom: (code: string, nickname: string) => Promise<void>;
  handleSubmitFilters: (filterData: FilterState) => Promise<void>;
  handleSwipe: (movie: TMDBMovie, direction: SwipeDirection) => Promise<void>;
  leaveRoom: () => void;
}

export function useRoom(): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [matches, setMatches] = useState<MatchedMovie[] | null>(null);
  const [myFiltersReady, setMyFiltersReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll room state while in a room
  useEffect(() => {
    if (!room) return;

    async function poll() {
      try {
        const qs = new URLSearchParams({ room_id: room!.id });
        const res = await fetch(`/api/rooms/poll?${qs}`);
        if (!res.ok) return;

        const data = await res.json();
        setParticipants(data.participants ?? []);

        if (data.room) {
          setRoomInfo(data.room);
        }

        if (data.matches) {
          setMatches(data.matches);
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

  const handleCreateRoom = useCallback(
    async (nickname: string, expectedCount: number, movieCount: number) => {
      setLoading(true);
      setError(null);
      try {
        const createRes = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expectedCount, movieCount }),
        });
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
        setError(e instanceof Error ? e.message : "Erro ao criar sala");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

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
      setError(e instanceof Error ? e.message : "Erro ao entrar na sala");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmitFilters = useCallback(
    async (filterData: FilterState) => {
      if (!room) return;
      setLoading(true);
      setError(null);
      try {
        const userId = getUserId();
        const res = await fetch("/api/rooms/filters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: room.id, userId, filterData }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setMyFiltersReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao enviar filtros");
      } finally {
        setLoading(false);
      }
    },
    [room],
  );

  const handleSwipe = useCallback(
    async (movie: TMDBMovie, direction: SwipeDirection) => {
      if (!room) return;
      try {
        const userId = getUserId();
        await fetch("/api/rooms/swipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: room.id,
            userId,
            movieId: movie.id,
            direction,
          }),
        });
      } catch {
        // swipe recording is best-effort
      }
    },
    [room],
  );

  const leaveRoom = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setRoom(null);
    setRoomInfo(null);
    setParticipants([]);
    setMatches(null);
    setMyFiltersReady(false);
  }, []);

  const shareUrl = room
    ? `${typeof window !== "undefined" ? window.location.origin : ""}?room=${room.code}`
    : "";

  return {
    room,
    roomInfo,
    participants,
    shareUrl,
    matches,
    myFiltersReady,
    loading,
    error,
    handleCreateRoom,
    handleJoinRoom,
    handleSubmitFilters,
    handleSwipe,
    leaveRoom,
  };
}
