"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { TMDBMovie, SwipeDirection, FilterState } from "@/types";
import { DURATION_MIN, DURATION_MAX } from "@/types";
import { Header } from "./Header";
import { CardDeck } from "./CardDeck";
import { RoomLobby } from "./RoomLobby";
import { FilterSetup } from "./FilterSetup";
import { WaitingRoom } from "./WaitingRoom";
import { GroupResults } from "./GroupResults";
import { BottomNav } from "./BottomNav";
import { SettingsPage } from "./SettingsPage";
import { useRoom } from "@/hooks/useRoom";

const SOLO_ROUND_SIZE = 10;

export function AppShell() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"discover" | "settings">("discover");
  const [showLobby, setShowLobby] = useState(false);
  const [lobbyInitialMode, setLobbyInitialMode] = useState<"create" | "join" | undefined>();
  const [resetKey, setResetKey] = useState(0);

  // Solo mode: filter gate + liked movies tracking
  const [soloStarted, setSoloStarted] = useState(false);
  const [filtersConfirmed, setFiltersConfirmed] = useState(false);
  const [soloFilters, setSoloFilters] = useState<FilterState>({
    genreIds: [],
    durationRange: [DURATION_MIN, DURATION_MAX],
    vibe: "any",
    minRating: 0,
    providerIds: [],
  });
  const [likedMovies, setLikedMovies] = useState<TMDBMovie[]>([]);
  const [showSoloSummary, setShowSoloSummary] = useState(false);
  const roundSwipes = useRef(0);

  const {
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
  } = useRoom();

  const inRoom = room !== null;
  const roomStatus = roomInfo?.status ?? "waiting";

  // Auto-open lobby if ?room= param is in URL
  useEffect(() => {
    const roomCode = searchParams.get("room");
    if (roomCode && !inRoom) {
      setShowLobby(true);
    }
  }, [searchParams, inRoom]);

  function handleLeave() {
    leaveRoom();
    setShowLobby(false);
  }

  function handleLogoClick() {
    if (inRoom) {
      handleLeave();
    }
    setActiveTab("discover");
    setShowLobby(false);
    setLobbyInitialMode(undefined);
    setSoloStarted(false);
    setShowSoloSummary(false);
    setLikedMovies([]);
    setFiltersConfirmed(false);
    roundSwipes.current = 0;
    setResetKey((k) => k + 1);
  }

  function handleSoloFilterConfirm(filters: FilterState) {
    setSoloFilters(filters);
    setFiltersConfirmed(true);
  }

  const handleCardSwipe = useCallback(
    (movie: TMDBMovie, direction: SwipeDirection) => {
      if (inRoom) {
        handleSwipe(movie, direction);
      }

      // Track liked movies for solo mode
      if (!inRoom && direction === "right") {
        setLikedMovies((prev) => [...prev, movie]);
      }

      // Solo round tracking
      if (!inRoom) {
        roundSwipes.current += 1;
        if (roundSwipes.current >= SOLO_ROUND_SIZE) {
          roundSwipes.current = 0;
          setShowSoloSummary(true);
        }
      }
    },
    [inRoom, handleSwipe],
  );

  function handleRestartSolo() {
    setShowSoloSummary(false);
    setLikedMovies([]);
    roundSwipes.current = 0;
  }

  // Determine what to render for the room flow
  function renderRoomContent() {
    // Not in a room yet — show lobby
    if (!inRoom) {
      if (!showLobby) return null;
      return (
        <RoomLobby
          loading={loading}
          error={error}
          onCreateRoom={(nick, ec, mc) => handleCreateRoom(nick, ec, mc)}
          onJoinRoom={(code, nick) => handleJoinRoom(code, nick)}
          initialCode={searchParams.get("room") ?? undefined}
          initialMode={lobbyInitialMode}
        />
      );
    }

    // In room: waiting phase
    if (roomStatus === "waiting") {
      // User hasn't submitted filters yet
      if (!myFiltersReady) {
        return (
          <FilterSetup
            mode="room"
            onConfirm={handleSubmitFilters}
            loading={loading}
            readyCount={participants.filter((p) => p.filters_ready).length}
            expectedCount={roomInfo?.expected_count ?? 2}
          />
        );
      }

      // User submitted, waiting for others
      return (
        <WaitingRoom
          participants={participants}
          roomCode={room!.code}
          shareUrl={shareUrl}
          expectedCount={roomInfo?.expected_count ?? 2}
          onLeave={handleLeave}
        />
      );
    }

    // In room: swiping phase
    if (roomStatus === "swiping") {
      return (
        <CardDeck
          key={`room-${room!.id}`}
          sharedMovieIds={roomInfo?.movie_ids}
          onSwipe={handleCardSwipe}
        />
      );
    }

    // In room: results phase
    if (roomStatus === "results" && matches) {
      return <GroupResults matches={matches} onLeave={handleLeave} />;
    }

    // Fallback: loading
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
      </div>
    );
  }

  // Home screen — shown before user picks solo or room
  function renderHome() {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
            Encontre o filme perfeito<br />para assistir hoje
          </h1>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Descubra sugestoes sozinho ou crie uma sala e encontre o filme que todo mundo vai curtir.
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={() => setSoloStarted(true)}
            className="rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Ver sugestoes sozinho
          </button>
          <button
            onClick={() => { setShowLobby(true); setLobbyInitialMode("create"); }}
            className="rounded-xl bg-white/10 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/15"
          >
            Criar Sala
          </button>
          <button
            onClick={() => { setShowLobby(true); setLobbyInitialMode("join"); }}
            className="rounded-xl bg-white/10 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/15"
          >
            Entrar com Codigo
          </button>
        </div>
      </div>
    );
  }

  // Determine what to render for solo mode
  function renderSoloContent() {
    if (!filtersConfirmed) {
      return (
        <FilterSetup mode="solo" onConfirm={handleSoloFilterConfirm} />
      );
    }

    return (
      <CardDeck
        key={resetKey}
        filters={soloFilters}
        onFiltersChange={setSoloFilters}
        onSwipe={handleCardSwipe}
        likedMovies={likedMovies}
        showSummary={showSoloSummary && likedMovies.length > 0}
        onRestart={handleRestartSolo}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        onLogoClick={handleLogoClick}
        onRoomClick={() => setShowLobby((v) => !v)}
        inRoom={inRoom}
        participantCount={participants.length}
      />

      <main className="flex flex-1 flex-col">
        {activeTab === "discover" && (
          <>
            {inRoom || showLobby
              ? renderRoomContent()
              : soloStarted
                ? renderSoloContent()
                : renderHome()}
          </>
        )}

        {activeTab === "settings" && (
          <SettingsPage
            streamingCount={soloFilters.providerIds.length}
            onStreamingClick={() => {
              setFiltersConfirmed(false);
              setActiveTab("discover");
            }}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
