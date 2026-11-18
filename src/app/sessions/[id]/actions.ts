"use server";

import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/require-admin";

const ALLOWED = ["hadir", "tidak_hadir", "belum"] as const;

export async function updateAttendance(formData: FormData) {
  const recordId = String(formData.get("record_id") ?? "");
  const sessionId = String(formData.get("session_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const back = `/sessions/${sessionId}`;

  if (!recordId || !sessionId || !ALLOWED.includes(status as (typeof ALLOWED)[number])) {
    redirect(`${back}?error=invalid`);
  }

  const { supabase } = await requireStaff();
  const { error } = await supabase.rpc("set_attendance", {
    p_record_id: recordId,
    p_status: status,
  });

  redirect(error ? `${back}?error=save` : `${back}?saved=1`);
}
