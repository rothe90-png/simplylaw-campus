import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";
import { CourseCard } from "@/components/course-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProgressBar } from "@/components/progress-bar";
import { SectionTitle } from "@/components/section-title";
import { requireUser } from "@/lib/auth";
import { getCourseSummaries } from "@/lib/queries";

type PageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const context = await requireUser();
  const { profile, user, supabase } = context;
  const [courses, params, quizResultResponse] = await Promise.all([
    getCourseSummaries({ enrolledOnly: true }),
    searchParams,
    supabase.from("quiz_results").select("id", { count: "exact", head: true }).eq("user_id", user.id)
  ]);
  const name = profile?.full_name || user.email?.split("@")[0] || "Willkommen";
  const completedLessons = courses.reduce((sum, course) => sum + course.completedLessons, 0);
  const totalLessons = courses.reduce((sum, course) => sum + course.lessonsCount, 0);
  const nextCourse = courses.find((course) => course.progress < 100) || courses[0];
  const stats = [
    { label: "Kurse", value: courses.length },
    { label: "Lektionen abgeschlossen", value: completedLessons },
    { label: "Quiz-Ergebnisse", value: quizResultResponse.count || 0 }
  ];

  return (
    <DashboardShell userName={name} isAdmin={profile?.role === "admin"} active="dashboard">
      <section className="space-y-8">
        <PageHeader
          eyebrow="Dashboard"
          title={`Hallo, ${name}`}
          description="Hier findest du deine freigeschalteten Kurse und deinen aktuellen Lernfortschritt."
          actions={
            <ButtonLink variant="secondary" href="/courses">
              Kurse ansehen
            </ButtonLink>
          }
        />

        {params.message ? <p className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-success">{params.message}</p> : null}

        {courses.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <Card key={stat.label} className="p-5">
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-ink">{stat.value}</p>
                </Card>
              ))}
            </div>

            {nextCourse ? (
              <Card className="overflow-hidden">
                <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="brand">Weiterlernen</Badge>
                      <span className="text-xs font-semibold text-slate-500">
                        {nextCourse.completedLessons}/{nextCourse.lessonsCount} Lektionen abgeschlossen
                      </span>
                    </div>
                    <div className="mt-4 max-w-2xl space-y-2">
                      <h2 className="text-2xl font-bold text-ink">{nextCourse.title}</h2>
                      <p className="text-body-sm text-slate-600">{nextCourse.description}</p>
                    </div>
                    <ProgressBar className="mt-5 max-w-xl" value={nextCourse.progress} label="Aktueller Fortschritt" />
                  </div>
                  <div className="flex flex-col justify-between border-t border-line bg-brand-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
                    <div>
                      <p className="text-sm font-bold text-brand">Gesamtfortschritt</p>
                      <p className="mt-2 text-4xl font-bold text-brand">{nextCourse.progress}%</p>
                    </div>
                    <ButtonLink className="mt-6" fullWidth href={`/courses/${nextCourse.id}`}>
                      Weiterlernen
                    </ButtonLink>
                  </div>
                </div>
              </Card>
            ) : null}

            <div className="space-y-4">
              <SectionTitle
                title="Meine Kurse"
                description={`${completedLessons} von ${totalLessons} Lektionen abgeschlossen`}
                action={
                  <ButtonLink variant="ghost" href="/courses">
                    Alle Kurse
                  </ButtonLink>
                }
              />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} actionLabel="Weiterlernen" />
                ))}
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="Noch keine freigeschalteten Kurse"
            description="Öffne einen Kurs und schalte ihn für dein Konto frei, damit er im Dashboard erscheint."
            href="/courses"
            action="Kurse ansehen"
          />
        )}
      </section>
    </DashboardShell>
  );
}
