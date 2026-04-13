"use client";

import { Club, displayRank } from "@/types";

interface Props {
  club: Club;
  onClick: () => void;
  onEdit: () => void;
}

export default function ClubCard({ club, onClick, onEdit }: Props) {
  const rankSrc = club.rank ? `/ranks/${club.rank}.png` : null;

  return (
    <div className="relative group aspect-square">
      <button
        onClick={onClick}
        className="w-full h-full rounded-2xl bg-surface border border-surface-overlay hover:border-gold/30 flex flex-col items-center justify-center gap-2.5 p-4 transition-all duration-200 hover:bg-surface-raised"
      >
        {/* Rank Image / Placeholder */}
        <div className="w-14 h-14 flex items-center justify-center shrink-0">
          {rankSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={rankSrc}
              alt={displayRank(club.rank)}
              className="w-full h-full object-contain"
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = "none";
                const fallback = img.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          {/* Text fallback (shown when no rank or image fails) */}
          <div
            className="w-12 h-12 rounded-full bg-surface-overlay border border-surface-overlay flex items-center justify-center"
            style={{ display: rankSrc ? "none" : "flex" }}
          >
            <span className="text-xs text-gold/30 font-display">
              {club.rank ? displayRank(club.rank) : "—"}
            </span>
          </div>
        </div>

        {/* Club Name */}
        <p className="font-display text-xs font-semibold text-white/80 text-center leading-tight tracking-wider group-hover:text-gold transition-colors line-clamp-2">
          {club.name}
        </p>

        {/* Member Count */}
        <p className="text-[10px] text-white/30 font-body tracking-wider">
          {club.members.length}{" "}
          {club.members.length === 1 ? "member" : "members"}
        </p>
      </button>

      {/* Edit button (top-right corner, on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-surface-overlay/80 text-white/30 hover:text-gold hover:bg-surface-overlay flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
        title="Edit club"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path
            d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
