import Link from "next/link";
import { notFound } from "next/navigation";
import { enrollInCourse } from "@/app/actions";
import { LessonStatusBadge } from "@/components/lesson-status-badge";
import { PageHeading } from "@/components/page-heading";
import { ProgressBar } from "@/components/progress-bar";
import { requireOnboardedUser } from "@/lib/auth";
import { getCourseDetail } from "@/lib/queries";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;
  const [course, { user }] = await Promise.all([getCourseDetail(courseId), requireOnboardedUser()]);

  if (!course) notFound();

  const enrollAction = enrollInCourse.bind(null, course.id);
  const firstOpenLesson = course.lessons.find((lesson) => lesson.status !== "completed") || course.lessons[0];

  return (
    <section className="container-shell py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <PageHeading eyebrow={course.category} title={course.title} description={course.description} />

          <div className="card p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <ProgressBar value={course.progress} label={`${course.completedLessons}/${course.lessonsCount} Lektionen abgeschlossen`} />
              {user ? (
                course.enrollment ? (
                  firstOpenLesson ? (
                    <Link className="btn-primary shrink-0" href={`/courses/${course.id}/lessons/${firstOpenLesson.id}`}>
                      Weiterlernen
                    </Link>
                  ) : null
                ) : (
                  <form action={enrollAction}>
                    <button className="btn-primary w-full sm:w-auto" type="submit">
                      Kurs freischalten
                    </button>
                  </form>
                )
              ) : (
                <Link className="btn-primary shrink-0" href="/login">
                  Einloggen zum Lernen
                </Link>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-ink">Lektionen</h2>
            <div className="space-y-3">
              {course.lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/courses/${course.id}/lessons/${lesson.id}`}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-soft transition hover:border-brand sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-ink">{lesson.title}</p>
                    {lesson.description ? <p className="text-sm leading-6 text-slate-600">{lesson.description}</p> : null}
                  </div>
                  <LessonStatusBadge status={lesson.status} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="text-lg font-bold text-ink">Kursdaten</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-slate-500">Kategorie</dt>
                <dd className="font-bold text-ink">{course.category}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-slate-500">Lektionen</dt>
                <dd className="font-bold text-ink">{course.lessonsCount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-slate-500">Status</dt>
                <dd className="font-bold text-ink">{course.enrollment ? "freigeschaltet" : "offen"}</dd>
              </div>
            </dl>
          </div>

          {course.quiz ? (
            <Link className="btn-secondary w-full" href={`/courses/${course.id}/quiz`}>
              Quiz starten
            </Link>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
