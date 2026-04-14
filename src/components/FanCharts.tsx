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
  "#60a5fa", "#4ade80", "#facc15", "#f87171", "#c084fc",
];

// Build SVG pie/donut slices from an array of {value, color}
function buildPieSlices(segments: { value: number; color: string; name: string }[], cx: number, cy: number, r: number, ir: number) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return [];
  let angle = -Math.PI / 2; // start at top
  return segments.map((seg) => {
    const sweep = (seg.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const xi1 = cx + ir * Math.cos(angle);
    const yi1 = cy + ir * Math.sin(angle);
    const xi2 = cx + ir * Math.cos(angle - sweep);
    const yi2 = cy + ir * Math.sin(angle - sweep);
    const large = sweep > Math.PI ? 1 : 0;
    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
      `L ${xi1} ${yi1}`,
      `A ${ir} ${ir} 0 ${large} 0 ${xi2} ${yi2}`,
      "Z",
    ].join(" ");
    return { d, color: seg.color, name: seg.name, value: seg.value, pct: seg.value / total };
  });
}

export default function FanCharts({ club, monthKey, weekCount }: Props) {
  const weeks = Array.from({ length: weekCount }, (_, i) => i + 1);

  const memberSeries = useMemo(() =>
    club.members.map((m, i) => ({
      member: m,
      color: COLORS[i % COLORS.length],
      data: weeks.map((w) => m.history?.[monthKey]?.weeks?.[String(w)]?.current ?? 0),
      increases: weeks.map((w) => {
        const wd = m.history?.[monthKey]?.weeks?.[String(w)];
        return wd ? wd.current - wd.prev : 0;
      }),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [club.members, monthKey, weekCount]
  );

  // Total fans: latest non-zero current per member summed
  const totalFans = useMemo(() =>
    club.members.reduce((sum, m) => {
      for (let w = weekCount; w >= 1; w--) {
        const cur = m.history?.[monthKey]?.weeks?.[String(w)]?.current;
        if (cur && cur > 0) return sum + cur;
      }
      return sum;
    }, 0),
    [club.members, monthKey, weekCount]
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

  // Weekly leaders = highest EARNED (increase) that week
  const weeklyEarnLeaders = weeks.map((_, wi) =>
    memberSeries.reduce(
      (b, s) => (s.increases[wi] > b.val ? { name: s.member.name, val: s.increases[wi], color: s.color } : b),
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

  const VW = 400; const VH = 160;
  const PL = 8; const PR = 8; const PT = 10; const PB = 24;
  const plotW = VW - PL - PR; const plotH = VH - PT - PB;
  const xOf = (wi: number) => weeks.length > 1 ? PL + (wi / (weeks.length - 1)) * plotW : PL + plotW / 2;
  const yOf = (val: number) => PT + plotH - (val / (maxVal || 1)) * plotH;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface rounded-xl border border-white/[0.07] p-4">
          <p className="text-[11px] text-white/30 mb-2">Top gainer this month</p>
          <p className="text-sm font-semibold truncate" style={{ color: hasAnyData && topGainer.total > 0 ? topGainer.color : undefined }}>
            {hasAnyData && topGainer.total > 0 ? topGainer.name : <span className="text-white/25">—</span>}
          </p>
          <p className="text-[11px] text-white/40 font-mono mt-0.5">
            {hasAnyData && topGainer.total > 0 ? `+${formatFans(topGainer.total)}` : "—"}
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-white/[0.07] p-4">
          <p className="text-[11px] text-white/30 mb-2">Club total fans</p>
          <p className="text-sm font-semibold font-mono text-white">
            {totalFans > 0 ? formatFans(totalFans) : <span className="text-white/25">—</span>}
          </p>
          <p className="text-[11px] text-white/40 mt-0.5">{club.members.length} members</p>
        </div>
      </div>

      {!hasAnyData && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 bg-surface rounded-xl border border-white/[0.07]">
          <p className="text-white/20 text-sm">No fan data recorded yet.</p>
          <p className="text-white/10 text-xs">Add data in the Table tab to see charts.</p>
        </div>
      )}

      {hasAnyData && (
        <>
          {/* Fan Count line chart */}
          <div className="bg-surface rounded-xl border border-white/[0.07] p-4">
            <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest mb-4">Fan Count by Week</p>
            <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ height: 160 }}>
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <line key={t} x1={PL} y1={PT + plotH * (1 - t)} x2={VW - PR} y2={PT + plotH * (1 - t)}
                  stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
              ))}
              {weeks.map((w, wi) => (
                <text key={w} x={xOf(wi)} y={VH - 6} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.25)">W{w}</text>
              ))}
              {memberSeries.map((s) => {
                if (!s.data.some((v) => v > 0)) return null;
                return (
                  <g key={s.member.id}>
                    <polyline points={s.data.map((v, wi) => `${xOf(wi)},${yOf(v)}`).join(" ")}
                      fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
                    {s.data.map((v, wi) => v > 0 ? <circle key={wi} cx={xOf(wi)} cy={yOf(v)} r="3.5" fill={s.color} /> : null)}
                  </g>
                );
              })}
            </svg>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
              {memberSeries.map((s) => (
                <div key={s.member.id} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[11px] text-white/50">{s.member.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fan Increase per Week */}
          <div className="bg-surface rounded-xl border border-white/[0.07] overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
              <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest">Fan Increase per Week</p>
            </div>

            {weeks.map((w, wi) => {
              const weekInc = memberSeries
                .map((s) => ({ name: s.member.name, val: s.increases[wi], color: s.color }))
                .filter((x) => x.val > 0)
                .sort((a, b) => b.val - a.val);

              const negatives = memberSeries
                .map((s) => ({ name: s.member.name, val: s.increases[wi], color: s.color }))
                .filter((x) => x.val < 0)
                .sort((a, b) => a.val - b.val);

              const allThisWeek = [...weekInc, ...negatives];
              if (allThisWeek.length === 0) return null;

              const totalInc = weekInc.reduce((sum, x) => sum + x.val, 0);
              const wMax = Math.max(...allThisWeek.map((x) => Math.abs(x.val)), 1);

              // Pie chart data (only positives for the pie)
              const pieSegments = weekInc.map((x) => ({ value: x.val, color: x.color, name: x.name }));
              const pieSize = 80;
              const cx = pieSize / 2, cy = pieSize / 2;
              const slices = buildPieSlices(pieSegments, cx, cy, pieSize / 2 - 2, pieSize / 2 - 14);

              return (
                <div key={w} className={wi > 0 ? "border-t border-white/[0.06]" : ""}>
                  {/* Week header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-white/60">Week {w}</span>
                      <span className="text-[10px] font-mono text-white/20">{allThisWeek.length} members</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald/70">+{formatFans(totalInc)} total</span>
                  </div>

                  {/* Pie chart + ranked list side by side */}
                  <div className="px-4 py-3 flex gap-4">
                    {/* Donut pie */}
                    {pieSegments.length > 0 && (
                      <div className="shrink-0">
                        <svg width={pieSize} height={pieSize} viewBox={`0 0 ${pieSize} ${pieSize}`}>
                          {slices.map((slice, si) => (
                            <path key={si} d={slice.d} fill={slice.color} opacity={0.82}>
                              <title>{slice.name}: +{formatFans(slice.value)} ({Math.round(slice.pct * 100)}%)</title>
                            </path>
                          ))}
                          {/* Center hole label */}
                          <text x={cx} y={cy - 3} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.35)" fontWeight="600">
                            {allThisWeek.length}
                          </text>
                          <text x={cx} y={cy + 6} textAnchor="middle" fontSize="5.5" fill="rgba(255,255,255,0.2)">
                            members
                          </text>
                        </svg>
                      </div>
                    )}

                    {/* Ranked member rows */}
                    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                      {allThisWeek.map(({ name, val, color }, ri) => (
                        <div key={name} className="flex items-center gap-2">
                          <span className="text-[10px] text-white/20 w-4 text-right shrink-0 font-mono">{ri + 1}</span>
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: val > 0 ? color : "#f06b85" }} />
                          <span className="text-[11px] text-white/55 w-20 truncate shrink-0">{name}</span>
                          <div className="flex-1 h-3 flex items-center">
                            <div className="h-1 rounded-full"
                              style={{ width: `${Math.min((Math.abs(val) / wMax) * 100, 100)}%`, backgroundColor: val > 0 ? color : "#f06b85", opacity: 0.6 }} />
                          </div>
                          <span className="text-[11px] font-mono font-medium w-20 text-right shrink-0"
                            style={{ color: val > 0 ? color : "#f06b85" }}>
                            {val > 0 ? `+${formatFans(val)}` : formatFans(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weekly Leaders — highest EARNED that week */}
          <div className="bg-surface rounded-xl border border-white/[0.07] overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
              <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest">Weekly Fan Leaders</p>
              <p className="text-[10px] text-white/20 mt-0.5">Highest fans earned per week</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {weeks.map((w, wi) => {
                const leader = weeklyEarnLeaders[wi];
                if (leader.val <= 0) return null;

                // Top 3 by increase this week
                const top3 = [...memberSeries]
                  .filter(s => s.increases[wi] > 0)
                  .sort((a, b) => b.increases[wi] - a.increases[wi])
                  .slice(0, 3);

                if (top3.length === 0) return null;

                return (
                  <div key={w} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-white/50">Week {w}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: leader.color }} />
                        <span className="text-xs font-medium" style={{ color: leader.color }}>{leader.name}</span>
                        <span className="text-[11px] font-mono text-white/35">+{formatFans(leader.val)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {top3.map((s, rank) => (
                        <div key={s.member.id} className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-white/20 w-3">{rank + 1}</span>
                          <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{ width: `${(s.increases[wi] / top3[0].increases[wi]) * 100}%`, backgroundColor: s.color, opacity: 0.65 }} />
                          </div>
                          <span className="text-[10px] font-mono text-white/30 w-24 text-right">+{formatFans(s.increases[wi])}</span>
                        </div>
                      ))}
                    </div>
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
