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

  // Exit bulk mode when week changes
  useEffect(() => {
    setBulkMode(false);
    setDraft({});
  }, [activeWeek]);

  const enterBulk = () => {
    const d: Record<string, { prev: string; current: string }> = {};
    club.members.forEach((m) => {
      const { prev, current } = getWeekData(m);
      // Auto-fill prev from previous week's current if empty
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

  const cancelBulk = () => { setBulkMode(false); setDraft({}); };

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
      {/* Toolbar */}
      {!removeMode && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-white/25">
            {club.members.length} {club.members.length === 1 ? "member" : "members"}
          </p>
          {bulkMode ? (
            <div className="flex gap-2">
              <button onClick={cancelBulk} className="px-3 py-1.5 rounded-lg border border-white/10 text-white/35 text-xs hover:border-white/20 transition-colors">
                Cancel
              </button>
              <button onClick={saveBulk} className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-light transition-colors">
                Save all
              </button>
            </div>
          ) : (
            <button
              onClick={enterBulk}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-white/40 text-xs hover:border-white/20 hover:text-white/65 transition-colors flex items-center gap-1.5"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M1 3h10M1 6h10M1 9h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Bulk edit
            </button>
          )}
        </div>
      )}

      {/* Scrollable table wrapper */}
      <div className="overflow-x-auto rounded-xl border border-white/8">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="bg-surface-raised">
              {/* selector col */}
              <th className="w-10" />
              <th className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase text-left">Trainer</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase text-right w-[140px]">Prev</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase text-right w-[140px]">Current</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase text-right w-[110px]">+/−</th>
            </tr>
          </thead>
          <tbody>
            {club.members.map((member, idx) => {
              const saved = getWeekData(member);
              const prev  = bulkMode ? (parseInt(draft[member.id]?.prev    || "0") || 0) : saved.prev;
              const curr  = bulkMode ? (parseInt(draft[member.id]?.current || "0") || 0) : saved.current;
              const increase = curr - prev;
              const hasData  = curr > 0 || prev > 0;
              const isSelected = selectedForRemoval.has(member.id);

              return (
                <tr
                  key={member.id}
                  onClick={() => removeMode && onToggleRemove(member.id)}
                  className={`border-t border-white/[0.06] transition-colors ${
                    removeMode ? "cursor-pointer" : ""
                  } ${
                    isSelected
                      ? "bg-rose/10"
                      : idx % 2 === 0
                      ? "bg-surface"
                      : "bg-surface-raised"
                  } ${removeMode && !isSelected ? "hover:bg-white/[0.03]" : ""}`}
                >
                  {/* Select indicator */}
                  <td className="w-10 text-center align-middle py-3">
                    {removeMode && (
                      <div className={`mx-auto w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        isSelected
                          ? "bg-rose border-rose"
                          : "border-white/20 bg-transparent"
                      }`}>
                        {isSelected && (
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 text-sm text-white/85 font-medium max-w-0">
                    <span className="block truncate">{member.name}</span>
                  </td>

                  {/* Prev */}
                  <td className="px-4 py-3 text-right w-[140px]">
                    {bulkMode ? (
                      <input
                        ref={idx === 0 ? firstInputRef : undefined}
                        type="number"
                        value={draft[member.id]?.prev ?? ""}
                        onChange={(e) => updateDraft(member.id, "prev", e.target.value)}
                        placeholder="0"
                        className="w-full bg-surface-raised border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-white/80 text-right placeholder:text-white/15 focus:outline-none focus:border-white/25 transition-colors"
                      />
                    ) : (
                      <span className="text-xs font-mono text-white/35">
                        {prev > 0 ? formatFans(prev) : <span className="text-white/12">—</span>}
                      </span>
                    )}
                  </td>

                  {/* Current */}
                  <td className="px-4 py-3 text-right w-[140px]">
                    {bulkMode ? (
                      <input
                        type="number"
                        value={draft[member.id]?.current ?? ""}
                        onChange={(e) => updateDraft(member.id, "current", e.target.value)}
                        placeholder="0"
                        onKeyDown={(e) => { if (e.key === "Enter" && idx === club.members.length - 1) saveBulk(); }}
                        className="w-full bg-surface-raised border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-white/80 text-right placeholder:text-white/15 focus:outline-none focus:border-white/25 transition-colors"
                      />
                    ) : (
                      <span className="text-xs font-mono text-white/65">
                        {curr > 0 ? formatFans(curr) : <span className="text-white/12">—</span>}
                      </span>
                    )}
                  </td>

                  {/* Increase — fixed width, never overlaps */}
                  <td className="px-4 py-3 text-right w-[110px]">
                    {hasData ? (
                      <span className={`text-xs font-mono font-semibold whitespace-nowrap ${
                        increase > 0 ? "text-emerald" : increase < 0 ? "text-rose" : "text-white/15"
                      }`}>
                        {increase > 0 ? `+${formatFans(increase)}` : increase < 0 ? formatFans(increase) : "—"}
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-white/12">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bulk save footer */}
      {bulkMode && (
        <div className="mt-3 flex gap-2 animate-fade-in">
          <button onClick={cancelBulk} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/35 text-sm hover:border-white/20 transition-colors">
            Cancel
          </button>
          <button onClick={saveBulk} className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-colors">
            Save all
          </button>
        </div>
      )}
    </>
  );
}
