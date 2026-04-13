import { AppData } from "@/types";

const KEY = "uma-club-tracker-v1";

function empty(): AppData {
  return { clubs: [], meta: { activeClub: null } };
}

export function loadData(): AppData {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppData) : empty();
  } catch {
    return empty();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}
