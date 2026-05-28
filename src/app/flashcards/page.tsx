import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { requireOnboardedUser } from "@/lib/auth";

export default async function FlashcardsPage() {
  const { profile, user } = await requireOnboardedUser();
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "SimplyLaw";

  return (
    <DashboardShell userName={name} isAdmin={profile?.role === "admin"} active="flashcards">
      <section className="space-y-6">
        <PageHeader
          tone="dark"
          eyebrow="Karteikarten"
          title="Karteikarten"
          description="Hier entsteht später ein kompakter Wiederholungsbereich für Definitionen, Schemata und Kernwissen."
        />
        <EmptyState tone="dark" title="Noch keine Karteikarten" description="Karteikarten werden in einer späteren Phase ergänzt." />
      </section>
    </DashboardShell>
  );
}
