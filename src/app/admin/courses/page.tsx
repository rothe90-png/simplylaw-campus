import Link from "next/link";
import { AdminSecondaryLink } from "@/components/admin/admin-fields";
import { AdminKicker, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { SoftDeleteCourseForm } from "@/components/admin/course-trash-actions";
import { requireAdmin } from "@/lib/auth";
import { getAdminCourseRows } from "@/lib/queries";

function statusLabel(status: string) {
  if (status === "published") return "Veröffentlicht";
  if (status === "archived") return "Archiviert";
  return "Entwurf";
}

function accessLabel(accessType: string) {
  if (accessType === "free") return "Kostenlos";
  if (accessType === "single_purchase") return "Einzelkauf";
  return "Premium";
}

export default async function AdminCoursesPage() {
  const [{ profile, user }, courses] = await Promise.all([requireAdmin(), getAdminCourseRows()]);
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "Admin";

  return (
    <AdminShell userName={name} active="courses">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <AdminKicker>Kursverwaltung</AdminKicker>
            <h1 className="mt-2 text-3xl font-bold text-white">Kurse</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Kurse erstellen, Status und Zugriff pflegen, Module und Lektionen vorbereiten.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminSecondaryLink href="/admin/courses/trash">Papierkorb</AdminSecondaryLink>
            <AdminSecondaryLink href="/admin/courses/new">Neuen Kurs erstellen</AdminSecondaryLink>
          </div>
        </div>

        <div className="grid gap-4">
          {courses.map((course) => (
            <AdminPanel key={course.id}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-brand/22 px-3 py-1 text-xs font-bold text-brand-100">{statusLabel(course.status)}</span>
                    <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-bold text-slate-300">{accessLabel(course.access_type)}</span>
                    <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-bold text-slate-300">{course.category}</span>
                  </div>
                  <h2 className="mt-3 text-2xl font-bold text-white">{course.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{course.short_description || course.description}</p>
                  <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-300 sm:grid-cols-4">
                    <span>{course.modulesCount} Module</span>
                    <span>{course.lessonsCount} Lektionen</span>
                    <span>{course.quizzesCount} Quiz</span>
                    <span>{course.entitlementsCount} Freischaltungen</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10" href={`/admin/courses/${course.id}/edit`} prefetch={false}>
                    Bearbeiten
                  </Link>
                  <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10" href={`/admin/courses/${course.id}/modules`} prefetch={false}>
                    Module
                  </Link>
                  <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10" href={`/admin/courses/${course.id}/lessons`} prefetch={false}>
                    Lektionen
                  </Link>
                  <SoftDeleteCourseForm courseId={course.id} />
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>

        {!courses.length ? (
          <AdminPanel>
            <h2 className="text-xl font-bold text-white">Noch keine Kurse</h2>
            <p className="mt-2 text-sm text-slate-400">Lege den ersten Kurs an, damit Module und Lektionen gepflegt werden können.</p>
          </AdminPanel>
        ) : null}
      </section>
    </AdminShell>
  );
}
