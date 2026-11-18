# Product Requirements Document (PRD)

# KEMZINPAGE --- Sistem Manajemen Presensi Organisasi

  Informasi          Detail
  ------------------ --------------------------------------------
  Nama produk        Kemzinpage
  Jenis produk       Aplikasi web manajemen presensi organisasi
  Dokumen            Product Requirements Document (PRD)
  Versi              1.0
  Tanggal            16 November 2026
  Status             Draft dasar pengembangan
  Platform           Web responsif
  Bahasa antarmuka   Bahasa Indonesia

------------------------------------------------------------------------

## 1. Ringkasan Produk

Kemzinpage adalah aplikasi web untuk membantu organisasi mengelola data
divisi, anggota, kegiatan, sesi kegiatan, dan presensi secara terpusat.
Sistem dirancang untuk organisasi yang memiliki sekitar 5--10 divisi
dengan 10--30 anggota per divisi, atau perkiraan total 50--300 anggota.

Aplikasi menyediakan tiga peran pengguna, yaitu Admin, Kepala Divisi
(Kadiv), dan Wakil Kepala Divisi (Wakadiv). Admin mengelola keseluruhan
data dan menentukan divisi yang wajib mengikuti kegiatan. Kadiv dan
Wakadiv memiliki kewenangan yang sama dalam mengelola presensi anggota
di divisinya masing-masing. Anggota yang dicatat kehadirannya tidak
harus memiliki akun untuk masuk ke aplikasi.

Presensi dilakukan secara manual dengan tiga status: **Hadir**, **Tidak
Hadir**, dan **Belum**. Satu kegiatan dapat memiliki beberapa sesi.
Ketika sesi baru dibuat, seluruh anggota yang termasuk dalam divisi
peserta sesi tersebut otomatis memperoleh status awal **Belum**.
Perubahan presensi dicatat dalam log aktivitas agar riwayat perubahan
dapat ditelusuri.

## 2. Latar Belakang dan Permasalahan

Pengelolaan presensi organisasi sering dilakukan melalui lembar kerja,
formulir, atau percakapan terpisah. Cara tersebut dapat menimbulkan
beberapa kendala:

1.  Data anggota dan divisi tersebar di beberapa tempat.
2.  Rekap kehadiran membutuhkan penggabungan data secara manual.
3.  Pengurus kesulitan memastikan anggota yang wajib hadir pada suatu
    kegiatan.
4.  Satu kegiatan yang memiliki beberapa sesi berisiko tercatat secara
    tidak konsisten.
5.  Perubahan status kehadiran sulit dilacak apabila tidak ada riwayat
    perubahan.
6.  Pengurus divisi dapat membutuhkan akses yang sama, tetapi hanya
    untuk anggota divisinya sendiri.
7.  Perubahan susunan anggota atau divisi dapat membuat data presensi
    historis kehilangan konteks.

Kemzinpage dibuat untuk menyatukan proses tersebut dalam satu aplikasi
dengan pembagian akses yang jelas, data terstruktur, dan pencatatan
riwayat.

## 3. Tujuan Produk

### 3.1 Tujuan utama

-   Menyediakan satu sumber data terpusat untuk divisi, anggota,
    kegiatan, sesi, dan presensi.
-   Mempercepat pencatatan serta rekapitulasi kehadiran.
-   Memastikan setiap pengurus hanya dapat mengelola data sesuai
    kewenangannya.
-   Menyediakan riwayat perubahan presensi yang dapat diaudit.
-   Mempertahankan konteks data historis meskipun data anggota atau
    divisi berubah.

### 3.2 Indikator keberhasilan

  -----------------------------------------------------------------------
  Indikator                           Kriteria keberhasilan
  ----------------------------------- -----------------------------------
  Pengelolaan akun                    Hanya akun yang dibuat atau
                                      diaktifkan Admin yang dapat
                                      mengakses aplikasi

  Pembatasan akses                    Kadiv/Wakadiv hanya dapat mengakses
                                      data divisinya

  Pencatatan presensi                 Status anggota dapat diperbarui dan
                                      tersimpan di database

  Status awal sesi                    Seluruh peserta sesi baru berstatus
                                      `Belum`

  Multi-sesi                          Satu kegiatan dapat memiliki lebih
                                      dari satu sesi

  Riwayat                             Perubahan status presensi tercatat
                                      dalam log

  Rekapitulasi                        Data kehadiran dapat ditampilkan
                                      berdasarkan kegiatan, sesi, dan
                                      divisi

  Responsivitas                       Antarmuka dapat digunakan pada
                                      desktop dan perangkat mobile
  -----------------------------------------------------------------------

## 4. Target Pengguna dan Skala

### 4.1 Target organisasi

-   Jumlah divisi: 5--10 divisi.
-   Jumlah anggota: 10--30 anggota per divisi.
-   Perkiraan total anggota: 50--300 orang.
-   Pengguna aplikasi: Admin, Kadiv, dan Wakadiv.
-   Anggota yang dicatat presensinya tidak diwajibkan memiliki akun.

### 4.2 Persona pengguna

#### A. Admin

Admin merupakan pengelola utama sistem dan memiliki akses lintas divisi.

Kebutuhan: - Membuat dan mengelola divisi. - Menambahkan, mengubah,
menonaktifkan, atau menghapus data anggota sesuai aturan data. - Membuat
dan mengelola akun pengurus. - Membuat kegiatan dan menentukan divisi
peserta. - Membuat beberapa sesi dalam satu kegiatan. - Membuka dan
menutup sesi presensi. - Melihat serta memperbaiki presensi seluruh
divisi. - Melihat rekapitulasi dan log aktivitas.

#### B. Kepala Divisi (Kadiv)

Kadiv bertanggung jawab terhadap presensi anggota divisinya.

Kebutuhan: - Melihat daftar anggota divisinya. - Melihat kegiatan dan
sesi yang melibatkan divisinya. - Mengubah status presensi anggota
divisinya. - Melihat rekapitulasi presensi divisinya. - Melihat
perubahan data presensi yang relevan dengan divisinya.

#### C. Wakil Kepala Divisi (Wakadiv)

Wakadiv memiliki kewenangan aplikasi yang sama dengan Kadiv untuk divisi
yang sama.

Kebutuhan: - Membantu Kadiv mengelola presensi. - Melihat data anggota
dan kegiatan divisinya. - Memperbarui status presensi. - Melihat
rekapitulasi divisinya.

