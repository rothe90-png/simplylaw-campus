import { CourseCard } from "@/components/course-card";
import { EmptyState } from "@/components/empty-state";
import { PageHeading } from "@/components/page-heading";
import { getCourseSummaries } from "@/lib/queries";

export default async function CoursesPage() {
  const courses = await getCourseSummaries();

  return (
    <section className="container-shell py-8 sm:py-12">
      <div className="space-y-8">
        <PageHeading
          eyebrow="Kurse"
          title="SimplyLaw Kursübersicht"
          description="Alle Kurse im Campus. Angemeldete Nutzer sehen hier zusätzlich ihren Fortschritt."
        />

        {courses.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState title="Noch keine Kurse" description="Im Adminbereich können Kurse und Lektionen angelegt werden." />
        )}
      </div>
    </section>
  );
}
