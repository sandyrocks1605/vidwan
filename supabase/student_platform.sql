begin;

create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  age integer check (age between 6 and 21),
  mun_experience text,
  debate_experience text,
  goals text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  date date not null,
  start_time time not null,
  end_time time,
  meeting_type text not null default 'CLASS' check (meeting_type in ('CLASS', 'MUN TRAINING', 'WORKSHOP', 'MOCK MUN', 'DEBATE', 'OTHER')),
  location text not null default '',
  meeting_link text,
  status text not null default 'UPCOMING' check (status in ('UPCOMING', 'COMPLETED', 'CANCELLED')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  link text,
  is_published boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meetings_date_idx on public.meetings (date, start_time);
create index if not exists announcements_created_at_idx on public.announcements (created_at desc);

create or replace function public.set_student_profile_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists student_profiles_updated_at on public.student_profiles;
create trigger student_profiles_updated_at
before update on public.student_profiles
for each row execute function public.set_student_profile_updated_at();

create or replace function public.handle_new_student()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.student_profiles (
    user_id, full_name, email, age, mun_experience, debate_experience, goals
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
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

alter table public.student_profiles enable row level security;
alter table public.meetings enable row level security;
alter table public.announcements enable row level security;

revoke all on table public.student_profiles from public, anon;
revoke all on table public.meetings from public, anon;
revoke all on table public.announcements from public, anon;
grant select, update (full_name, age, mun_experience, debate_experience, goals) on public.student_profiles to authenticated;
grant select on public.meetings, public.announcements to authenticated;
grant insert, update, delete on public.meetings to authenticated;
grant insert, update, delete on public.announcements to authenticated;

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

drop policy if exists "Students can read relevant meetings" on public.meetings;
create policy "Students can read relevant meetings"
on public.meetings for select to authenticated
using (
  public.is_authorized_teacher()
  or exists (select 1 from public.student_profiles where user_id = auth.uid() and status = 'ACTIVE')
);

drop policy if exists "Teachers can create meetings" on public.meetings;
create policy "Teachers can create meetings"
on public.meetings for insert to authenticated
with check (public.is_authorized_teacher() and created_by = auth.uid());

drop policy if exists "Teachers can update meetings" on public.meetings;
create policy "Teachers can update meetings"
on public.meetings for update to authenticated
using (public.is_authorized_teacher())
with check (public.is_authorized_teacher());

drop policy if exists "Teachers can delete meetings" on public.meetings;
create policy "Teachers can delete meetings"
on public.meetings for delete to authenticated
using (public.is_authorized_teacher());

drop policy if exists "Students can read published announcements" on public.announcements;
create policy "Students can read published announcements"
on public.announcements for select to authenticated
using (
  public.is_authorized_teacher()
  or (is_published and exists (select 1 from public.student_profiles where user_id = auth.uid() and status = 'ACTIVE'))
);

drop policy if exists "Teachers can create announcements" on public.announcements;
create policy "Teachers can create announcements"
on public.announcements for insert to authenticated
with check (public.is_authorized_teacher() and created_by = auth.uid());

drop policy if exists "Teachers can update announcements" on public.announcements;
create policy "Teachers can update announcements"
on public.announcements for update to authenticated
using (public.is_authorized_teacher())
with check (public.is_authorized_teacher());

drop policy if exists "Teachers can delete announcements" on public.announcements;
create policy "Teachers can delete announcements"
on public.announcements for delete to authenticated
using (public.is_authorized_teacher());

commit;
