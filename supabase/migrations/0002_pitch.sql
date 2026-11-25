-- The pitch builder, saved with the rest of a user's data. The table's grant and row level
-- security from 0001 cover this column too.
alter table public.user_data add column if not exists pitch jsonb;
