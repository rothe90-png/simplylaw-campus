import Link from "next/link";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { cn } from "@/lib/cn";

export type AdminSection =
  | "overview"
  | "courses"
  | "media"
  | "quizzes"
  | "users"
  | "entitlements"
  | "payments";

type AdminShellProps = {
  children: ReactNode;
  userName?: string;
  active: AdminSection;
};

const adminNav: { href: string; label: string; key: AdminSection; description: string }[] = [
  { href: "/admin", label: "Übersicht", key: "overview", description: "CMS-Zentrale" },
  { href: "/admin/courses", label: "Kurse", key: "courses", description: "Kurse, Module, Lektionen" },
  { href: "/admin/media", label: "Medien", key: "media", description: "Bilder, PDFs, Videos" },
  { href: "/admin/quizzes", label: "Quiz", key: "quizzes", description: "Fragen und Tests" },
  { href: "/admin/users", label: "Nutzer", key: "users", description: "Rollen und Support" },
  { href: "/admin/entitlements", label: "Freischaltungen", key: "entitlements", description: "Zugriffe vorbereiten" },
  { href: "/admin/payments", label: "Zahlungen", key: "payments", description: "Abo später" }
];

export function AdminShell({ children, userName, active }: AdminShellProps) {
  return (
    <DashboardShell userName={userName} isAdmin active="admin">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-3 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-4 lg:grid-cols-7">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "min-w-40 rounded-[1.15rem] border border-transparent px-3 py-3 transition hover:border-white/15 hover:bg-white/10",
                  active === item.key &&
                    "border-brand-300/30 bg-[linear-gradient(135deg,rgba(0,76,145,0.42),rgba(93,63,211,0.22))] shadow-[0_0_28px_rgba(0,76,145,0.24)]"
                )}
              >
                <p className="text-sm font-bold text-white">{item.label}</p>
                <p className="mt-1 text-xs font-semibold leading-4 text-slate-400">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
        {children}
      </div>
    </DashboardShell>
  );
}

export function AdminPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[1.6rem] border border-white/10 bg-[#111827]/78 p-4 shadow-[0_20px_65px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminKicker({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-100">{children}</p>;
}
