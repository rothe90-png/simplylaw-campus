import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { completeLesson, markLessonStarted } from "@/app/actions";
import { LessonStatusBadge } from "@/components/lesson-status-badge";
import { PageHeading } from "@/components/page-heading";
import { requireOnboardedUser } from "@/lib/auth";
import { getLessonPageData } from "@/lib/queries";

type PageProps = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

export default async function LessonPage({ params }: PageProps) {
  await requireOnboardedUser();
  const { courseId, lessonId } = await params;
  const data = await getLessonPageData(courseId, lessonId);

  if (!data) notFound();
  if (!data.enrollment) redirect(`/courses/${data.course.slug || data.course.id}`);

  const startAction = markLessonStarted.bind(null, data.course.id, data.lesson.id);
  const completeAction = completeLesson.bind(null, data.course.id, data.lesson.id);

  return (
    <section className="container-shell py-8 sm:py-12">
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <PageHeading eyebrow={data.course.title} title={data.lesson.title} description={data.lesson.description || undefined} />
          <LessonStatusBadge status={data.lesson.status} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <article className="space-y-6">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-soft">
              {data.lesson.video_url ? (
                <iframe
                  className="aspect-video w-full"
                  src={data.lesson.video_url}
                  title={data.lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex aspect-video items-center justify-center px-6 text-center text-sm font-semibold text-slate-300">
                  Noch kein Video hinterlegt.
                </div>
              )}
            </div>

            <div className="card p-5 sm:p-6">
              <h2 className="text-2xl font-bold text-ink">Lektionstext</h2>
              <div className="mt-4 whitespace-pre-line text-base leading-8 text-slate-700">
                {data.lesson.body || "Für diese Lektion wurde noch kein Text hinterlegt."}
              </div>
            </div>
          </article>

          <aside className="space-y-4">
            <div className="card p-5">
              <h2 className="text-lg font-bold text-ink">Downloads</h2>
              {data.pdfUrl ? (
                <a className="btn-secondary mt-4 w-full" href={data.pdfUrl} target="_blank" rel="noreferrer">
                  PDF herunterladen
                </a>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-600">Keine PDF-Datei für diese Lektion hinterlegt.</p>
              )}
            </div>

            <div className="card p-5">
              <h2 className="text-lg font-bold text-ink">Fortschritt</h2>
              <div className="mt-4 space-y-3">
                {data.lesson.status === "open" ? (
                  <form action={startAction}>
                    <button className="btn-secondary w-full" type="submit">
                      Als begonnen markieren
                    </button>
                  </form>
                ) : null}
                <form action={completeAction}>
                  <button className="btn-primary w-full" type="submit">
                    Lektion als abgeschlossen markieren
                  </button>
                </form>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {data.previousLesson ? (
                <Link className="btn-secondary" href={`/courses/${data.course.id}/lessons/${data.previousLesson.id}`}>
                  Vorherige
                </Link>
              ) : (
                <span className="btn-secondary pointer-events-none opacity-50">Vorherige</span>
              )}
              {data.nextLesson ? (
                <Link className="btn-secondary" href={`/courses/${data.course.id}/lessons/${data.nextLesson.id}`}>
                  Nächste
                </Link>
              ) : (
                <Link className="btn-secondary" href={`/courses/${data.course.id}`}>
                  Kurs
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
