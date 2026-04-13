"use client";

import { useState, useRef, useEffect } from "react";
import { Club, Member } from "@/types";
import { formatFans } from "@/lib/utils";

interface Props {
  club: Club;
  activeWeek: number;
  monthKey: string;
  removeMode: boolean;
  selectedForRemoval: Set<string>;
  onToggleRemove: (id: string) => void;
  onUpdateFans: (memberId: string, prev: number, current: number) => void;
  onBulkUpdate: (updates: { memberId: string; prev: number; current: number }[]) => void;
}

export default function FanTable({
  club,
  activeWeek,
  monthKey,
  removeMode,
  selectedForRemoval,
  onToggleRemove,
  onBulkUpdate,
}: Props) {
  const [bulkMode, setBulkMode] = useState(false);
  const [draft, setDraft] = useState<Record<string, { prev: string; current: string }>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  const getWeekData = (member: Member) =>
    member.history?.[monthKey]?.weeks?.[String(activeWeek)] ?? { prev: 0, current: 0 };

  // Exit bulk mode when week tab changes
  useEffect(() => {
    setBulkMode(false);
    setDraft({});
  }, [activeWeek]);

  const enterBulk = () => {
    const d: Record<string, { prev: string; current: string }> = {};
    club.members.forEach((m) => {
      const { prev, current } = getWeekData(m);
      // Auto-fill prev from last week current if this week has no prev yet
      let autoPrev = prev > 0 ? String(prev) : "";
      if (!autoPrev && activeWeek > 1) {
        const lastWeekCurrent = m.history?.[monthKey]?.weeks?.[String(activeWeek - 1)]?.current;
        if (lastWeekCurrent && lastWeekCurrent > 0) autoPrev = String(lastWeekCurrent);
      }
      d[m.id] = { prev: autoPrev, current: current > 0 ? String(current) : "" };
    });
    setDraft(d);
    setBulkMode(true);
  };

  useEffect(() => {
    if (bulkMode && firstInputRef.current) firstInputRef.current.focus();
  }, [bulkMode]);

  const saveBulk = () => {
    const updates = club.members.map((m) => ({
      memberId: m.id,
      prev: parseInt(draft[m.id]?.prev || "0") || 0,
      current: parseInt(draft[m.id]?.current || "0") || 0,
    }));
    onBulkUpdate(updates);
    setBulkMode(false);
    setDraft({});
  };

  const cancelBulk = () => {
    setBulkMode(false);
    setDraft({});
  };

  const updateDraft = (memberId: string, field: "prev" | "current", value: string) => {
    setDraft((d) => ({ ...d, [memberId]: { ...d[memberId], [field]: value } }));
  };

  if (club.members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2">
        <p className="text-white/20 text-sm">No members yet.</p>
        <p className="text-white/10 text-xs">Open the menu to add your first member.</p>
      </div>
    );
  }

  const readCol = "grid-cols-[32px_minmax(0,1fr)_130px_130px_88px]";
  const bulkCol = "grid-cols-[32px_minmax(0,1fr)_155px_155px_88px]";
  const activeCol = bulkMode ? bulkCol : readCol;

  return (
    <>
      {/* Toolbar */}
      {!removeMode && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-white/25">
            {club.members.length} {club.members.length === 1 ? "member" : "members"}
          </p>
          {bulkMode ? (
            <div className="flex gap-2">
              <button
                onClick={cancelBulk}
                className="px-3 py-1.5 rounded-lg border border-surface-overlay text-white/35 text-xs hover:border-white/15 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveBulk}
                className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-light transition-colors"
              >
                Save all
              </button>
            </div>
          ) : (
            <button
              onClick={enterBulk}
              className="px-3 py-1.5 rounded-lg border border-surface-overlay text-white/40 text-xs hover:border-white/20 hover:text-white/65 transition-colors flex items-center gap-1.5"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M1 3h10M1 6h10M1 9h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Bulk edit
            </button>
          )}
        </div>
      )}

      {/* Scrollable table */}
      <div className="overflow-x-auto rounded-xl border border-surface-overlay">
        <div className="min-w-[480px]">
          {/* Header */}
          <div className={`grid bg-surface-raised ${activeCol}`}>
            <div className="w-8" />
            <div className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase">Trainer</div>
            <div className="px-3 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 text-right uppercase">Prev</div>
            <div className="px-3 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 text-right uppercase">Current</div>
            <div className="px-3 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 text-right uppercase">+/−</div>
          </div>

          {/* Rows */}
          {club.members.map((member, idx) => {
            const saved = getWeekData(member);
            const prev = bulkMode ? (parseInt(draft[member.id]?.prev || "0") || 0) : saved.prev;
            const current = bulkMode ? (parseInt(draft[member.id]?.current || "0") || 0) : saved.current;
            const increase = current - prev;
            const hasData = current > 0 || prev > 0;
            const isSelected = selectedForRemoval.has(member.id);

            return (
              <div
                key={member.id}
                className={`grid border-t border-surface-overlay transition-colors ${activeCol} ${
                  isSelected ? "bg-rose/8" : idx % 2 === 0 ? "bg-surface" : "bg-surface-raised"
                }`}
              >
                {/* Checkbox */}
                <div className="w-8 flex items-center justify-center">
                  {removeMode && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleRemove(member.id)}
                      className="w-3.5 h-3.5 cursor-pointer accent-rose"
                    />
                  )}
                </div>

                {/* Name */}
                <div className="px-4 py-3 text-sm text-white/85 flex items-center font-medium">
                  <span className="truncate">{member.name}</span>
                </div>

                {/* Prev */}
                {bulkMode ? (
                  <div className="px-2 py-2 flex items-center">
                    <input
                      ref={idx === 0 ? firstInputRef : undefined}
                      type="number"
                      value={draft[member.id]?.prev ?? ""}
                      onChange={(e) => updateDraft(member.id, "prev", e.target.value)}
                      placeholder="0"
                      className="w-full bg-surface-raised border border-surface-overlay rounded-lg px-2 py-1.5 text-xs font-mono text-white/80 text-right placeholder:text-white/15 focus:outline-none focus:border-white/25 transition-colors"
                    />
                  </div>
                ) : (
                  <div className="px-3 py-3 text-xs font-mono text-white/35 text-right flex items-center justify-end">
                    {prev > 0 ? formatFans(prev) : <span className="text-white/12">—</span>}
                  </div>
                )}

                {/* Current */}
                {bulkMode ? (
                  <div className="px-2 py-2 flex items-center">
                    <input
                      type="number"
                      value={draft[member.id]?.current ?? ""}
                      onChange={(e) => updateDraft(member.id, "current", e.target.value)}
                      placeholder="0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && idx === club.members.length - 1) saveBulk();
                      }}
                      className="w-full bg-surface-raised border border-surface-overlay rounded-lg px-2 py-1.5 text-xs font-mono text-white/80 text-right placeholder:text-white/15 focus:outline-none focus:border-white/25 transition-colors"
                    />
                  </div>
                ) : (
                  <div className="px-3 py-3 text-xs font-mono text-white/65 text-right flex items-center justify-end">
                    {current > 0 ? formatFans(current) : <span className="text-white/12">—</span>}
                  </div>
                )}

                {/* Increase */}
                <div className="px-3 py-3 text-xs font-mono text-right flex items-center justify-end">
                  {hasData ? (
                    <span className={`font-medium ${increase > 0 ? "text-emerald-400" : increase < 0 ? "text-rose-400" : "text-white/15"}`}>
                      {increase > 0 ? `+${formatFans(increase)}` : increase < 0 ? formatFans(increase) : "—"}
                    </span>
                  ) : (
                    <span className="text-white/12">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bulk save footer */}
      {bulkMode && (
        <div className="mt-3 flex gap-2 animate-fade-in">
          <button
            onClick={cancelBulk}
            className="flex-1 py-2.5 rounded-xl border border-surface-overlay text-white/35 text-sm hover:border-white/15 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveBulk}
            className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-colors"
          >
            Save all
          </button>
        </div>
      )}
    </>
  );
}
