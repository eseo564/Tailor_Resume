create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,

  original_pdf_path text not null,
  original_tex_path text, -- optional

  parsed_json jsonb,      -- output of Uploader Agent

  title text,             -- optional: resume nickname
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Helpful index
create index resumes_user_id_idx on public.resumes(user_id);
