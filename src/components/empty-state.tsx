import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  href?: string;
  action?: string;
};

export function EmptyState({ title, description, href, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      {href && action ? (
        <Link className="btn-primary mt-5" href={href}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}
