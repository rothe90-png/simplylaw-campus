import { updateAdminUserRole } from "@/app/actions";
import { AdminSelect, AdminSubmitButton } from "@/components/admin/admin-fields";
import { AdminKicker, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAdminUsers } from "@/lib/queries";

export default async function AdminUsersPage() {
  const [{ profile, user }, users] = await Promise.all([requireAdmin(), getAdminUsers()]);
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "Admin";

  return (
    <AdminShell userName={name} active="users">
      <section className="space-y-6">
        <div>
          <AdminKicker>Nutzer / Support</AdminKicker>
          <h1 className="mt-2 text-3xl font-bold text-white">Nutzer</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Supportansicht für Rollen und Onboardingstatus. Freischaltungen sollen später primär automatisch über Payment-Webhooks
            entstehen.
          </p>
        </div>

        <div className="space-y-4">
          {users.map((item) => {
            const displayName = item.username || item.full_name || item.email || item.id;
            const isSelf = item.id === user.id;

            return (
              <AdminPanel key={item.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold text-white">{displayName}</h2>
                    <p className="mt-1 truncate text-sm text-slate-400">{item.email || "Keine E-Mail im Profil gespeichert"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-bold text-brand-100">{item.role}</span>
                      <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-bold text-slate-300">
                        Onboarding {item.onboarding_completed ? "fertig" : "offen"}
                      </span>
                      <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-bold text-slate-300">
                        {item.entitlementsCount} Freischaltungen
                      </span>
                    </div>
                  </div>
                  {isSelf ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-slate-300">
                      Eigene Adminrolle geschützt
                    </div>
                  ) : (
                    <form action={updateAdminUserRole.bind(null, item.id)} className="grid gap-3 sm:grid-cols-[180px_auto] sm:items-end">
                      <AdminSelect label="Rolle" name="role" defaultValue={item.role}>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </AdminSelect>
                      <AdminSubmitButton>Rolle speichern</AdminSubmitButton>
                    </form>
                  )}
                </div>
              </AdminPanel>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
