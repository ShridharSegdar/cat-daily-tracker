import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { CAT_EXAM_DATE } from "@/lib/tasks";

export function Countdown() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const days = Math.max(0, Math.ceil((CAT_EXAM_DATE.getTime() - now.getTime()) / 86_400_000));
  return (
    <div className="premium-card flex items-center gap-3 p-4">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[color:var(--surface-2)] text-primary">
        <CalendarClock className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">CAT Countdown</div>
        <div className="text-sm text-foreground/90">
          <span className="text-lg font-semibold text-foreground">{days}</span> days to exam day
        </div>
      </div>
    </div>
  );
}
