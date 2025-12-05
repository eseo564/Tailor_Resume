create table public.match_runs (
  id uuid primary key default gen_random_uuid(),

  user_id uuid references auth.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete cascade,
  job_id uuid references public.job_descriptions(id) on delete cascade,

  pipeline_status text default 'pending', 
  -- pending / running / completed / failed

  match_score numeric,   -- final score from Scorer Agent

  agent_trace jsonb,     -- full orchestration logs for compliance
                         -- e.g. { uploader: {...}, scorer: {...}, augment: {...}}

  created_at timestamptz default now()
);

create index match_runs_user_idx on public.match_runs(user_id);
create index match_runs_resume_idx on public.match_runs(resume_id);
