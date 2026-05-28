import { notFound } from "next/navigation";
import { AdminSecondaryLink } from "@/components/admin/admin-fields";
import { AdminKicker, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { AdminCourseForm } from "@/components/admin/course-forms";
import { requireAdmin } from "@/lib/auth";
import { getAdminCourseContent } from "@/lib/queries";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function AdminEditCoursePage({ params }: PageProps) {
  const [{ profile, user }, routeParams] = await Promise.all([requireAdmin(), params]);
  const { course, modules, lessons, quizzes } = await getAdminCourseContent(routeParams.courseId);
  if (!course) notFound();

  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "Admin";

  return (
    <AdminShell userName={name} active="courses">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <AdminKicker>Kurs bearbeiten</AdminKicker>
            <h1 className="mt-2 text-3xl font-bold text-white">{course.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              {modules.length} Module, {lessons.length} Lektionen, {quizzes.length} Quiz.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminSecondaryLink href="/admin/courses">Zur Kursliste</AdminSecondaryLink>
            <AdminSecondaryLink href={`/admin/courses/${course.id}/modules`}>Module</AdminSecondaryLink>
            <AdminSecondaryLink href={`/admin/courses/${course.id}/lessons`}>Lektionen</AdminSecondaryLink>
          </div>
        </div>

        <AdminPanel>
          <AdminCourseForm course={course} />
        </AdminPanel>
      </section>
    </AdminShell>
  );
}
