"use client";

import { useState } from "react";
import { Club } from "@/types";
import { formatFans, getLatestCurrentFans } from "@/lib/utils";

interface Props {
  open: boolean;
  club: Club;
  onClose: () => void;
  onAddMember: (name: string) => void;
  onStartRemove: () => void;
}

export default function BurgerMenu({ open, club, onClose, onAddMember, onStartRemove }: Props) {
  const [addingMember, setAddingMember] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddMember(newName.trim());
    setNewName("");
    setAddingMember(false);
  };

  const handleClose = () => {
    setAddingMember(false);
    setNewName("");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={handleClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-surface-raised border-l border-surface-border z-50 flex flex-col transition-transform duration-250 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border shrink-0">
          <div>
            <h2 className="text-white font-semibold text-sm">Members</h2>
            <p className="text-[11px] text-white/30 mt-0.5">
              {club.members.length} in {club.name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/25 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-surface-hover"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto">
          {club.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-white/20 text-sm">No members yet.</p>
            </div>
          ) : (
            <div>
              {club.members.map((member, idx) => {
                const latestFans = getLatestCurrentFans(member);
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between px-5 py-3 border-b border-surface-border/60 ${
                      idx % 2 === 0 ? "" : "bg-surface/40"
                    }`}
                  >
                    <span className="text-sm text-white/75 font-medium">{member.name}</span>
                    <span className="text-xs font-mono text-white/30 tabular-nums">
                      {latestFans > 0 ? formatFans(latestFans) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-surface-border p-4 flex flex-col gap-2 shrink-0">
          {addingMember ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Trainer name…"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") { setAddingMember(false); setNewName(""); }
                }}
                className="bg-surface border border-surface-border rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setAddingMember(false); setNewName(""); }}
                  className="flex-1 py-2.5 rounded-xl border border-surface-border text-white/35 text-sm hover:border-white/15 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => setAddingMember(true)}
                className="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-colors"
              >
                + Add Member
              </button>
              <button
                onClick={onStartRemove}
                className="w-full py-2.5 rounded-xl border border-surface-border text-rose text-sm hover:border-rose/25 transition-colors"
              >
                Remove Members
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
