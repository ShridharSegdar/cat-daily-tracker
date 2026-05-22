CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  time TEXT,
  icon TEXT NOT NULL DEFAULT 'Circle',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Public insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Public delete tasks" ON public.tasks FOR DELETE USING (true);

CREATE INDEX idx_tasks_position ON public.tasks(position);

ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;

-- Seed default tasks
INSERT INTO public.tasks (name, time, icon, position) VALUES
  ('Wake Up On Time', NULL, 'Sun', 0),
  ('Quant Practice', '6:15 – 7:45 AM', 'Calculator', 1),
  ('Formula Revision', NULL, 'BookOpen', 2),
  ('Commute Revision', NULL, 'Train', 3),
  ('Office Work', '9:30 AM – 6 PM', 'Briefcase', 4),
  ('Gym', '7 – 8 PM', 'Dumbbell', 5),
  ('VARC Practice', '9 – 10 PM', 'Type', 6),
  ('LRDI Practice', '10 – 11 PM', 'Brain', 7),
  ('Read RC Article', NULL, 'Newspaper', 8),
  ('Sleep By 11:15 PM', NULL, 'Moon', 9);