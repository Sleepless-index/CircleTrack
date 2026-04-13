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

export default function EditFansModal({
  member,
  weekData,
  onConfirm,
  onClose,
}: Props) {
  const [prev, setPrev] = useState(
    weekData.prev > 0 ? String(weekData.prev) : ""
  );
  const [current, setCurrent] = useState(
    weekData.current > 0 ? String(weekData.current) : ""
  );

  const prevNum = parseInt(prev) || 0;
  const currentNum = parseInt(current) || 0;
  const increase = currentNum - prevNum;
  const showPreview = prevNum > 0 || currentNum > 0;

  const handleSubmit = () => {
    onConfirm(prevNum, currentNum);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-raised border border-surface-overlay rounded-2xl w-full max-w-sm p-6 flex flex-col gap-5">
        {/* Header */}
        <div>
          <h2 className="font-display text-base font-semibold tracking-[0.2em] text-gold">
            EDIT FANS
          </h2>
          <p className="text-white/30 text-sm font-body mt-0.5">
            {member.name}
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/40 tracking-[0.2em] font-body">
              PREVIOUS FANS
            </label>
            <input
              type="number"
              value={prev}
              onChange={(e) => setPrev(e.target.value)}
              placeholder="0"
              autoFocus
              className="bg-surface border border-surface-overlay rounded-xl px-4 py-3 text-white text-sm font-body placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/40 tracking-[0.2em] font-body">
              CURRENT FANS
            </label>
            <input
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="0"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-surface border border-surface-overlay rounded-xl px-4 py-3 text-white text-sm font-body placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
            />
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="bg-surface rounded-xl px-4 py-3 flex justify-between items-center border border-surface-overlay">
              <span className="text-[10px] text-white/30 font-body tracking-[0.2em]">
                FAN INCREASE
              </span>
              <span
                className={`text-sm font-body font-semibold ${
                  increase > 0
                    ? "text-gold"
                    : increase < 0
                    ? "text-rose"
                    : "text-white/30"
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
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-surface border border-surface-overlay text-white/40 text-sm font-body hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-gold text-bg text-sm font-body font-semibold tracking-wider hover:bg-gold-light transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
