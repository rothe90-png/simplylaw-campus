import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { requireOnboardedUser } from "@/lib/auth";

export default async function LearningPlansPage() {
  const { profile, user } = await requireOnboardedUser();
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "SimplyLaw";

  return (
    <DashboardShell userName={name} isAdmin={profile?.role === "admin"} active="learning-plans">
      <section className="space-y-6">
        <PageHeader
          tone="dark"
          eyebrow="Lernpläne"
          title="Deine Lernpläne"
          description="Hier werden später strukturierte Lernpfade und Wochenziele für deine Kurse vorbereitet."
        />
        <EmptyState tone="dark" title="Noch keine Lernpläne" description="Lernpläne werden in einer späteren Phase ergänzt." />
      </section>
    </DashboardShell>
  );
}
