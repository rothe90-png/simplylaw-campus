"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getRequestOrigin } from "@/lib/env";

function encodeMessage(type: "message" | "error", value: string) {
  return `${type}=${encodeURIComponent(value)}`;
}

async function getOrigin() {
  const headerStore = await headers();
  return getRequestOrigin(headerStore);
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?${encodeMessage("error", "Login fehlgeschlagen. Bitte prüfe deine Zugangsdaten.")}`);
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`
    }
  });

  if (error) {
    redirect(`/register?${encodeMessage("error", "Registrierung fehlgeschlagen. Bitte prüfe deine Angaben.")}`);
  }

  redirect(`/login?${encodeMessage("message", "Registrierung erfolgreich. Bitte bestätige bei Bedarf deine E-Mail und logge dich ein.")}`);
}

export async function resetPasswordAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`
  });

  if (error) {
    redirect(`/reset-password?${encodeMessage("error", "Der Reset-Link konnte nicht versendet werden.")}`);
  }

  redirect(`/login?${encodeMessage("message", "Wenn die E-Mail existiert, wurde ein Reset-Link versendet.")}`);
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/update-password?${encodeMessage("error", "Das Passwort konnte nicht aktualisiert werden.")}`);
  }

  redirect(`/dashboard?${encodeMessage("message", "Passwort aktualisiert.")}`);
}
