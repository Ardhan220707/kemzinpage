import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createDivision, updateDivision } from "./actions";
import { ArrowLeft, Plus, Save } from "lucide-react";

export default function DivisionsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-500">Memuat divisi...</p>}>
      <DivisionsContent />
    </Suspense>
  );
}

async function DivisionsContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();
  if (!profile?.is_active || profile.role !== "admin") redirect("/dashboard");

  const { data: divisions, error } = await supabase
    .from("divisions")
    .select("id, name, description, is_active, created_at")
    .order("name");

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <a href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
          <ArrowLeft size={17} /> Kembali ke Dashboard
        </a>
        <div className="mt-6 mb-8">
          <p className="text-sm font-semibold text-blue-600">Manajemen Organisasi</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Divisi</h1>
          <p className="mt-2 text-slate-500">Kelola divisi organisasi tanpa menghapus histori.</p>
        </div>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><Plus size={19} /> Tambah Divisi</h2>
          <form action={createDivision} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="text-sm font-medium text-slate-700">Nama<input name="name" required className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
            <label className="text-sm font-medium text-slate-700">Deskripsi<input name="description" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"><Plus size={17} /> Tambah</button>
          </form>
        </section>

        <section className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">Data divisi gagal dimuat.</p>}
          {!error && !divisions?.length && <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">Belum ada divisi.</p>}
          {divisions?.map((division) => (
            <form key={division.id} action={updateDivision} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
              <input type="hidden" name="id" value={division.id} />
              <label className="text-sm font-medium text-slate-700">Nama<input name="name" required defaultValue={division.name} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
              <label className="text-sm font-medium text-slate-700">Deskripsi<input name="description" defaultValue={division.description ?? ""} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
              <label className="flex items-center gap-2 pb-2 text-sm text-slate-700"><input type="checkbox" name="is_active" defaultChecked={division.is_active} /> Aktif</label>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 py-2 font-semibold text-blue-700 hover:bg-blue-50"><Save size={17} /> Simpan</button>
            </form>
          ))}
        </section>
      </div>
    </main>
  );
}
