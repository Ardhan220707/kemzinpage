# Progres Pengembangan Kemzinpage

PRD tetap sumber kebutuhan utama. File ini catatan status nyata kode dan database.

## Ringkasan status

| Tahap PRD | Cakupan | Status |
| --- | --- | --- |
| Tahap 1 | Fondasi proyek, Supabase, login Admin | Selesai |
| Tahap 2 | Autentikasi, proteksi route, redirect role, RLS lintas role | Selesai sebagian. Sisa: provisioning akun pengurus |
| Tahap 3 | Divisi, anggota, akun pengurus | Selesai sebagian. Sisa: manajemen akun pengurus |
| Tahap 4 | Kegiatan, divisi peserta, sesi, snapshot peserta | Selesai |
| Tahap 5 | Presensi, ubah status, audit log | Selesai sebagian. Sisa: buka/tutup sesi |
| Tahap 6 | Dashboard dan rekap | Belum |
| Tahap 7 | QA, deployment, backup | Belum |

# Sudah selesai

## Batch 2.1 — Autentikasi, proteksi route, logout

- `/` redirect berdasarkan sesi dan role.
- Admin ke `/admin`, Kadiv/Wakadiv ke `/dashboard`.
- Akun tanpa profil, nonaktif, atau role tidak dikenal sign-out lalu ke `/login`.
- Validasi server pada `/admin`, `/dashboard`, dan `/`.
- Logout via `src/app/logout-action.ts`.
- Metadata aplikasi dan `lang="id"`.
- File: `src/app/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/logout-action.ts`, `src/app/layout.tsx`, `src/app/admin/page.tsx`.

## Batch 2.2 — Verifikasi database dan RLS

- 9 tabel PRD tersedia di Supabase.
- RLS aktif. Insert anonim ditolak `42501` di seluruh tabel.
- Snapshot schema dan policy: `supabase/migrations/202611170001_schema_snapshot.sql`.
- Selisih nama kolom nyata vs PRD:
  - `members.full_name`
  - `events.start_date`, `events.end_date`
  - `attendance_sessions.session_name`, `start_time`, `end_time`
  - belum ada `updated_at` pada beberapa tabel

## Batch 2.3 — Akun uji dan uji RLS lintas role

- 7 divisi: Kemzin, Acara, Humas, Konkes, Perkab, Fundra, PDD.
- 14 akun Auth + profile: 1 Kadiv dan 1 Wakadiv per divisi (`@confest.com`).
- Uji RLS lintas role aman.
- Catatan: insert manual `auth.users` wajib disertai `auth.identities` (`provider = 'email'`, `provider_id = auth.users.id::text`). `confirmed_at` generated, tidak boleh di-update.
- Password akun uji masih seragam, ganti sebelum produksi.

## Batch 3.1 — CRUD divisi

- `/admin/divisions`: daftar, tambah, edit nama/deskripsi, aktif/nonaktifkan.
- Tanpa hard delete.
- Statistik dashboard Admin dari database (divisi, anggota, kegiatan, sesi).

## Batch 3.2 — CRUD anggota

- `/admin/members`: daftar, tambah, edit, pindah divisi, aktif/nonaktifkan, cari nama.
- Tanpa hard delete agar snapshot dan histori aman.

## Batch 3.3 — Anggota untuk Kadiv/Wakadiv

- `/dashboard`: nama divisi, jumlah anggota, daftar anggota read-only, jumlah sesi.

## Batch 4.1 — CRUD kegiatan dan divisi peserta

- `/admin/events`: tambah/edit kegiatan, status enum, waktu mulai/selesai, pilih divisi peserta.
- Helper `src/lib/require-admin.ts`.

## Batch 4.2 — Sesi dan snapshot peserta

- RPC `create_attendance_session`: sesi + snapshot peserta + record `belum` dalam satu transaksi.
- Tolak jika bukan Admin, nama kosong, kegiatan tanpa divisi peserta, atau tanpa anggota aktif.
- UI: daftar sesi per kegiatan, buat sesi, hapus sesi (cascade).
- File: `supabase/migrations/202611170002_create_attendance_session.sql`.

## Batch 5.1 — Presensi, ubah status, audit log

