
CREATE TABLE public.habit_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  task_id TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date, task_id)
);

ALTER TABLE public.habit_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON public.habit_entries FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.habit_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.habit_entries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete" ON public.habit_entries FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_entries;
ALTER TABLE public.habit_entries REPLICA IDENTITY FULL;
