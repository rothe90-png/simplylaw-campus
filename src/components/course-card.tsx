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
      className: "bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 text-white"
    };
  }

  if (value.includes("verkehr")) {
    return {
      label: "V",
      className: "bg-gradient-to-br from-sky-900 via-brand-800 to-cyan-700 text-white"
    };
  }

  if (value.includes("eingriff")) {
    return {
      label: "E",
      className: "bg-gradient-to-br from-slate-900 via-brand-900 to-slate-700 text-white"
    };
  }

  if (value.includes("staat")) {
    return {
      label: "GG",
      className: "bg-gradient-to-br from-indigo-950 via-brand-900 to-slate-800 text-white"
    };
  }

  return {
    label: "§",
    className: "bg-gradient-to-br from-brand-900 via-slate-900 to-violet-950 text-white"
  };
}

export function CourseCard({ course, actionLabel, compact, status }: CourseCardProps) {
  const isEnrolled = status ? status === "enrolled" : Boolean(course.enrollment);
  const visual = getCourseVisual(course);
  const label = actionLabel || (isEnrolled ? "Weiterlernen" : "Kurs ansehen");

  return (
    <Card className="flex h-full overflow-hidden rounded-[1.5rem] border-white/10 bg-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:border-brand/40 hover:bg-white/[0.08]">
      <div className={`relative flex h-36 items-center justify-center overflow-hidden ${visual.className}`}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.45))]" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl font-bold shadow-[0_0_40px_rgba(0,76,145,0.45)] backdrop-blur">
          <span>{visual.label}</span>
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
            <h2 className="text-xl font-bold text-white">{course.title}</h2>
            {!compact ? <p className="text-body-sm text-slate-400">{course.description}</p> : null}
          </div>

          {isEnrolled ? (
            <ProgressBar value={course.progress} label={`${course.completedLessons}/${course.lessonsCount} abgeschlossen`} size="sm" />
          ) : (
            <p className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-slate-400">
              Dieser Kurs ist vorbereitet und kann später freigeschaltet werden.
            </p>
          )}
        </div>

        <ButtonLink className="mt-auto" fullWidth variant={isEnrolled ? "primary" : "glass"} href={`/courses/${course.id}`}>
          {label}
        </ButtonLink>
      </div>
    </Card>
  );
}
