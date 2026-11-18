import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ClipboardCheck, CalendarDays, LogOut, Users } from "lucide-react";
import { logout } from "@/app/logout-action";
import { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/one";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">Memuat dashboard...</p>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_active, division_id")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=inactive");
  }

  if (profile.role === "admin") redirect("/admin");
  if (profile.role !== "kadiv" && profile.role !== "wakadiv") {
    await supabase.auth.signOut();
    redirect("/login?error=invalid");
    return null;
  }

  const [{ data: sessions }, { data: members }, { data: division }] = await Promise.all([
    supabase
      .from("attendance_sessions")
      .select("id, session_name, status, start_time, events(name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("members")
      .select("id, full_name, is_active")
      .order("full_name"),
    profile.division_id
      ? supabase.from("divisions").select("name").eq("id", profile.division_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const [{ data: activeEvents }, { data: myRecords }] = await Promise.all([
    profile.division_id
      ? supabase
          .from("events")
          .select("id, name, start_date, event_divisions!inner(division_id)")
          .eq("status", "active")
          .eq("event_divisions.division_id", profile.division_id)
          .order("start_date", { ascending: true, nullsFirst: false })
      : Promise.resolve({ data: [] as { id: string; name: string; start_date: string | null; event_divisions: unknown[] }[] }),
    profile.division_id
      ? supabase
          .from("session_participants")
          .select("attendance_records(status)")
          .eq("division_id", profile.division_id)
      : Promise.resolve({ data: [] as { attendance_records: { status: string }[] | { status: string } | null }[] }),
  ]);

  const attendance = { hadir: 0, tidak_hadir: 0, belum: 0 } as Record<string, number>;
  for (const participant of myRecords ?? []) {
    const status = one(participant.attendance_records)?.status ?? "belum";
    attendance[status] = (attendance[status] ?? 0) + 1;
  }
  const decided = attendance.hadir + attendance.tidak_hadir;
  const attendancePercent = decided ? Math.round((attendance.hadir / decided) * 100) : 0;
  const openSessions = (sessions ?? []).filter((session) => session.status === "open");

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              {profile.role === "kadiv" ? "Kepala Divisi" : "Wakil Kepala Divisi"}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Dashboard Divisi</h1>
            <p className="mt-2 text-slate-500">
              Selamat datang, {profile.full_name || "Pengurus"}.
            </p>
          </div>
          <form action={logout}>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              <LogOut size={17} />
              Keluar
            </button>
          </form>
        </header>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard icon={Users} title={`Anggota ${division?.name ?? "Divisi"}`} text={`${members?.length ?? 0} anggota terdaftar.`} />
          <InfoCard icon={CalendarDays} title="Kegiatan Aktif" text={`${activeEvents?.length ?? 0} kegiatan aktif melibatkan divisi Anda.`} />
          <InfoCard icon={ClipboardCheck} title="Sesi Terbuka" text={openSessions.length ? `${openSessions.length} sesi sedang dibuka.` : "Belum ada sesi yang dibuka."} />
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <ClipboardCheck size={18} /> Ringkasan Kehadiran Divisi
          </h2>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Hadir</p>
              <p className="mt-1 text-2xl font-bold text-green-700">{attendance.hadir}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Tidak Hadir</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{attendance.tidak_hadir}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Belum</p>
              <p className="mt-1 text-2xl font-bold text-slate-700">{attendance.belum}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Kehadiran</p>
              <p className="mt-1 text-2xl font-bold text-blue-700">{attendancePercent}%</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">Persentase hanya menghitung status yang sudah diputuskan (Hadir vs Tidak Hadir).</p>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <CalendarDays size={18} /> Kegiatan Aktif Divisi
          </h2>
          {!activeEvents?.length && <p className="text-sm text-slate-500">Belum ada kegiatan aktif untuk divisi Anda.</p>}
          <ul className="space-y-2">
            {activeEvents?.map((event) => (
              <li key={event.id} className="rounded-lg border border-slate-200 px-4 py-3 text-sm">
                <p className="font-semibold text-slate-800">{event.name}</p>
                <p className="text-slate-500">
                  {event.start_date ? new Date(event.start_date).toLocaleString("id-ID") : "Jadwal belum ditentukan"}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <Users size={18} /> Anggota {division?.name ?? "Divisi"}
          </h2>
          {!members?.length && <p className="text-sm text-slate-500">Belum ada anggota pada divisi ini.</p>}
          <ul className="divide-y divide-slate-100">
            {members?.map((member, index) => (
              <li key={member.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="flex items-center gap-3">
                  <span className="w-6 text-right text-xs font-semibold text-slate-400">{index + 1}</span>
                  <span className="font-medium text-slate-800">{member.full_name}</span>
                </span>
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${member.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {member.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-400">Daftar anggota hanya dapat dilihat. Perubahan data dilakukan Admin.</p>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <ClipboardCheck size={18} /> Sesi Presensi Divisi
          </h2>
          {!sessions?.length && <p className="text-sm text-slate-500">Belum ada sesi presensi untuk divisi Anda.</p>}
          <ul className="space-y-2">
            {sessions?.map((session) => (
              <li key={session.id}>
                <a href={`/sessions/${session.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm hover:border-blue-300 hover:bg-blue-50">
                  <span>
                    <span className="font-semibold text-slate-800">{session.session_name}</span>
                    <span className="ml-2 text-slate-500">{one(session.events)?.name ?? "Kegiatan"}</span>
                  </span>
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${session.status === "open" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>{session.status}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof Users; title: string; text: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Icon className="mb-4 text-blue-600" size={24} />
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </section>
  );
}
