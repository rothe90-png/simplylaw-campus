import type { CourseSummary } from "@/lib/queries";
import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";
import { ProgressBar } from "@/components/progress-bar";

type CourseCardProps = {
  course: CourseSummary;
  actionLabel?: string;
  compact?: boolean;
  status?: "enrolled" | "locked";
};

function getCourseVisual(course: CourseSummary) {
  const value = `${course.title} ${course.category}`.toLowerCase();

  if (value.includes("straf")) {
    return {
      label: "StGB",
      className: "bg-gradient-to-br from-brand-700 to-brand-500 text-white"
    };
  }

  if (value.includes("verkehr")) {
    return {
      label: "V",
      className: "bg-gradient-to-br from-sky-100 to-cyan-50 text-brand"
    };
  }

  if (value.includes("eingriff")) {
    return {
      label: "E",
      className: "bg-gradient-to-br from-slate-200 to-brand-50 text-brand"
    };
  }

  if (value.includes("staat")) {
    return {
      label: "GG",
      className: "bg-gradient-to-br from-indigo-100 to-slate-50 text-brand"
    };
  }

  return {
    label: "§",
    className: "bg-gradient-to-br from-brand-50 to-white text-brand"
  };
}

export function CourseCard({ course, actionLabel, compact, status }: CourseCardProps) {
  const isEnrolled = status ? status === "enrolled" : Boolean(course.enrollment);
  const visual = getCourseVisual(course);
  const label = actionLabel || (isEnrolled ? "Weiterlernen" : "Kurs ansehen");

  return (
    <Card className="flex h-full overflow-hidden rounded-ui-lg transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-soft">
      <div className={`flex h-32 items-center justify-center ${visual.className}`}>
        <div className="flex h-16 w-16 items-center justify-center rounded-ui-lg bg-white/80 text-2xl font-bold shadow-card backdrop-blur">
          {visual.label}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">{course.category}</Badge>
            {!isEnrolled ? <Badge variant="neutral">Noch nicht freigeschaltet</Badge> : null}
            <span className="text-xs font-semibold text-slate-500">{course.lessonsCount} Lektionen</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-ink">{course.title}</h2>
            {!compact ? <p className="text-body-sm text-slate-600">{course.description}</p> : null}
          </div>

          {isEnrolled ? (
            <ProgressBar value={course.progress} label={`${course.completedLessons}/${course.lessonsCount} abgeschlossen`} size="sm" />
          ) : (
            <p className="rounded-ui-sm bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
              Dieser Kurs ist vorbereitet und kann später freigeschaltet werden.
            </p>
          )}
        </div>

        <ButtonLink className="mt-auto" fullWidth variant={isEnrolled ? "primary" : "secondary"} href={`/courses/${course.id}`}>
          {label}
        </ButtonLink>
      </div>
    </Card>
  );
}
