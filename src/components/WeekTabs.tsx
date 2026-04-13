interface Props {
  weekCount: number;
  activeWeek: number;
  onSelect: (week: number) => void;
}

export default function WeekTabs({ weekCount, activeWeek, onSelect }: Props) {
  return (
    <div className="flex gap-1 px-4 py-3 border-b border-surface-border overflow-x-auto shrink-0">
      {Array.from({ length: weekCount }, (_, i) => i + 1).map((week) => (
        <button
          key={week}
          onClick={() => onSelect(week)}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            activeWeek === week
              ? "bg-accent-dim text-accent border border-accent/30"
              : "text-white/30 hover:text-white/60 hover:bg-surface-hover"
          }`}
        >
          Week {week}
        </button>
      ))}
    </div>
  );
}
