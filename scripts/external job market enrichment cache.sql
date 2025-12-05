create table public.market_skill_data (
  id uuid primary key default gen_random_uuid(),
  job_title text not null,
  location text,                -- optional
  source text not null,         -- API name or scraper URL

  raw_json jsonb,               -- raw response from API
  normalized_skills jsonb,      -- {python:0.72, docker:0.55, ...}

  created_at timestamptz default now()
);

create index market_skill_data_job_title_idx on public.market_skill_data(job_title);
