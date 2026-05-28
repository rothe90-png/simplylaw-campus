import { notFound } from "next/navigation";
import { AdminSecondaryLink } from "@/components/admin/admin-fields";
import { AdminKicker, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { AdminModuleForm } from "@/components/admin/course-forms";
import { requireAdmin } from "@/lib/auth";
import { getAdminCourseContent } from "@/lib/queries";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function AdminCourseModulesPage({ params }: PageProps) {
  const [{ profile, user }, routeParams] = await Promise.all([requireAdmin(), params]);
  const { course, modules } = await getAdminCourseContent(routeParams.courseId);
  if (!course) notFound();

  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "Admin";

  return (
    <AdminShell userName={name} active="courses">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <AdminKicker>Module / Kapitel</AdminKicker>
            <h1 className="mt-2 text-3xl font-bold text-white">{course.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Kapitel strukturieren, Reihenfolge festlegen und Veröffentlichungsstatus setzen.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminSecondaryLink href={`/admin/courses/${course.id}/edit`}>Kurs bearbeiten</AdminSecondaryLink>
            <AdminSecondaryLink href={`/admin/courses/${course.id}/lessons`}>Lektionen</AdminSecondaryLink>
          </div>
        </div>

        <AdminPanel>
          <h2 className="text-xl font-bold text-white">Neues Modul</h2>
          <div className="mt-4">
            <AdminModuleForm courseId={course.id} />
          </div>
        </AdminPanel>

        <div className="space-y-4">
          {modules.map((module) => (
            <AdminPanel key={module.id}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-brand-100">#{module.sort_order}</p>
                  <h2 className="text-xl font-bold text-white">{module.title}</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold text-slate-300">
                  {module.status}
                </span>
              </div>
              <AdminModuleForm courseId={course.id} module={module} />
            </AdminPanel>
          ))}
        </div>

        {!modules.length ? (
          <AdminPanel>
            <h2 className="text-xl font-bold text-white">Noch keine Module</h2>
            <p className="mt-2 text-sm text-slate-400">Lege oben das erste Kapitel für diesen Kurs an.</p>
          </AdminPanel>
        ) : null}
      </section>
    </AdminShell>
  );
}
