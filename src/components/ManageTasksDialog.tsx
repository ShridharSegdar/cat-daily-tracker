import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { useHabits } from "@/context/HabitsContext";
import { ICON_NAMES, getIcon } from "@/lib/tasks";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ManageTasksDialog({ open, onClose }: Props) {
  const { tasks, addTask, deleteTask, moveTask } = useHabits();
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [icon, setIcon] = useState("Star");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const sorted = [...tasks].sort((a, b) => a.position - b.position);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await addTask({ name: name.trim(), time: time.trim() || null, icon });
    setName("");
    setTime("");
    setIcon("Star");
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="premium-card max-h-[90vh] w-full max-w-md overflow-y-auto p-5 sm:max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Manage Tasks</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-[color:var(--surface-2)] text-foreground/80">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Add new */}
        <div className="mb-5 rounded-2xl border border-white/10 bg-[color:var(--surface-2)] p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add Task</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Task name"
            className="mb-2 w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
          />
          <input
            value={time}
            onChange={e => setTime(e.target.value)}
            placeholder="Time (optional, e.g. 7 – 8 PM)"
            className="mb-2 w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
          />
          <div className="mb-3">
            <div className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">Icon</div>
            <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
              {ICON_NAMES.map(n => {
                const I = getIcon(n);
                const selected = n === icon;
                return (
                  <button
                    key={n}
                    onClick={() => setIcon(n)}
                    className={[
                      "grid h-9 w-9 place-items-center rounded-lg border transition-colors",
                      selected ? "border-primary bg-primary/15 text-primary" : "border-white/10 bg-background text-foreground/70 hover:text-foreground",
                    ].join(" ")}
                    aria-label={n}
                  >
                    <I className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!name.trim() || saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add Task
          </button>
        </div>

        {/* List */}
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your Tasks ({sorted.length})
        </div>
        <ul className="space-y-2">
          {sorted.map((t, i) => {
            const Icon = getIcon(t.icon);
            return (
              <li key={t.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-[color:var(--surface-2)] p-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background text-foreground/80">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{t.name}</div>
                  {t.time && <div className="truncate text-xs text-muted-foreground">{t.time}</div>}
                </div>
                <button
                  onClick={() => moveTask(t.id, -1)}
                  disabled={i === 0}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-background text-foreground/70 transition-opacity disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveTask(t.id, 1)}
                  disabled={i === sorted.length - 1}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-background text-foreground/70 transition-opacity disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { if (confirm(`Delete "${t.name}"?`)) deleteTask(t.id); }}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-background text-destructive/80 hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
