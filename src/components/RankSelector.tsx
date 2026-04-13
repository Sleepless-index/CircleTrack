"use client";

import { Rank, RANKS, displayRank } from "@/types";

interface Props {
  value: Rank;
  onChange: (rank: Rank) => void;
}

export default function RankSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] text-white/40 tracking-[0.2em] font-body">
        RANK
      </label>
      <div className="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`py-2 rounded-lg text-[10px] font-body tracking-wider transition-all ${
            value === null
              ? "bg-gold text-bg font-semibold"
              : "bg-surface border border-surface-overlay text-white/30 hover:border-gold/30"
          }`}
        >
          None
        </button>
        {RANKS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={`py-2 rounded-lg text-[10px] font-body tracking-wider transition-all ${
              value === r
                ? "bg-gold text-bg font-semibold"
                : "bg-surface border border-surface-overlay text-white/40 hover:border-gold/30"
            }`}
          >
            {displayRank(r)}
          </button>
        ))}
      </div>
    </div>
  );
}
