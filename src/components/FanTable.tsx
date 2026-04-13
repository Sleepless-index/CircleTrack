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
    member.history?.[monthKey]?.weeks?.[String(activeWeek)] ?? {
      prev: 0,
      current: 0,
    };

  if (club.members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-white/20 font-body text-sm tracking-wider">
          No members yet.
        </p>
        <p className="text-white/10 font-body text-xs">
          Open the menu to add your first member.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl overflow-hidden border border-surface-overlay">
        {/* Header Row */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_40px] bg-surface-overlay">
          {/* Checkbox spacer */}
          <div className="w-10" />
          <div className="px-4 py-3 text-[10px] font-body tracking-[0.2em] text-white/30">
            TRAINER
          </div>
          <div className="px-4 py-3 text-[10px] font-body tracking-[0.2em] text-white/30 text-right">
            PREV FANS
          </div>
          <div className="px-4 py-3 text-[10px] font-body tracking-[0.2em] text-white/30 text-right">
            CURRENT FANS
          </div>
          <div className="px-4 py-3 text-[10px] font-body tracking-[0.2em] text-white/30 text-right">
            +
          </div>
        </div>

        {/* Data Rows */}
        {club.members.map((member, idx) => {
          const { prev, current } = getWeekData(member);
          const increase = current - prev;
          const isSelected = selectedForRemoval.has(member.id);

          return (
            <div
              key={member.id}
              className={`grid grid-cols-[auto_1fr_1fr_1fr_40px] border-t border-surface-overlay transition-colors ${
                isSelected
                  ? "bg-rose/10"
                  : idx % 2 === 0
                  ? "bg-surface"
                  : "bg-surface-raised"
              }`}
            >
              {/* Checkbox / empty spacer */}
              <div className="w-10 flex items-center justify-center">
                {removeMode ? (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleRemove(member.id)}
                    className="w-4 h-4 cursor-pointer accent-rose"
                  />
                ) : null}
              </div>

              {/* Name */}
              <div className="px-4 py-3.5 text-sm font-body text-white/80 flex items-center">
                {member.name}
              </div>

              {/* Prev Fans */}
              <div className="px-4 py-3.5 text-sm font-body text-white/40 text-right flex items-center justify-end">
                {formatFans(prev)}
              </div>

              {/* Current Fans */}
              <div className="px-4 py-3.5 text-sm font-body text-white/70 text-right flex items-center justify-end">
                {formatFans(current)}
              </div>

              {/* Fan Increase + Edit Button */}
              <div className="flex items-center justify-end px-1">
                {removeMode ? (
                  <span
                    className={`text-xs font-body pr-2 ${
                      increase > 0 ? "text-gold" : "text-white/20"
                    }`}
                  >
                    {increase > 0 ? `+${formatFans(increase)}` : "—"}
                  </span>
                ) : (
                  <button
                    onClick={() => setEditingMember(member)}
                    className="w-9 h-9 flex items-center justify-center text-white/20 hover:text-gold transition-colors"
                    title="Edit fans"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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

      {/* Fan Increase summary column — shown as separate visual below table when not in remove mode */}
      {!removeMode && club.members.some((m) => getWeekData(m).current > 0) && (
        <div className="mt-3 rounded-xl overflow-hidden border border-surface-overlay">
          <div className="px-4 py-2.5 bg-surface-overlay text-[10px] font-body tracking-[0.2em] text-white/30">
            FAN INCREASE THIS WEEK
          </div>
          {club.members.map((member, idx) => {
            const { prev, current } = getWeekData(member);
            const increase = current - prev;
            if (!current) return null;
            return (
              <div
                key={member.id}
                className={`flex justify-between items-center px-4 py-3 border-t border-surface-overlay ${
                  idx % 2 === 0 ? "bg-surface" : "bg-surface-raised"
                }`}
              >
                <span className="text-sm font-body text-white/60">
                  {member.name}
                </span>
                <span
                  className={`text-sm font-body font-medium ${
                    increase > 0
                      ? "text-gold"
                      : increase < 0
                      ? "text-rose"
                      : "text-white/20"
                  }`}
                >
                  {increase > 0
                    ? `+${formatFans(increase)}`
                    : increase < 0
                    ? formatFans(increase)
                    : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}

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
