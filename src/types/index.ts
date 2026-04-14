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
  "SS", "S-plus", "S", "A-plus", "A", "B-plus", "B", "C-plus", "C", "D-plus",
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
    weeks: {
      [weekNum: string]: WeekData;
    };
  };
}

export interface Member {
  id: string;
  name: string;
  quota?: number; // optional weekly fan gain quota
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
