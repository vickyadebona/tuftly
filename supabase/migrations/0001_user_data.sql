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

-- New Supabase projects don't expose new tables to the API on their own. Signed-in users only;
-- the policies below still limit each of them to their own row.
grant select, insert, update on public.user_data to authenticated;

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
