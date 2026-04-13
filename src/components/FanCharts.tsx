"use client";

import { useMemo } from "react";
import { Club } from "@/types";
import { formatFans } from "@/lib/utils";

interface Props {
  club: Club;
  monthKey: string;
  weekCount: number;
}

const COLORS = [
  "#4f8ef7", "#34d97b", "#f5a623", "#e879a8", "#a78bfa",
  "#38bdf8", "#fb923c", "#86efac", "#fbbf24", "#f472b6",
];

export default function FanCharts({ club, monthKey, weekCount }: Props) {
  const weeks = Array.from({ length: weekCount }, (_, i) => i + 1);

  const memberSeries = useMemo(() =>
    club.members.map((m, i) => ({
      member: m,
      color: COLORS[i % COLORS.length],
      data: weeks.map((w) => m.history?.[monthKey]?.weeks?.[String(w)]?.current ?? 0),
      increases: weeks.map((w) => {
        const wd = m.history?.[monthKey]?.weeks?.[String(w)];
        if (!wd) return 0;
        return wd.current - wd.prev;
      }),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [club.members, monthKey, weekCount]
  );

  const totalByWeek = weeks.map((_, wi) =>
    memberSeries.reduce((sum, s) => sum + s.data[wi], 0)
  );

  const allValues = memberSeries.flatMap((s) => s.data).filter((v) => v > 0);
  const maxVal = allValues.length > 0 ? Math.max(...allValues) : 1;

  const topGainer = memberSeries.reduce(
    (best, s) => {
      const total = s.increases.reduce((a, b) => a + b, 0);
      return total > best.total ? { name: s.member.name, total, color: s.color } : best;
    },
    { name: "—", total: 0, color: COLORS[0] }
  );

  const weeklyHighest = weeks.map((_, wi) =>
    memberSeries.reduce(
      (b, s) => (s.data[wi] > b.val ? { name: s.member.name, val: s.data[wi], color: s.color } : b),
      { name: "—", val: 0, color: "#fff" }
    )
  );

  if (club.members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2">
        <p className="text-white/20 text-sm">No members yet.</p>
      </div>
    );
  }

  const hasAnyData = allValues.length > 0;

  // SVG chart constants — fixed pixel viewBox for correct aspect ratio
  const VW = 400;
  const VH = 160;
  const PAD_L = 8;
  const PAD_R = 8;
  const PAD_T = 10;
  const PAD_B = 24;
  const plotW = VW - PAD_L - PAD_R;
  const plotH = VH - PAD_T - PAD_B;

  const xOf = (wi: number) =>
    weeks.length > 1
      ? PAD_L + (wi / (weeks.length - 1)) * plotW
      : PAD_L + plotW / 2;

  const yOf = (val: number) =>
    PAD_T + plotH - (val / (maxVal || 1)) * plotH;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface rounded-xl border border-surface-overlay p-4">
          <p className="text-[11px] text-white/30 mb-1">Top gainer this month</p>
          <p className="text-sm font-semibold truncate" style={{ color: topGainer.color }}>
            {topGainer.name}
          </p>
          <p className="text-[11px] text-white/40 font-mono mt-0.5">
            {topGainer.total > 0 ? `+${formatFans(topGainer.total)}` : "—"}
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-surface-overlay p-4">
          <p className="text-[11px] text-white/30 mb-1">Club total fans</p>
          <p className="text-sm font-semibold font-mono text-white">
            {totalByWeek[totalByWeek.length - 1] > 0
              ? formatFans(totalByWeek[totalByWeek.length - 1])
              : "—"}
          </p>
          <p className="text-[11px] text-white/40 mt-0.5">{club.members.length} members</p>
        </div>
      </div>

      {!hasAnyData && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 bg-surface rounded-xl border border-surface-overlay">
          <p className="text-white/20 text-sm">No fan data recorded yet.</p>
          <p className="text-white/10 text-xs">Add data in the Table tab to see charts.</p>
        </div>
      )}

      {hasAnyData && (
        <>
          {/* Fan Count line chart */}
          <div className="bg-surface rounded-xl border border-surface-overlay p-4">
            <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest mb-4">
              Fan Count by Week
            </p>
            <svg
              viewBox={`0 0 ${VW} ${VH}`}
              className="w-full"
              style={{ height: 160 }}
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <line
                  key={t}
                  x1={PAD_L} y1={PAD_T + plotH * (1 - t)}
                  x2={VW - PAD_R} y2={PAD_T + plotH * (1 - t)}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.8"
                />
              ))}

              {/* Week labels */}
              {weeks.map((w, wi) => (
                <text
                  key={w}
                  x={xOf(wi)}
                  y={VH - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="rgba(255,255,255,0.25)"
                >
                  W{w}
                </text>
              ))}

              {/* Lines per member */}
              {memberSeries.map((s) => {
                const hasLine = s.data.some((v) => v > 0);
                if (!hasLine) return null;
                const pts = s.data
                  .map((v, wi) => `${xOf(wi)},${yOf(v)}`)
                  .join(" ");
                return (
                  <g key={s.member.id}>
                    <polyline
                      points={pts}
                      fill="none"
                      stroke={s.color}
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                    {s.data.map((v, wi) =>
                      v > 0 ? (
                        <circle
                          key={wi}
                          cx={xOf(wi)}
                          cy={yOf(v)}
                          r="3.5"
                          fill={s.color}
                        />
                      ) : null
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
              {memberSeries.map((s) => (
                <div key={s.member.id} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[11px] text-white/50">{s.member.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fan Increase bar chart */}
          <div className="bg-surface rounded-xl border border-surface-overlay p-4">
            <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest mb-4">
              Fan Increase per Week
            </p>
            <div className="flex flex-col gap-3">
              {weeks.map((w, wi) => {
                const weekIncreases = memberSeries
                  .map((s) => ({ name: s.member.name, val: s.increases[wi], color: s.color }))
                  .filter((x) => x.val !== 0);
                if (weekIncreases.length === 0) return null;
                const wMax = Math.max(...weekIncreases.map((x) => Math.abs(x.val)), 1);
                return (
                  <div key={w}>
                    <p className="text-[10px] text-white/25 mb-1.5 font-mono">Week {w}</p>
                    <div className="flex flex-col gap-1.5">
                      {weekIncreases.map(({ name, val, color }) => (
                        <div key={name} className="flex items-center gap-2">
                          <span className="text-[10px] text-white/40 w-20 truncate shrink-0">{name}</span>
                          <div className="flex-1 h-4 flex items-center">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${Math.min((Math.abs(val) / wMax) * 100, 100)}%`,
                                backgroundColor: val > 0 ? color : "#f06b85",
                                opacity: 0.8,
                              }}
                            />
                          </div>
                          <span
                            className="text-[10px] font-mono w-16 text-right shrink-0"
                            style={{ color: val > 0 ? color : "#f06b85" }}
                          >
                            {val > 0 ? `+${formatFans(val)}` : formatFans(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly leaderboard */}
          <div className="bg-surface rounded-xl border border-surface-overlay p-4">
            <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest mb-3">
              Weekly Leaders
            </p>
            <div className="flex flex-col">
              {weeks.map((w, wi) => {
                const best = weeklyHighest[wi];
                if (best.val === 0) return null;
                return (
                  <div
                    key={w}
                    className="flex items-center justify-between py-2.5 border-b border-surface-overlay last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-white/25 w-10">Wk {w}</span>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: best.color }} />
                      <span className="text-sm text-white/70 font-medium">{best.name}</span>
                    </div>
                    <span className="text-xs font-mono text-white/50">{formatFans(best.val)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
