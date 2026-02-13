"use client";

interface SwipeButtonsProps {
  onSwipe: (direction: "left" | "right") => void;
}

export function SwipeButtons({ onSwipe }: SwipeButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <button
        onClick={() => onSwipe("left")}
        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-500/50 text-red-500 transition-colors hover:border-red-500 hover:bg-red-500/10 active:scale-90"
        aria-label="Dislike"
      >
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        onClick={() => onSwipe("right")}
        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-500/50 text-green-500 transition-colors hover:border-green-500 hover:bg-green-500/10 active:scale-90"
        aria-label="Like"
      >
        <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    </div>
  );
}
