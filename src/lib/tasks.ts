import {
  Sun, Calculator, BookOpen, Train, Briefcase, Dumbbell,
  Type, Brain, Newspaper, Moon, Circle, Coffee, Pencil, Music,
  Heart, Code, Camera, Globe, Target, Zap, Clock, Star,
  type LucideIcon,
} from "lucide-react";

export interface TaskDef {
  id: string;
  name: string;
  time?: string | null;
  icon: string;
  position: number;
}

export const ICON_MAP: Record<string, LucideIcon> = {
  Sun, Calculator, BookOpen, Train, Briefcase, Dumbbell,
  Type, Brain, Newspaper, Moon, Circle, Coffee, Pencil, Music,
  Heart, Code, Camera, Globe, Target, Zap, Clock, Star,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Circle;
}

export const QUOTES = [
  "Discipline beats motivation. Show up.",
  "Small daily wins compound into a percentile.",
  "The exam rewards consistency, not intensity.",
  "Today's reps are tomorrow's confidence.",
  "Master the basics. Speed follows mastery.",
];

export const CAT_EXAM_DATE = new Date("2026-11-29T00:00:00");

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function lastNDays(n: number, end = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    out.push(todayKey(d));
  }
  return out;
}

export function weekDates(end = new Date()): { key: string; label: string }[] {
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  const start = new Date(end);
  start.setDate(end.getDate() - end.getDay());
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { key: todayKey(d), label: labels[i] };
  });
}
