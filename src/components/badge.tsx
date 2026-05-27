import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "brand" | "neutral" | "success" | "warning" | "danger";

const badgeClasses: Record<BadgeVariant, string> = {
  brand: "bg-brand-50 text-brand ring-brand-100",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-success ring-emerald-100",
  warning: "bg-amber-50 text-warning ring-amber-100",
  danger: "bg-red-50 text-red-700 ring-red-100"
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-ui-sm px-3 py-1 text-xs font-bold ring-1", badgeClasses[variant], className)}
      {...props}
    />
  );
}
