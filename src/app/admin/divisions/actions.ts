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

export async function createDivision(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) redirect("/admin/divisions?error=name");

  const supabase = await requireAdmin();
  const { error } = await supabase.from("divisions").insert({
    name,
    description: description || null,
    is_active: true,
  });

  redirect(error ? "/admin/divisions?error=duplicate" : "/admin/divisions?saved=1");
}

export async function updateDivision(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isActive = formData.get("is_active") === "on";
  if (!id || !name) redirect("/admin/divisions?error=invalid");

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("divisions")
    .update({ name, description: description || null, is_active: isActive })
    .eq("id", id);

  redirect(error ? "/admin/divisions?error=duplicate" : "/admin/divisions?saved=1");
}
