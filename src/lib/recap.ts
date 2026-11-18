import type { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/one";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type RecapFilters = { eventId?: string; divisionId?: string; sessionId?: string };

const SELECT = "id, member_name, division_id, divisions(name), attendance_records(status), attendance_sessions!inner(id, session_name, status, event_id, events(name))";

export type RecapRow = {
  participantId: string;
  memberName: string;
  divisionName: string;
  status: string;
  sessionId: string;
  sessionName: string;
  sessionStatus: string;
  eventName: string;
};

export async function fetchRecap(supabase: Supabase, filters: RecapFilters): Promise<RecapRow[]> {
  let query = supabase.from("session_participants").select(SELECT).order("member_name");
  if (filters.sessionId) query = query.eq("session_id", filters.sessionId);
  if (filters.divisionId) query = query.eq("division_id", filters.divisionId);
  if (filters.eventId) query = query.eq("attendance_sessions.event_id", filters.eventId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).flatMap((row) => {
    const session = one(row.attendance_sessions);
    if (!session) return [];
    return [{
      participantId: row.id,
      memberName: row.member_name,
      divisionName: one(row.divisions)?.name ?? "-",
      status: one(row.attendance_records)?.status ?? "belum",
      sessionId: session.id,
      sessionName: session.session_name,
      sessionStatus: session.status,
      eventName: one(session.events)?.name ?? "Kegiatan",
    }];
  });
}

export type SessionGroup = {
  id: string;
  name: string;
  status: string;
  eventName: string;
  rows: RecapRow[];
  counts: { hadir: number; tidak_hadir: number; belum: number };
  percent: number;
};

export function groupBySession(rows: RecapRow[]): SessionGroup[] {
  const groups = new Map<string, SessionGroup>();
  for (const row of rows) {
    let group = groups.get(row.sessionId);
    if (!group) {
      group = {
        id: row.sessionId,
        name: row.sessionName,
        status: row.sessionStatus,
        eventName: row.eventName,
        rows: [],
        counts: { hadir: 0, tidak_hadir: 0, belum: 0 },
        percent: 0,
      };
      groups.set(row.sessionId, group);
    }
    group.rows.push(row);
    group.counts[row.status as keyof SessionGroup["counts"]] += 1;
  }
  for (const group of groups.values()) {
    const decided = group.counts.hadir + group.counts.tidak_hadir;
    group.percent = decided ? Math.round((group.counts.hadir / decided) * 100) : 0;
  }
  return [...groups.values()].sort((a, b) => a.eventName.localeCompare(b.eventName) || a.name.localeCompare(b.name));
}
