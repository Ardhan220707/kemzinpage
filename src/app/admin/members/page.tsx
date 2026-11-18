import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createMember, updateMember } from "./actions";

type SearchParams = Promise<{ q?: string; error?: string }>;

export default function MembersPage({ searchParams }: { searchParams: SearchParams }) {
  return <Suspense fallback={<p className="p-8 text-sm text-slate-500">Memuat anggota...</p>}><MembersContent searchParams={searchParams} /></Suspense>;
}

async function MembersContent({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", user.id).single();
  if (!profile?.is_active || profile.role !== "admin") redirect("/dashboard");

  const [{ data: divisions }, { data: members, error: membersError }] = await Promise.all([
    supabase.from("divisions").select("id, name, is_active").order("name"),
    supabase.from("members").select("id, full_name, division_id, is_active, divisions(name)").ilike("full_name", `%${q}%`).order("full_name"),
  ]);
  const activeDivisions = divisions?.filter((division) => division.is_active) ?? [];

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"><ArrowLeft size={17} /> Kembali ke Dashboard</a>
        <div className="mt-6 mb-8"><p className="text-sm font-semibold text-blue-600">Manajemen Organisasi</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Anggota</h1><p className="mt-2 text-slate-500">Tambah, pindahkan, atau nonaktifkan anggota tanpa menghapus histori.</p></div>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><Plus size={19} /> Tambah Anggota</h2>
          {!activeDivisions.length ? <p className="text-sm text-amber-700">Buat divisi aktif terlebih dahulu.</p> : <form action={createMember} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="text-sm font-medium text-slate-700">Nama lengkap<input name="full_name" required className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
            <label className="text-sm font-medium text-slate-700">Divisi<select name="division_id" required className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500">{activeDivisions.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}</select></label>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"><Plus size={17} /> Tambah</button>
          </form>}
        </section>

        <form className="mb-5 flex gap-3" action="/admin/members"><input name="q" defaultValue={q} placeholder="Cari nama anggota..." className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" /><button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cari</button></form>
        {error && <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">Data anggota gagal disimpan. Periksa data lalu coba lagi.</p>}
        {membersError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">Data anggota gagal dimuat.</p>}
        {!membersError && !members?.length && <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">Belum ada anggota yang cocok.</p>}

        <section className="space-y-4">
          {members?.map((member) => (
            <form key={member.id} action={updateMember} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
              <input type="hidden" name="id" value={member.id} />
              <label className="text-sm font-medium text-slate-700">Nama lengkap<input name="full_name" required defaultValue={member.full_name} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
              <label className="text-sm font-medium text-slate-700">Divisi<select name="division_id" defaultValue={member.division_id} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500">{divisions?.map((division) => <option key={division.id} value={division.id}>{division.name}{division.is_active ? "" : " (nonaktif)"}</option>)}</select></label>
              <label className="flex items-center gap-2 pb-2 text-sm text-slate-700"><input type="checkbox" name="is_active" defaultChecked={member.is_active} /> Aktif</label>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 py-2 font-semibold text-blue-700 hover:bg-blue-50"><Save size={17} /> Simpan</button>
            </form>
          ))}
        </section>
      </div>
    </main>
  );
}
