create table public.augmented_bullets (
  id uuid primary key default gen_random_uuid(),
  match_run_id uuid references public.match_runs(id) on delete cascade,
  original_bullet_id uuid references public.resume_bullets(id) on delete cascade,

  mode text,                -- conservative / aggressive
  suggested_text text not null,
  audit_flags jsonb,        -- e.g. ["added_metrics", "possible_fabrication"]
  user_approved boolean default false,

  created_at timestamptz default now()
);

create index augmented_bullets_run_idx on public.augmented_bullets(match_run_id);
