-- Enable Row Level Security on all tables
alter table public.resumes enable row level security;
alter table public.job_descriptions enable row level security;
alter table public.match_runs enable row level security;
alter table public.resume_bullets enable row level security;
alter table public.augmented_bullets enable row level security;
alter table public.generated_resumes enable row level security;
alter table public.market_skill_data enable row level security;
