-- What learners choose to share about a gap after answering "Almost", to improve lessons.
-- Deliberately holds no user id, name or email. The app can add rows but never read them: only
-- the project owner can, in the dashboard. Delete old rows yearly:
--   delete from public.lesson_feedback where created_on < current_date - interval '12 months';
-- Safe to run more than once.
create table if not exists public.lesson_feedback (
  id         bigint generated always as identity primary key,
  drill_id   text not null check (char_length(drill_id) <= 80),
  gap        text not null default '' check (char_length(gap) <= 500),
  points     text[] not null default '{}'
               check (cardinality(points) <= 10 and char_length(array_to_string(points, '')) <= 1500),
  created_on date not null default current_date
);

alter table public.lesson_feedback enable row level security;

revoke all on public.lesson_feedback from anon, authenticated;
grant insert (drill_id, gap, points) on public.lesson_feedback to anon, authenticated;

drop policy if exists "Anyone can share a gap" on public.lesson_feedback;
create policy "Anyone can share a gap"
  on public.lesson_feedback for insert
  to anon, authenticated
  with check (true);
