import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionTitleProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  tone?: "light" | "dark";
};

export function SectionTitle({ title, description, action, className, tone = "light" }: SectionTitleProps) {
  const isDark = tone === "dark";

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-1">
        <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-ink")}>{title}</h2>
        {description ? <p className={cn("text-body-sm", isDark ? "text-slate-400" : "text-slate-600")}>{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
