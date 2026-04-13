"use client";

import { useState } from "react";
import { Club, Member } from "@/types";
import { formatFans } from "@/lib/utils";
import EditFansModal from "./EditFansModal";

interface Props {
  club: Club;
  activeWeek: number;
  monthKey: string;
  removeMode: boolean;
  selectedForRemoval: Set<string>;
  onToggleRemove: (id: string) => void;
  onUpdateFans: (memberId: string, prev: number, current: number) => void;
}

export default function FanTable({
  club,
  activeWeek,
  monthKey,
  removeMode,
  selectedForRemoval,
  onToggleRemove,
  onUpdateFans,
}: Props) {
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const getWeekData = (member: Member) =>
    member.history?.[monthKey]?.weeks?.[String(activeWeek)] ?? { prev: 0, current: 0 };

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
      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-surface-border">
        {/* Header */}
        <div className="grid grid-cols-[auto_1fr_80px_80px_64px_40px] bg-surface-raised">
          <div className="w-10" />
          <div className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase">
            Trainer
          </div>
          <div className="px-3 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 text-right uppercase">
            Prev
          </div>
          <div className="px-3 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 text-right uppercase">
            Current
          </div>
          <div className="px-3 py-2.5 text-[10px] font-semibold tracking-widest text-white/30 text-right uppercase">
            +/−
          </div>
          <div className="w-10" />
        </div>

        {/* Rows */}
        {club.members.map((member, idx) => {
          const { prev, current } = getWeekData(member);
          const increase = current - prev;
          const isSelected = selectedForRemoval.has(member.id);
          const hasData = current > 0 || prev > 0;

          return (
            <div
              key={member.id}
              className={`grid grid-cols-[auto_1fr_80px_80px_64px_40px] border-t border-surface-border transition-colors ${
                isSelected
                  ? "bg-rose/8"
                  : idx % 2 === 0
                  ? "bg-surface"
                  : "bg-surface-raised"
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
              <div className="px-4 py-3 text-sm text-white/85 flex items-center font-medium">
                {member.name}
              </div>

              {/* Prev */}
              <div className="px-3 py-3 text-xs font-mono text-white/30 text-right flex items-center justify-end">
                {prev > 0 ? formatFans(prev) : <span className="text-white/12">—</span>}
              </div>

              {/* Current */}
              <div className="px-3 py-3 text-xs font-mono text-white/65 text-right flex items-center justify-end">
                {current > 0 ? formatFans(current) : <span className="text-white/12">—</span>}
              </div>

              {/* Increase */}
              <div className="px-3 py-3 text-xs font-mono text-right flex items-center justify-end">
                {hasData ? (
                  <span
                    className={`font-medium ${
                      increase > 0
                        ? "text-emerald"
                        : increase < 0
                        ? "text-rose"
                        : "text-white/15"
                    }`}
                  >
                    {increase > 0
                      ? `+${formatFans(increase)}`
                      : increase < 0
                      ? formatFans(increase)
                      : "—"}
                  </span>
                ) : (
                  <span className="text-white/12">—</span>
                )}
              </div>

              {/* Edit / remove indicator */}
              <div className="w-10 flex items-center justify-center">
                {removeMode ? (
                  <span
                    className={`text-xs font-mono ${
                      isSelected ? "text-rose/60" : "text-white/0"
                    }`}
                  >
                    ✕
                  </span>
                ) : (
                  <button
                    onClick={() => setEditingMember(member)}
                    className="w-8 h-8 flex items-center justify-center text-white/15 hover:text-white/50 transition-colors rounded-lg hover:bg-surface-hover"
                    title="Edit fans"
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingMember && (
        <EditFansModal
          member={editingMember}
          weekData={getWeekData(editingMember)}
          onConfirm={(prev, current) => {
            onUpdateFans(editingMember.id, prev, current);
            setEditingMember(null);
          }}
          onClose={() => setEditingMember(null)}
        />
      )}
    </>
  );
}