- `/sessions/[id]` untuk Admin, Kadiv, Wakadiv.
- Tabel peserta: nama snapshot, divisi snapshot, status.
- Ringkasan hadir / tidak hadir / belum / total.
- Ubah status via RPC `set_attendance` (update record + tulis log, skip jika status sama).
- Riwayat 20 perubahan terbaru + pelaku + waktu.
- File: `supabase/migrations/202611170003_set_attendance.sql`, `src/app/sessions/[id]/*`, `src/lib/one.ts`.

## Perbaikan setelah 5.1

- Bug tabel peserta kosong: relasi `attendance_records` dibaca sebagai array. Diperbaiki memakai helper `one()`.
- Policy RLS baca peserta, record, log, sesi, kegiatan untuk Kadiv/Wakadiv ditambahkan.
- Helper database `is_active_user()`, `is_admin()`, `current_division_id()` dibuat di `supabase/migrations/202611170000_auth_helpers.sql`.
- Policy presensi: `supabase/migrations/202611170004_attendance_policies.sql`.

# Belum selesai

## Blocker saat ini

- [ ] Jalankan `supabase/migrations/202611170003_set_attendance.sql` di Supabase.
  Fungsi `set_attendance` belum ada di database, sehingga perubahan status dari Kadiv/Wakadiv gagal tersimpan.
- [ ] Ganti password 14 akun uji sebelum dipakai di luar lingkungan uji.

## Tahap 2 — sisa

- [ ] Provisioning akun pengurus dari aplikasi.
  - Halaman Admin buat Kadiv/Wakadiv.
  - Supabase Admin API hanya dari server.
  - `SUPABASE_SERVICE_ROLE_KEY` hanya di `.env.local` dan Vercel, bukan `NEXT_PUBLIC_*`.
  - Validasi email, role, `division_id` di server.
- [ ] Manajemen akun pengurus.
  - Daftar akun.
  - Ubah role dan divisi.
  - Aktif/nonaktifkan tanpa menghapus histori.

## Tahap 5 — sisa

- [ ] Buka/tutup sesi (`scheduled` → `open` → `closed`).
- [ ] Kunci perubahan presensi saat sesi `closed`.
- [ ] Kebijakan koreksi Admin setelah sesi ditutup.
- [ ] Penanganan dua pengurus mengubah presensi bersamaan.
- [ ] Indikator sesi `scheduled` tidak boleh diisi.

## Tahap 6 — dashboard dan laporan

- [ ] Rekap presensi per kegiatan, sesi, dan divisi.
- [ ] Persentase kehadiran dengan status `belum` dikecualikan.
- [ ] Filter kegiatan, sesi, divisi sesuai role.
- [ ] Ringkasan kehadiran lintas divisi di dashboard Admin.
- [ ] Aktivitas terbaru di dashboard Admin.
- [ ] Rekap dan daftar kegiatan relevan di dashboard pengurus.
- [ ] Tampilan rekap ramah mobile.

## Tahap 7 — QA dan deployment

- [ ] Pengujian fungsional seluruh alur.
- [ ] Pengujian RLS dengan request nyata lintas akun.
- [ ] Pengujian responsivitas desktop dan mobile.
- [ ] `npm run build` bersih.
- [ ] Deployment Vercel.
- [ ] Konfigurasi domain dan redirect Auth Supabase.
- [ ] Environment variables di Vercel.
- [ ] Backup database dan dokumentasi operasional.
- [ ] Commit dan push seluruh pekerjaan yang masih untracked.

## Keputusan yang masih menggantung

Diambil dari PRD §21. Perlu diputuskan sebelum fitur terkait dibuat.

- [ ] Atribut tambahan anggota (kontak, angkatan, NIM, status keanggotaan).
- [ ] Kadiv/Wakadiv boleh CRUD anggota atau hanya melihat.
- [ ] Pengurus boleh mengubah presensi saat sesi `closed`.
- [ ] Koreksi Admin setelah sesi tutup wajib alasan atau tidak.
- [ ] Kebijakan hapus: hard delete atau soft delete.
- [ ] Pengurus boleh melihat log lengkap atau tidak.
- [ ] Format rekap dan kebutuhan ekspor PDF/Excel/CSV.
- [ ] Pagination dan pencarian global sejak MVP.
