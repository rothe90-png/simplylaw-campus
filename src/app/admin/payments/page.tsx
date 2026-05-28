import { AdminKicker, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPaymentsPage() {
  const { profile, user } = await requireAdmin();
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "Admin";

  return (
    <AdminShell userName={name} active="payments">
      <section className="space-y-6">
        <div>
          <AdminKicker>Zahlungen / Abo später</AdminKicker>
          <h1 className="mt-2 text-3xl font-bold text-white">Payments</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Zahlungen und Abos werden später über Stripe/PayPal angebunden. Apple Pay und Google Pay laufen im Web voraussichtlich
            über Stripe.
          </p>
        </div>

        <AdminPanel className="bg-[linear-gradient(135deg,rgba(0,76,145,0.22),rgba(93,63,211,0.16),rgba(255,255,255,0.04))]">
          <h2 className="text-2xl font-bold text-white">Noch keine Paymentlogik aktiv</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Für Admin-CMS 1.0 bleibt dieser Bereich ein Platzhalter. Die vorbereitete Entitlements-Tabelle kann später von
            Webhooks beschrieben werden, ohne Kurs- oder Dashboardlogik neu zu erfinden.
          </p>
        </AdminPanel>
      </section>
    </AdminShell>
  );
}
