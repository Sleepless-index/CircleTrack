export type Rank =
  | "SS"
  | "S-plus"
  | "S"
  | "A-plus"
  | "A"
  | "B-plus"
  | "B"
  | "C-plus"
  | "C"
  | "D-plus"
  | null;

export const RANKS: Exclude<Rank, null>[] = [
  "SS",
  "S-plus",
  "S",
  "A-plus",
  "A",
  "B-plus",
  "B",
  "C-plus",
  "C",
  "D-plus",
];

export function displayRank(rank: Rank): string {
  if (!rank) return "";
  return rank.replace("-plus", "+");
}

export interface WeekData {
  prev: number;
  current: number;
}

export interface MemberHistory {
  [monthKey: string]: {
    // e.g. "2026-04"
    weeks: {
      [weekNum: string]: WeekData;
    };
  };
}

export interface Member {
  id: string;
  name: string;
  history: MemberHistory;
}

export interface Club {
  id: string;
  name: string;
  rank: Rank;
  members: Member[];
}

export interface AppData {
  clubs: Club[];
  meta: {
    activeClub: string | null;
  };
}
