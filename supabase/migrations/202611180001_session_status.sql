-- Buka/tutup sesi + kunci presensi saat sesi bukan 'open'.
-- Jalankan di Supabase SQL Editor. Aman dijalankan berulang.

create or replace function public.set_session_status(
  p_session_id uuid,
  p_status public.session_status
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_old public.session_status;
begin
  if not public.is_admin() then
    raise exception 'Hanya Admin yang dapat mengubah status sesi';
  end if;

  select status into v_old from public.attendance_sessions where id = p_session_id;
  if v_old is null then
    raise exception 'Sesi tidak ditemukan';
  end if;

  if not (
    (v_old = 'scheduled' and p_status = 'open')
    or (v_old = 'open' and p_status = 'closed')
  ) then
    raise exception 'Status sesi tidak dapat diubah dari % ke %', v_old, p_status;
  end if;

  update public.attendance_sessions set status = p_status where id = p_session_id;
end;
$$;

grant execute on function public.set_session_status(uuid, public.session_status) to authenticated;

-- set_attendance: tolak perubahan bila sesi belum dibuka atau sudah ditutup.
create or replace function public.set_attendance(
  p_record_id uuid,
  p_status public.attendance_status
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_old public.attendance_status;
  v_division uuid;
  v_session public.session_status;
begin
  select ar.status, sp.division_id, s.status
    into v_old, v_division, v_session
  from public.attendance_records ar
  join public.session_participants sp on sp.id = ar.session_participant_id
  join public.attendance_sessions s on s.id = sp.session_id
  where ar.id = p_record_id;

  if v_old is null then
    raise exception 'Record presensi tidak ditemukan';
  end if;

  if v_session <> 'open' then
    raise exception 'Presensi hanya dapat diubah saat sesi dibuka';
  end if;

  if not (public.is_admin() or v_division = public.current_division_id()) then
    raise exception 'Tidak berwenang mengubah presensi divisi ini';
  end if;

  if v_old = p_status then
    return;
  end if;

  update public.attendance_records
  set status = p_status, updated_at = now(), updated_by = auth.uid()
  where id = p_record_id;

  insert into public.attendance_logs (attendance_record_id, old_status, new_status, changed_by)
  values (p_record_id, v_old, p_status, auth.uid());
end;
$$;

-- RLS: update record hanya saat sesi open (cegah bypass lewat PostgREST langsung).
drop policy if exists records_update on public.attendance_records;
create policy records_update on public.attendance_records for update to authenticated
using (
  public.is_active_user()
  and exists (
    select 1
    from public.session_participants sp
    join public.attendance_sessions s on s.id = sp.session_id
    where sp.id = session_participant_id
      and s.status = 'open'
      and (
        public.is_admin()
        or sp.division_id = public.current_division_id()
      )
  )
)
with check (public.is_active_user());
