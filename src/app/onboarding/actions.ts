"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import type { ProfileInsert, ProfileUpdate } from "@/types/database";

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function cleanUsername(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 14);
}

function nullableText(value: string) {
  return value || null;
}

function encodeError(value: string) {
  return `error=${encodeURIComponent(value)}`;
}

export async function completeOnboardingAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const fallbackName = cleanUsername(existingProfile?.username || existingProfile?.full_name || user.email?.split("@")[0] || "Nutzer");
  const username = cleanUsername(textValue(formData, "username")) || fallbackName || "Nutzer";
  const level = textValue(formData, "level");
  const federalState = level === "Bundesebene" ? "" : textValue(formData, "federal_state");
  const agency = textValue(formData, "agency");
  const activityArea = textValue(formData, "activity_area");

  const profileUpdate: ProfileUpdate = {
    username,
    full_name: username,
    avatar_url: nullableText(textValue(formData, "avatar_url")),
    level: nullableText(level),
    federal_state: nullableText(federalState),
    agency: nullableText(agency),
    activity_area: nullableText(activityArea),
    onboarding_completed: true
  };

  let error: { message: string } | null = null;

  if (existingProfile) {
    const response = await supabase.from("profiles").update(profileUpdate).eq("id", user.id);
    error = response.error;
  } else {
    const profileInsert: ProfileInsert = {
        id: user.id,
        role: "student",
        ...profileUpdate
    };
    const response = await supabase.from("profiles").insert(profileInsert);
    error = response.error;
  }

  if (error) {
    console.error("Onboarding profile save failed:", error.message);
    redirect(`/onboarding?${encodeError("Das Onboarding konnte nicht gespeichert werden.")}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  redirect("/dashboard");
}
