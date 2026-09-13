begin;

alter table public.registrations
  add column if not exists is_read boolean not null default false,
  add column if not exists read_at timestamptz,
  add column if not exists read_by uuid references auth.users(id) on delete set null;

alter table public.registrations enable row level security;

revoke update on table public.registrations from public, anon, authenticated;
revoke delete on table public.registrations from public, anon, authenticated;

grant update (is_read, read_at, read_by)
on table public.registrations
to authenticated;

grant delete on table public.registrations to authenticated;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'registrations'
      and cmd in ('UPDATE', '*')
  loop
    execute format(
      'drop policy if exists %I on public.registrations',
      policy_record.policyname
    );
  end loop;
end;
$$;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'registrations'
      and cmd in ('DELETE', '*')
  loop
    execute format(
      'drop policy if exists %I on public.registrations',
      policy_record.policyname
    );
  end loop;
end;
$$;

drop policy if exists "Authorized teachers can update registration status"
on public.registrations;

create policy "Authorized teachers can update registration status"
on public.registrations
for update
to authenticated
using (public.is_authorized_teacher())
with check (
  public.is_authorized_teacher()
  and (
    (is_read = false and read_at is null and read_by is null)
    or (is_read = true and read_at is not null and read_by = (select auth.uid()))
  )
);

drop policy if exists "Authorized teachers can delete registrations"
on public.registrations;

create policy "Authorized teachers can delete registrations"
on public.registrations
for delete
to authenticated
using (public.is_authorized_teacher() and is_read = true);

commit;