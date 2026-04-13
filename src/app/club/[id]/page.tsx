"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Club, AppData, Member, displayRank } from "@/types";
import { loadData, saveData } from "@/lib/store";
import { getCurrentMonthKey, getWeeksInMonth, generateId } from "@/lib/utils";
import WeekTabs from "@/components/WeekTabs";
import FanTable from "@/components/FanTable";
import BurgerMenu from "@/components/BurgerMenu";

export default function ClubPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [data, setData] = useState<AppData>({ clubs: [], meta: { activeClub: null } });
  const [activeWeek, setActiveWeek] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);
  const [selectedForRemoval, setSelectedForRemoval] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  const weekCount = getWeeksInMonth();
  const monthKey = getCurrentMonthKey();

  useEffect(() => {
    setData(loadData());
    setMounted(true);
  }, []);

  const club = data.clubs.find((c) => c.id === id);

  const updateData = (updated: AppData) => {
    setData(updated);
    saveData(updated);
  };

  const updateClub = (updatedClub: Club) => {
    updateData({
      ...data,
      clubs: data.clubs.map((c) => (c.id === id ? updatedClub : c)),
    });
  };

  const handleAddMember = (name: string) => {
    if (!club) return;
    const newMember: Member = { id: generateId(), name, history: {} };
    updateClub({ ...club, members: [...club.members, newMember] });
  };

  const handleRemoveConfirm = () => {
    if (!club) return;
    updateClub({
      ...club,
      members: club.members.filter((m) => !selectedForRemoval.has(m.id)),
    });
    setRemoveMode(false);
    setSelectedForRemoval(new Set());
  };

  const handleUpdateFans = (memberId: string, prev: number, current: number) => {
    if (!club) return;
    const updatedMembers = club.members.map((m) => {
      if (m.id !== memberId) return m;
      const history = { ...m.history };
      if (!history[monthKey]) history[monthKey] = { weeks: {} };
      history[monthKey] = {
        ...history[monthKey],
        weeks: { ...history[monthKey].weeks, [String(activeWeek)]: { prev, current } },
      };
      return { ...m, history };
    });
    updateClub({ ...club, members: updatedMembers });
  };

  const toggleRemoval = (memberId: string) => {
    const next = new Set(selectedForRemoval);
    next.has(memberId) ? next.delete(memberId) : next.add(memberId);
    setSelectedForRemoval(next);
  };

  if (!mounted) return null;

  if (!club) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-white/25 text-sm">Club not found.</p>
        <button
          onClick={() => router.push("/")}
          className="text-white/40 text-sm hover:text-white/70 transition-colors"
        >
          ← Back to clubs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-surface-border px-4 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-white/25 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-surface-hover -ml-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-sm text-white tracking-tight">{club.name}</h1>
            {club.rank && (
              <span className="text-[10px] text-white/40 font-mono bg-surface-raised border border-surface-border px-1.5 py-0.5 rounded-md">
                {displayRank(club.rank)}
              </span>
            )}
          </div>
        </div>

        {/* Menu button */}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col gap-[5px] p-2 text-white/30 hover:text-white/60 transition-colors rounded-lg hover:bg-surface-hover"
          aria-label="Open menu"
        >
          <span className="w-4 h-px bg-current block" />
          <span className="w-3 h-px bg-current block" />
          <span className="w-4 h-px bg-current block" />
        </button>
      </header>

      {/* Week Tabs */}
      <WeekTabs weekCount={weekCount} activeWeek={activeWeek} onSelect={setActiveWeek} />

      {/* Table */}
      <div className={`flex-1 overflow-auto p-4 ${removeMode ? "pb-24" : ""}`}>
        <FanTable
          club={club}
          activeWeek={activeWeek}
          monthKey={monthKey}
          removeMode={removeMode}
          selectedForRemoval={selectedForRemoval}
          onToggleRemove={toggleRemoval}
          onUpdateFans={handleUpdateFans}
        />
      </div>

      {/* Remove Mode Footer */}
      {removeMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-raised border-t border-surface-border p-4 flex gap-2 animate-fade-in">
          <button
            onClick={() => { setRemoveMode(false); setSelectedForRemoval(new Set()); }}
            className="flex-1 py-2.5 rounded-xl border border-surface-border text-white/35 text-sm hover:border-white/15 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRemoveConfirm}
            disabled={selectedForRemoval.size === 0}
            className="flex-1 py-2.5 rounded-xl bg-rose/80 text-white text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rose transition-colors"
          >
            {selectedForRemoval.size > 0 ? `Remove (${selectedForRemoval.size})` : "Select members"}
          </button>
        </div>
      )}

      {/* Drawer */}
      <BurgerMenu
        open={menuOpen}
        club={club}
        onClose={() => setMenuOpen(false)}
        onAddMember={handleAddMember}
        onStartRemove={() => { setMenuOpen(false); setRemoveMode(true); }}
      />
    </div>
  );
}
