"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Club, AppData, Member, displayRank } from "@/types";
import { loadData, saveData } from "@/lib/store";
import { getCurrentMonthKey, getWeeksInMonth, generateId } from "@/lib/utils";
import WeekTabs from "@/components/WeekTabs";
import FanTable from "@/components/FanTable";
import FanCharts from "@/components/FanCharts";
import BurgerMenu from "@/components/BurgerMenu";

type Tab = "table" | "charts";

// Helper: after saving week W for a member, if week W+1 has no prev set yet,
// auto-fill it with this week's current value.
function propagateToNextWeek(
  member: Member,
  monthKey: string,
  week: number,
  currentFans: number,
  totalWeeks: number
): Member {
  if (week >= totalWeeks || currentFans === 0) return member;
  const nextWeekKey = String(week + 1);
  const existingNext = member.history?.[monthKey]?.weeks?.[nextWeekKey];
  // Only auto-fill if next week's prev is not already set
  if (existingNext && existingNext.prev > 0) return member;

  const history = { ...member.history };
  if (!history[monthKey]) history[monthKey] = { weeks: {} };
  history[monthKey] = {
    ...history[monthKey],
    weeks: {
      ...history[monthKey].weeks,
      [nextWeekKey]: {
        prev: currentFans,
        current: existingNext?.current ?? 0,
      },
    },
  };
  return { ...member, history };
}

export default function ClubPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [data, setData] = useState<AppData>({ clubs: [], meta: { activeClub: null } });
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("table");
  const [menuOpen, setMenuOpen] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);
  const [selectedForRemoval, setSelectedForRemoval] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  const weekCount = getWeeksInMonth();
  const monthKey = getCurrentMonthKey();

  useEffect(() => { setData(loadData()); setMounted(true); }, []);

  const club = data.clubs.find((c) => c.id === id);

  const updateData = (updated: AppData) => { setData(updated); saveData(updated); };
  const updateClub = (updatedClub: Club) => {
    updateData({ ...data, clubs: data.clubs.map((c) => (c.id === id ? updatedClub : c)) });
  };

  const handleAddMember = (name: string) => {
    if (!club) return;
    updateClub({ ...club, members: [...club.members, { id: generateId(), name, history: {} }] });
  };

  const handleRemoveConfirm = () => {
    if (!club) return;
    updateClub({ ...club, members: club.members.filter((m) => !selectedForRemoval.has(m.id)) });
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
      let updated: Member = { ...m, history };
      updated = propagateToNextWeek(updated, monthKey, activeWeek, current, weekCount);
      return updated;
    });
    updateClub({ ...club, members: updatedMembers });
  };

  const handleBulkUpdate = (updates: { memberId: string; prev: number; current: number }[]) => {
    if (!club) return;
    const updatedMembers = club.members.map((m) => {
      const upd = updates.find((u) => u.memberId === m.id);
      if (!upd) return m;
      const history = { ...m.history };
      if (!history[monthKey]) history[monthKey] = { weeks: {} };
      history[monthKey] = {
        ...history[monthKey],
        weeks: { ...history[monthKey].weeks, [String(activeWeek)]: { prev: upd.prev, current: upd.current } },
      };
      let updated: Member = { ...m, history };
      updated = propagateToNextWeek(updated, monthKey, activeWeek, upd.current, weekCount);
      return updated;
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
        <button onClick={() => router.push("/")} className="text-white/40 text-sm hover:text-white/70 transition-colors">← Back to clubs</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-white/[0.07] px-4 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-white/25 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-white/[0.04] -ml-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-sm text-white tracking-tight">{club.name}</h1>
            {club.rank && (
              <span className="text-[10px] text-white/40 font-mono bg-white/[0.05] px-1.5 py-0.5 rounded-md">
                {displayRank(club.rank)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col gap-[5px] p-2 text-white/30 hover:text-white/60 transition-colors rounded-lg hover:bg-white/[0.04]"
        >
          <span className="w-4 h-px bg-current block" />
          <span className="w-3 h-px bg-current block" />
          <span className="w-4 h-px bg-current block" />
        </button>
      </header>

      {/* Tab bar */}
      <div className="flex border-b border-white/[0.07] shrink-0 px-4 gap-1 pt-2">
        {(["table", "charts"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium rounded-t-lg capitalize transition-all border-b-2 -mb-px ${
              activeTab === tab ? "text-white border-accent" : "text-white/30 border-transparent hover:text-white/55"
            }`}
          >
            {tab === "table" ? (
              <span className="flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <line x1="1" y1="4.5" x2="11" y2="4.5" stroke="currentColor" strokeWidth="1"/>
                  <line x1="5" y1="4.5" x2="5" y2="11" stroke="currentColor" strokeWidth="1"/>
                </svg>
                Table
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <polyline points="1,9 4,5 7,7 11,2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                Charts
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "table" && (
        <WeekTabs weekCount={weekCount} activeWeek={activeWeek} onSelect={setActiveWeek} />
      )}

      <div className={`flex-1 overflow-auto p-4 ${removeMode ? "pb-24" : ""}`}>
        {activeTab === "table" ? (
          <FanTable
            club={club}
            activeWeek={activeWeek}
            monthKey={monthKey}
            removeMode={removeMode}
            selectedForRemoval={selectedForRemoval}
            onToggleRemove={toggleRemoval}
            onUpdateFans={handleUpdateFans}
            onBulkUpdate={handleBulkUpdate}
          />
        ) : (
          <FanCharts club={club} monthKey={monthKey} weekCount={weekCount} />
        )}
      </div>

      {/* Remove mode footer */}
      {removeMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-raised border-t border-white/[0.07] p-4 flex gap-2 animate-fade-in">
          <button
            onClick={() => { setRemoveMode(false); setSelectedForRemoval(new Set()); }}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/35 text-sm hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRemoveConfirm}
            disabled={selectedForRemoval.size === 0}
            className="flex-1 py-2.5 rounded-xl bg-rose text-white text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {selectedForRemoval.size > 0 ? `Remove (${selectedForRemoval.size})` : "Select members"}
          </button>
        </div>
      )}

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
