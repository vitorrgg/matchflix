"use client";

interface HeaderProps {
  onLogoClick: () => void;
  onRoomClick: () => void;
  onStreamingClick: () => void;
  inRoom: boolean;
  participantCount: number;
  streamingCount: number;
}

export function Header({
  onLogoClick,
  onRoomClick,
  onStreamingClick,
  inRoom,
  participantCount,
  streamingCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-background/80 px-4 py-3 backdrop-blur-md">
      <button onClick={onLogoClick} className="transition-transform active:scale-95">
        <h1 className="text-2xl font-bold tracking-tight">
          Match<span className="text-primary">flix</span>
        </h1>
      </button>

      <div className="flex items-center gap-2">
        {/* Streaming config button */}
        <button
          onClick={onStreamingClick}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            streamingCount > 0
              ? "bg-purple-500/20 text-purple-400"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {streamingCount > 0 ? streamingCount : "TV"}
        </button>

        {/* Room button */}
        <button
          onClick={onRoomClick}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            inRoom
              ? "bg-primary/20 text-primary"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {inRoom ? `Sala (${participantCount})` : "Sala"}
        </button>
      </div>
    </header>
  );
}
