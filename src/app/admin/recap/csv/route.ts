import { requireAdmin } from "@/lib/require-admin";
import { fetchRecap } from "@/lib/recap";

function cell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export async function GET(request: Request) {
  const supabase = await requireAdmin();
  const params = new URL(request.url).searchParams;

  const rows = await fetchRecap(supabase, {
    eventId: params.get("event_id") ?? undefined,
    divisionId: params.get("division_id") ?? undefined,
    sessionId: params.get("session_id") ?? undefined,
  });

  const lines = [
    ["Kegiatan", "Sesi", "Status Sesi", "Divisi", "Nama", "Status Presensi"].join(","),
    ...rows.map((row) =>
      [row.eventName, row.sessionName, row.sessionStatus, row.divisionName, row.memberName, row.status].map(cell).join(","),
    ),
  ];

  return new Response(`\uFEFF${lines.join("\n")}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="rekap-presensi.csv"',
    },
  });
}
