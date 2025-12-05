-- RLS Policies for resumes table
create policy "Users can view their own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own resumes"
  on public.resumes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

-- RLS Policies for job_descriptions table
create policy "Users can view their own job descriptions"
  on public.job_descriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own job descriptions"
  on public.job_descriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own job descriptions"
  on public.job_descriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own job descriptions"
  on public.job_descriptions for delete
  using (auth.uid() = user_id);

-- RLS Policies for match_runs table
create policy "Users can view their own match runs"
  on public.match_runs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own match runs"
  on public.match_runs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own match runs"
  on public.match_runs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own match runs"
  on public.match_runs for delete
  using (auth.uid() = user_id);

-- RLS Policies for resume_bullets table
create policy "Users can view bullets from their own resumes"
  on public.resume_bullets for select
  using (
    exists (
      select 1 from public.resumes
      where resumes.id = resume_bullets.resume_id
      and resumes.user_id = auth.uid()
    )
  );

create policy "Users can insert bullets to their own resumes"
  on public.resume_bullets for insert
  with check (
    exists (
      select 1 from public.resumes
      where resumes.id = resume_bullets.resume_id
      and resumes.user_id = auth.uid()
    )
  );

create policy "Users can update bullets from their own resumes"
  on public.resume_bullets for update
  using (
    exists (
      select 1 from public.resumes
      where resumes.id = resume_bullets.resume_id
      and resumes.user_id = auth.uid()
    )
  );

create policy "Users can delete bullets from their own resumes"
  on public.resume_bullets for delete
  using (
    exists (
      select 1 from public.resumes
      where resumes.id = resume_bullets.resume_id
      and resumes.user_id = auth.uid()
    )
  );

-- RLS Policies for augmented_bullets table
create policy "Users can view augmented bullets from their own match runs"
  on public.augmented_bullets for select
  using (
    exists (
      select 1 from public.match_runs
      where match_runs.id = augmented_bullets.match_run_id
      and match_runs.user_id = auth.uid()
    )
  );

create policy "Users can insert augmented bullets to their own match runs"
  on public.augmented_bullets for insert
  with check (
    exists (
      select 1 from public.match_runs
      where match_runs.id = augmented_bullets.match_run_id
      and match_runs.user_id = auth.uid()
    )
  );

create policy "Users can update augmented bullets from their own match runs"
  on public.augmented_bullets for update
  using (
    exists (
      select 1 from public.match_runs
      where match_runs.id = augmented_bullets.match_run_id
      and match_runs.user_id = auth.uid()
    )
  );

create policy "Users can delete augmented bullets from their own match runs"
  on public.augmented_bullets for delete
  using (
    exists (
      select 1 from public.match_runs
      where match_runs.id = augmented_bullets.match_run_id
      and match_runs.user_id = auth.uid()
    )
  );

-- RLS Policies for generated_resumes table
create policy "Users can view generated resumes from their own match runs"
  on public.generated_resumes for select
  using (
    exists (
      select 1 from public.match_runs
      where match_runs.id = generated_resumes.match_run_id
      and match_runs.user_id = auth.uid()
    )
  );

create policy "Users can insert generated resumes to their own match runs"
  on public.generated_resumes for insert
  with check (
    exists (
      select 1 from public.match_runs
      where match_runs.id = generated_resumes.match_run_id
      and match_runs.user_id = auth.uid()
    )
  );

create policy "Users can update generated resumes from their own match runs"
  on public.generated_resumes for update
  using (
    exists (
      select 1 from public.match_runs
      where match_runs.id = generated_resumes.match_run_id
      and match_runs.user_id = auth.uid()
    )
  );

create policy "Users can delete generated resumes from their own match runs"
  on public.generated_resumes for delete
  using (
    exists (
      select 1 from public.match_runs
      where match_runs.id = generated_resumes.match_run_id
      and match_runs.user_id = auth.uid()
    )
  );

-- RLS Policies for market_skill_data table
-- This table can be read by all authenticated users (shared cache)
create policy "Authenticated users can view market skill data"
  on public.market_skill_data for select
  using (auth.uid() is not null);

create policy "Authenticated users can insert market skill data"
  on public.market_skill_data for insert
  with check (auth.uid() is not null);
