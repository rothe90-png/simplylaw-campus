import { CourseCard } from "@/components/course-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionTitle } from "@/components/section-title";
import { requireOnboardedUser } from "@/lib/auth";
import { getCourseSummaries } from "@/lib/queries";

export default async function CoursesPage() {
  const [{ profile, user }, courses] = await Promise.all([requireOnboardedUser(), getCourseSummaries()]);
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "SimplyLaw";
  const myCourses = courses.filter((course) => course.enrollment);
  const availableCourses = courses.filter((course) => !course.enrollment);

  return (
    <DashboardShell userName={name} isAdmin={profile?.role === "admin"} active="courses">
      <section className="space-y-8">
        <PageHeader
          tone="dark"
          eyebrow="Kurse"
          title="Kursübersicht"
          description="Alle Kurse im SimplyLaw Campus: deine freigeschalteten Lernpfade und weitere vorbereitete Themen."
        />

        {courses.length ? (
          <>
            <div className="space-y-4">
              <SectionTitle
                tone="dark"
                title="Meine Kurse"
                description={
                  myCourses.length
                    ? "Deine freigeschalteten Kurse mit aktuellem Lernfortschritt."
                    : "Noch keine Kurse freigeschaltet."
                }
              />
              {myCourses.length ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {myCourses.map((course) => (
                    <CourseCard key={course.id} course={course} status="enrolled" actionLabel="Weiterlernen" />
                  ))}
                </div>
              ) : (
                <EmptyState
                  tone="dark"
                  title="Noch keine freigeschalteten Kurse"
                  description="Freigeschaltete Kurse erscheinen hier mit Fortschritt und Schnellzugriff."
                />
              )}
            </div>

            {availableCourses.length ? (
              <div className="space-y-4">
                <SectionTitle
                  tone="dark"
                  title="Weitere Kurse"
                  description="Diese Kurse sind vorbereitet und können später gebucht oder freigeschaltet werden."
                />
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {availableCourses.map((course) => (
                    <CourseCard key={course.id} course={course} status="locked" actionLabel="Mehr erfahren" />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState tone="dark" title="Noch keine Kurse" description="Im Adminbereich können Kurse und Lektionen angelegt werden." />
        )}
      </section>
    </DashboardShell>
  );
}
