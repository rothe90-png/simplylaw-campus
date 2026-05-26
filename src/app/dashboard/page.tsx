import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeading } from "@/components/page-heading";
import { ProgressBar } from "@/components/progress-bar";
import { requireUser } from "@/lib/auth";
import { getCourseSummaries } from "@/lib/queries";

type PageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const [{ profile, user }, courses, params] = await Promise.all([requireUser(), getCourseSummaries({ enrolledOnly: true }), searchParams]);
  const name = profile?.full_name || user.email?.split("@")[0] || "Willkommen";

  return (
    <section className="container-shell py-8 sm:py-12">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <PageHeading
            eyebrow="Dashboard"
            title={`Hallo, ${name}`}
            description="Hier findest du deine freigeschalteten Kurse und deinen aktuellen Lernfortschritt."
          />
          <Link className="btn-secondary sm:w-auto" href="/courses">
            Kurse ansehen
          </Link>
        </div>

        {params.message ? <p className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-success">{params.message}</p> : null}

        {courses.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {courses.map((course) => (
              <article key={course.id} className="card p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-brand-light px-3 py-1 text-xs font-bold text-brand">{course.category}</span>
                    <span className="text-xs font-semibold text-slate-500">{course.lessonsCount} Lektionen</span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-ink">{course.title}</h2>
                    <p className="text-sm leading-6 text-slate-600">{course.description}</p>
                  </div>
                  <ProgressBar value={course.progress} label={`${course.completedLessons}/${course.lessonsCount} abgeschlossen`} />
                  <Link className="btn-primary w-full" href={`/courses/${course.id}`}>
                    Weiterlernen
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Noch keine freigeschalteten Kurse"
            description="Öffne einen Kurs und schalte ihn für dein Konto frei, damit er im Dashboard erscheint."
            href="/courses"
            action="Kurse ansehen"
          />
        )}
      </div>
    </section>
  );
}
