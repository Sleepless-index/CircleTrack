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
    const newClub: Club = {
      id: generateId(),
      name,
      rank,
      members: [],
    };
    const updated = { ...data, clubs: [...data.clubs, newClub] };
    setData(updated);
    saveData(updated);
    setShowAdd(false);
  };

  const handleEditClub = (clubId: string, name: string, rank: Rank) => {
    const updated = {
      ...data,
      clubs: data.clubs.map((c) =>
        c.id === clubId ? { ...c, name, rank } : c
      ),
    };
    setData(updated);
    saveData(updated);
    setEditingClub(null);
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-surface-overlay px-6 py-5 flex items-center gap-4">
        <div className="w-0.5 h-7 bg-gold rounded-full" />
        <h1 className="font-display text-xl font-bold tracking-[0.2em] text-gold">
          UMA CLUB TRACKER
        </h1>
      </header>

      {/* Club Grid */}
      <main className="p-6">
        {data.clubs.length === 0 && (
          <p className="text-center text-white/20 font-body text-sm mb-8 tracking-wider">
            No clubs yet. Add your first one below.
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.clubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              onClick={() => router.push(`/club/${club.id}`)}
              onEdit={() => setEditingClub(club)}
            />
          ))}

          {/* Add Club Card */}
          <button
            onClick={() => setShowAdd(true)}
            className="aspect-square rounded-2xl border-2 border-dashed border-surface-overlay hover:border-gold/40 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:bg-surface/20 group"
          >
            <span className="text-4xl text-surface-overlay group-hover:text-gold/40 transition-colors leading-none">
              +
            </span>
            <span className="text-[10px] text-surface-overlay group-hover:text-gold/30 font-body tracking-[0.2em] transition-colors">
              ADD CLUB
            </span>
          </button>
        </div>
      </main>

      {showAdd && (
        <AddClubModal onConfirm={handleAddClub} onClose={() => setShowAdd(false)} />
      )}

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
