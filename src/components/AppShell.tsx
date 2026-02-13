"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { TMDBMovie, SwipeDirection } from "@/types";
import { Header } from "./Header";
import { CardDeck } from "./CardDeck";
import { RoomLobby } from "./RoomLobby";
import { MatchCelebration } from "./MatchCelebration";
import { ProviderSelector } from "./ProviderSelector";
import { BottomNav } from "./BottomNav";
import { SettingsPage } from "./SettingsPage";
// Monetization disabled for now — keep for future activation
// import { AdBanner, shouldShowAd } from "./AdBanner";
import { useRoom } from "@/hooks/useRoom";
import { useProviders } from "@/hooks/useProviders";

const SOLO_ROUND_SIZE = 10;

export function AppShell() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"discover" | "settings">("discover");
  const [showLobby, setShowLobby] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Solo mode: track liked movies
  const [likedMovies, setLikedMovies] = useState<TMDBMovie[]>([]);
  const [showSoloSummary, setShowSoloSummary] = useState(false);
  const roundSwipes = useRef(0);

  const {
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
  } = useRoom();

  const {
    selectedIds: providerIds,
    providerParam,
    toggle: toggleProvider,
    clear: clearProviders,
  } = useProviders();

  const inRoom = room !== null;

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
    setActiveTab("discover");
    setShowLobby(false);
    setShowSoloSummary(false);
    setLikedMovies([]);
    roundSwipes.current = 0;
    setResetKey((k) => k + 1);
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

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        onLogoClick={handleLogoClick}
        onRoomClick={() => setShowLobby((v) => !v)}
        onStreamingClick={() => setShowProviders(true)}
        inRoom={inRoom}
        participantCount={participants.length}
        streamingCount={providerIds.length}
      />

      <main className="flex flex-1 flex-col">
        {activeTab === "discover" && (
          <>
            {showLobby && (
              <RoomLobby
                participants={participants}
                roomCode={room?.code ?? ""}
                shareUrl={shareUrl}
                loading={loading}
                error={error}
                onCreateRoom={(nick) => handleCreateRoom(nick)}
                onJoinRoom={(code, nick) => handleJoinRoom(code, nick)}
                onLeave={handleLeave}
                inRoom={inRoom}
              />
            )}

            {(inRoom || !showLobby) && (
              <CardDeck
                key={resetKey}
                providerParam={providerParam}
                onSwipe={handleCardSwipe}
                likedMovies={likedMovies}
                showSummary={!inRoom && showSoloSummary && likedMovies.length > 0}
                onRestart={handleRestartSolo}
              />
            )}
          </>
        )}

        {activeTab === "settings" && (
          <SettingsPage
            streamingCount={providerIds.length}
            onStreamingClick={() => setShowProviders(true)}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <MatchCelebration match={matchedMovie} onDismiss={dismissMatch} />

      <ProviderSelector
        open={showProviders}
        onClose={() => setShowProviders(false)}
        selectedIds={providerIds}
        onToggle={toggleProvider}
        onClear={clearProviders}
      />

    </div>
  );
}
