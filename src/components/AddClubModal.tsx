"use client";

import { useState } from "react";
import { Rank } from "@/types";
import RankSelector from "./RankSelector";

interface Props {
  onConfirm: (name: string, rank: Rank) => void;
  onClose: () => void;
}

export default function AddClubModal({ onConfirm, onClose }: Props) {
  const [name, setName] = useState("");
  const [rank, setRank] = useState<Rank>(null);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onConfirm(name.trim(), rank);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-raised border border-surface-overlay rounded-2xl w-full max-w-sm p-6 flex flex-col gap-5">
        <h2 className="font-display text-base font-semibold tracking-[0.2em] text-gold">
          ADD CLUB
        </h2>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-white/40 tracking-[0.2em] font-body">
            CLUB NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter club name…"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="bg-surface border border-surface-overlay rounded-xl px-4 py-3 text-white text-sm font-body placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>

        <RankSelector value={rank} onChange={setRank} />

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-surface border border-surface-overlay text-white/40 text-sm font-body hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-3 rounded-xl bg-gold text-bg text-sm font-body font-semibold tracking-wider hover:bg-gold-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
