import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Plus, Save, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createEvent, createSession, deleteSession, updateEvent } from "./actions";

const STATUSES = ["draft", "active", "completed", "cancelled"] as const;

type SearchParams = Promise<{ error?: string; saved?: string }>;

export default function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  return <Suspense fallback={<p className="p-8 text-sm text-slate-500">Memuat kegiatan...</p>}><EventsContent searchParams={searchParams} /></Suspense>;
}

function toLocalInput(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

async function EventsContent({ searchParams }: { searchParams: SearchParams }) {
  const { error, saved } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", user.id).single();
  if (!profile?.is_active || profile.role !== "admin") redirect("/dashboard");

  const [{ data: divisions }, { data: events, error: eventsError }] = await Promise.all([
    supabase.from("divisions").select("id, name").order("name"),
    supabase
      .from("events")
      .select("id, name, description, location, status, start_date, end_date, event_divisions(division_id), attendance_sessions(id, session_name, start_time, end_time, status, session_participants(count))")
      .order("start_date", { ascending: false, nullsFirst: false }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"><ArrowLeft size={17} /> Kembali ke Dashboard</a>
        <div className="mt-6 mb-8"><p className="text-sm font-semibold text-blue-600">Manajemen Organisasi</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Kegiatan</h1><p className="mt-2 text-slate-500">Buat kegiatan dan tentukan divisi yang wajib mengikuti.</p></div>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><Plus size={19} /> Tambah Kegiatan</h2>
          <form action={createEvent} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Nama kegiatan<input name="name" required className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
              <label className="text-sm font-medium text-slate-700">Lokasi<input name="location" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
              <label className="text-sm font-medium text-slate-700 md:col-span-2">Deskripsi<input name="description" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
              <label className="text-sm font-medium text-slate-700">Status<select name="status" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500">{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm font-medium text-slate-700">Mulai<input type="datetime-local" name="start_date" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
                <label className="text-sm font-medium text-slate-700">Selesai<input type="datetime-local" name="end_date" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
              </div>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-700">Divisi peserta</legend>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {divisions?.map((division) => <label key={division.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"><input type="checkbox" name="division_ids" value={division.id} /> {division.name}</label>)}
              </div>
            </fieldset>
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"><Plus size={17} /> Tambah Kegiatan</button>
          </form>
        </section>

        {error && <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">Kegiatan gagal disimpan. Periksa nama divisi peserta dan data kegiatan.</p>}
        {saved && <p className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">Kegiatan tersimpan.</p>}
        {eventsError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">Daftar kegiatan gagal dimuat.</p>}
        {!eventsError && !events?.length && <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">Belum ada kegiatan.</p>}

        <section className="space-y-4">
          {events?.map((event) => {
            const selected = new Set(event.event_divisions.map((row) => row.division_id));
            return (
              <form key={event.id} action={updateEvent} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <input type="hidden" name="id" value={event.id} />
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><CalendarDays size={17} /> {event.status}</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">Nama kegiatan<input name="name" required defaultValue={event.name} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
                  <label className="text-sm font-medium text-slate-700">Lokasi<input name="location" defaultValue={event.location ?? ""} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
                  <label className="text-sm font-medium text-slate-700 md:col-span-2">Deskripsi<input name="description" defaultValue={event.description ?? ""} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
                  <label className="text-sm font-medium text-slate-700">Status<select name="status" defaultValue={event.status} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500">{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="text-sm font-medium text-slate-700">Mulai<input type="datetime-local" name="start_date" defaultValue={toLocalInput(event.start_date)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
                    <label className="text-sm font-medium text-slate-700">Selesai<input type="datetime-local" name="end_date" defaultValue={toLocalInput(event.end_date)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
                  </div>
                </div>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-slate-700">Divisi peserta</legend>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {divisions?.map((division) => <label key={division.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"><input type="checkbox" name="division_ids" value={division.id} defaultChecked={selected.has(division.id)} /> {division.name}</label>)}
                  </div>
                </fieldset>
                <button className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 font-semibold text-blue-700 hover:bg-blue-50"><Save size={17} /> Simpan</button>

                <div className="border-t border-slate-200 pt-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><CalendarDays size={17} /> Sesi Presensi</h3>
                  {!event.attendance_sessions.length && <p className="mb-3 text-sm text-slate-500">Belum ada sesi.</p>}
                  <ul className="mb-4 space-y-2">
                    {event.attendance_sessions.map((session) => (
                      <li key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                        <a href={`/sessions/${session.id}`} className="font-medium text-blue-700 hover:underline">{session.session_name}</a>
                        <span className="flex items-center gap-3 text-slate-500">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase">{session.status}</span>
                          <span>{session.session_participants[0]?.count ?? 0} peserta</span>
                        </span>
                        <button
                          formAction={deleteSession}
                          name="session_id"
                          value={session.id}
                          title="Hapus sesi"
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                    <input type="hidden" name="event_id" value={event.id} />
                    <label className="text-sm font-medium text-slate-700">Nama sesi<input name="session_name" required placeholder="Sesi 1" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
                    <label className="text-sm font-medium text-slate-700">Mulai<input type="datetime-local" name="start_time" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
                    <label className="text-sm font-medium text-slate-700">Selesai<input type="datetime-local" name="end_time" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
                    <button formAction={createSession} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"><Plus size={17} /> Buat Sesi</button>
                  </div>
                </div>
              </form>
            );
          })}
        </section>
      </div>
    </main>
  );
}
