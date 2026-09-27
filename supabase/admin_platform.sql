-- VIDWAN — master admin platform
-- ---------------------------------------------------------------------------
-- Purpose:
--   1. Add a public.admin_profiles table holding the Vidwan owner/admin.
--   2. Add a public.is_authorized_admin() SECURITY DEFINER helper.
--   3. Add a safe teacher status column (ACTIVE / INACTIVE) to teacher_profiles
--      and enforce it in public.is_authorized_teacher().
--   4. Grant authorized admins the same read/admin access teachers already
--      have (student profiles, meetings, announcements, registrations) so the
--      admin dashboard can show real platform statistics.
--
-- This file is idempotent and safe to re-run.
-- It does NOT delete data, does NOT drop tables, and does NOT weaken the
-- existing student/teacher RLS policies.
--
-- Bootstrap (run once in the Supabase SQL editor after the owner has created
-- their Auth user — server-side only, never in browser code):
--   insert into public.admin_profiles (user_id)
--   values ('<AUTH_USER_UUID>')
--   on conflict (user_id) do nothing;
-- (If VIDWAN_ADMIN_USER_ID is configured on the server, the one-time initial
-- admin bootstrap is performed by src/lib/admin-auth.ts using the server-only
-- service-role client from src/lib/supabase/server.ts.)
-- ---------------------------------------------------------------------------

begin;

-- ---------------------------------------------------------------------------
-- 1. admin_profiles
-- ---------------------------------------------------------------------------
create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

alter table public.admin_profiles enable row level security;

revoke all on table public.admin_profiles from public, anon, authenticated;
grant select on public.admin_profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 2. is_authorized_admin() helper (created BEFORE any policy references it)
-- ---------------------------------------------------------------------------
create or replace function public.is_authorized_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
      and is_active = true
  );
$$;

revoke all on function public.is_authorized_admin() from public;
grant execute on function public.is_authorized_admin() to authenticated;

-- No direct table access for regular roles. Only the admin API route reads it
-- with the service-role key. RLS with no policies blocks every authenticated
-- role (including students and teachers) by default.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'admin_profiles'
  ) then
    create policy "Admins can read their own admin profile"
      on public.admin_profiles
      for select
      to authenticated
      using (public.is_authorized_admin());
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Teacher status (ACTIVE / INACTIVE) — added safely, only if missing.
--    Teacher login must verify is_teacher = true AND status = 'ACTIVE'.
-- ---------------------------------------------------------------------------
alter table public.teacher_profiles
  add column if not exists status text not null default 'ACTIVE'
  check (status in ('ACTIVE', 'INACTIVE'));

-- Tighten the existing teacher helper so only ACTIVE teachers are authorized.
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
      and status = 'ACTIVE'
  );
$$;

revoke all on function public.is_authorized_teacher() from public;
grant execute on function public.is_authorized_teacher() to authenticated;

-- Preserve the existing teacher platform grants (see supabase/teacher_dashboard.sql:
-- authenticated keeps SELECT; teachers read their own row via RLS) and add only
-- the status-column update admins need.
revoke all on table public.teacher_profiles from public, anon, authenticated;
grant select on public.teacher_profiles to authenticated;
grant update (status) on public.teacher_profiles to authenticated;

drop policy if exists "Teachers can read their own profile" on public.teacher_profiles;
create policy "Teachers can read their own profile"
on public.teacher_profiles
for select
to authenticated
using (auth.uid() = user_id);

-- Authorized admins may read all teacher profiles (needed for the admin
-- dashboard: total teachers, active teachers, teacher list). Reuses the
-- existing public.is_authorized_admin() helper — students and ordinary
-- authenticated users still have no access beyond their own row.
drop policy if exists "Authorized admins can read teacher profiles" on public.teacher_profiles;
create policy "Authorized admins can read teacher profiles"
on public.teacher_profiles
for select
to authenticated
using (public.is_authorized_admin());

drop policy if exists "Authorized admins can manage teacher status" on public.teacher_profiles;
create policy "Authorized admins can manage teacher status"
on public.teacher_profiles
for update
to authenticated
using (public.is_authorized_admin())
with check (public.is_authorized_admin());

-- ---------------------------------------------------------------------------
-- 4. Admin read access to platform data (mirrors existing teacher policies,
--    never weakening them — the OR clauses only add the admin role).
-- ---------------------------------------------------------------------------
drop policy if exists "Students can read their own profile" on public.student_profiles;
create policy "Students can read their own profile"
on public.student_profiles for select to authenticated
using (
  auth.uid() = user_id
  or public.is_authorized_teacher()
  or public.is_authorized_admin()
);

drop policy if exists "Teachers can manage student profiles" on public.student_profiles;
create policy "Teachers can manage student profiles"
on public.student_profiles for update to authenticated
using (public.is_authorized_teacher() or public.is_authorized_admin())
with check (public.is_authorized_teacher() or public.is_authorized_admin());

drop policy if exists "Students can read relevant meetings" on public.meetings;
create policy "Students can read relevant meetings"
on public.meetings for select to authenticated
using (
  public.is_authorized_teacher()
  or public.is_authorized_admin()
  or exists (select 1 from public.student_profiles where user_id = auth.uid() and status = 'ACTIVE')
);

drop policy if exists "Teachers can create meetings" on public.meetings;
create policy "Teachers can create meetings"
on public.meetings for insert to authenticated
with check (
  public.is_authorized_teacher()
  or (public.is_authorized_admin() and created_by = auth.uid())
);

drop policy if exists "Teachers can update meetings" on public.meetings;
create policy "Teachers can update meetings"
on public.meetings for update to authenticated
using (public.is_authorized_teacher() or public.is_authorized_admin())
with check (public.is_authorized_teacher() or public.is_authorized_admin());

drop policy if exists "Teachers can delete meetings" on public.meetings;
create policy "Teachers can delete meetings"
on public.meetings for delete to authenticated
using (public.is_authorized_teacher() or public.is_authorized_admin());

drop policy if exists "Students can read published announcements" on public.announcements;
create policy "Students can read published announcements"
on public.announcements for select to authenticated
using (
  public.is_authorized_teacher()
  or public.is_authorized_admin()
  or (is_published and exists (select 1 from public.student_profiles where user_id = auth.uid() and status = 'ACTIVE'))
);

drop policy if exists "Teachers can create announcements" on public.announcements;
create policy "Teachers can create announcements"
on public.announcements for insert to authenticated
with check (
  public.is_authorized_teacher()
  or (public.is_authorized_admin() and created_by = auth.uid())
);

drop policy if exists "Teachers can update announcements" on public.announcements;
create policy "Teachers can update announcements"
on public.announcements for update to authenticated
using (public.is_authorized_teacher() or public.is_authorized_admin())
with check (public.is_authorized_teacher() or public.is_authorized_admin());

drop policy if exists "Teachers can delete announcements" on public.announcements;
create policy "Teachers can delete announcements"
on public.announcements for delete to authenticated
using (public.is_authorized_teacher() or public.is_authorized_admin());

drop policy if exists "Authorized teachers can read registrations" on public.registrations;
create policy "Authorized teachers can read registrations"
on public.registrations
for select
to authenticated
using (public.is_authorized_teacher() or public.is_authorized_admin());

commit;
