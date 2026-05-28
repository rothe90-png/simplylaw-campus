import { notFound } from "next/navigation";
import { AdminSecondaryLink } from "@/components/admin/admin-fields";
import { AdminKicker, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { AdminLessonForm } from "@/components/admin/course-forms";
import { requireAdmin } from "@/lib/auth";
import { getAdminCourseContent } from "@/lib/queries";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function AdminCourseLessonsPage({ params }: PageProps) {
  const [{ profile, user }, routeParams] = await Promise.all([requireAdmin(), params]);
  const { course, modules, lessons } = await getAdminCourseContent(routeParams.courseId);
  if (!course) notFound();

  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "Admin";
  const modulesById = new Map(modules.map((module) => [module.id, module.title]));

  return (
    <AdminShell userName={name} active="courses">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <AdminKicker>Lektionen</AdminKicker>
            <h1 className="mt-2 text-3xl font-bold text-white">{course.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Lektionen als Text, Video-URL, PDF-Link und Vorschaustatus pflegen.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminSecondaryLink href={`/admin/courses/${course.id}/edit`}>Kurs bearbeiten</AdminSecondaryLink>
            <AdminSecondaryLink href={`/admin/courses/${course.id}/modules`}>Module</AdminSecondaryLink>
          </div>
        </div>

        <AdminPanel>
          <h2 className="text-xl font-bold text-white">Neue Lektion</h2>
          <p className="mt-2 text-sm text-slate-400">Rich-Text kann später ergänzt werden; für 1.0 reicht ein normales Textfeld.</p>
          <div className="mt-4">
            <AdminLessonForm courseId={course.id} modules={modules} />
          </div>
        </AdminPanel>

        <div className="space-y-4">
          {lessons.map((lesson) => (
            <AdminPanel key={lesson.id}>
              <details>
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-brand-100">
                        #{lesson.sort_order || lesson.position} · {modulesById.get(lesson.module_id || "") || "Kein Modul"}
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-white">{lesson.title}</h2>
                      <p className="mt-2 text-sm text-slate-400">{lesson.description || "Keine Kurzbeschreibung hinterlegt."}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {lesson.is_preview ? <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-bold text-brand-100">Preview</span> : null}
                      <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold text-slate-300">
                        {lesson.status}
                      </span>
                    </div>
                  </div>
                </summary>
                <div className="mt-5 border-t border-white/10 pt-5">
                  <AdminLessonForm courseId={course.id} modules={modules} lesson={lesson} />
                </div>
              </details>
            </AdminPanel>
          ))}
        </div>

        {!lessons.length ? (
          <AdminPanel>
            <h2 className="text-xl font-bold text-white">Noch keine Lektionen</h2>
            <p className="mt-2 text-sm text-slate-400">Lege oben die erste Lektion für diesen Kurs an.</p>
          </AdminPanel>
        ) : null}
      </section>
    </AdminShell>
  );
}