Kadiv dan Wakadiv dapat melihat perubahan satu sama lain karena bekerja
pada data divisi yang sama.

#### D. Anggota

Anggota adalah subjek yang dicatat kehadirannya, bukan pengguna aplikasi
pada versi awal.

Karakteristik: - Tidak memerlukan akun login. - Data identitas dikelola
Admin. - Status kehadiran dicatat oleh pengurus yang memiliki akses.

## 5. Ruang Lingkup Produk

### 5.1 Fitur dalam cakupan versi awal (MVP)

1.  Autentikasi dan otorisasi pengguna.
2.  Manajemen akun pengurus.
3.  Manajemen divisi.
4.  Manajemen anggota.
5.  Manajemen kegiatan.
6.  Penentuan divisi peserta kegiatan.
7.  Manajemen beberapa sesi dalam satu kegiatan.
8.  Pencatatan presensi manual.
9.  Pembukaan dan penutupan sesi.
10. Riwayat perubahan presensi.
11. Dashboard berdasarkan peran.
12. Rekapitulasi presensi.
13. Antarmuka responsif untuk desktop dan mobile.

### 5.2 Di luar cakupan MVP

Fitur berikut dapat dipertimbangkan untuk pengembangan berikutnya dan
tidak dianggap tersedia sebelum diimplementasikan:

-   Presensi mandiri oleh anggota.
-   QR Code, GPS, geofencing, atau biometrik.
-   Notifikasi WhatsApp, SMS, atau push notification.
-   Integrasi Google Calendar.
-   Aplikasi native Android/iOS.
-   Pengajuan izin atau sakit oleh anggota melalui akun pribadi.
-   Tanda tangan digital.
-   Analitik lanjutan dan prediksi kehadiran.
-   Ekspor laporan dengan format khusus apabila belum diimplementasikan.

## 6. Peran dan Hak Akses

### 6.1 Matriks hak akses

  ----------------------------------------------------------------------------
  Fitur                            Admin              Kadiv            Wakadiv
  ------------------- ------------------ ------------------ ------------------
  Melihat seluruh                     Ya              Tidak              Tidak
  divisi                                                    

  Mengelola divisi                    Ya              Tidak              Tidak

  Melihat seluruh                     Ya              Tidak              Tidak
  anggota                                                   

  Mengelola anggota                   Ya              Tidak              Tidak

  Melihat anggota                     Ya                 Ya                 Ya
  divisi sendiri                                            

  Mengelola akun                      Ya              Tidak              Tidak
  pengurus                                                  

  Membuat kegiatan                    Ya              Tidak              Tidak

  Menentukan divisi                   Ya              Tidak              Tidak
  peserta kegiatan                                          

  Membuat/mengelola                   Ya              Tidak              Tidak
  sesi                                                      

  Melihat kegiatan                    Ya                 Ya                 Ya
  untuk divisinya                                           

  Membuka/menutup                     Ya              Tidak              Tidak
  sesi                                                      

  Mengubah presensi                   Ya              Tidak              Tidak
  seluruh divisi                                            

  Mengubah presensi                   Ya                 Ya                 Ya
  divisi sendiri                                            

  Melihat rekap                       Ya              Tidak              Tidak
  seluruh divisi                                            

  Melihat rekap                       Ya                 Ya                 Ya
  divisi sendiri                                            

  Melihat log seluruh                 Ya              Tidak              Tidak
  sistem                                                    

  Melihat log divisi                  Ya   Sesuai kebijakan   Sesuai kebijakan
  sendiri                                             akses              akses
  ----------------------------------------------------------------------------

### 6.2 Prinsip otorisasi

-   Hak akses ditentukan oleh role yang tersimpan pada tabel `profiles`.
-   Setiap akun pengurus harus memiliki profil aktif.
-   Kadiv dan Wakadiv terikat pada satu `division_id`.
-   Kadiv dan Wakadiv dalam divisi yang sama memperoleh kewenangan yang
    setara.
-   Pembatasan akses wajib diterapkan di server dan database melalui
    Supabase Row Level Security (RLS), bukan hanya dengan menyembunyikan
    tombol di antarmuka.
-   Pengguna yang tidak memiliki sesi valid harus diarahkan ke halaman
    login.
-   Pengguna aktif dengan role yang tidak sesuai tidak boleh mengakses
    halaman atau data di luar kewenangannya.

## 7. Alur Penggunaan Utama

### 7.1 Alur Admin pertama kali

1.  Admin membuat akun melalui Supabase Authentication atau mekanisme
    provisioning yang hanya dapat dilakukan pihak berwenang.
2.  Profil pengguna dibuat pada tabel `profiles`.
3.  Role ditetapkan menjadi `admin`.
4.  Admin login melalui halaman login.
5.  Sistem memvalidasi sesi, profil, dan status aktif.
6.  Admin diarahkan ke Dashboard Admin.

Registrasi publik tidak disediakan pada MVP. Akun pengurus dibuat atau
diundang oleh Admin.

### 7.2 Alur pengelolaan organisasi

1.  Admin membuat data divisi.
2.  Admin menambahkan anggota ke divisi yang sesuai.
3.  Admin membuat akun Kadiv dan Wakadiv.
4.  Admin menghubungkan setiap akun pengurus ke divisinya melalui
    profil.
5.  Pengurus login menggunakan akun yang telah disediakan.

### 7.3 Alur pembuatan kegiatan

1.  Admin membuat kegiatan.
2.  Admin mengisi informasi kegiatan seperti nama, deskripsi, lokasi,
    dan jadwal sesuai kebutuhan implementasi.
3.  Admin memilih satu atau beberapa divisi yang wajib mengikuti
    kegiatan.
4.  Admin menyimpan kegiatan.
5.  Kegiatan dapat memiliki satu atau beberapa sesi.

### 7.4 Alur pembuatan sesi dan peserta

1.  Admin membuka detail kegiatan.
2.  Admin membuat sesi baru.
3.  Sistem mengambil anggota dari divisi yang ditetapkan sebagai peserta
    kegiatan.
4.  Sistem membuat snapshot peserta sesi.
5.  Setiap peserta memperoleh status awal `belum`.
6.  Sesi dapat dijadwalkan, dibuka, atau ditutup sesuai statusnya.

Snapshot peserta menyimpan nama anggota dan identitas divisi pada saat
sesi dibuat. Tujuannya agar laporan historis tetap dapat dipahami
walaupun anggota berpindah divisi atau data keanggotaannya berubah
kemudian.

### 7.5 Alur pencatatan presensi

