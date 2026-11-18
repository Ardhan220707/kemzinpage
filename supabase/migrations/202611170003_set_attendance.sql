-- Presensi: ubah status + audit log dalam satu transaksi.
-- Jalankan di Supabase SQL Editor sebelum memakai halaman presensi.

drop policy if exists logs_insert_division on public.attendance_logs;
create policy logs_insert_division on public.attendance_logs for insert to authenticated
with check (
  public.is_active_user()
  and changed_by = auth.uid()
  and (
    public.is_admin()
    or exists (
      select 1
      from public.attendance_records ar
      join public.session_participants sp on sp.id = ar.session_participant_id
      where ar.id = attendance_record_id
        and sp.division_id = public.current_division_id()
    )
  )
);

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
begin
  select ar.status, sp.division_id
    into v_old, v_division
  from public.attendance_records ar
  join public.session_participants sp on sp.id = ar.session_participant_id
  where ar.id = p_record_id;

  if v_old is null then
    raise exception 'Record presensi tidak ditemukan';
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

grant execute on function public.set_attendance(uuid, public.attendance_status) to authenticated;
