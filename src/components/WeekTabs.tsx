interface Props {
  weekCount: number;
  activeWeek: number;
  onSelect: (week: number) => void;
}

export default function WeekTabs({ weekCount, activeWeek, onSelect }: Props) {
  return (
    <div className="flex border-b border-surface-overlay overflow-x-auto shrink-0">
      {Array.from({ length: weekCount }, (_, i) => i + 1).map((week) => (
        <button
          key={week}
          onClick={() => onSelect(week)}
          className={`px-6 py-4 text-[11px] font-body tracking-[0.2em] whitespace-nowrap transition-all border-b-2 -mb-px ${
            activeWeek === week
              ? "border-gold text-gold"
              : "border-transparent text-white/30 hover:text-white/60"
          }`}
        >
          WEEK {week}
        </button>
      ))}
    </div>
  );
}
