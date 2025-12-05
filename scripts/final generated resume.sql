create table public.generated_resumes (
  id uuid primary key default gen_random_uuid(),
  match_run_id uuid references public.match_runs(id) on delete cascade,

  final_pdf_path text not null,     -- stored in Supabase Storage privately
  final_tex_path text,              -- optional for transparency/debugging

  created_at timestamptz default now()
);
