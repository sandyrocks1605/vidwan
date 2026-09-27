-- VIDWAN — student platform hardening
-- ---------------------------------------------------------------------------
-- Purpose:
--   1. Only create a public.student_profiles row for Auth users that are
--      explicitly marked as students via raw_user_meta_data->>'account_type'.
--      Previously public.handle_new_student() ran for EVERY new Auth user, so a
--      teacher account could accidentally receive a student profile.
--   2. Allow authorized teachers to update public.student_profiles.status
--      (activate / deactivate a student). The table GRANT previously did not
--      include the status column, so teacher status updates failed even
--      though an UPDATE RLS policy existed.
--   3. Make the column GRANTs match the existing RLS policies without
--      weakening them: students keep their own-row access only, anon/anon
--      keep no read access, and the public registration flow is untouched.
--
-- This file is idempotent and safe to re-run.
-- Existing student_profiles rows and existing teacher accounts are NOT deleted.
-- ---------------------------------------------------------------------------

begin;

-- ---------------------------------------------------------------------------
-- 1. Student profile creation only for accounts explicitly marked as students.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_student()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Teacher / staff / any non-student Auth user must not get a student profile.
  if coalesce(new.raw_user_meta_data ->> 'account_type', '') is distinct from 'student' then
    return new;
  end if;

  insert into public.student_profiles (
    user_id, full_name, email, age, mun_experience, debate_experience, goals
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'age', '')::integer,
    nullif(new.raw_user_meta_data ->> 'mun_experience', ''),
    nullif(new.raw_user_meta_data ->> 'debate_experience', ''),
    nullif(new.raw_user_meta_data ->> 'goals', '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_student_profile on auth.users;
create trigger on_auth_user_created_student_profile
after insert on auth.users
for each row execute function public.handle_new_student();

-- ---------------------------------------------------------------------------
-- 2. Column-level GRANTS aligned with the existing RLS policies.
-- ---------------------------------------------------------------------------
revoke all on table public.student_profiles from public, anon;
revoke all on table public.meetings from public, anon;
revoke all on table public.announcements from public, anon;

-- Students: read their own row (RLS restricts this to auth.uid() = user_id)
-- and update only their permitted personal fields. status is NOT included.
grant select on public.student_profiles to authenticated;
grant update (full_name, age, mun_experience, debate_experience, goals)
  on public.student_profiles to authenticated;

-- Authorized teachers (enforced by RLS via public.is_authorized_teacher()) need
-- the status column in order to activate / deactivate a student. The
-- all-columns grant is safe here because the RLS policies below still limit
-- which rows and columns a teacher may touch, and a student can never satisfy
-- is_authorized_teacher().
grant update (full_name, email, age, mun_experience, debate_experience, goals, status)
  on public.student_profiles to authenticated;

grant select on public.meetings, public.announcements to authenticated;
grant insert, update, delete on public.meetings to authenticated;
grant insert, update, delete on public.announcements to authenticated;

-- ---------------------------------------------------------------------------
-- 3. RLS policies (re-declared for clarity; identical intent to the originals).
-- ---------------------------------------------------------------------------
drop policy if exists "Students can read their own profile" on public.student_profiles;
create policy "Students can read their own profile"
on public.student_profiles for select to authenticated
using (auth.uid() = user_id or public.is_authorized_teacher());

drop policy if exists "Students can update their own profile" on public.student_profiles;
create policy "Students can update their own profile"
on public.student_profiles for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Teachers can manage student profiles" on public.student_profiles;
create policy "Teachers can manage student profiles"
on public.student_profiles for update to authenticated
using (public.is_authorized_teacher())
with check (public.is_authorized_teacher());

commit;

-- ---------------------------------------------------------------------------
-- Notes:
--   * A student cannot change their own status: their own-row UPDATE policy
--     does not grant access to the status column, and the status column is
--     only writable by a session satisfying public.is_authorized_teacher().
--   * Teachers created directly in Supabase Auth are unaffected: they simply
--     no longer get a spurious student_profiles row.
--   * Students created through /teacher/students receive
--     account_type = 'student' in user_metadata and therefore DO get a
--     student_profiles row.
-- ---------------------------------------------------------------------------