1.  Kadiv/Wakadiv login.
2.  Sistem memvalidasi role, status aktif, dan divisi pengguna.
3.  Pengurus melihat kegiatan serta sesi yang melibatkan divisinya.
4.  Pengurus membuka daftar peserta sesi.
5.  Pengurus mengubah status setiap anggota menjadi `hadir` atau
    `tidak_hadir`; status `belum` digunakan sebelum keputusan kehadiran
    dicatat.
6.  Sistem menyimpan perubahan.
7.  Sistem mencatat perubahan pada `attendance_logs`.
8.  Kadiv dan Wakadiv dapat melihat data terbaru yang sama.

Admin juga dapat melakukan koreksi presensi sesuai kewenangannya.
Koreksi harus tetap tercatat di log.

### 7.6 Alur penutupan sesi

1.  Admin menutup sesi.
2.  Status sesi berubah menjadi `closed`.
3.  Perubahan presensi setelah sesi ditutup dibatasi sesuai aturan
    bisnis.
4.  Jika Admin melakukan koreksi setelah penutupan, tindakan tersebut
    harus mengikuti kebijakan koreksi dan tetap tercatat pada log.

## 8. Spesifikasi Fungsional

### FR-01 --- Autentikasi

-   Sistem menyediakan halaman login dengan email dan password.
-   Sistem menggunakan Supabase Authentication.
-   Sistem tidak menyediakan pendaftaran akun publik pada MVP.
-   Sistem memvalidasi sesi pengguna pada server.
-   Sistem memeriksa keberadaan profil dan `is_active`.
-   Sistem mengarahkan Admin ke `/admin`.
-   Sistem mengarahkan Kadiv/Wakadiv ke `/dashboard`.
-   Sistem menolak akun tanpa profil, profil nonaktif, atau role yang
    tidak dikenali.
-   Sistem menyediakan fungsi logout.
-   Kredensial dan secret key tidak boleh ditampilkan atau disimpan di
    sisi klien.

### FR-02 --- Manajemen akun pengurus

-   Admin dapat membuat atau mengundang akun pengurus melalui mekanisme
    yang aman.
-   Setiap akun pengurus memiliki nama, role, status aktif, dan divisi
    (untuk Kadiv/Wakadiv).
-   Admin dapat mengubah role atau divisi sesuai kebutuhan organisasi.
-   Admin dapat menonaktifkan akun tanpa harus menghapus histori
    presensi.
-   Akun nonaktif tidak dapat mengakses fitur terlindungi.

### FR-03 --- Manajemen divisi

-   Admin dapat menambah, melihat, mengubah, dan menonaktifkan/menghapus
    divisi sesuai aturan relasi data.
-   Setiap divisi memiliki identitas unik dan nama.
-   Sistem mencegah nama atau kode divisi duplikat jika aturan unik
    diterapkan.
-   Data historis tidak boleh rusak ketika divisi berubah atau
    dinonaktifkan.

### FR-04 --- Manajemen anggota

-   Admin dapat menambahkan anggota ke divisi.
-   Admin dapat melihat dan mengubah data anggota.
-   Admin dapat memindahkan anggota ke divisi lain.
-   Admin dapat menonaktifkan atau menghapus anggota sesuai kebijakan
    retensi.
-   Kadiv/Wakadiv hanya dapat melihat dan mengelola anggota divisinya
    sendiri jika kebijakan CRUD anggota untuk pengurus diaktifkan.
-   Anggota tidak memerlukan akun autentikasi.

### FR-05 --- Manajemen kegiatan

-   Admin dapat membuat, melihat, mengubah, dan membatalkan kegiatan.
-   Kegiatan dapat melibatkan satu atau beberapa divisi.
-   Admin dapat menentukan divisi peserta melalui relasi
    kegiatan-divisi.
-   Pengurus hanya dapat melihat kegiatan yang melibatkan divisinya.
-   Status kegiatan meliputi `draft`, `active`, `completed`, dan
    `cancelled`.

### FR-06 --- Manajemen sesi

-   Satu kegiatan dapat memiliki beberapa sesi.
-   Setiap sesi terhubung ke satu kegiatan.
-   Status sesi meliputi `scheduled`, `open`, dan `closed`.
-   Sesi baru menghasilkan daftar peserta berdasarkan divisi peserta
    kegiatan.
-   Setiap peserta sesi dibuat dengan status awal `belum`.
-   Sistem mencegah duplikasi peserta untuk anggota yang sama dalam sesi
    yang sama.

### FR-07 --- Presensi

-   Status presensi yang didukung adalah `hadir`, `tidak_hadir`, dan
    `belum`.
-   Status awal setiap peserta adalah `belum`.
-   Kadiv/Wakadiv dapat memperbarui presensi hanya untuk divisinya.
-   Admin dapat melihat dan mengoreksi presensi seluruh divisi.
-   Perubahan harus tersimpan di database.
-   Perubahan status harus menghasilkan catatan log.
-   Perilaku pengeditan saat sesi tertutup harus mengikuti kebijakan
    yang ditetapkan Admin.

### FR-08 --- Audit log

-   Sistem mencatat perubahan status presensi.
-   Log minimal menyimpan data presensi yang diubah, status sebelum,
    status sesudah, pengguna yang mengubah, dan waktu perubahan.
-   Log tidak boleh dapat diubah oleh pengurus biasa.
-   Admin dapat menelusuri riwayat perubahan untuk keperluan audit.
-   Identitas pelaku perubahan diambil dari sesi autentikasi yang
    tervalidasi, bukan dari input bebas pengguna.

### FR-09 --- Dashboard

Dashboard menampilkan informasi sesuai peran.

Dashboard Admin dapat menampilkan: - Total divisi. - Total anggota. -
Total kegiatan. - Total sesi presensi. - Aktivitas terbaru. - Ringkasan
kehadiran lintas divisi.

Dashboard Kadiv/Wakadiv dapat menampilkan: - Identitas divisi. - Jumlah
anggota divisi. - Kegiatan dan sesi yang relevan. - Ringkasan kehadiran
divisi. - Aktivitas presensi terbaru.

Angka statistik harus berasal dari database, bukan nilai statis, setelah
integrasi data selesai.

### FR-10 --- Rekapitulasi

