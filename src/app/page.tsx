"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Club, AppData, Rank } from "@/types";
import { loadData, saveData } from "@/lib/store";
import { generateId } from "@/lib/utils";
import ClubCard from "@/components/ClubCard";
import AddClubModal from "@/components/AddClubModal";
import EditClubModal from "@/components/EditClubModal";

export default function LandingPage() {
  const [data, setData] = useState<AppData>({ clubs: [], meta: { activeClub: null } });
  const [showAdd, setShowAdd] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const router = useRouter();

  useEffect(() => {
    setData(loadData());
  }, []);

  const handleAddClub = (name: string, rank: Rank) => {
    const newClub: Club = { id: generateId(), name, rank, members: [] };
    const updated = { ...data, clubs: [...data.clubs, newClub] };
    setData(updated);
    saveData(updated);
    setShowAdd(false);
  };

  const handleEditClub = (clubId: string, name: string, rank: Rank) => {
    const updated = {
      ...data,
      clubs: data.clubs.map((c) => (c.id === clubId ? { ...c, name, rank } : c)),
    };
    setData(updated);
    saveData(updated);
    setEditingClub(null);
  };

  return (
    <div className="min-h-screen bg-bg font-sans">
      {/* Header */}
      <header className="px-5 py-5 flex items-center justify-between border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent-dim flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#4f8ef7" strokeWidth="1.5"/>
              <path d="M7 4v3l2 1.5" stroke="#4f8ef7" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">CircleTrack</span>
        </div>
        <span className="text-white/20 text-xs font-mono">
          {data.clubs.length} {data.clubs.length === 1 ? "club" : "clubs"}
        </span>
      </header>

      {/* Main */}
      <main className="p-5">
        {data.clubs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-white/25 text-sm">No clubs yet.</p>
            <p className="text-white/12 text-xs">Add your first one below.</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {data.clubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              onClick={() => router.push(`/club/${club.id}`)}
              onEdit={() => setEditingClub(club)}
            />
          ))}

          {/* Add Club */}
          <button
            onClick={() => setShowAdd(true)}
            className="aspect-square rounded-2xl border border-dashed border-surface-border hover:border-white/15 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:bg-surface-hover group"
          >
            <div className="w-8 h-8 rounded-full border border-dashed border-white/12 group-hover:border-white/20 flex items-center justify-center transition-colors">
              <span className="text-white/20 group-hover:text-white/40 text-lg leading-none transition-colors">+</span>
            </div>
            <span className="text-[10px] text-white/20 group-hover:text-white/35 tracking-wider uppercase transition-colors">
              New Club
            </span>
          </button>
        </div>
      </main>

      {showAdd && <AddClubModal onConfirm={handleAddClub} onClose={() => setShowAdd(false)} />}
      {editingClub && (
        <EditClubModal
          club={editingClub}
          onConfirm={(name, rank) => handleEditClub(editingClub.id, name, rank)}
          onClose={() => setEditingClub(null)}
        />
      )}
    </div>
  );
}
