create table public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,

  raw_text text not null,
  parsed_json jsonb,       -- skills, must-haves, seniority, responsibilities

  title text,               -- job title detected or user-provided
  created_at timestamptz default now()
);

create index job_descriptions_user_id_idx on public.job_descriptions(user_id);
