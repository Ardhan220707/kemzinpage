"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();
  if (!profile?.is_active || profile.role !== "admin") redirect("/dashboard");
  return supabase;
}

export async function createMember(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const divisionId = String(formData.get("division_id") ?? "");
  if (!fullName || !divisionId) redirect("/admin/members?error=required");

  const supabase = await requireAdmin();
  const { error } = await supabase.from("members").insert({
    full_name: fullName,
    division_id: divisionId,
    is_active: true,
  });
  redirect(error ? "/admin/members?error=save" : "/admin/members?saved=1");
}

export async function updateMember(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const divisionId = String(formData.get("division_id") ?? "");
  const isActive = formData.get("is_active") === "on";
  if (!id || !fullName || !divisionId) redirect("/admin/members?error=required");

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("members")
    .update({ full_name: fullName, division_id: divisionId, is_active: isActive })
    .eq("id", id);
  redirect(error ? "/admin/members?error=save" : "/admin/members?saved=1");
}
