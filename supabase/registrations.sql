create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  parent_name text not null,
  student_name text not null,
  student_age integer not null check (student_age between 6 and 21),
  preferred_track text not null,
  email text not null,
  phone text not null,
  prior_mun_experience text not null,
  heard_from text,
  additional_info text
);

alter table public.registrations enable row level security;

grant insert on table public.registrations to anon, authenticated;

create policy "Allow public registration inserts"
on public.registrations
for insert
to anon, authenticated
with check (true);