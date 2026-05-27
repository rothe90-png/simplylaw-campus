import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  tone?: "light" | "dark";
};

export function PageHeader({ eyebrow, title, description, actions, className, tone = "light" }: PageHeaderProps) {
  const isDark = tone === "dark";

  return (
    <div className={cn("flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-3xl space-y-3">
        {eyebrow ? <p className={cn("text-sm font-bold uppercase", isDark ? "text-brand-200" : "text-brand")}>{eyebrow}</p> : null}
        <h1 className={cn("text-3xl font-bold leading-tight sm:text-4xl", isDark ? "text-white" : "text-ink")}>{title}</h1>
        {description ? <p className={cn("text-body-base", isDark ? "text-slate-400" : "text-slate-600")}>{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div> : null}
    </div>
  );
}
