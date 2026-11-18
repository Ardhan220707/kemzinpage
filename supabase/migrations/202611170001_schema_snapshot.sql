-- Snapshot skema Supabase Kemzinpage.
-- Sumber kebenaran: database proyek https://bxytadggcqmhcnsromqp.supabase.co
-- File ini mendokumentasikan skema yang SUDAH ADA. Jangan jalankan ulang
-- pada database yang sama; gunakan untuk membuat environment baru.
-- Perbedaan nama kolom dengan PRD dicatat di PROGRESS.md Batch 2.2.

do $$ begin
  create type public.user_role as enum ('admin', 'kadiv', 'wakadiv');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attendance_status as enum ('hadir', 'tidak_hadir', 'belum');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.event_status as enum ('draft', 'active', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.session_status as enum ('scheduled', 'open', 'closed');
exception when duplicate_object then null; end $$;

create table if not exists public.divisions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null,
  division_id uuid references public.divisions(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  division_id uuid not null references public.divisions(id),
  full_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location text,
  status public.event_status not null default 'draft',
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.event_divisions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  division_id uuid not null references public.divisions(id),
  created_at timestamptz not null default now(),
  unique (event_id, division_id)
);

create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  session_name text not null,
  start_time timestamptz,
  end_time timestamptz,
  status public.session_status not null default 'scheduled',
  created_at timestamptz not null default now()
);

create table if not exists public.session_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  division_id uuid not null references public.divisions(id),
  member_name text not null,
  created_at timestamptz not null default now(),
  unique (session_id, member_id)
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_participant_id uuid not null unique references public.session_participants(id) on delete cascade,
  status public.attendance_status not null default 'belum',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  attendance_record_id uuid not null references public.attendance_records(id) on delete cascade,
  old_status public.attendance_status not null,
  new_status public.attendance_status not null,
  changed_by uuid not null references auth.users(id) on delete restrict,
  changed_at timestamptz not null default now()
);

create index if not exists members_division_id_idx on public.members(division_id);
create index if not exists event_divisions_division_id_idx on public.event_divisions(division_id);
create index if not exists session_participants_division_id_idx on public.session_participants(division_id);

create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and is_active) $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and is_active) $$;

create or replace function public.current_division_id()
returns uuid language sql stable security definer set search_path = public
as $$ select division_id from public.profiles where id = auth.uid() and is_active $$;

grant execute on function public.is_active_user() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_division_id() to authenticated;

alter table public.divisions enable row level security;
alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.events enable row level security;
alter table public.event_divisions enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.session_participants enable row level security;
alter table public.attendance_records enable row level security;
alter table public.attendance_logs enable row level security;

drop policy if exists divisions_select on public.divisions;
drop policy if exists divisions_admin on public.divisions;
create policy divisions_select on public.divisions for select to authenticated
  using (public.is_active_user() and (public.is_admin() or id = public.current_division_id()));
create policy divisions_admin on public.divisions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_admin on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (public.is_active_user() and (public.is_admin() or division_id = public.current_division_id()));
create policy profiles_admin on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists members_select on public.members;
drop policy if exists members_admin on public.members;
create policy members_select on public.members for select to authenticated
  using (public.is_active_user() and (public.is_admin() or division_id = public.current_division_id()));
create policy members_admin on public.members for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists events_select on public.events;
drop policy if exists events_admin on public.events;
create policy events_select on public.events for select to authenticated
  using (public.is_active_user() and (public.is_admin() or exists (
    select 1 from public.event_divisions ed
    where ed.event_id = events.id and ed.division_id = public.current_division_id()
  )));
create policy events_admin on public.events for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists event_divisions_select on public.event_divisions;
drop policy if exists event_divisions_admin on public.event_divisions;
create policy event_divisions_select on public.event_divisions for select to authenticated
  using (public.is_active_user() and (public.is_admin() or division_id = public.current_division_id()));
create policy event_divisions_admin on public.event_divisions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists sessions_select on public.attendance_sessions;
drop policy if exists sessions_admin on public.attendance_sessions;
create policy sessions_select on public.attendance_sessions for select to authenticated
  using (public.is_active_user() and (public.is_admin() or exists (
    select 1 from public.event_divisions ed
    where ed.event_id = attendance_sessions.event_id
      and ed.division_id = public.current_division_id()
  )));
create policy sessions_admin on public.attendance_sessions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists participants_select on public.session_participants;
drop policy if exists participants_admin on public.session_participants;
create policy participants_select on public.session_participants for select to authenticated
  using (public.is_active_user() and (public.is_admin() or division_id = public.current_division_id()));
create policy participants_admin on public.session_participants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists records_select on public.attendance_records;
drop policy if exists records_update on public.attendance_records;
drop policy if exists records_admin on public.attendance_records;
create policy records_select on public.attendance_records for select to authenticated
  using (public.is_active_user() and (public.is_admin() or exists (
    select 1 from public.session_participants sp
    where sp.id = session_participant_id and sp.division_id = public.current_division_id()
  )));
create policy records_update on public.attendance_records for update to authenticated
  using (public.is_active_user() and (public.is_admin() or exists (
    select 1 from public.session_participants sp
    where sp.id = session_participant_id and sp.division_id = public.current_division_id()
  )))
  with check (public.is_active_user());
create policy records_admin on public.attendance_records for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists logs_select on public.attendance_logs;
drop policy if exists logs_admin on public.attendance_logs;
create policy logs_select on public.attendance_logs for select to authenticated
  using (public.is_active_user() and (public.is_admin() or exists (
    select 1 from public.attendance_records ar
    join public.session_participants sp on sp.id = ar.session_participant_id
    where ar.id = attendance_logs.attendance_record_id
      and sp.division_id = public.current_division_id()
  )));
create policy logs_admin on public.attendance_logs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