-   Admin dapat melihat rekap presensi lintas divisi.
-   Kadiv/Wakadiv hanya dapat melihat rekap divisinya.
-   Rekap dapat dikelompokkan berdasarkan kegiatan, sesi, dan divisi.
-   Rekap membedakan jumlah hadir, tidak hadir, dan belum.
-   Persentase kehadiran dihitung dengan rumus yang konsisten dan
    mengecualikan status `belum` dari jumlah keputusan hadir/tidak
    hadir, kecuali kebijakan laporan menentukan lain.
-   Ekspor file merupakan fitur lanjutan kecuali telah disepakati untuk
    MVP.

## 9. Aturan Bisnis

  -----------------------------------------------------------------------
  ID                                  Aturan
  ----------------------------------- -----------------------------------
  BR-01                               Akun aplikasi hanya untuk Admin,
                                      Kadiv, dan Wakadiv

  BR-02                               Anggota yang dicatat presensinya
                                      tidak wajib memiliki akun

  BR-03                               Satu akun pengurus memiliki satu
                                      role aktif

  BR-04                               Kadiv/Wakadiv terhubung dengan
                                      divisi melalui `division_id`

  BR-05                               Kadiv dan Wakadiv pada divisi yang
                                      sama memiliki hak pengelolaan
                                      presensi yang setara

  BR-06                               Admin menentukan divisi peserta
                                      kegiatan

  BR-07                               Satu kegiatan dapat memiliki
                                      beberapa sesi

  BR-08                               Peserta sesi berasal dari anggota
                                      divisi yang ditetapkan untuk
                                      kegiatan

  BR-09                               Status awal peserta pada sesi baru
                                      adalah `belum`

  BR-10                               Satu anggota hanya boleh memiliki
                                      satu entri peserta pada sesi yang
                                      sama

  BR-11                               Pengurus hanya boleh mengubah
                                      presensi anggota divisinya

  BR-12                               Admin dapat mengakses data seluruh
                                      divisi

  BR-13                               Setiap perubahan status presensi
                                      dicatat pada audit log

  BR-14                               Data snapshot peserta tidak berubah
                                      hanya karena data anggota saat ini
                                      berubah

  BR-15                               Akun nonaktif tidak boleh mengakses
                                      halaman terlindungi

  BR-16                               Penghapusan data yang memiliki
                                      histori harus mengikuti kebijakan
                                      retensi dan integritas relasi
  -----------------------------------------------------------------------

## 10. Struktur Data dan Database

Database menggunakan PostgreSQL melalui Supabase. Rancangan awal terdiri
dari sembilan tabel utama dan beberapa enum.

### 10.1 Enum

#### `user_role`

-   `admin`
-   `kadiv`
-   `wakadiv`

#### `attendance_status`

-   `hadir`
-   `tidak_hadir`
-   `belum`

#### `event_status`

-   `draft`
-   `active`
-   `completed`
-   `cancelled`

#### `session_status`

-   `scheduled`
-   `open`
-   `closed`

### 10.2 Tabel utama

#### A. `divisions`

Menyimpan data divisi organisasi.

Kolom inti: - `id` - `name` - `created_at` - kolom status/atribut
tambahan sesuai implementasi

#### B. `profiles`

Menghubungkan akun Supabase Auth dengan identitas dan role aplikasi.

Kolom inti: - `id` --- mengacu ke `auth.users.id` - `full_name` -
`role` - `division_id` --- kosong untuk Admin, terisi untuk
Kadiv/Wakadiv - `is_active` - `created_at` - `updated_at`

#### C. `members`

Menyimpan data anggota organisasi yang menjadi subjek presensi.

Kolom inti: - `id` - `division_id` - `name` - atribut anggota lain
sesuai kebutuhan organisasi - `created_at` - `updated_at`

#### D. `events`

Menyimpan data kegiatan.

Kolom inti: - `id` - `name` - `description` - `location` - `status` -
atribut waktu kegiatan - `created_at` - `updated_at`

#### E. `event_divisions`

Tabel relasi many-to-many antara kegiatan dan divisi peserta.

Kolom inti: - `id` - `event_id` - `division_id` - constraint unik untuk
kombinasi kegiatan dan divisi

#### F. `attendance_sessions`

Menyimpan sesi-sesi dalam sebuah kegiatan.

Kolom inti: - `id` - `event_id` - `name` - atribut jadwal sesi -
`status` - `created_at` - `updated_at`

#### G. `session_participants`

Menyimpan snapshot peserta sesi.

Kolom inti: - `id` - `session_id` - `member_id` (dapat nullable untuk
menjaga snapshot jika data anggota asal dihapus, bergantung pada
kebijakan FK) - `division_id` - `member_name` - constraint unik untuk
kombinasi sesi dan anggota jika `member_id` tersedia - `created_at`

Snapshot nama dan divisi diperlukan agar histori sesi tetap dapat
ditampilkan dengan benar setelah perubahan data keanggotaan.

#### H. `attendance_records`

Menyimpan status presensi peserta sesi.

Kolom inti: - `id` - `session_participant_id` - `status` -
`updated_at` - `updated_by`

Setiap peserta sesi harus memiliki satu record presensi.

#### I. `attendance_logs`

Menyimpan histori perubahan presensi.

Kolom inti: - `id` - `attendance_record_id` - `old_status` -
`new_status` - `changed_by` - `changed_at` - kolom tambahan seperti
catatan perubahan jika diperlukan

### 10.3 Relasi konseptual

-   Satu `division` memiliki banyak `members`.
-   Satu `division` dapat memiliki banyak `profiles` pengurus.
-   Satu `event` dapat melibatkan banyak `divisions` melalui
    `event_divisions`.
-   Satu `event` memiliki banyak `attendance_sessions`.
-   Satu `attendance_session` memiliki banyak `session_participants`.
-   Satu `session_participant` memiliki satu `attendance_record`.
-   Satu `attendance_record` dapat memiliki banyak `attendance_logs`.

### 10.4 Catatan integritas data

-   Gunakan foreign key dan constraint untuk menjaga relasi.
-   Gunakan unique constraint untuk mencegah peserta ganda pada sesi
    yang sama.
-   Pembuatan peserta sesi dan record presensi awal sebaiknya dilakukan
    secara atomik melalui transaksi atau fungsi database/RPC agar tidak
    ada peserta tanpa record presensi.
-   Kebijakan penghapusan harus mempertimbangkan histori presensi dan
    audit.
-   Perpindahan anggota divisi tidak boleh mengubah snapshot sesi yang
    telah dibuat.
