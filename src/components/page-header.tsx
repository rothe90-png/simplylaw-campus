import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-3xl space-y-3">
        {eyebrow ? <p className="text-sm font-bold uppercase text-brand">{eyebrow}</p> : null}
        <h1 className="text-3xl font-bold leading-tight text-ink sm:text-4xl">{title}</h1>
        {description ? <p className="text-body-base text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div> : null}
    </div>
  );
}
