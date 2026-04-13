import { Member } from "@/types";

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function getWeeksInMonth(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Math.ceil((firstDay + daysInMonth) / 7);
}

export function formatFans(n: number): string {
  if (!n) return "—";
  return n.toLocaleString();
}

export function getLatestCurrentFans(member: Member): number {
  const monthKeys = Object.keys(member.history).sort().reverse();
  for (const mk of monthKeys) {
    const weeks = member.history[mk]?.weeks ?? {};
    const weekNums = Object.keys(weeks).sort((a, b) => Number(b) - Number(a));
    for (const wn of weekNums) {
      if (weeks[wn].current > 0) return weeks[wn].current;
    }
  }
  return 0;
}
