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
  onUpdateFans,
  onBulkUpdate,
}: Props) {
  const [bulkMode, setBulkMode] = useState(false);
  // draft: memberId -> { prev: string, current: string }
  const [draft, setDraft] = useState<Record<string, { prev: string; current: string }>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  const getWeekData = (member: Member) =>
    member.history?.[monthKey]?.weeks?.[String(activeWeek)] ?? { prev: 0, current: 0 };

  // Enter bulk mode: pre-fill draft from existing data
  const enterBulk = () => {
    const d: Record<string, { prev: string; current: string }> = {};
    club.members.forEach((m) => {
      const { prev, current } = getWeekData(m);
      d[m.id] = { prev: prev > 0 ? String(prev) : "", current: current > 0 ? String(current) : "" };
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

  return (
    <>
      {/* Bulk edit toolbar */}
      {!removeMode && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-white/25">
            {club.members.length} {club.members.length === 1 ? "member" : "members"}
          </p>
          {bulkMode ? (
            <div className="flex gap-2">
              <button
                onClick={cancelBulk}
                className="px-3 py-1.5 rounded-lg border border-surface-border text-white/35 text-xs hover:border-white/15 transition-colors"
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
              className="px-3 py-1.5 rounded-lg border border-surface-border text-white/40 text-xs hover:border-white/20 hover:text-white/65 transition-colors flex items-center gap-1.5"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M1 3h10M1 6h10M1 9h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Bulk edit
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-surface-border">
        {/* Header */}
        <div className={`grid bg-surface-raised ${bulkMode ? "grid-cols-[auto_1fr_120px_120px_72px]" : "grid-cols-[auto_1fr_88px_88px_72px_40px]"}`}>
          <div className="w-10" />
          <div className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase">Trainer</div>
          <div className="px-3 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 text-right uppercase">Prev</div>
          <div className="px-3 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 text-right uppercase">Current</div>
          <div className="px-3 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 text-right uppercase">+/−</div>
          {!bulkMode && <div className="w-10" />}
        </div>

        {/* Rows */}
        {club.members.map((member, idx) => {
          const { prev, current } = bulkMode
            ? { prev: parseInt(draft[member.id]?.prev || "0") || 0, current: parseInt(draft[member.id]?.current || "0") || 0 }
            : getWeekData(member);
          const increase = current - prev;
          const isSelected = selectedForRemoval.has(member.id);
          const hasData = current > 0 || prev > 0;

          return (
            <div
              key={member.id}
              className={`grid border-t border-surface-border transition-colors ${
                bulkMode ? "grid-cols-[auto_1fr_120px_120px_72px]" : "grid-cols-[auto_1fr_88px_88px_72px_40px]"
              } ${
                isSelected ? "bg-rose/8" : idx % 2 === 0 ? "bg-surface" : "bg-surface-raised"
              }`}
            >
              {/* Checkbox / spacer */}
              <div className="w-10 flex items-center justify-center">
                {removeMode ? (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleRemove(member.id)}
                    className="w-3.5 h-3.5 cursor-pointer accent-rose"
                  />
                ) : null}
              </div>

              {/* Name */}
              <div className="px-4 py-3 text-sm text-white/85 flex items-center font-medium truncate">
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
                    className="w-full bg-surface-raised border border-surface-border rounded-lg px-2 py-1.5 text-xs font-mono text-white/80 text-right placeholder:text-white/15 focus:outline-none focus:border-white/25 transition-colors"
                  />
                </div>
              ) : (
                <div className="px-3 py-3 text-xs font-mono text-white/30 text-right flex items-center justify-end">
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
                    className="w-full bg-surface-raised border border-surface-border rounded-lg px-2 py-1.5 text-xs font-mono text-white/80 text-right placeholder:text-white/15 focus:outline-none focus:border-white/25 transition-colors"
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
                  <span className={`font-medium ${increase > 0 ? "text-emerald" : increase < 0 ? "text-rose" : "text-white/15"}`}>
                    {increase > 0 ? `+${formatFans(increase)}` : increase < 0 ? formatFans(increase) : "—"}
                  </span>
                ) : (
                  <span className="text-white/12">—</span>
                )}
              </div>

              {/* Edit button (read-only mode) */}
              {!bulkMode && (
                <div className="w-10 flex items-center justify-center">
                  {removeMode ? (
                    <span className={`text-xs font-mono ${isSelected ? "text-rose/60" : "text-white/0"}`}>✕</span>
                  ) : (
                    <button
                      onClick={() => {
                        // quick single-row inline toggle — still allow individual edit via entering bulk mode focused on that row
                        const d: Record<string, { prev: string; current: string }> = {};
                        club.members.forEach((m) => {
                          const wd = getWeekData(m);
                          d[m.id] = { prev: wd.prev > 0 ? String(wd.prev) : "", current: wd.current > 0 ? String(wd.current) : "" };
                        });
                        setDraft(d);
                        setBulkMode(true);
                      }}
                      className="w-8 h-8 flex items-center justify-center text-white/15 hover:text-white/50 transition-colors rounded-lg hover:bg-surface-hover"
                      title="Edit fans"
                    >
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bulk save sticky footer */}
      {bulkMode && (
        <div className="mt-3 flex gap-2 animate-fade-in">
          <button
            onClick={cancelBulk}
            className="flex-1 py-2.5 rounded-xl border border-surface-border text-white/35 text-sm hover:border-white/15 transition-colors"
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
