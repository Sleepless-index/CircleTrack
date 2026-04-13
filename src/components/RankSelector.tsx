"use client";

import { Rank, RANKS, displayRank } from "@/types";

interface Props {
  value: Rank;
  onChange: (rank: Rank) => void;
}

export default function RankSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-white/35 font-medium">Rank</label>
      <div className="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`py-2 rounded-lg text-[11px] font-medium transition-all ${
            value === null
              ? "bg-accent-dim text-accent border border-accent/25"
              : "bg-surface border border-surface-border text-white/25 hover:border-white/15 hover:text-white/50"
          }`}
        >
          None
        </button>
        {RANKS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={`py-2 rounded-lg text-[11px] font-medium transition-all ${
              value === r
                ? "bg-accent-dim text-accent border border-accent/25"
                : "bg-surface border border-surface-border text-white/30 hover:border-white/15 hover:text-white/50"
            }`}
          >
            {displayRank(r)}
          </button>
        ))}
      </div>
    </div>
  );
}
