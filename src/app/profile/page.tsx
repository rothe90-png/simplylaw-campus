import { ButtonLink } from "@/components/button";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";
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
            <ButtonLink variant="glass" href="/auth/signout">
              Logout
            </ButtonLink>
          }
        />
      </section>
    </DashboardShell>
  );
}
