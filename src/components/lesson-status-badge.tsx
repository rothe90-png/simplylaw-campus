import { Badge } from "@/components/badge";
import type { LessonStatus } from "@/types/database";
import { statusLabel } from "@/lib/format";

type LessonStatusBadgeProps = {
  status: LessonStatus;
};

export function LessonStatusBadge({ status }: LessonStatusBadgeProps) {
  const variant = status === "completed" ? "success" : status === "started" ? "warning" : "neutral";

  return <Badge variant={variant}>{statusLabel(status)}</Badge>;
}
