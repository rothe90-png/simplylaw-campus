import { cn } from "@/lib/cn";

type ProgressBarProps = {
  value: number;
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

export function ProgressBar({ value, label, size = "md", className }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-400">
        <span>{label || "Fortschritt"}</span>
        <span>{safeValue}%</span>
      </div>
      <div className={cn("overflow-hidden rounded-full bg-white/10", size === "sm" ? "h-2" : "h-3")}>
        <div className="h-full rounded-full bg-gradient-to-r from-brand to-violet-500" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
