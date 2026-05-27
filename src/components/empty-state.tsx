import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";

type EmptyStateProps = {
  title: string;
  description: string;
  href?: string;
  action?: string;
  tone?: "light" | "dark";
};

export function EmptyState({ title, description, href, action, tone = "light" }: EmptyStateProps) {
  const isDark = tone === "dark";

  return (
    <Card className={isDark ? "border-dashed border-white/10 bg-white/[0.04] p-8 text-center shadow-none" : "border-dashed p-8 text-center"}>
      <h2 className={isDark ? "text-xl font-bold text-white" : "text-xl font-bold text-ink"}>{title}</h2>
      <p className={isDark ? "mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400" : "mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600"}>{description}</p>
      {href && action ? (
        <ButtonLink className="mt-5" href={href}>
          {action}
        </ButtonLink>
      ) : null}
    </Card>
  );
}
