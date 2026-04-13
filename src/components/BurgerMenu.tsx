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

export default function BurgerMenu({
  open,
  club,
  onClose,
  onAddMember,
  onStartRemove,
}: Props) {
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
        className={`fixed top-0 right-0 h-full w-72 bg-surface-raised border-l border-surface-overlay z-50 flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-surface-overlay shrink-0">
          <div>
            <h2 className="font-display text-sm font-semibold tracking-[0.2em] text-gold">
              MEMBERS
            </h2>
            <p className="text-[10px] text-white/30 font-body mt-0.5">
              {club.members.length} in {club.name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/25 hover:text-white/70 transition-colors p-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3L13 13M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto">
          {club.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-white/20 text-sm font-body">No members yet.</p>
            </div>
          ) : (
            <div>
              {club.members.map((member, idx) => {
                const latestFans = getLatestCurrentFans(member);
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between px-5 py-3.5 border-b border-surface-overlay/50 ${
                      idx % 2 === 0 ? "" : "bg-surface/30"
                    }`}
                  >
                    <span className="text-sm font-body text-white/75">
                      {member.name}
                    </span>
                    <span className="text-xs font-body text-gold/60 tabular-nums">
                      {latestFans > 0 ? formatFans(latestFans) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="border-t border-surface-overlay p-4 flex flex-col gap-2.5 shrink-0">
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
                  if (e.key === "Escape") {
                    setAddingMember(false);
                    setNewName("");
                  }
                }}
                className="bg-surface border border-surface-overlay rounded-xl px-4 py-3 text-white text-sm font-body placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAddingMember(false);
                    setNewName("");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-surface border border-surface-overlay text-white/40 text-sm font-body hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gold text-bg text-sm font-body font-semibold hover:bg-gold-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => setAddingMember(true)}
                className="w-full py-3 rounded-xl bg-gold text-bg text-sm font-body font-semibold tracking-wider hover:bg-gold-light transition-colors"
              >
                + Add Member
              </button>
              <button
                onClick={onStartRemove}
                className="w-full py-3 rounded-xl bg-surface border border-surface-overlay text-rose text-sm font-body hover:border-rose/30 transition-colors"
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
