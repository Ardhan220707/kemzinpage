-- Fungsi atomik pembuatan sesi presensi + snapshot peserta + record awal.
-- Jalankan di Supabase SQL Editor SEKALI sebelum memakai Batch 4.2.

create or replace function public.create_attendance_session(
  p_event_id uuid,
  p_session_name text,
  p_start_time timestamptz default null,
  p_end_time timestamptz default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_session_id uuid;
  v_participants int;
begin
  if not public.is_admin() then
    raise exception 'Hanya Admin yang dapat membuat sesi';
  end if;

  if coalesce(trim(p_session_name), '') = '' then
    raise exception 'Nama sesi wajib diisi';
  end if;

  if not exists (select 1 from public.events where id = p_event_id) then
    raise exception 'Kegiatan tidak ditemukan';
  end if;

  if not exists (select 1 from public.event_divisions where event_id = p_event_id) then
    raise exception 'Kegiatan belum memiliki divisi peserta';
  end if;

  insert into public.attendance_sessions (event_id, session_name, start_time, end_time, status)
  values (p_event_id, trim(p_session_name), p_start_time, p_end_time, 'scheduled')
  returning id into v_session_id;

  insert into public.session_participants (session_id, member_id, division_id, member_name)
  select v_session_id, m.id, m.division_id, m.full_name
  from public.members m
  join public.event_divisions ed on ed.division_id = m.division_id
  where ed.event_id = p_event_id
    and m.is_active;

  get diagnostics v_participants = row_count;
  if v_participants = 0 then
    raise exception 'Tidak ada anggota aktif pada divisi peserta kegiatan';
  end if;

  insert into public.attendance_records (session_participant_id, status, updated_by)
  select sp.id, 'belum', auth.uid()
  from public.session_participants sp
  where sp.session_id = v_session_id;

  return v_session_id;
end;
$$;

grant execute on function public.create_attendance_session(uuid, text, timestamptz, timestamptz) to authenticated;
