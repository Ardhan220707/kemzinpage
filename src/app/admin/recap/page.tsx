import { Suspense } from "react";
import { ArrowLeft, ClipboardCheck, Download, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/require-admin";
import { one } from "@/lib/one";
import { fetchRecap, groupBySession } from "@/lib/recap";
import { logout } from "@/app/logout-action";
import { LogOut } from "lucide-react";

const LABELS: Record<string, string> = { hadir: "Hadir", tidak_hadir: "Tidak Hadir", belum: "Belum" };

type SearchParams = Promise<{ event_id?: string; division_id?: string; session_id?: string }>;

export default function RecapPage({ searchParams }: { searchParams: SearchParams }) {
  return <Suspense fallback={<p className="p-8 text-sm text-slate-500">Memuat rekap...</p>}><RecapContent searchParams={searchParams} /></Suspense>;
}

async function RecapContent({ searchParams }: { searchParams: SearchParams }) {
  const { event_id, division_id, session_id } = await searchParams;
  const supabase = await requireAdmin();

  const [{ data: events }, { data: divisions }, { data: sessions }] = await Promise.all([
    supabase.from("events").select("id, name").order("name"),
    supabase.from("divisions").select("id, name").order("name"),
    supabase.from("attendance_sessions").select("id, session_name, events(name)").order("session_name"),
  ]);

  const rows = await fetchRecap(supabase, { eventId: event_id, divisionId: division_id, sessionId: session_id });
  const groups = groupBySession(rows);
  const totals = rows.reduce(
    (acc, row) => { acc[row.status as keyof typeof acc] += 1; return acc; },
    { hadir: 0, tidak_hadir: 0, belum: 0 },
  );
  const decided = totals.hadir + totals.tidak_hadir;
  const overallPercent = decided ? Math.round((totals.hadir / decided) * 100) : 0;

  const csvQuery = new URLSearchParams();
  if (event_id) csvQuery.set("event_id", event_id);
  if (division_id) csvQuery.set("division_id", division_id);
  if (session_id) csvQuery.set("session_id", session_id);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <a href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"><ArrowLeft size={17} /> Kembali ke Dashboard</a>
          <form action={logout}>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"><LogOut size={16} /> Keluar</button>
          </form>
        </div>

        <div className="mt-6 mb-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-blue-600"><ShieldCheck size={16} /> Administrator</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-slate-900"><ClipboardCheck size={28} /> Rekapitulasi Presensi</h1>
          <p className="mt-2 text-slate-500">Rekap lintas divisi. Persentase hanya menghitung status yang sudah diputuskan (Hadir vs Tidak Hadir).</p>
        </div>

        <form className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <label className="text-sm font-medium text-slate-700">Kegiatan
            <select name="event_id" defaultValue={event_id ?? ""} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500">
              <option value="">Semua kegiatan</option>
              {events?.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Divisi
            <select name="division_id" defaultValue={division_id ?? ""} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500">
              <option value="">Semua divisi</option>
              {divisions?.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Sesi
            <select name="session_id" defaultValue={session_id ?? ""} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500">
              <option value="">Semua sesi</option>
              {sessions?.map((session) => <option key={session.id} value={session.id}>{session.session_name} — {one(session.events)?.name ?? "Kegiatan"}</option>)}
            </select>
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Terapkan</button>
        </form>

        <section className="mb-8 grid gap-3 sm:grid-cols-4">
          {(["hadir", "tidak_hadir", "belum"] as const).map((status) => (
            <div key={status} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">{LABELS[status]}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{totals[status]}</p>
            </div>
          ))}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Kehadiran</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{overallPercent}%</p>
          </div>
        </section>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">{groups.length} sesi · {rows.length} peserta tercatat</p>
          <a href={`/admin/recap/csv?${csvQuery.toString()}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"><Download size={16} /> Unduh CSV</a>
        </div>

        {!groups.length && <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">Belum ada data presensi untuk filter ini.</p>}

        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.id} className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-600">{group.eventName}</p>
                  <h2 className="font-semibold text-slate-900">{group.name}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="rounded bg-slate-100 px-2 py-1 uppercase text-slate-600">{group.status}</span>
                  <span className="rounded bg-green-50 px-2 py-1 text-green-700">Hadir {group.counts.hadir}</span>
                  <span className="rounded bg-red-50 px-2 py-1 text-red-700">Tidak {group.counts.tidak_hadir}</span>
                  <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">Belum {group.counts.belum}</span>
                  <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">{group.percent}%</span>
                </div>
              </div>
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Nama</th>
                    <th className="px-4 py-2">Divisi</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((row) => (
                    <tr key={row.participantId} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-medium text-slate-800">{row.memberName}</td>
                      <td className="px-4 py-2 text-slate-500">{row.divisionName}</td>
                      <td className="px-4 py-2 text-slate-700">{LABELS[row.status] ?? row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
