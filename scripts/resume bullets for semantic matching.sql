create extension if not exists vector;

create table public.resume_bullets (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references public.resumes(id) on delete cascade,

  section text,            -- e.g. "Experience", "Projects"
  original_text text not null,
  cleaned_text text,       -- after minor normalization

  embedding vector(1536),  -- depending on embedding model

  last_used_in_run uuid,   -- optional: last match run referencing this bullet
  created_at timestamptz default now()
);

create index resume_bullets_resume_idx on public.resume_bullets(resume_id);
create index resume_bullets_vector_idx on public.resume_bullets using ivfflat (embedding vector_cosine_ops);