-   Perlu diputuskan apakah anggota yang ditambahkan ke divisi setelah
    sesi dibuat otomatis dimasukkan ke sesi lama atau hanya ke sesi
    baru. Rekomendasi MVP: daftar peserta menjadi snapshot saat sesi
    dibuat; perubahan berikutnya memerlukan tindakan eksplisit Admin.

## 11. Keamanan dan Row Level Security (RLS)

Keamanan data merupakan bagian inti produk karena sistem menyimpan
informasi organisasi dan histori kehadiran.

### 11.1 Prinsip keamanan

-   Aktifkan RLS pada seluruh tabel yang dapat diakses melalui Supabase
    API.
-   Terapkan kebijakan akses berdasarkan `auth.uid()`, role, status
    aktif, dan divisi pengguna.
-   Gunakan fungsi database seperti `is_admin()` dan
    `current_division_id()` untuk memusatkan pemeriksaan role/divisi
    bila sesuai.
-   Fungsi `SECURITY DEFINER` harus memiliki `search_path` yang aman dan
    hak eksekusi yang dibatasi.
-   Jangan mempercayai `division_id`, `role`, `changed_by`, atau
    identitas pengguna yang dikirim dari browser tanpa validasi
    server/database.
-   Publishable key boleh digunakan pada aplikasi klien sesuai desain
    Supabase, tetapi service role/secret key tidak boleh diekspos ke
    browser atau repository.
-   Validasi input dilakukan di server dan database.
-   Semua tindakan sensitif harus memiliki otorisasi server-side dan
    kebijakan RLS yang sesuai.

### 11.2 Ringkasan kebijakan akses yang diharapkan

  ------------------------------------------------------------------------
  Data                     Admin                   Kadiv/Wakadiv
  ------------------------ ----------------------- -----------------------
  `profiles`               Melihat dan mengelola   Melihat profil yang
                           sesuai kebijakan Admin  diperlukan untuk divisi
                                                   sendiri

  `divisions`              Mengelola seluruh       Membaca divisi sendiri
                           divisi                  

  `members`                Mengelola seluruh       Mengakses anggota
                           anggota                 divisi sendiri sesuai
                                                   kebijakan

  `events`                 Mengelola seluruh       Membaca kegiatan yang
                           kegiatan                melibatkan divisinya

  `event_divisions`        Mengelola relasi        Membaca relasi yang
                                                   relevan dengan
                                                   divisinya

  `attendance_sessions`    Mengelola seluruh sesi  Membaca sesi yang
                                                   relevan dengan
                                                   divisinya

  `session_participants`   Mengelola seluruh       Membaca peserta
                           peserta                 divisinya

  `attendance_records`     Melihat dan mengoreksi  Memperbarui presensi
                           seluruh presensi        divisinya sesuai aturan

  `attendance_logs`        Melihat seluruh log     Membaca log yang
                                                   diizinkan untuk
                                                   divisinya; tidak
                                                   mengubah log
  ------------------------------------------------------------------------

### 11.3 Hal yang wajib diuji sebelum produksi

-   Pengguna tanpa login tidak dapat membaca data terlindungi.
-   Kadiv Divisi A tidak dapat membaca atau mengubah data Divisi B.
-   Wakadiv Divisi A memiliki akses yang sama dengan Kadiv Divisi A.
-   Kadiv tidak dapat menaikkan role dirinya menjadi Admin.
-   Pengguna tidak dapat mengganti `division_id` melalui manipulasi
    request untuk memperoleh akses divisi lain.
-   Akun nonaktif ditolak.
-   Log tidak dapat dimanipulasi oleh pengguna biasa.
-   Admin tetap dapat mengakses data lintas divisi.
-   Pemeriksaan dilakukan melalui request nyata dengan beberapa akun
    uji, bukan hanya tampilan UI.

## 12. Teknologi dan Tech Stack

### 12.1 Stack yang digunakan

  -----------------------------------------------------------------------
  Lapisan                 Teknologi               Peran
  ----------------------- ----------------------- -----------------------
  Framework               Next.js 16.4.6          Framework aplikasi web

  Bahasa                  TypeScript              Type safety

  UI                      React 19                Komponen antarmuka

  Styling                 Tailwind CSS v4         Styling responsif

  Ikon                    lucide-react            Ikon antarmuka

  Form                    react-hook-form         Pengelolaan form

  Validasi                Zod                     Validasi skema input

  Integrasi form          @hookform/resolvers     Resolver validasi Zod

  Backend-as-a-Service    Supabase                Auth, database, dan API

  Database                PostgreSQL              Penyimpanan data
                                                  relasional

  SSR Auth                @supabase/ssr           Pengelolaan sesi
                                                  Supabase pada SSR

  Supabase Client         @supabase/supabase-js   Akses Supabase

  State management        Belum ditetapkan untuk  Dipilih bila kebutuhan
                          kebutuhan global        state lintas komponen
                                                  muncul

  Version control         Git dan GitHub          Riwayat perubahan dan
                                                  backup kode

  Deployment              Vercel                  Hosting aplikasi
                                                  Next.js
  -----------------------------------------------------------------------

### 12.2 Struktur proyek saat ini

Struktur yang telah digunakan atau direncanakan:

``` text
kemzinpage/
├── public/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   ├── login-form.tsx
│   │   │   └── actions.ts
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── server.ts
│   └── proxy.ts
├── .env.local
├── .gitignore
├── next.config.ts
├── package.json
└── README.md
```

Struktur ini merupakan baseline dan dapat berkembang menjadi folder
`components`, `features`, `hooks`, `types`, `schemas`, dan `services`
ketika fitur bertambah.

### 12.3 Konfigurasi Next.js

Konfigurasi proyek saat ini mengaktifkan:

-   `cacheComponents: true`
-   `partialPrefetching: true`
-   Turbopack rule untuk Tailwind CSS

Komponen yang membaca data request-time seperti cookies atau sesi
autentikasi harus mengikuti mekanisme dynamic rendering dan Suspense
yang sesuai dengan Next.js 16 serta konfigurasi Cache Components. Jangan
menambahkan `force-dynamic` secara sembarang karena konfigurasi tersebut
tidak kompatibel dengan `cacheComponents` pada setup ini.

### 12.4 Environment variables

Variabel publik yang digunakan:

