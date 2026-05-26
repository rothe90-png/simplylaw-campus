import Link from "next/link";
import type { CourseSummary } from "@/lib/queries";
import { ProgressBar } from "@/components/progress-bar";

type CourseCardProps = {
  course: CourseSummary;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="card flex h-full flex-col p-5">
      <div className="flex flex-1 flex-col gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-brand-light px-3 py-1 text-xs font-bold text-brand">{course.category}</span>
            <span className="text-xs font-semibold text-slate-500">{course.lessonsCount} Lektionen</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-ink">{course.title}</h2>
            <p className="text-sm leading-6 text-slate-600">{course.description}</p>
          </div>
        </div>

        <ProgressBar value={course.progress} label={`${course.completedLessons}/${course.lessonsCount} abgeschlossen`} />
      </div>

      <Link className="btn-primary mt-5 w-full" href={`/courses/${course.id}`}>
        Kurs öffnen
      </Link>
    </article>
  );
}
