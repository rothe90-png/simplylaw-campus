import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Profile } from "@/types/database";

export async function getCurrentUserAndProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null };
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  return { supabase, user, profile };
}

export async function requireUser() {
  const context = await getCurrentUserAndProfile();

  if (!context.user) {
    redirect("/login");
  }

  return context as typeof context & {
    user: NonNullable<typeof context.user>;
    profile: Profile | null;
  };
}

export async function requireAdmin() {
  const context = await requireUser();

  if (context.profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return context as typeof context & {
    profile: Profile;
  };
}
