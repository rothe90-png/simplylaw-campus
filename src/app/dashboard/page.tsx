import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";
import { CourseCard } from "@/components/course-card";
import { CoursePreviewCard } from "@/components/course-preview-card";
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

const availableCoursePreviews = [
  {
    title: "Strafrecht",
    description: "Grundlagen, Prüfungsschemata und typische Fallfragen kompakt trainieren.",
    tone: "criminal-law" as const
  },
  {
    title: "Eingriffsrecht",
    description: "Befugnisse, Verhältnismäßigkeit und rechtssichere Maßnahmen verstehen.",
    tone: "intervention" as const
  },
  {
    title: "Verkehrsrecht",
    description: "Kontrollen, Ordnungswidrigkeiten und Standardlagen im Straßenverkehr üben.",
    tone: "traffic" as const
  },
  {
    title: "Kriminalistik",
    description: "Spuren, Tatortarbeit und kriminalistische Denkweisen strukturiert lernen.",
    tone: "forensics" as const
  }
];

export default async function DashboardPage({ searchParams }: PageProps) {
  const context = await requireUser();
  const { profile, user, supabase } = context;
  const [allCourses, params, quizResultResponse] = await Promise.all([
    getCourseSummaries(),
    searchParams,
    supabase.from("quiz_results").select("id", { count: "exact", head: true }).eq("user_id", user.id)
  ]);
  const myCourses = allCourses.filter((course) => course.enrollment);
  const availableCourses = allCourses.filter((course) => !course.enrollment);
  const name = profile?.full_name || user.email?.split("@")[0] || "Willkommen";
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
      <section className="space-y-8">
        <PageHeader
          eyebrow="SimplyLaw Campus"
          title={`Willkommen zurück, ${name}`}
          description="Deine Kursübersicht für Polizei- und Rechtsnachhilfe. Starte direkt dort, wo du aufgehört hast, oder sieh dir weitere Kurse an."
          actions={
            <ButtonLink variant="secondary" href="/courses">
              Alle Kurse ansehen
            </ButtonLink>
          }
        />

        {params.message ? <p className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-success">{params.message}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="space-y-6">
              <EmptyState
                title="Noch keine freigeschalteten Kurse"
                description="Sobald ein Kurs für dich freigeschaltet ist, erscheint er hier mit Fortschritt und Schnellstart."
              />
              <div className="space-y-4">
                <SectionTitle
                  title="Verfügbare Kurse"
                  description="Diese Kurse sind bereits vorbereitet und können später freigeschaltet werden."
                />
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
              title="Weitere Kurse"
              description="Diese Kurse sind bereits vorbereitet und können später freigeschaltet werden."
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
