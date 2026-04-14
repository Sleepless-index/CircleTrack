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
  const [deletingClub, setDeletingClub] = useState<Club | null>(null);
  const router = useRouter();

  useEffect(() => { setData(loadData()); }, []);

  const handleAddClub = (name: string, rank: Rank) => {
    const updated = { ...data, clubs: [...data.clubs, { id: generateId(), name, rank, members: [] }] };
    setData(updated); saveData(updated); setShowAdd(false);
  };

  const handleEditClub = (clubId: string, name: string, rank: Rank) => {
    const updated = { ...data, clubs: data.clubs.map((c) => (c.id === clubId ? { ...c, name, rank } : c)) };
    setData(updated); saveData(updated); setEditingClub(null);
  };

  const handleDeleteClub = (clubId: string) => {
    const updated = { ...data, clubs: data.clubs.filter((c) => c.id !== clubId) };
    setData(updated); saveData(updated); setDeletingClub(null);
  };

  return (
    <div className="min-h-screen bg-bg font-sans">
      <header className="px-5 py-4 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-accent-dim flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
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

      <main className="p-4">
        {data.clubs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-white/25 text-sm">No clubs yet.</p>
            <p className="text-white/12 text-xs">Add your first one below.</p>
          </div>
        )}

        {/* Smaller cards — 3 cols on mobile, more on larger screens */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
          {data.clubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              onClick={() => router.push(`/club/${club.id}`)}
              onEdit={() => setEditingClub(club)}
              onDelete={() => setDeletingClub(club)}
            />
          ))}

          <button
            onClick={() => setShowAdd(true)}
            className="aspect-square rounded-xl border border-dashed border-white/8 hover:border-white/15 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:bg-white/[0.02] group"
          >
            <div className="w-6 h-6 rounded-full border border-dashed border-white/10 group-hover:border-white/20 flex items-center justify-center transition-colors">
              <span className="text-white/20 group-hover:text-white/40 text-base leading-none transition-colors">+</span>
            </div>
            <span className="text-[9px] text-white/18 group-hover:text-white/30 tracking-wider uppercase transition-colors">New</span>
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

      {deletingClub && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface-raised border border-white/8 rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-white font-semibold text-base">Delete club?</h2>
              <p className="text-white/40 text-sm mt-1">
                <span className="text-white/70">{deletingClub.name}</span> and all its member data will be permanently removed.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeletingClub(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm hover:border-white/20 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDeleteClub(deletingClub.id)}
                className="flex-1 py-2.5 rounded-xl bg-rose text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
