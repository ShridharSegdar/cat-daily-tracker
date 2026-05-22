import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { todayKey, lastNDays, type TaskDef } from "@/lib/tasks";

export type HabitHistory = Record<string, Record<string, boolean>>;

interface HabitsCtx {
  tasks: TaskDef[];
  history: HabitHistory;
  loading: boolean;
  toggle: (taskId: string, date?: string) => Promise<void>;
  isDone: (taskId: string, date?: string) => boolean;
  dailyPct: (date?: string) => number;
  streak: number;
  weeklyPct: number;
  addTask: (input: { name: string; time?: string | null; icon: string }) => Promise<void>;
  updateTask: (id: string, patch: Partial<Pick<TaskDef, "name" | "time" | "icon">>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, direction: -1 | 1) => Promise<void>;
}

const Ctx = createContext<HabitsCtx | null>(null);

function rowsToHistory(rows: Array<{ date: string; task_id: string; done: boolean }>): HabitHistory {
  const h: HabitHistory = {};
  for (const r of rows) {
    if (!h[r.date]) h[r.date] = {};
    h[r.date][r.task_id] = r.done;
  }
  return h;
}

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HabitHistory>({});
  const [tasks, setTasks] = useState<TaskDef[]>([]);
  const [loading, setLoading] = useState(true);

  // Load + subscribe to tasks
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("tasks")
        .select("id, name, time, icon, position")
        .order("position", { ascending: true });
      if (!cancelled && data) setTasks(data as TaskDef[]);
    })();

    const ch = supabase
      .channel("tasks-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, async () => {
        const { data } = await supabase
          .from("tasks")
          .select("id, name, time, icon, position")
          .order("position", { ascending: true });
        if (data) setTasks(data as TaskDef[]);
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, []);

  // Load + subscribe to habit entries
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("habit_entries")
        .select("date, task_id, done");
      if (cancelled) return;
      if (!error && data) setHistory(rowsToHistory(data as any));
      setLoading(false);
    })();

    const channel = supabase
      .channel("habit_entries-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "habit_entries" }, (payload) => {
        setHistory(prev => {
          const next: HabitHistory = { ...prev };
          const newRow = (payload.new ?? null) as { date: string; task_id: string; done: boolean } | null;
          const oldRow = (payload.old ?? null) as { date: string; task_id: string } | null;
          if (payload.eventType === "DELETE" && oldRow) {
            if (next[oldRow.date]) {
              const day = { ...next[oldRow.date] };
              delete day[oldRow.task_id];
              next[oldRow.date] = day;
            }
          } else if (newRow) {
            const day = { ...(next[newRow.date] ?? {}) };
            day[newRow.task_id] = newRow.done;
            next[newRow.date] = day;
          }
          return next;
        });
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, []);

  const isDone = useCallback(
    (taskId: string, date?: string) => Boolean(history[date ?? todayKey()]?.[taskId]),
    [history],
  );

  const toggle = useCallback(async (taskId: string, date?: string) => {
    const d = date ?? todayKey();
    const current = Boolean(history[d]?.[taskId]);
    const nextDone = !current;
    setHistory(prev => {
      const day = { ...(prev[d] ?? {}) };
      day[taskId] = nextDone;
      return { ...prev, [d]: day };
    });
    const { error } = await supabase
      .from("habit_entries")
      .upsert(
        { date: d, task_id: taskId, done: nextDone, updated_at: new Date().toISOString() },
        { onConflict: "date,task_id" },
      );
    if (error) {
      setHistory(prev => {
        const day = { ...(prev[d] ?? {}) };
        day[taskId] = current;
        return { ...prev, [d]: day };
      });
      console.error("Failed to save habit:", error);
    }
  }, [history]);

  const dailyPct = useCallback((date?: string) => {
    if (tasks.length === 0) return 0;
    const d = date ?? todayKey();
    const day = history[d] ?? {};
    const done = tasks.filter(t => day[t.id]).length;
    return Math.round((done / tasks.length) * 100);
  }, [history, tasks]);

  const streak = useMemo(() => {
    if (tasks.length === 0) return 0;
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = todayKey(d);
      const day = history[key] ?? {};
      const done = tasks.filter(t => day[t.id]).length;
      const ratio = done / tasks.length;
      if (ratio >= 0.7) s++;
      else if (i === 0) continue;
      else break;
    }
    return s;
  }, [history, tasks]);

  const weeklyPct = useMemo(() => {
    if (tasks.length === 0) return 0;
    const days = lastNDays(7);
    const total = days.length * tasks.length;
    let done = 0;
    days.forEach(d => {
      const day = history[d] ?? {};
      done += tasks.filter(t => day[t.id]).length;
    });
    return Math.round((done / total) * 100);
  }, [history, tasks]);

  const addTask = useCallback(async (input: { name: string; time?: string | null; icon: string }) => {
    const maxPos = tasks.reduce((m, t) => Math.max(m, t.position), -1);
    const { error } = await supabase.from("tasks").insert({
      name: input.name,
      time: input.time || null,
      icon: input.icon,
      position: maxPos + 1,
    });
    if (error) console.error("Failed to add task:", error);
  }, [tasks]);

  const updateTask = useCallback(async (id: string, patch: Partial<Pick<TaskDef, "name" | "time" | "icon">>) => {
    const { error } = await supabase
      .from("tasks")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) console.error("Failed to update task:", error);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) console.error("Failed to delete task:", error);
  }, []);

  const moveTask = useCallback(async (id: string, direction: -1 | 1) => {
    const sorted = [...tasks].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex(t => t.id === id);
    const swapIdx = idx + direction;
    if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    // Optimistic local swap
    setTasks(prev => prev.map(t => {
      if (t.id === a.id) return { ...t, position: b.position };
      if (t.id === b.id) return { ...t, position: a.position };
      return t;
    }).sort((x, y) => x.position - y.position));
    // Use a temporary out-of-range position to dodge any potential conflicts
    const tmp = -Date.now();
    await supabase.from("tasks").update({ position: tmp }).eq("id", a.id);
    await supabase.from("tasks").update({ position: a.position }).eq("id", b.id);
    await supabase.from("tasks").update({ position: b.position }).eq("id", a.id);
  }, [tasks]);

  const value: HabitsCtx = {
    tasks, history, loading, toggle, isDone, dailyPct, streak, weeklyPct,
    addTask, updateTask, deleteTask, moveTask,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHabits() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useHabits must be used within HabitsProvider");
  return v;
}
