alter table public.resumes enable row level security;
alter table public.job_descriptions enable row level security;
alter table public.match_runs enable row level security;
alter table public.resume_bullets enable row level security;
alter table public.augmented_bullets enable row level security;
alter table public.generated_resumes enable row level security;
alter table public.market_skill_data enable row level security;

create policy "Users can SELECT their own rows"
on public.resumes
for select
using (auth.uid() = user_id);

create policy "Users can INSERT their own rows"
on public.resumes
for insert
with check (auth.uid() = user_id);

create policy "Users can UPDATE their own rows"
on public.resumes
for update
using (auth.uid() = user_id);

create policy "Users can DELETE their own rows"
on public.resumes
for delete
using (auth.uid() = user_id);

create policy "market_search_read" 
on public.market_skill_data
for select
using (true);
