-- One row per signed-in user: display name, tour state and learning progress.
-- Row level security means a user can only ever read or change their own row.
create table if not exists public.user_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  name       text,
  tour_done  boolean not null default false,
  progress   jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

create policy "Users read their own data"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "Users create their own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "Users update their own data"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
