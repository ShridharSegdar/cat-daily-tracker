import { Flame, Target, TrendingUp } from "lucide-react";
import { useHabits } from "@/context/HabitsContext";

export function StatsRow() {
  const { dailyPct, streak, weeklyPct } = useHabits();
  const items = [
    { icon: Target, label: "Today", value: `${dailyPct()}%` },
    { icon: Flame, label: "Streak", value: `${streak}d` },
    { icon: TrendingUp, label: "Week", value: `${weeklyPct}%` },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="premium-card flex flex-col items-start gap-2 p-4">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-[color:var(--surface-2)] text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-lg font-semibold text-foreground">{value}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}
