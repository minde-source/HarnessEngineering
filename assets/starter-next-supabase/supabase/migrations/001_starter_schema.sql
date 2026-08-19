create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

create table if not exists public.starter_records (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  note text not null default '' check (char_length(note) <= 500),
  is_protected boolean not null default false,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.starter_deleted_records (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null,
  snapshot jsonb not null,
  deleted_by uuid null references public.profiles(id) on delete set null,
  deleted_by_email text not null,
  reason text not null,
  deleted_at timestamptz not null default now()
);

create table if not exists public.starter_audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in ('record.create', 'record.delete_safe')),
  actor_id uuid null references public.profiles(id) on delete set null,
  actor_email text not null,
  target_ids uuid[] not null default '{}',
  reason text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists starter_records_created_at_idx on public.starter_records(created_at desc);
create index if not exists starter_deleted_records_deleted_at_idx on public.starter_deleted_records(deleted_at desc);
create index if not exists starter_audit_logs_created_at_idx on public.starter_audit_logs(created_at desc);

alter table public.profiles enable row level security;
alter table public.starter_records enable row level security;
alter table public.starter_deleted_records enable row level security;
alter table public.starter_audit_logs enable row level security;

drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, coalesce(new.email, ''), 'staff')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert or update of email on auth.users
  for each row execute function public.handle_new_user_profile();

create or replace function public.starter_safe_delete_records(
  p_ids uuid[],
  p_actor_id uuid,
  p_actor_email text,
  p_reason text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_count integer;
  matched_count integer;
  total_count integer;
begin
  select count(*) into requested_count from (select distinct unnest(p_ids) as id) selected;
  if requested_count < 1 or requested_count > 100 then
    raise exception 'invalid_selection';
  end if;
  if char_length(trim(coalesce(p_reason, ''))) < 5 or char_length(p_reason) > 300 then
    raise exception 'invalid_reason';
  end if;
  if not exists (select 1 from public.profiles where id = p_actor_id and role = 'admin') then
    raise exception 'admin_required';
  end if;

  perform 1 from public.starter_records where id = any(p_ids) for update;
  select count(*) into matched_count from public.starter_records where id = any(p_ids);
  if matched_count <> requested_count then
    raise exception 'record_changed';
  end if;
  if exists (select 1 from public.starter_records where id = any(p_ids) and is_protected) then
    raise exception 'protected_record';
  end if;
  select count(*) into total_count from public.starter_records;
  if total_count - matched_count < 1 then
    raise exception 'keep_one_record';
  end if;

  insert into public.starter_deleted_records (source_id, snapshot, deleted_by, deleted_by_email, reason)
  select record.id, to_jsonb(record), p_actor_id, p_actor_email, trim(p_reason)
  from public.starter_records record
  where record.id = any(p_ids);

  insert into public.starter_audit_logs (action, actor_id, actor_email, target_ids, reason, metadata)
  values ('record.delete_safe', p_actor_id, p_actor_email, p_ids, trim(p_reason), jsonb_build_object('deleted_count', matched_count));

  delete from public.starter_records where id = any(p_ids);
  return matched_count;
end;
$$;

revoke all on function public.starter_safe_delete_records(uuid[], uuid, text, text) from public, anon, authenticated;
grant execute on function public.starter_safe_delete_records(uuid[], uuid, text, text) to service_role;

insert into public.starter_records (name, note, is_protected)
select 'Hồ sơ mẫu được bảo vệ', 'Dùng để kiểm tra quy tắc xóa an toàn.', true
where not exists (select 1 from public.starter_records);
