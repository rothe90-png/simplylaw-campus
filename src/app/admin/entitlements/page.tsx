import { createAdminEntitlement, updateAdminEntitlementStatus } from "@/app/actions";
import { AdminSelect, AdminSubmitButton, AdminTextInput } from "@/components/admin/admin-fields";
import { AdminKicker, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAdminCourseRows, getAdminEntitlements, getAdminUsers } from "@/lib/queries";

export default async function AdminEntitlementsPage() {
  const [{ profile, user }, users, courses, entitlements] = await Promise.all([
    requireAdmin(),
    getAdminUsers(),
    getAdminCourseRows(),
    getAdminEntitlements()
  ]);
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "Admin";

  return (
    <AdminShell userName={name} active="entitlements">
      <section className="space-y-6">
        <div>
          <AdminKicker>Freischaltungen</AdminKicker>
          <h1 className="mt-2 text-3xl font-bold text-white">Entitlements</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Dieses Modell ist für spätere Stripe-, PayPal-, Apple- und Google-Webhooks vorbereitet. Manuelle Einträge bleiben
            Supportfällen vorbehalten.
          </p>
        </div>

        <AdminPanel>
          <h2 className="text-xl font-bold text-white">Manuelle Freischaltung vorbereiten</h2>
          <form action={createAdminEntitlement} className="mt-4 grid gap-4 md:grid-cols-2">
            <AdminSelect label="Nutzer" name="user_id" required>
              <option value="">Nutzer wählen</option>
              {users.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.username || item.full_name || item.email || item.id}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect label="Kurs" name="course_id" required>
              <option value="">Kurs wählen</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect label="Quelle" name="source" defaultValue="manual">
              <option value="manual">Manuell</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="apple">Apple</option>
              <option value="google">Google</option>
            </AdminSelect>
            <AdminSelect label="Status" name="status" defaultValue="active">
              <option value="active">Aktiv</option>
              <option value="expired">Abgelaufen</option>
              <option value="revoked">Entzogen</option>
            </AdminSelect>
            <AdminTextInput label="Start optional" name="starts_at" type="datetime-local" />
            <AdminTextInput label="Ende optional" name="ends_at" type="datetime-local" />
            <div className="md:col-span-2">
              <AdminSubmitButton>Freischaltung speichern</AdminSubmitButton>
            </div>
          </form>
        </AdminPanel>

        <div className="space-y-4">
          {entitlements.map((entitlement) => (
            <AdminPanel key={entitlement.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-bold text-brand-100">{entitlement.status}</span>
                    <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-bold text-slate-300">{entitlement.source}</span>
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-white">{entitlement.course?.title || "Unbekannter Kurs"}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {entitlement.profile?.username || entitlement.profile?.full_name || entitlement.profile?.email || entitlement.user_id}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Start: {new Date(entitlement.starts_at).toLocaleDateString("de-DE")} · Ende:{" "}
                    {entitlement.ends_at ? new Date(entitlement.ends_at).toLocaleDateString("de-DE") : "offen"}
                  </p>
                </div>
                <form action={updateAdminEntitlementStatus.bind(null, entitlement.id)} className="grid gap-3 sm:grid-cols-[170px_auto] sm:items-end">
                  <AdminSelect label="Status" name="status" defaultValue={entitlement.status}>
                    <option value="active">Aktiv</option>
                    <option value="expired">Abgelaufen</option>
                    <option value="revoked">Entzogen</option>
                  </AdminSelect>
                  <AdminSubmitButton>Status speichern</AdminSubmitButton>
                </form>
              </div>
            </AdminPanel>
          ))}
        </div>

        {!entitlements.length ? (
          <AdminPanel>
            <h2 className="text-xl font-bold text-white">Noch keine Freischaltungen</h2>
            <p className="mt-2 text-sm text-slate-400">Spätere Payment-Webhooks schreiben in diese Tabelle.</p>
          </AdminPanel>
        ) : null}
      </section>
    </AdminShell>
  );
}
