import { AdminCourseForm } from "@/components/admin/course-forms";
import { AdminSecondaryLink } from "@/components/admin/admin-fields";
import { AdminKicker, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminNewCoursePage() {
  const { profile, user } = await requireAdmin();
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "Admin";

  return (
    <AdminShell userName={name} active="courses">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <AdminKicker>Kursverwaltung</AdminKicker>
            <h1 className="mt-2 text-3xl font-bold text-white">Neuen Kurs erstellen</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Definiere Basisdaten, Zugriffstyp und Veröffentlichungsstatus. Module und Lektionen folgen im nächsten Schritt.
            </p>
          </div>
          <AdminSecondaryLink href="/admin/courses">Zur Kursliste</AdminSecondaryLink>
        </div>

        <AdminPanel>
          <AdminCourseForm />
        </AdminPanel>
      </section>
    </AdminShell>
  );
}
