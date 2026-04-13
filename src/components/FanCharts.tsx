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

  // Per-member weekly current fans
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
    [club.members, monthKey, weeks]
  );

  // Total fans per week
  const totalByWeek = weeks.map((_, wi) =>
    memberSeries.reduce((sum, s) => sum + s.data[wi], 0)
  );

  const allValues = memberSeries.flatMap((s) => s.data).filter((v) => v > 0);
  const maxVal = allValues.length > 0 ? Math.max(...allValues) : 1;

  const allIncreases = memberSeries.flatMap((s) => s.increases);
  const maxInc = Math.max(...allIncreases, 1);
  const minInc = Math.min(...allIncreases, 0);
  const incRange = maxInc - minInc || 1;

  const chartH = 140;
  const chartW = 100; // percentage-based via viewBox
  const padL = 0;
  const padR = 0;
  const padT = 8;
  const padB = 20;
  const plotH = chartH - padT - padB;

  const toY = (val: number, max: number) =>
    padT + plotH - (val / (max || 1)) * plotH;

  const toIncY = (val: number) =>
    padT + plotH - ((val - minInc) / incRange) * plotH;

  const xStep = weeks.length > 1 ? (chartW - padL - padR) / (weeks.length - 1) : chartW / 2;

  // Summary stats
  const topGainer = memberSeries.reduce(
    (best, s) => {
      const total = s.increases.reduce((a, b) => a + b, 0);
      return total > best.total ? { name: s.member.name, total, color: s.color } : best;
    },
    { name: "—", total: 0, color: COLORS[0] }
  );

  const weeklyHighest = weeks.map((_, wi) => {
    const best = memberSeries.reduce(
      (b, s) => (s.data[wi] > b.val ? { name: s.member.name, val: s.data[wi], color: s.color } : b),
      { name: "—", val: 0, color: "#fff" }
    );
    return best;
  });

  if (club.members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2">
        <p className="text-white/20 text-sm">No members yet.</p>
      </div>
    );
  }

  const hasAnyData = allValues.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface rounded-xl border border-surface-border p-4">
          <p className="text-[11px] text-white/30 mb-1">Top gainer this month</p>
          <p className="text-white font-semibold text-sm truncate" style={{ color: topGainer.color }}>
            {topGainer.name}
          </p>
          <p className="text-[11px] text-white/40 font-mono mt-0.5">
            {topGainer.total > 0 ? `+${formatFans(topGainer.total)}` : "—"}
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-surface-border p-4">
          <p className="text-[11px] text-white/30 mb-1">Club total fans</p>
          <p className="text-white font-semibold text-sm font-mono">
            {formatFans(totalByWeek[totalByWeek.length - 1]) || "—"}
          </p>
          <p className="text-[11px] text-white/40 mt-0.5">{club.members.length} members</p>
        </div>
      </div>

      {!hasAnyData && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 bg-surface rounded-xl border border-surface-border">
          <p className="text-white/20 text-sm">No fan data recorded yet.</p>
          <p className="text-white/12 text-xs">Add data in the Table tab to see charts.</p>
        </div>
      )}

      {hasAnyData && (
        <>
          {/* Fan count line chart */}
          <div className="bg-surface rounded-xl border border-surface-border p-4">
            <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest mb-4">Fan Count by Week</p>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" preserveAspectRatio="none" style={{ height: 160 }}>
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <line
                  key={t}
                  x1={padL} y1={padT + plotH * (1 - t)}
                  x2={chartW - padR} y2={padT + plotH * (1 - t)}
                  stroke="rgba(255,255,255,0.05)" strokeWidth="0.3"
                />
              ))}

              {/* Week tick labels */}
              {weeks.map((w, wi) => (
                <text
                  key={w}
                  x={padL + wi * xStep}
                  y={chartH - 4}
                  textAnchor="middle"
                  fontSize="4"
                  fill="rgba(255,255,255,0.25)"
                >
                  W{w}
                </text>
              ))}

              {/* Lines per member */}
              {memberSeries.map((s) => {
                const pts = s.data.map((v, wi) => `${padL + wi * xStep},${toY(v, maxVal)}`).join(" ");
                const hasLine = s.data.some((v) => v > 0);
                if (!hasLine) return null;
                return (
                  <g key={s.member.id}>
                    <polyline
                      points={pts}
                      fill="none"
                      stroke={s.color}
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                    {s.data.map((v, wi) =>
                      v > 0 ? (
                        <circle
                          key={wi}
                          cx={padL + wi * xStep}
                          cy={toY(v, maxVal)}
                          r="1.5"
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
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[11px] text-white/50">{s.member.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fan increase bar chart */}
          <div className="bg-surface rounded-xl border border-surface-border p-4">
            <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest mb-4">Fan Increase per Week</p>

            <div className="flex flex-col gap-2">
              {weeks.map((w, wi) => {
                const weekIncreases = memberSeries
                  .map((s) => ({ name: s.member.name, val: s.increases[wi], color: s.color }))
                  .filter((x) => x.val !== 0);
                if (weekIncreases.length === 0) return null;

                const wMax = Math.max(...weekIncreases.map((x) => Math.abs(x.val)), 1);

                return (
                  <div key={w}>
                    <p className="text-[10px] text-white/25 mb-1.5 font-mono">Week {w}</p>
                    <div className="flex flex-col gap-1">
                      {weekIncreases.map(({ name, val, color }) => (
                        <div key={name} className="flex items-center gap-2">
                          <span className="text-[10px] text-white/40 w-20 truncate shrink-0">{name}</span>
                          <div className="flex-1 h-4 flex items-center">
                            <div
                              className="h-2 rounded-full transition-all"
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
          <div className="bg-surface rounded-xl border border-surface-border p-4">
            <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest mb-3">Weekly Leaders</p>
            <div className="flex flex-col gap-0">
              {weeks.map((w, wi) => {
                const best = weeklyHighest[wi];
                if (best.val === 0) return null;
                return (
                  <div key={w} className="flex items-center justify-between py-2.5 border-b border-surface-border last:border-0">
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
