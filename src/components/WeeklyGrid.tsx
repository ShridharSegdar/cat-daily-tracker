import { Check } from "lucide-react";
import { useHabits } from "@/context/HabitsContext";
import { weekDates } from "@/lib/tasks";

export function WeeklyGrid() {
  const { history, tasks } = useHabits();
  const days = weekDates();
  const total = Math.max(1, tasks.length);

  return (
    <div className="premium-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Weekly Consistency</h3>
        <span className="text-xs text-muted-foreground">This week</span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const day = history[d.key] ?? {};
          const done = tasks.filter(t => day[t.id]).length;
          const ratio = done / total;
          const complete = ratio >= 0.7;
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.label}</span>
              <div
                className={[
                  "grid h-9 w-9 place-items-center rounded-lg border",
                  complete
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-white/10 bg-[color:var(--surface-2)]",
                ].join(" ")}
              >
                {complete && <Check className="h-4 w-4" strokeWidth={3} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
