-- Helper otorisasi untuk RLS dan fungsi presensi.
-- Jalankan SEBELUM 202611170003_set_attendance.sql.

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
