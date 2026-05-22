import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useHabits } from "@/context/HabitsContext";
import { lastNDays, todayKey, getIcon } from "@/lib/tasks";

interface Props {
  id: string;
  name: string;
  time?: string | null;
  icon: string;
}

export function TaskRow({ id, name, time, icon }: Props) {
  const { isDone, toggle } = useHabits();
  const Icon = getIcon(icon);
  const days = lastNDays(7);
  const today = todayKey();

  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex min-w-0 items-center gap-3 sm:flex-1">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[color:var(--surface-2)] text-foreground/80">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">{name}</div>
          {time && <div className="truncate text-xs text-muted-foreground">{time}</div>}
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-1.5">

        {days.map((d) => {
          const done = isDone(id, d);
          const isToday = d === today;
          return (
            <motion.button
              key={d}
              whileTap={{ scale: 0.85 }}
              onClick={() => isToday && toggle(id, d)}
              disabled={!isToday}
              aria-label={`${name} on ${d}`}
              className={[
                "grid h-6 w-6 place-items-center rounded-md border transition-colors",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/15 bg-transparent",
                isToday ? "ring-1 ring-primary/40" : "opacity-70",
                isToday ? "cursor-pointer" : "cursor-default",
              ].join(" ")}
            >
              {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
