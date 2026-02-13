"use client";

interface HeaderProps {
  onLogoClick: () => void;
  onRoomClick: () => void;
  inRoom: boolean;
  participantCount: number;
}

export function Header({
  onLogoClick,
  onRoomClick,
  inRoom,
  participantCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-background/80 px-4 py-3 backdrop-blur-md">
      <button onClick={onLogoClick} className="transition-transform active:scale-95">
        <h1 className="text-2xl font-bold tracking-tight">
          Match<span className="text-primary">flix</span>
        </h1>
      </button>

      <div className="flex items-center gap-2">
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
