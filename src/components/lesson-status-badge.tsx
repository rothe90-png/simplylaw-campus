import type { LessonStatus } from "@/types/database";
import { statusLabel } from "@/lib/format";

type LessonStatusBadgeProps = {
  status: LessonStatus;
};

export function LessonStatusBadge({ status }: LessonStatusBadgeProps) {
  const className =
    status === "completed"
      ? "bg-emerald-50 text-success ring-emerald-100"
      : status === "started"
        ? "bg-amber-50 text-warning ring-amber-100"
        : "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span className={`rounded-md px-3 py-1 text-xs font-bold ring-1 ${className}`}>
      {statusLabel(status)}
    </span>
  );
}
