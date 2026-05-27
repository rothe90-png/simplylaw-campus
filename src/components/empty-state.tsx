import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";

type EmptyStateProps = {
  title: string;
  description: string;
  href?: string;
  action?: string;
};

export function EmptyState({ title, description, href, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed p-8 text-center">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      {href && action ? (
        <ButtonLink className="mt-5" href={href}>
          {action}
        </ButtonLink>
      ) : null}
    </Card>
  );
}
