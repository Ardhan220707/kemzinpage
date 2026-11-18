"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";

function toIso(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function createEvent(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const divisionIds = formData.getAll("division_ids").map(String);
  if (!name) redirect("/admin/events?error=required");

  const supabase = await requireAdmin();
  const { data: event, error } = await supabase
    .from("events")
    .insert({
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      status: String(formData.get("status") ?? "draft"),
      start_date: toIso(formData.get("start_date")),
      end_date: toIso(formData.get("end_date")),
    })
    .select("id")
    .single();

  if (error || !event) redirect("/admin/events?error=save");

  if (divisionIds.length) {
    const { error: divisionError } = await supabase.from("event_divisions").insert(
      divisionIds.map((divisionId) => ({ event_id: event.id, division_id: divisionId })),
    );
    if (divisionError) redirect("/admin/events?error=divisions");
  }

  redirect("/admin/events?saved=1");
}

export async function deleteSession(formData: FormData) {
  const id = String(formData.get("session_id") ?? "");
  if (!id) redirect("/admin/events?error=session");

  const supabase = await requireAdmin();
  const { error } = await supabase.from("attendance_sessions").delete().eq("id", id);
  redirect(error ? "/admin/events?error=session" : "/admin/events?saved=1");
}

export async function createSession(formData: FormData) {
  const eventId = String(formData.get("event_id") ?? "");
  const sessionName = String(formData.get("session_name") ?? "").trim();
  if (!eventId || !sessionName) redirect("/admin/events?error=session");

  const supabase = await requireAdmin();
  const { error } = await supabase.rpc("create_attendance_session", {
    p_event_id: eventId,
    p_session_name: sessionName,
    p_start_time: toIso(formData.get("start_time")),
    p_end_time: toIso(formData.get("end_time")),
  });

  redirect(error ? "/admin/events?error=session" : "/admin/events?saved=1");
}

export async function updateEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const divisionIds = formData.getAll("division_ids").map(String);
  if (!id || !name) redirect("/admin/events?error=required");

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("events")
    .update({
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      status: String(formData.get("status") ?? "draft"),
      start_date: toIso(formData.get("start_date")),
      end_date: toIso(formData.get("end_date")),
    })
    .eq("id", id);
  if (error) redirect("/admin/events?error=save");

  const { error: deleteError } = await supabase.from("event_divisions").delete().eq("event_id", id);
  if (deleteError) redirect("/admin/events?error=divisions");

  if (divisionIds.length) {
    const { error: insertError } = await supabase.from("event_divisions").insert(
      divisionIds.map((divisionId) => ({ event_id: id, division_id: divisionId })),
    );
    if (insertError) redirect("/admin/events?error=divisions");
  }

  redirect("/admin/events?saved=1");
}
