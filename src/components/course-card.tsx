import type { CourseSummary } from "@/lib/queries";
import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";
import { ProgressBar } from "@/components/progress-bar";

type CourseCardProps = {
  course: CourseSummary;
  actionLabel?: string;
  compact?: boolean;
};

export function CourseCard({ course, actionLabel = "Kurs öffnen", compact }: CourseCardProps) {
  return (
    <Card className="flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-soft">
      <div className="flex flex-1 flex-col gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">{course.category}</Badge>
            <span className="text-xs font-semibold text-slate-500">{course.lessonsCount} Lektionen</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-ink">{course.title}</h2>
            {!compact ? <p className="text-body-sm text-slate-600">{course.description}</p> : null}
          </div>
        </div>

        <ProgressBar value={course.progress} label={`${course.completedLessons}/${course.lessonsCount} abgeschlossen`} size="sm" />
      </div>

      <ButtonLink className="mt-5" fullWidth href={`/courses/${course.id}`}>
        {actionLabel}
      </ButtonLink>
    </Card>
  );
}
