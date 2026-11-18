-- Seed anggota Kemzinpage. Edit daftar nama di bawah lalu jalankan di Supabase SQL Editor.
-- Aman dijalankan berulang: baris dengan divisi + nama yang sama akan dilewati.

with member_data (division_name, full_name) as (
  values
    ('Kemzin', 'Anggota Kemzin 1'),
    ('Kemzin', 'Anggota Kemzin 2'),

    ('Acara', 'Anggota Acara 1'),
    ('Acara', 'Anggota Acara 2'),

    ('Humas', 'Anggota Humas 1'),
    ('Humas', 'Anggota Humas 2'),

    ('Konkes', 'Anggota Konkes 1'),
    ('Konkes', 'Anggota Konkes 2'),

    ('Perkab', 'Anggota Perkab 1'),
    ('Perkab', 'Anggota Perkab 2'),

    ('Fundra', 'Anggota Fundra 1'),
    ('Fundra', 'Anggota Fundra 2'),

    ('PDD', 'Anggota PDD 1'),
    ('PDD', 'Anggota PDD 2')
)
insert into public.members (division_id, full_name, is_active)
select d.id, m.full_name, true
from member_data m
join public.divisions d on d.name = m.division_name
where not exists (
  select 1 from public.members existing
  where existing.division_id = d.id
    and existing.full_name = m.full_name
);

-- Cek hasil per divisi.
select
  d.name as division_name,
  count(m.id) filter (where m.is_active) as anggota_aktif,
  count(m.id) as total
from public.divisions d
left join public.members m on m.division_id = d.id
group by d.name
order by d.name;
