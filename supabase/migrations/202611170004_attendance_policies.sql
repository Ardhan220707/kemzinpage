  -- Policy RLS presensi untuk Kadiv/Wakadiv dan Admin.
  -- Jalankan di Supabase SQL Editor. Aman dijalankan berulang.

  -- attendance_records: baca
  drop policy if exists records_select on public.attendance_records;
  create policy records_select on public.attendance_records for select to authenticated
  using (
    public.is_active_user()
    and (
      public.is_admin()
      or exists (
        select 1
        from public.session_participants sp
        where sp.id = session_participant_id
          and sp.division_id = public.current_division_id()
      )
    )
  );

  -- attendance_records: update status oleh pengurus divisi
  drop policy if exists records_update on public.attendance_records;
  create policy records_update on public.attendance_records for update to authenticated
  using (
    public.is_active_user()
    and (
      public.is_admin()
      or exists (
        select 1
        from public.session_participants sp
        where sp.id = session_participant_id
          and sp.division_id = public.current_division_id()
      )
    )
  )
  with check (public.is_active_user());

  -- attendance_logs: baca
  drop policy if exists logs_select on public.attendance_logs;
  create policy logs_select on public.attendance_logs for select to authenticated
  using (
    public.is_active_user()
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

  -- attendance_logs: insert log oleh pengurus divisi
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
