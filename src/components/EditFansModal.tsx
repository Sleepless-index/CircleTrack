"use client";

import { useState } from "react";
import { Member, WeekData } from "@/types";
import { formatFans } from "@/lib/utils";

interface Props {
  member: Member;
  weekData: WeekData;
  onConfirm: (prev: number, current: number) => void;
  onClose: () => void;
}

export default function EditFansModal({ member, weekData, onConfirm, onClose }: Props) {
  const [prev, setPrev] = useState(weekData.prev > 0 ? String(weekData.prev) : "");
  const [current, setCurrent] = useState(weekData.current > 0 ? String(weekData.current) : "");

  const prevNum = parseInt(prev) || 0;
  const currentNum = parseInt(current) || 0;
  const increase = currentNum - prevNum;
  const showPreview = prevNum > 0 || currentNum > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-raised border border-white/8 rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-semibold text-base">Edit Fans</h2>
            <p className="text-white/35 text-xs mt-0.5">{member.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/20 hover:text-white/50 transition-colors p-1 -mr-1"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/35 font-medium">Previous fans</label>
            <input
              type="number"
              value={prev}
              onChange={(e) => setPrev(e.target.value)}
              placeholder="0"
              autoFocus
              className="bg-surface border border-white/8 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors font-mono"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/35 font-medium">Current fans</label>
            <input
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="0"
              onKeyDown={(e) => e.key === "Enter" && onConfirm(prevNum, currentNum)}
              className="bg-surface border border-white/8 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors font-mono"
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="bg-surface rounded-xl px-4 py-2.5 flex justify-between items-center border border-white/8">
              <span className="text-[11px] text-white/30">Fan increase</span>
              <span
                className={`text-sm font-mono font-medium ${
                  increase > 0 ? "text-emerald" : increase < 0 ? "text-rose" : "text-white/25"
                }`}
              >
                {increase > 0
                  ? `+${formatFans(increase)}`
                  : increase < 0
                  ? formatFans(increase)
                  : "—"}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/8 text-white/40 text-sm hover:border-white/15 hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(prevNum, currentNum)}
            className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
