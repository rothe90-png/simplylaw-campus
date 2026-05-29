import { AdminSecondaryLink } from "@/components/admin/admin-fields";
import { AdminKicker, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import {
  PermanentlyDeleteCourseForm,
  RestoreCourseForm
} from "@/components/admin/course-trash-actions";
import { requireAdmin } from "@/lib/auth";
import { getAdminDeletedCourseRows } from "@/lib/queries";

function statusLabel(status: string) {
  if (status === "published") return "Veröffentlicht";
  if (status === "archived") return "Archiviert";
  return "Entwurf";
}

function deletedAtLabel(value: string | null) {
  if (!value) return "Unbekannt";

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default async function AdminCourseTrashPage() {
  const [{ profile, user }, courses] = await Promise.all([requireAdmin(), getAdminDeletedCourseRows()]);
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "Admin";

  return (
    <AdminShell userName={name} active="courses">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <AdminKicker>Papierkorb</AdminKicker>
            <h1 className="mt-2 text-3xl font-bold text-white">Gelöschte Kurse</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Wiederherstellen macht einen Kurs samt Modulen, Lektionen und Quizzen wieder sichtbar. Endgültiges
              Löschen ist nur möglich, wenn keine verknüpften Inhalte mehr bestehen.
            </p>
          </div>
          <AdminSecondaryLink href="/admin/courses">Zurück zu Kurse</AdminSecondaryLink>
        </div>

        <div className="grid gap-4">
          {courses.map((course) => (
            <AdminPanel key={course.id}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-red-500/12 px-3 py-1 text-xs font-bold text-red-100">
                      Im Papierkorb
                    </span>
                    <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-bold text-slate-300">
                      {statusLabel(course.status)}
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-bold text-white">{course.title}</h2>
                  <div className="mt-2 grid gap-2 text-sm font-semibold text-slate-400 sm:grid-cols-3">
                    <span>Slug: {course.slug}</span>
                    <span>Gelöscht am: {deletedAtLabel(course.deleted_at)}</span>
                    <span>{course.modulesCount + course.lessonsCount + course.quizzesCount} verknüpfte Inhalte</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <RestoreCourseForm courseId={course.id} />
                  <PermanentlyDeleteCourseForm courseId={course.id} />
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>

        {!courses.length ? (
          <AdminPanel>
            <h2 className="text-xl font-bold text-white">Der Papierkorb ist leer</h2>
            <p className="mt-2 text-sm text-slate-400">
              Gelöschte Kurse erscheinen hier, bevor sie endgültig entfernt oder wiederhergestellt werden.
            </p>
          </AdminPanel>
        ) : null}
      </section>
    </AdminShell>
  );
}
