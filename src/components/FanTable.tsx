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
  onUpdateQuota: (memberId: string, quota: number | undefined) => void;
}

export default function FanTable({
  club,
  activeWeek,
  monthKey,
  removeMode,
  selectedForRemoval,
  onToggleRemove,
  onBulkUpdate,
  onUpdateQuota,
}: Props) {
  const [bulkMode, setBulkMode] = useState(false);
  const [quotaMode, setQuotaMode] = useState(false);
  const [draft, setDraft] = useState<Record<string, { prev: string; current: string }>>({});
  const [quotaDraft, setQuotaDraft] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  const getWeekData = (member: Member) =>
    member.history?.[monthKey]?.weeks?.[String(activeWeek)] ?? { prev: 0, current: 0 };

  useEffect(() => { setBulkMode(false); setDraft({}); }, [activeWeek]);

  const enterBulk = () => {
    const d: Record<string, { prev: string; current: string }> = {};
    club.members.forEach((m) => {
      const { prev, current } = getWeekData(m);
      let autoPrev = prev > 0 ? String(prev) : "";
      if (!autoPrev && activeWeek > 1) {
        const lw = m.history?.[monthKey]?.weeks?.[String(activeWeek - 1)]?.current;
        if (lw && lw > 0) autoPrev = String(lw);
      }
      d[m.id] = { prev: autoPrev, current: current > 0 ? String(current) : "" };
    });
    setDraft(d);
    setBulkMode(true);
    setQuotaMode(false);
  };

  const enterQuota = () => {
    const d: Record<string, string> = {};
    club.members.forEach((m) => { d[m.id] = m.quota != null ? String(m.quota) : ""; });
    setQuotaDraft(d);
    setQuotaMode(true);
    setBulkMode(false);
  };

  useEffect(() => { if (bulkMode && firstInputRef.current) firstInputRef.current.focus(); }, [bulkMode]);

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

  const saveQuota = () => {
    club.members.forEach((m) => {
      const val = quotaDraft[m.id];
      const parsed = val ? parseInt(val) || undefined : undefined;
      onUpdateQuota(m.id, parsed);
    });
    setQuotaMode(false);
    setQuotaDraft({});
  };

  const cancelBulk = () => { setBulkMode(false); setDraft({}); };
  const cancelQuota = () => { setQuotaMode(false); setQuotaDraft({}); };

  const updateDraft = (id: string, f: "prev" | "current", v: string) =>
    setDraft((d) => ({ ...d, [id]: { ...d[id], [f]: v } }));

  if (club.members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2">
        <p className="text-white/20 text-sm">No members yet.</p>
        <p className="text-white/10 text-xs">Open the menu to add your first member.</p>
      </div>
    );
  }

  const showQuotaCol = !bulkMode && club.members.some((m) => m.quota != null && m.quota > 0);

  return (
    <>
      {/* Toolbar */}
      {!removeMode && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-white/25">
            {club.members.length} {club.members.length === 1 ? "member" : "members"}
          </p>
          <div className="flex gap-2">
            {quotaMode ? (
              <>
                <button onClick={cancelQuota} className="px-3 py-1.5 rounded-lg border border-white/10 text-white/35 text-xs hover:border-white/20 transition-colors">Cancel</button>
                <button onClick={saveQuota} className="px-3 py-1.5 rounded-lg bg-amber/80 text-black text-xs font-semibold hover:bg-amber transition-colors">Save quotas</button>
              </>
            ) : bulkMode ? (
              <>
                <button onClick={cancelBulk} className="px-3 py-1.5 rounded-lg border border-white/10 text-white/35 text-xs hover:border-white/20 transition-colors">Cancel</button>
                <button onClick={saveBulk} className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-light transition-colors">Save all</button>
              </>
            ) : (
              <>
                <button
                  onClick={enterQuota}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-white/40 text-xs hover:border-white/20 hover:text-white/65 transition-colors flex items-center gap-1.5"
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M6 4v2.5l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  Quota
                </button>
                <button
                  onClick={enterBulk}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-white/40 text-xs hover:border-white/20 hover:text-white/65 transition-colors flex items-center gap-1.5"
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M1 3h10M1 6h10M1 9h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  Bulk edit
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
        <table className="w-full border-collapse" style={{ minWidth: showQuotaCol ? 620 : 520 }}>
          <thead>
            <tr className="bg-surface-raised">
              <th className="w-10" />
              <th className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase text-left">Trainer</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase text-right w-[130px]">Prev</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase text-right w-[130px]">Current</th>
              <th className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase text-right w-[100px]">+/−</th>
              {showQuotaCol && (
                <th className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-amber/60 uppercase text-right w-[100px]">Quota</th>
              )}
              {quotaMode && (
                <th className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-amber/60 uppercase text-right w-[130px]">Set Quota</th>
              )}
            </tr>
          </thead>
          <tbody>
            {club.members.map((member, idx) => {
              const saved = getWeekData(member);
              const prev    = bulkMode ? (parseInt(draft[member.id]?.prev    || "0") || 0) : saved.prev;
              const curr    = bulkMode ? (parseInt(draft[member.id]?.current || "0") || 0) : saved.current;
              const increase = curr - prev;
              const hasData  = curr > 0 || prev > 0;
              const isSelected = selectedForRemoval.has(member.id);
              const quota = member.quota;
              const meetsQuota = quota != null && increase >= quota;
              const missingQuota = quota != null && hasData && increase < quota;

              return (
                <tr
                  key={member.id}
                  onClick={() => removeMode && onToggleRemove(member.id)}
                  className={`border-t border-white/[0.05] transition-colors ${removeMode ? "cursor-pointer" : ""} ${
                    isSelected ? "bg-rose/10" : idx % 2 === 0 ? "bg-surface" : "bg-surface-raised"
                  } ${removeMode && !isSelected ? "hover:bg-white/[0.02]" : ""}`}
                >
                  {/* Select indicator */}
                  <td className="w-10 text-center align-middle py-3">
                    {removeMode && (
                      <div className={`mx-auto w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        isSelected ? "bg-rose border-rose" : "border-white/20"
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
                    {quota != null && (
                      <span className={`text-[10px] font-mono ${meetsQuota ? "text-emerald/60" : missingQuota ? "text-rose/50" : "text-amber/40"}`}>
                        quota {formatFans(quota)}
                      </span>
                    )}
                  </td>

                  {/* Prev */}
                  <td className="px-4 py-3 text-right w-[130px]">
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
                      <span className="text-xs font-mono text-white/30">
                        {prev > 0 ? formatFans(prev) : <span className="opacity-30">—</span>}
                      </span>
                    )}
                  </td>

                  {/* Current */}
                  <td className="px-4 py-3 text-right w-[130px]">
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
                        {curr > 0 ? formatFans(curr) : <span className="opacity-30">—</span>}
                      </span>
                    )}
                  </td>

                  {/* Increase */}
                  <td className="px-4 py-3 text-right w-[100px]">
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

                  {/* Quota progress column */}
                  {showQuotaCol && (
                    <td className="px-4 py-3 text-right w-[100px]">
                      {quota != null && hasData ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] font-mono font-medium ${meetsQuota ? "text-emerald" : "text-rose/70"}`}>
                            {meetsQuota ? "✓" : `${formatFans(quota - increase)} left`}
                          </span>
                          {/* Mini progress bar */}
                          <div className="w-14 h-1 rounded-full bg-white/8 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${meetsQuota ? "bg-emerald" : "bg-amber/60"}`}
                              style={{ width: `${Math.min((increase / quota) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : quota != null ? (
                        <span className="text-[10px] text-white/20 font-mono">{formatFans(quota)}</span>
                      ) : null}
                    </td>
                  )}

                  {/* Quota edit input */}
                  {quotaMode && (
                    <td className="px-4 py-2 w-[130px]">
                      <input
                        type="number"
                        value={quotaDraft[member.id] ?? ""}
                        onChange={(e) => setQuotaDraft((d) => ({ ...d, [member.id]: e.target.value }))}
                        placeholder="no quota"
                        className="w-full bg-surface-raised border border-amber/20 rounded-lg px-2 py-1.5 text-xs font-mono text-amber/80 text-right placeholder:text-white/15 focus:outline-none focus:border-amber/40 transition-colors"
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Save footer */}
      {(bulkMode || quotaMode) && (
        <div className="mt-3 flex gap-2 animate-fade-in">
          <button
            onClick={bulkMode ? cancelBulk : cancelQuota}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/35 text-sm hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={bulkMode ? saveBulk : saveQuota}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              bulkMode ? "bg-accent hover:bg-accent-light text-white" : "bg-amber/80 hover:bg-amber text-black"
            }`}
          >
            {bulkMode ? "Save all" : "Save quotas"}
          </button>
        </div>
      )}
    </>
  );
}
