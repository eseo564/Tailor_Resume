-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- Resumes table: stores uploaded PDFs and their parsed content
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  original_pdf_path text not null,
  original_tex_path text,
  parsed_json jsonb,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists resumes_user_id_idx on public.resumes(user_id);

-- Job descriptions table: stores job postings with parsed data
create table if not exists public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  raw_text text not null,
  parsed_json jsonb,
  title text,
  created_at timestamptz default now()
);

create index if not exists job_descriptions_user_id_idx on public.job_descriptions(user_id);

-- Match runs table: tracks resume tailoring sessions
create table if not exists public.match_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete cascade,
  job_id uuid references public.job_descriptions(id) on delete cascade,
  pipeline_status text default 'pending',
  match_score numeric,
  agent_trace jsonb,
  created_at timestamptz default now()
);

create index if not exists match_runs_user_idx on public.match_runs(user_id);
create index if not exists match_runs_resume_idx on public.match_runs(resume_id);

-- Resume bullets table: individual bullet points with embeddings
create table if not exists public.resume_bullets (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references public.resumes(id) on delete cascade,
  section text,
  original_text text not null,
  cleaned_text text,
  embedding vector(1536),
  last_used_in_run uuid,
  created_at timestamptz default now()
);

create index if not exists resume_bullets_resume_idx on public.resume_bullets(resume_id);
create index if not exists resume_bullets_vector_idx on public.resume_bullets using ivfflat (embedding vector_cosine_ops);

-- Augmented bullets table: AI-enhanced bullet points
create table if not exists public.augmented_bullets (
  id uuid primary key default gen_random_uuid(),
  match_run_id uuid references public.match_runs(id) on delete cascade,
  original_bullet_id uuid references public.resume_bullets(id) on delete cascade,
  mode text,
  suggested_text text not null,
  audit_flags jsonb,
  user_approved boolean default false,
  created_at timestamptz default now()
);

create index if not exists augmented_bullets_run_idx on public.augmented_bullets(match_run_id);

-- Generated resumes table: final output PDFs
create table if not exists public.generated_resumes (
  id uuid primary key default gen_random_uuid(),
  match_run_id uuid references public.match_runs(id) on delete cascade,
  final_pdf_path text not null,
  final_tex_path text,
  created_at timestamptz default now()
);

-- Market skill data table: external job market data cache
create table if not exists public.market_skill_data (
  id uuid primary key default gen_random_uuid(),
  job_title text not null,
  location text,
  source text not null,
  raw_json jsonb,
  normalized_skills jsonb,
  created_at timestamptz default now()
);

create index if not exists market_skill_data_job_title_idx on public.market_skill_data(job_title);
