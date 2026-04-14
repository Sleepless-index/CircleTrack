"use client";

import { useState } from "react";
import { Club, Rank, RANKS, displayRank } from "@/types";

interface Props {
  club: Club;
  onConfirm: (name: string, rank: Rank) => void;
  onClose: () => void;
}

export default function EditClubModal({ club, onConfirm, onClose }: Props) {
  const [name, setName] = useState(club.name);
  const [rank, setRank] = useState<Rank>(club.rank);
  const [pickingRank, setPickingRank] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onConfirm(name.trim(), rank);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-raised border border-white/8 rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-base">Edit Club</h2>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors p-1 -mr-1">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Rank button */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setPickingRank(true)}
            className="w-24 h-24 rounded-2xl border border-dashed border-white/[0.08] hover:border-white/20 flex flex-col items-center justify-center gap-1.5 transition-all group bg-surface"
          >
            {rank ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/ranks/${rank}.png`}
                alt={displayRank(rank)}
                className="w-14 h-14 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full border border-dashed border-white/15 group-hover:border-white/25 flex items-center justify-center transition-colors">
                <span className="text-white/20 group-hover:text-white/40 text-lg leading-none transition-colors">+</span>
              </div>
            )}
            <span className="text-[10px] text-white/30 group-hover:text-white/50 tracking-wider uppercase transition-colors">
              {rank ? displayRank(rank) : "Rank"}
            </span>
          </button>
        </div>

        {/* Club name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-white/35 font-medium">Club name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="bg-surface border border-white/8 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/8 text-white/40 text-sm hover:border-white/15 hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>

      {/* Rank picker overlay */}
      {pickingRank && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-60 p-4 animate-fade-in">
          <div className="bg-surface-raised border border-white/8 rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Select Rank</h3>
              <button onClick={() => setPickingRank(false)} className="text-white/20 hover:text-white/50 transition-colors p-1 -mr-1">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => { setRank(null); setPickingRank(false); }}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  rank === null
                    ? "border-accent bg-accent/10"
                    : "border-white/[0.08] hover:border-white/20 bg-surface"
                }`}
              >
                <span className="text-white/25 text-lg leading-none">—</span>
                <span className="text-[9px] text-white/20 tracking-wider">None</span>
              </button>

              {RANKS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRank(r); setPickingRank(false); }}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    rank === r
                      ? "border-accent bg-accent/10"
                      : "border-white/[0.08] hover:border-white/20 bg-surface"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/ranks/${r}.png`}
                    alt={displayRank(r)}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="text-[9px] text-white/30 tracking-wider">{displayRank(r)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
