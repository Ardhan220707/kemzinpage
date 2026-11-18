import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardCheck, History } from "lucide-react";
import { requireStaff } from "@/lib/require-admin";
import { one } from "@/lib/one";
import { updateAttendance } from "./actions";

const LABELS: Record<string, string> = {
  hadir: "Hadir",
  tidak_hadir: "Tidak Hadir",
  belum: "Belum",
};

const STATUS_STYLE: Record<string, string> = {
  hadir: "bg-green-600 text-white border-green-600",
  tidak_hadir: "bg-red-600 text-white border-red-600",
  belum: "bg-slate-600 text-white border-slate-600",
};

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ error?: string; saved?: string }>;

export default function SessionPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  return <Suspense fallback={<p className="p-8 text-sm text-slate-500">Memuat sesi...</p>}><SessionContent params={params} searchParams={searchParams} /></Suspense>;
}

async function SessionContent({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const { supabase, profile } = await requireStaff();

  const { data: session } = await supabase
    .from("attendance_sessions")
    .select("id, session_name, status, start_time, end_time, events(name)")
    .eq("id", id)
    .maybeSingle();

  if (!session) notFound();

  const { data: participants, error: participantsError } = await supabase
    .from("session_participants")
    .select("id, member_name, divisions(name), attendance_records(id, status, updated_at)")
    .eq("session_id", id)
    .order("member_name");

  const records = (participants ?? []).flatMap((participant) => {
    const record = one(participant.attendance_records);
    return record ? [record] : [];
  });
  const counts = { hadir: 0, tidak_hadir: 0, belum: 0 } as Record<string, number>;
  records.forEach((record) => { counts[record.status] = (counts[record.status] ?? 0) + 1; });

  const recordIds = records.map((record) => record.id);
  const { data: logs } = recordIds.length
    ? await supabase
        .from("attendance_logs")
        .select("id, old_status, new_status, changed_at, changed_by")
        .in("attendance_record_id", recordIds)
        .order("changed_at", { ascending: false })
        .limit(20)
    : { data: [] as { id: string; old_status: string; new_status: string; changed_at: string; changed_by: string }[] };

  const changerIds = [...new Set((logs ?? []).map((log) => log.changed_by))];
  const { data: changers } = changerIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", changerIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const changerName = new Map((changers ?? []).map((row) => [row.id, row.full_name]));

  const backHref = profile.role === "admin" ? "/admin/events" : "/dashboard";

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <a href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"><ArrowLeft size={17} /> Kembali</a>

        <div className="mt-6 mb-6">
          <p className="text-sm font-semibold text-blue-600">{one(session.events)?.name ?? "Kegiatan"}</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold text-slate-900"><ClipboardCheck size={28} /> {session.session_name}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Status sesi: <span className="font-semibold uppercase">{session.status}</span>
            {profile.role !== "admin" && " · Anda hanya dapat mengubah presensi divisi Anda."}
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          {(["hadir", "tidak_hadir", "belum"] as const).map((status) => (
            <div key={status} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">{LABELS[status]}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{counts[status] ?? 0}</p>
            </div>
          ))}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{records.length}</p>
          </div>
        </div>

        {error && <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">Presensi gagal diperbarui. Coba lagi.</p>}
        {saved && <p className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">Presensi tersimpan dan tercatat di log.</p>}
        {participantsError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">Daftar peserta gagal dimuat.</p>}
        {!participantsError && !records.length && <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">Sesi ini belum memiliki peserta.</p>}

        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          {!!records.length && (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Divisi snapshot</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ubah</th>
                </tr>
              </thead>
              <tbody>
                {participants?.map((participant) => {
                  const record = one(participant.attendance_records);
                  if (!record) return null;
                  return (
                    <tr key={participant.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-800">{participant.member_name}</td>
                      <td className="px-4 py-3 text-slate-500">{one(participant.divisions)?.name ?? "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLE[record.status]}`}>{LABELS[record.status]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <form action={updateAttendance} className="flex flex-wrap gap-2">
                          <input type="hidden" name="record_id" value={record.id} />
                          <input type="hidden" name="session_id" value={session.id} />
                          {(["hadir", "tidak_hadir", "belum"] as const).map((status) => (
                            <button
                              key={status}
                              name="status"
                              value={status}
                              disabled={record.status === status}
                              className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {LABELS[status]}
                            </button>
                          ))}
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><History size={18} /> Riwayat Perubahan Terbaru</h2>
          {!logs?.length && <p className="text-sm text-slate-500">Belum ada perubahan presensi.</p>}
          <ul className="space-y-2 text-sm">
            {logs?.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2">
                <span className="text-slate-700">
                  {LABELS[log.old_status]} <span className="text-slate-400">jadi</span> {LABELS[log.new_status]}
                </span>
                <span className="text-slate-500">
                  {changerName.get(log.changed_by) ?? "Pengguna"} · {new Date(log.changed_at).toLocaleString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
