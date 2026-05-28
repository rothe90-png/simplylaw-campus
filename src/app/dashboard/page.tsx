import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";
import { CourseCard } from "@/components/course-card";
import { CoursePreviewCard } from "@/components/course-preview-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/progress-bar";
import { SectionTitle } from "@/components/section-title";
import { requireOnboardedUser } from "@/lib/auth";
import { getAvailableCoursePreviews } from "@/lib/course-catalog";
import { getCourseSummaries } from "@/lib/queries";

type PageProps = {
  searchParams: Promise<{ message?: string }>;
};

const availableCoursePreviews = getAvailableCoursePreviews();

export default async function DashboardPage({ searchParams }: PageProps) {
  const context = await requireOnboardedUser();
  const { profile, user, supabase } = context;

  const [allCourses, params, quizResultResponse] = await Promise.all([
    getCourseSummaries(),
    searchParams,
    supabase.from("quiz_results").select("id", { count: "exact", head: true }).eq("user_id", user.id)
  ]);
  const myCourses = allCourses.filter((course) => course.enrollment);
  const availableCourses = allCourses.filter((course) => !course.enrollment);
  const name = profile?.username || profile?.full_name || user.email?.split("@")[0] || "Willkommen";
  const completedLessons = myCourses.reduce((sum, course) => sum + course.completedLessons, 0);
  const totalLessons = myCourses.reduce((sum, course) => sum + course.lessonsCount, 0);
  const nextCourse = myCourses.find((course) => course.progress < 100) || myCourses[0];
  const stats = [
    { label: "Meine Kurse", value: myCourses.length },
    { label: "Lektionen abgeschlossen", value: completedLessons },
    { label: "Weitere Kurse", value: myCourses.length ? availableCourses.length : availableCoursePreviews.length },
    { label: "Quiz-Ergebnisse", value: quizResultResponse.count || 0 }
  ];

  return (
    <DashboardShell userName={name} isAdmin={profile?.role === "admin"} active="dashboard">
      <section className="space-y-9">
        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(0,76,145,0.30),rgba(93,63,211,0.17)_48%,rgba(255,255,255,0.055))] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.30)] sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-bold uppercase text-brand-100">SimplyLaw Campus</p>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">Hallo, {name}</h1>
              <p className="text-sm leading-6 text-slate-300">Mach weiter, wo du aufgehört hast.</p>
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-lg font-bold text-white shadow-[0_0_34px_rgba(0,76,145,0.48)] backdrop-blur sm:flex">
              SL
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {nextCourse ? (
              <ButtonLink className="rounded-full px-4" size="sm" href={`/courses/${nextCourse.id}`}>
                Fortsetzen
              </ButtonLink>
            ) : null}
            <ButtonLink className="rounded-full px-4" size="sm" variant="glass" href="/courses">
              Kurse ansehen
            </ButtonLink>
          </div>
        </div>

        {params.message ? <p className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-success">{params.message}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-white/10 bg-white/[0.05] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
              <p className="text-sm font-semibold text-slate-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
            </Card>
          ))}
        </div>

        {nextCourse ? (
          <div className="space-y-4">
            <SectionTitle tone="dark" title="Weiterlernen" description="Dein nächster sinnvoller Schritt im Campus." />
            <Card className="overflow-hidden rounded-[1.75rem] border-white/10 bg-white/[0.06] shadow-[0_22px_70px_rgba(0,0,0,0.3)]">
              <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="brand">Letzter Kurs</Badge>
                    <span className="text-xs font-semibold text-slate-500">
                      {nextCourse.completedLessons}/{nextCourse.lessonsCount} Lektionen abgeschlossen
                    </span>
                  </div>
                  <div className="mt-4 max-w-2xl space-y-2">
                    <h2 className="text-2xl font-bold text-white">{nextCourse.title}</h2>
                    <p className="text-body-sm text-slate-400">{nextCourse.description}</p>
                  </div>
                  <ProgressBar className="mt-5 max-w-xl" value={nextCourse.progress} label="Aktueller Fortschritt" />
                </div>
                <div className="flex flex-col justify-between border-t border-white/10 bg-brand/20 p-5 sm:p-6 lg:border-l lg:border-t-0">
                  <div>
                    <p className="text-sm font-bold text-brand-100">Fortschritt</p>
                    <p className="mt-2 text-4xl font-bold text-white">{nextCourse.progress}%</p>
                  </div>
                  <ButtonLink className="mt-6" fullWidth href={`/courses/${nextCourse.id}`}>
                    Fortsetzen
                  </ButtonLink>
                </div>
              </div>
            </Card>
          </div>
        ) : null}

        <div className="space-y-4">
          <SectionTitle
            tone="dark"
            title="Meine Kurse"
            description={
              myCourses.length
                ? `${completedLessons} von ${totalLessons} Lektionen abgeschlossen`
                : "Noch keine Kurse freigeschaltet"
            }
          />
          {myCourses.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {myCourses.map((course) => (
                <CourseCard key={course.id} course={course} status="enrolled" actionLabel="Weiterlernen" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <EmptyState
                tone="dark"
                title="Noch keine freigeschalteten Kurse"
                description="Sobald ein Kurs für dich freigeschaltet ist, erscheint er hier mit Fortschritt und Schnellstart."
              />
              <div className="space-y-5">
                <SectionTitle
                  tone="dark"
                  title="Verfügbare Kurse"
                  description="Diese Kurse sind bereits vorbereitet und können später freigeschaltet werden."
                />
                <div className="grid gap-6 md:grid-cols-2 xl:gap-7">
                  {availableCoursePreviews.map((course) => (
                    <CoursePreviewCard key={course.title} {...course} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {myCourses.length && availableCourses.length ? (
          <div className="space-y-4">
            <SectionTitle
              tone="dark"
              title="Weitere Kurse"
              description="Diese Kurse sind bereits vorbereitet und können später freigeschaltet werden."
            />
            <div className="grid gap-6 md:grid-cols-2 xl:gap-7">
              {availableCourses.map((course) => (
                <CourseCard key={course.id} course={course} status="locked" actionLabel="Kurs ansehen" />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </DashboardShell>
  );
}
