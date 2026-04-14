"use client";

import { Club, displayRank } from "@/types";

interface Props {
  club: Club;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ClubCard({ club, onClick, onEdit, onDelete }: Props) {
  const rankSrc = club.rank ? `/ranks/${club.rank}.png` : null;

  return (
    <div className="relative group aspect-square">
      <button
        onClick={onClick}
        className="w-full h-full rounded-xl bg-surface border border-white/[0.05] hover:border-white/10 flex flex-col items-center justify-center gap-2 p-3 transition-all duration-200 hover:bg-surface-raised"
      >
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          {rankSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={rankSrc} alt={displayRank(club.rank)} className="w-full h-full object-contain opacity-90"
              onError={(e) => {
                const img = e.currentTarget; img.style.display = "none";
                const fb = img.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = "flex";
              }} />
          ) : null}
          <div className="w-8 h-8 rounded-lg bg-surface-raised border border-white/8 flex items-center justify-center"
            style={{ display: rankSrc ? "none" : "flex" }}>
            <span className="text-[10px] text-white/25 font-mono">{club.rank ? displayRank(club.rank) : "—"}</span>
          </div>
        </div>

        {/* Name + member count on same line */}
        <div className="flex flex-col items-center gap-0.5 w-full">
          <p className="font-semibold text-[11px] text-white/75 text-center leading-snug group-hover:text-white/90 transition-colors line-clamp-2 w-full">
            {club.name}
          </p>
          <p className="text-[9px] text-white/20">
            {club.members.length} {club.members.length === 1 ? "member" : "members"}
          </p>
        </div>
      </button>

      {/* Action buttons */}
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="w-5 h-5 rounded bg-surface-raised/90 backdrop-blur text-white/40 hover:text-white/80 flex items-center justify-center"
          title="Edit">
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
            <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="w-5 h-5 rounded bg-surface-raised/90 backdrop-blur text-white/40 hover:text-rose flex items-center justify-center"
          title="Delete">
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
            <path d="M2 3h8M5 3V2h2v1M4.5 3l.5 7M7.5 3l-.5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
