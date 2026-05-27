import { redirect } from "next/navigation";
import { completeOnboardingAction } from "@/app/onboarding/actions";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { requireUser } from "@/lib/auth";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function OnboardingPage({ searchParams }: PageProps) {
  const [{ profile }, params] = await Promise.all([requireUser(), searchParams]);

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <OnboardingFlow
      action={completeOnboardingAction}
      error={params.error}
      initialValues={{
        username: profile?.username || profile?.full_name || "",
        avatarUrl: profile?.avatar_url || "",
        level: profile?.level || "",
        federalState: profile?.federal_state || "",
        agency: profile?.agency || "",
        activityArea: profile?.activity_area || ""
      }}
    />
  );
}