``` env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Ketentuan: - `.env.local` tidak boleh masuk ke Git. - Jangan menaruh
service role key atau secret key di variabel `NEXT_PUBLIC_*`. - Secret
administratif hanya boleh digunakan pada lingkungan server yang aman. -
Jangan membagikan kredensial melalui screenshot, chat, atau repository.

## 13. Rancangan Antarmuka dan Navigasi

### 13.1 Prinsip desain

-   Modern, profesional, bersih, dan mudah dipahami.
-   Mengutamakan kejelasan informasi dibanding dekorasi.
-   Responsif pada desktop, tablet, dan mobile.
-   Navigasi menyesuaikan role.
-   Aksi penting seperti membuka sesi, menutup sesi, dan mengubah
    presensi harus jelas.
-   Status presensi menggunakan label teks yang mudah dibedakan; warna
    hanya sebagai pendukung, bukan satu-satunya indikator.

### 13.2 Halaman utama

#### Halaman Login (`/login`)

-   Logo/nama Kemzinpage.
-   Email.
-   Password.
-   Tombol masuk.
-   Pesan kesalahan validasi/login.
-   Informasi bahwa akun disediakan oleh Admin.
-   Tidak ada tautan registrasi publik.

#### Dashboard Admin (`/admin`)

-   Ringkasan statistik organisasi.
-   Navigasi manajemen divisi.
-   Navigasi manajemen anggota.
-   Navigasi akun pengurus.
-   Navigasi kegiatan dan sesi.
-   Navigasi rekapitulasi.
-   Navigasi log aktivitas.
-   Profil Admin dan logout.

#### Dashboard Pengurus (`/dashboard`)

-   Ringkasan divisi.
-   Daftar kegiatan aktif dan mendatang yang relevan.
-   Daftar sesi presensi.
-   Ringkasan kehadiran divisi.
-   Akses menuju daftar anggota dan presensi.
-   Profil dan logout.

#### Halaman Divisi

-   Daftar divisi untuk Admin.
-   Detail anggota per divisi.
-   Informasi Kadiv/Wakadiv.
-   Status aktif divisi.

#### Halaman Anggota

-   Daftar anggota.
-   Pencarian dan filter.
-   Tambah/edit anggota oleh pihak yang berwenang.
-   Informasi divisi dan status keanggotaan.

#### Halaman Kegiatan

-   Daftar kegiatan.
-   Status kegiatan.
-   Divisi peserta.
-   Detail kegiatan.
-   Daftar sesi dalam kegiatan.

#### Halaman Sesi dan Presensi

-   Informasi sesi dan status sesi.
-   Daftar peserta snapshot.
-   Status hadir/tidak hadir/belum.
-   Aksi pembaruan presensi sesuai role.
-   Ringkasan jumlah status.
-   Akses riwayat perubahan sesuai izin.

#### Halaman Rekapitulasi

-   Filter kegiatan.
-   Filter sesi.
-   Filter divisi sesuai role.
-   Jumlah hadir, tidak hadir, dan belum.
-   Persentase kehadiran.
-   Tampilan tabel yang dapat digunakan pada perangkat mobile.

## 14. Persyaratan Nonfungsional

### 14.1 Kinerja

-   Halaman utama dan daftar data harus tetap responsif pada skala
    50--300 anggota.
-   Gunakan pagination atau pencarian server-side bila daftar
    berkembang.
-   Hindari query berulang yang tidak diperlukan.
-   Gunakan indeks database pada foreign key dan kolom filter yang
    sering digunakan.

### 14.2 Keamanan

-   Terapkan RLS untuk seluruh tabel yang terekspos.
-   Validasi role dan status akun pada server.
-   Lindungi route dan Server Action.
-   Jangan mengandalkan validasi client-side sebagai kontrol keamanan.
-   Jangan menyimpan password dalam tabel aplikasi.
-   Gunakan HTTPS pada deployment.

### 14.3 Reliabilitas dan integritas

-   Perubahan presensi harus tersimpan secara konsisten.
-   Pembuatan sesi dan peserta harus mencegah data parsial.
-   Audit log harus dibuat secara konsisten.
-   Operasi penting perlu menangani kegagalan dan memberikan pesan yang
    jelas.

### 14.4 Usability dan aksesibilitas

-   Form memiliki label yang jelas.
-   Tombol memiliki teks atau label aksesibel.
-   Status tidak dibedakan hanya melalui warna.
-   Antarmuka mendukung keyboard dan ukuran layar mobile.
-   Pesan loading, kosong, sukses, dan error disediakan.

### 14.5 Maintainability

-   Gunakan TypeScript secara konsisten.
-   Pisahkan komponen UI, akses data, validasi, dan logika bisnis.
-   Gunakan tipe data yang sesuai dengan skema database.
-   Hindari duplikasi logika otorisasi.
-   Gunakan Git untuk menyimpan checkpoint perubahan.

## 15. Penanganan Kesalahan dan Kondisi Khusus

Sistem perlu menangani setidaknya kondisi berikut:

-   Email/password salah.
-   Akun tidak memiliki profil.
-   Akun dinonaktifkan.
-   Role tidak valid.
-   Pengguna mencoba membuka route tanpa login.
-   Pengurus mencoba mengakses divisi lain.
-   Kegiatan belum memiliki divisi peserta.
-   Sesi belum memiliki peserta.
-   Anggota berpindah divisi setelah sesi dibuat.
-   Anggota dinonaktifkan setelah pernah mengikuti sesi.
-   Sesi sudah ditutup.
-   Dua pengurus mengubah presensi pada waktu berdekatan.
-   Koneksi internet terputus saat menyimpan perubahan.
-   Query database gagal.
-   Data yang diminta tidak ditemukan.

Pesan kepada pengguna harus informatif tanpa membocorkan detail
internal, query, token, atau secret.

## 16. Pengujian dan Kriteria Penerimaan

### 16.1 Pengujian autentikasi

-   [ ] Login Admin berhasil.
-   [ ] Login Kadiv berhasil.
-   [ ] Login Wakadiv berhasil.
-   [ ] Password salah ditolak.
-   [ ] Akun nonaktif ditolak.
-   [ ] Akun tanpa profil ditolak.
-   [ ] Logout mengakhiri sesi.
-   [ ] Route terlindungi mengarahkan pengguna yang belum login ke
    halaman login.

### 16.2 Pengujian role dan RLS

-   [ ] Admin dapat mengakses data seluruh divisi.
-   [ ] Kadiv hanya dapat mengakses divisinya.
-   [ ] Wakadiv hanya dapat mengakses divisinya.
-   [ ] Kadiv dan Wakadiv divisi yang sama melihat perubahan data yang
    sama.
-   [ ] Pengurus tidak dapat mengubah role menjadi Admin.
-   [ ] Pengurus tidak dapat membaca atau mengubah data divisi lain
    dengan memanipulasi request.
-   [ ] Log tidak dapat diubah oleh pengurus biasa.

### 16.3 Pengujian divisi dan anggota

-   [ ] Admin dapat membuat divisi.
-   [ ] Admin dapat menambahkan anggota.
-   [ ] Anggota terhubung ke divisi yang benar.
-   [ ] Perpindahan anggota tidak merusak histori sesi sebelumnya.
-   [ ] Pengurus tidak dapat mengelola anggota di luar divisinya.

### 16.4 Pengujian kegiatan dan sesi

-   [ ] Admin dapat membuat kegiatan.
-   [ ] Admin dapat memilih beberapa divisi peserta.
-   [ ] Satu kegiatan dapat memiliki beberapa sesi.
-   [ ] Sesi baru menghasilkan snapshot peserta yang benar.
-   [ ] Semua peserta sesi baru berstatus `belum`.
-   [ ] Peserta tidak terduplikasi dalam sesi yang sama.
-   [ ] Pengurus hanya melihat sesi yang relevan dengan divisinya.

### 16.5 Pengujian presensi dan audit

-   [ ] Status dapat diubah menjadi `hadir`.
-   [ ] Status dapat diubah menjadi `tidak_hadir`.
-   [ ] Status awal `belum` tampil dengan benar.
-   [ ] Perubahan tersimpan di database.
-   [ ] Kadiv melihat perubahan yang dilakukan Wakadiv dan sebaliknya.
-   [ ] Setiap perubahan menghasilkan log.
-   [ ] Log menyimpan status lama, status baru, pelaku, dan waktu.
-   [ ] Aturan sesi tertutup berjalan sesuai kebijakan.

### 16.6 Pengujian antarmuka dan deployment

-   [ ] Login dapat digunakan pada desktop.
-   [ ] Login dapat digunakan pada mobile.
-   [ ] Dashboard responsif.
-   [ ] Loading, empty state, dan error state tersedia.
-   [ ] Environment variables telah diatur di Vercel.
-   [ ] Aplikasi dapat dibangun tanpa error.
-   [ ] RLS diuji pada lingkungan Supabase deployment.

## 17. Deployment, Operasional, dan Backup

### 17.1 Deployment

-   Repository kode disimpan di GitHub.
-   Aplikasi Next.js dideploy melalui Vercel.
-   Supabase menyediakan Authentication dan PostgreSQL.
-   Environment variables diatur melalui pengaturan proyek Vercel.
-   Domain deployment dan URL redirect autentikasi Supabase harus
    dikonfigurasi sesuai domain yang digunakan.

### 17.2 Backup

-   Lakukan backup database secara berkala.
-   Simpan perubahan skema database/migration dalam repository.
-   Jangan menganggap repository GitHub sebagai backup database.
-   Uji prosedur pemulihan database secara berkala.
-   Simpan kredensial pemulihan secara aman.

### 17.3 Pertimbangan biaya

-   Prioritaskan paket gratis selama kebutuhan dan batas pemakaian masih
    sesuai.
-   Periksa batas penggunaan, kebijakan jeda proyek, kapasitas database,
    dan ketentuan hosting secara berkala.
-   Paket gratis dapat memiliki batasan dan ketentuan yang berubah;
    evaluasi sebelum aplikasi digunakan secara intensif atau untuk
    kebutuhan komersial.
-   Hindari ketergantungan pada layanan berbayar sebelum benar-benar
    diperlukan.

## 18. Risiko dan Mitigasi

  -----------------------------------------------------------------------
  Risiko                  Dampak                  Mitigasi
  ----------------------- ----------------------- -----------------------
  Kebijakan RLS keliru    Data divisi lain dapat  Uji dengan beberapa
                          terbuka                 akun dan request
                                                  langsung

  Profil tidak sinkron    Pengguna berhasil login Validasi profil setelah
  dengan Auth             tetapi tidak memiliki   login
                          hak aplikasi            

  Perubahan anggota       Rekap masa lalu tidak   Gunakan snapshot
  merusak histori         akurat                  peserta

  Presensi tidak tercatat Sulit melakukan audit   Gunakan trigger/fungsi
  di log                                          database dan uji log

  Pembuatan sesi tidak    Peserta tidak memiliki  Gunakan transaksi atau
  atomik                  record presensi         RPC

  Dua pengurus mengubah   Perubahan terakhir      Tampilkan status
  data bersamaan          menimpa perubahan       terbaru dan
                          sebelumnya              pertimbangkan kontrol
                                                  konflik

  Secret masuk repository Risiko penyalahgunaan   `.gitignore`,
                          proyek                  environment variables,
                                                  rotasi key jika bocor

  Batas paket gratis      Aplikasi terganggu atau Pantau penggunaan dan
  terlampaui              membutuhkan biaya       siapkan evaluasi paket

  Penghapusan data        Riwayat presensi hilang Kebijakan soft
  historis                                        delete/retensi dan FK
                                                  yang tepat
  -----------------------------------------------------------------------

## 19. Tahapan Pengembangan

Urutan pengembangan yang disarankan:

### Tahap 1 --- Fondasi proyek

-   [x] Membuat proyek Next.js.
-   [x] Menjalankan aplikasi lokal.
-   [x] Membuat repository GitHub dan melakukan push awal.
-   [x] Memasang dependensi utama.
-   [x] Membuat Supabase project.
-   [x] Menyiapkan Supabase browser dan server client.
-   [x] Membuat struktur database awal.
-   [x] Mengaktifkan RLS dan membuat kebijakan awal.
-   [x] Membuat halaman login.
-   [x] Membuat akun Admin pertama dan profil Admin.
-   [x] Membuat tampilan awal Dashboard Admin.
-   [x] Menyelesaikan isu prerender/runtime Next.js 16 pada halaman
    Admin.
-   [ ] Menguji autentikasi, sesi, dan otorisasi secara menyeluruh.

### Tahap 2 --- Autentikasi dan akses

-   [x] Menyelesaikan login dan logout.
-   [x] Menyelesaikan proteksi route (`/`, `/admin`, `/dashboard`).
-   [x] Memastikan redirect berdasarkan role.
-   [x] Membuat halaman Dashboard Kadiv/Wakadiv (`/dashboard`).
-   [x] Membuat pengujian RLS dengan akun berbeda (Admin, Kadiv, Wakadiv,
    akun nonaktif, dan pembatasan lintas divisi sudah diuji).
-   [ ] Membuat provisioning akun pengurus yang aman.
-   [x] Menyimpan snapshot schema dan kebijakan RLS Supabase di repository
    (`supabase/migrations/202611170001_schema_snapshot.sql`).

### Tahap 3 --- Manajemen organisasi

-   [x] CRUD divisi (`/admin/divisions`: daftar, tambah, edit,
    aktif/nonaktifkan; tanpa hard delete).
-   [x] CRUD anggota (`/admin/members`: daftar, tambah, edit, pindah divisi,
    aktif/nonaktifkan; tanpa hard delete; pencarian nama).
-   [x] Kadiv/Wakadiv melihat anggota divisinya di `/dashboard` (read-only).
-   [ ] Manajemen akun Kadiv/Wakadiv.
-   [ ] Pengaitan akun dengan divisi.
-   [ ] Validasi data dan pembatasan akses.

### Tahap 4 --- Kegiatan dan sesi

-   [x] CRUD kegiatan dan penentuan divisi peserta (`/admin/events`).
-   [x] Pembuatan satu atau beberapa sesi per kegiatan.
-   [x] Snapshot peserta dari divisi peserta kegiatan.
-   [x] Pembuatan record presensi awal berstatus `belum`
    (fungsi atomik `create_attendance_session`).
-   [x] Penanganan sesi tanpa divisi peserta atau tanpa anggota (ditolak
    dengan pesan error).
-   [ ] Buka/tutup sesi (Tahap 5).

### Tahap 5 --- Presensi dan audit

-   [x] Tampilan daftar peserta (`/sessions/[id]`, data snapshot).
-   [x] Pembaruan status kehadiran (`hadir`, `tidak_hadir`, `belum`).
-   [x] Audit log otomatis setiap perubahan status.
-   [ ] Aturan buka/tutup sesi (`scheduled` → `open` → `closed`).
-   [ ] Penanganan perubahan presensi bersamaan.
-   [ ] Filter dan rekap presensi (Tahap 6).

### Tahap 6 --- Dashboard dan laporan

-   Statistik dashboard dari database.
-   Dashboard Admin.
-   Dashboard Kadiv/Wakadiv.
-   Rekapitulasi berdasarkan kegiatan, sesi, dan divisi.
-   Filter dan pencarian.

### Tahap 7 --- Quality assurance dan deployment

-   Pengujian fungsional.
-   Pengujian keamanan dan RLS.
-   Pengujian responsivitas.
-   Perbaikan error.
-   Deployment Vercel.
-   Konfigurasi domain dan redirect.
-   Backup dan dokumentasi operasional.

## 20. Keputusan Produk yang Sudah Ditetapkan

1.  Aplikasi bernama **Kemzinpage**.
2.  Target organisasi terdiri dari 5--10 divisi.
3.  Setiap divisi memiliki sekitar 10--30 anggota.
4.  Role aplikasi adalah Admin, Kadiv, dan Wakadiv.
5.  Anggota tidak membutuhkan akun login.
6.  Akun pengurus dibuat/dikelola Admin; tidak ada registrasi publik.
7.  Kadiv dan Wakadiv memiliki hak akses yang setara dalam divisinya.
8.  Satu kegiatan dapat memiliki beberapa sesi.
9.  Admin menentukan divisi yang wajib mengikuti kegiatan.
10. Status presensi adalah Hadir, Tidak Hadir, dan Belum.
11. Peserta sesi baru otomatis berstatus Belum.
12. Admin dapat membuka/menutup sesi dan mengoreksi presensi.
13. Perubahan presensi harus memiliki audit log.
14. Data historis perlu mempertahankan snapshot identitas peserta.
15. Pembatasan akses data dilakukan melalui Supabase RLS.
16. Stack utama adalah Next.js, TypeScript, Tailwind CSS, Supabase,
    GitHub, dan Vercel.
17. Pengembangan memprioritaskan layanan gratis selama memadai.
18. Aplikasi harus responsif dan memiliki tampilan profesional.

## 21. Hal yang Masih Perlu Diputuskan

Hal-hal berikut belum dianggap sebagai keputusan final dan perlu
ditentukan sebelum implementasi fitur terkait:

-   Atribut detail anggota yang wajib disimpan (misalnya nomor anggota,
    kontak, angkatan, atau status keanggotaan).
-   Apakah Kadiv/Wakadiv boleh menambah, mengubah, dan menonaktifkan
    anggota atau hanya mengelola presensi.
-   Apakah pengurus boleh mengubah presensi ketika sesi sudah ditutup.
-   Apakah koreksi Admin setelah sesi ditutup memerlukan alasan.
-   Apakah kegiatan memiliki tanggal mulai/selesai, lokasi, dan kategori
    wajib.
-   Apakah sesi memiliki jam mulai dan selesai wajib.
-   Aturan perubahan divisi anggota ketika kegiatan/sesi sedang
    berlangsung.
-   Kebijakan penghapusan: hard delete atau soft delete untuk divisi,
    anggota, kegiatan, dan akun.
-   Apakah pengurus boleh melihat log perubahan secara lengkap.
-   Format rekap dan kebutuhan ekspor PDF/Excel/CSV.
-   Apakah diperlukan fitur pencarian global dan pagination sejak MVP.
-   Apakah notifikasi diperlukan pada versi setelah MVP.

## 22. Definisi Selesai (Definition of Done)

Sebuah fitur dinyatakan selesai apabila:

1.  Alur penggunaan sesuai kebutuhan dan aturan bisnis.
2.  Data tersimpan dan dibaca dari database yang benar.
3.  Validasi input tersedia.
4.  Pemeriksaan role dan RLS telah diuji.
5.  Kondisi loading, kosong, sukses, dan gagal ditangani.
6.  Antarmuka berfungsi pada desktop dan mobile.
7.  Tidak ada error TypeScript, lint, atau build yang belum ditangani.
8.  Perubahan tidak merusak fitur yang telah selesai.
9.  Dokumentasi teknis diperbarui jika skema atau alur berubah.

------------------------------------------------------------------------

**Catatan status dokumen:** PRD ini merangkum kebutuhan produk,
keputusan yang sudah disepakati, rancangan teknis awal, serta progres
implementasi yang diketahui pada 16 November 2026. Beberapa fitur masih
berupa spesifikasi dan belum berarti sudah selesai dikembangkan.
Keputusan yang belum final dicantumkan secara terpisah agar tidak
tertukar dengan fitur yang sudah disepakati atau diimplementasikan.
