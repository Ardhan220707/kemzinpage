import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">Memuat...</p>
        </main>
      }
    >
      <RedirectByRole />
    </Suspense>
  );
}

async function RedirectByRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=inactive");
  }

  if (profile.role === "admin") redirect("/admin");
  if (profile.role === "kadiv" || profile.role === "wakadiv") redirect("/dashboard");

  await supabase.auth.signOut();
  redirect("/login?error=invalid");
  return null;
}
