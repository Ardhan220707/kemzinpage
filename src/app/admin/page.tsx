import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, Users, CalendarDays, ClipboardCheck, LogOut, ChevronRight } from "lucide-react";
import { logout } from "@/app/logout-action";

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">Memuat dashboard...</p>
        </main>
      }
    >
      <AdminContent />
    </Suspense>
  );
}

async function countOf(supabase: Awaited<ReturnType<typeof createClient>>, table: string) {
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
  return count ?? 0;
}

async function AdminContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=inactive");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const [divisions, members, events, sessions] = await Promise.all([
    countOf(supabase, "divisions"),
    countOf(supabase, "members"),
    countOf(supabase, "events"),
    countOf(supabase, "attendance_sessions"),
  ]);

  const { data: logs } = await supabase
    .from("attendance_logs")
    .select("id, old_status, new_status, changed_at, changed_by")
    .order("changed_at", { ascending: false })
    .limit(8);

  const changerIds = [...new Set((logs ?? []).map((log) => log.changed_by))];
  const { data: changers } = changerIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", changerIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const changerName = new Map((changers ?? []).map((row) => [row.id, row.full_name]));

  const STATUS_LABEL: Record<string, string> = { hadir: "Hadir", tidak_hadir: "Tidak Hadir", belum: "Belum" };

  const stats = [
    { label: "Total Divisi", value: divisions, icon: Users },
    { label: "Total Anggota", value: members, icon: Users },
    { label: "Total Kegiatan", value: events, icon: CalendarDays },
    { label: "Sesi Presensi", value: sessions, icon: ClipboardCheck },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-blue-600">
              <ShieldCheck size={20} />
              <span className="text-sm font-semibold">Administrator</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">Dashboard Admin</h1>

            <p className="mt-2 text-slate-500">
              Selamat datang, {profile.full_name || "Administrator"}.
            </p>
          </div>
          <form action={logout}>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              <LogOut size={17} />
              Keluar
            </button>
          </form>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={22} />
                </div>

                <p className="text-sm text-slate-500">{stat.label}</p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Manajemen</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/admin/divisions"
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50"
            >
              Kelola Divisi
              <ChevronRight size={17} className="text-slate-400" />
            </a>
            <a
              href="/admin/members"
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50"
            >
              Kelola Anggota
              <ChevronRight size={17} className="text-slate-400" />
            </a>
            <a
              href="/admin/events"
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50"
            >
              Kelola Kegiatan
              <ChevronRight size={17} className="text-slate-400" />
            </a>
            <a
              href="/admin/recap"
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50"
            >
              Rekapitulasi Presensi
              <ChevronRight size={17} className="text-slate-400" />
            </a>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Aktivitas Presensi Terbaru
          </h2>

          {!logs?.length && (
            <p className="mt-2 text-sm text-slate-500">
              Belum ada aktivitas yang tercatat.
            </p>
          )}

          <ul className="mt-4 space-y-2">
            {logs?.map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <span className="text-slate-700">
                  {STATUS_LABEL[log.old_status] ?? log.old_status}{" "}
                  <span className="text-slate-400">menjadi</span>{" "}
                  {STATUS_LABEL[log.new_status] ?? log.new_status}
                </span>
                <span className="text-slate-500">
                  {changerName.get(log.changed_by) ?? "Pengguna"} ·{" "}
                  {new Date(log.changed_at).toLocaleString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
