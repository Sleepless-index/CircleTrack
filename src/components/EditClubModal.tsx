"use client";

import { useState } from "react";
import { Club, Rank } from "@/types";
import RankSelector from "./RankSelector";

interface Props {
  club: Club;
  onConfirm: (name: string, rank: Rank) => void;
  onClose: () => void;
}

export default function EditClubModal({ club, onConfirm, onClose }: Props) {
  const [name, setName] = useState(club.name);
  const [rank, setRank] = useState<Rank>(club.rank);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onConfirm(name.trim(), rank);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-raised border border-surface-border rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-base">Edit Club</h2>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors p-1 -mr-1">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-white/35 font-medium">Club name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="bg-surface border border-surface-border rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        <RankSelector value={rank} onChange={setRank} />

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-surface-border text-white/40 text-sm hover:border-white/15 hover:text-white/60 transition-colors"
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
    </div>
  );
}
