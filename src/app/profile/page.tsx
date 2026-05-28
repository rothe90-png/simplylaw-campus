import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { SignOutButton } from "@/components/sign-out-button";
import { requireOnboardedUser } from "@/lib/auth";

export default async function ProfilePage() {
  const { profile, user } = await requireOnboardedUser();
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "SimplyLaw";

  return (
    <DashboardShell userName={name} isAdmin={profile?.role === "admin"} active="profile">
      <section className="space-y-6">
        <PageHeader
          tone="dark"
          eyebrow="Profil"
          title={name}
          description={user.email || "SimplyLaw Campus Nutzer"}
          actions={
            <SignOutButton className="inline-flex min-h-11 items-center justify-center rounded-ui-sm border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-brand/20">
              Logout
            </SignOutButton>
          }
        />
      </section>
    </DashboardShell>
  );
}
