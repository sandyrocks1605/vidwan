begin;

create table if not exists public.teacher_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  is_teacher boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.teacher_profiles enable row level security;

revoke all on table public.teacher_profiles from public, anon, authenticated;
grant select on table public.teacher_profiles to authenticated;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'teacher_profiles'
      and cmd in ('SELECT', '*')
  loop
    execute format(
      'drop policy if exists %I on public.teacher_profiles',
      policy_record.policyname
    );
  end loop;
end;
$$;

create policy "Teachers can read their own profile"
on public.teacher_profiles
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.is_authorized_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teacher_profiles
    where user_id = (select auth.uid())
      and is_teacher = true
  );
$$;

revoke all on function public.is_authorized_teacher() from public;
grant execute on function public.is_authorized_teacher() to authenticated;

alter table public.registrations enable row level security;

revoke select on table public.registrations from public, anon, authenticated;
grant select on table public.registrations to authenticated;
grant insert on table public.registrations to anon, authenticated;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'registrations'
      and cmd in ('SELECT', '*')
  loop
    execute format(
      'drop policy if exists %I on public.registrations',
      policy_record.policyname
    );
  end loop;
end;
$$;

drop policy if exists "Allow public registration inserts"
on public.registrations;

create policy "Allow public registration inserts"
on public.registrations
for insert
to anon, authenticated
with check (true);

drop policy if exists "Authorized teachers can read registrations"
on public.registrations;

create policy "Authorized teachers can read registrations"
on public.registrations
for select
to authenticated
using (public.is_authorized_teacher());

commit;

-- After creating the first teacher in Supabase Authentication, run:
-- insert into public.teacher_profiles (user_id, email, name, is_teacher)
-- values ('AUTH_USER_UUID', 'teacher@example.com', 'Teacher Name', true);