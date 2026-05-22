import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ChevronLeft, Quote, Settings2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { QUOTES, todayKey, lastNDays } from "@/lib/tasks";
import { useHabits } from "@/context/HabitsContext";
import { TaskRow } from "@/components/TaskRow";
import { WeeklyGrid } from "@/components/WeeklyGrid";
import { StatsRow } from "@/components/StatsRow";
import { Countdown } from "@/components/Countdown";
import { ManageTasksDialog } from "@/components/ManageTasksDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CAT Habit Tracker — Daily Discipline for CAT Aspirants" },
      { name: "description", content: "A premium dark-mode daily habit tracker built for CAT preparation. Track tasks, streaks, and weekly consistency." },
      { property: "og:title", content: "CAT Habit Tracker" },
      { property: "og:description", content: "Daily CAT preparation habit tracker with streaks and weekly consistency." },
    ],
  }),
  component: Home,
});

function Home() {
  const { tasks, history, dailyPct } = useHabits();
  const todayPct = dailyPct();
  const quote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], []);
  const [manageOpen, setManageOpen] = useState(false);

  const [celebrated, setCelebrated] = useState(false);
  useEffect(() => {
    if (tasks.length === 0) return;
    const today = todayKey();
    const day = history[today] ?? {};
    const allDone = tasks.every(t => day[t.id]);
    if (allDone && !celebrated) {
      setCelebrated(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.3 },
        colors: ["#5eead4", "#a7f3d0", "#ffffff"],
      });
    }
    if (!allDone && celebrated) setCelebrated(false);
  }, [history, celebrated, tasks]);

  const heat = lastNDays(30).map(d => {
    const day = history[d] ?? {};
    const ratio = tasks.length ? tasks.filter(t => day[t.id]).length / tasks.length : 0;
    return { d, ratio };
  });

  const missed = useMemo(() => {
    const counts: Record<string, number> = {};
    lastNDays(7).forEach(d => {
      const day = history[d] ?? {};
      tasks.forEach(t => { if (!day[t.id]) counts[t.id] = (counts[t.id] ?? 0) + 1; });
    });
    return tasks
      .map(t => ({ ...t, count: counts[t.id] ?? 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .filter(x => x.count > 0);
  }, [history, tasks]);

  const doneToday = tasks.filter(t => history[todayKey()]?.[t.id]).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-5">
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : null}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[color:var(--surface)] text-foreground/80 transition-colors hover:text-foreground"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-tight">Hi, Shridhar 👋</h1>
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-xs font-semibold text-primary">
            S
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 pb-16 pt-6">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card mb-5 p-6"
        >
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </div>
          <div className="mt-1 flex items-end justify-between">
            <div>
              <div className="text-3xl font-semibold tracking-tight text-foreground">
                Today's Progress
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {doneToday} of {tasks.length} habits done
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-semibold text-primary">{todayPct}%</div>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${todayPct}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 20 }}
            />
          </div>
        </motion.section>

        <section className="mb-5">
          <StatsRow />
        </section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="premium-card mb-5 p-5"
        >
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Daily Habits</h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Last 7 days</span>
              <button
                onClick={() => setManageOpen(true)}
                className="grid h-7 w-7 place-items-center rounded-lg bg-[color:var(--surface-2)] text-foreground/80 transition-colors hover:text-primary"
                aria-label="Manage tasks"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {tasks.map(t => (
                <TaskRow key={t.id} id={t.id} name={t.name} time={t.time} icon={t.icon} />
              ))}
            </AnimatePresence>
            {tasks.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No tasks yet. Tap the gear icon to add one.
              </div>
            )}
          </div>
        </motion.section>

        <section className="mb-5">
          <WeeklyGrid />
        </section>

        <section className="mb-5">
          <Countdown />
        </section>

        <section className="premium-card mb-5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">30-day Heatmap</h3>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Consistency</span>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {heat.map(({ d, ratio }) => (
              <div
                key={d}
                title={`${d} — ${Math.round(ratio * 100)}%`}
                className="aspect-square rounded-md border border-white/5"
                style={{
                  background:
                    ratio === 0
                      ? "var(--surface-2)"
                      : `color-mix(in oklab, var(--primary) ${Math.max(15, ratio * 100)}%, transparent)`,
                }}
              />
            ))}
          </div>
        </section>

        {missed.length > 0 && (
          <section className="premium-card mb-5 p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Most Missed (7d)</h3>
            <ul className="space-y-2">
              {missed.map(m => (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground/90">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.count}× missed</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="premium-card flex items-start gap-3 p-5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[color:var(--surface-2)] text-primary">
            <Quote className="h-4 w-4" />
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{quote}</p>
        </section>
      </main>

      <ManageTasksDialog open={manageOpen} onClose={() => setManageOpen(false)} />
    </div>
  );
}
