import Link from "next/link";
import type { ReactNode } from "react";
import { MobileNavigation } from "@/components/mobile-navigation";
import { cn } from "@/lib/cn";

type DashboardShellProps = {
  children: ReactNode;
  userName?: string;
  isAdmin?: boolean;
  active?: "dashboard" | "courses" | "admin";
};

export function DashboardShell({ children, userName, isAdmin, active = "dashboard" }: DashboardShellProps) {
  const navItems = [
    { href: "/dashboard", label: "Dashboard", key: "dashboard" },
    { href: "/courses", label: "Kurse", key: "courses" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", key: "admin" }] : [])
  ] as const;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper pb-20 md:pb-0">
      <div className="container-shell grid gap-6 py-6 md:grid-cols-[220px_1fr] lg:py-8">
        <aside className="hidden md:block">
          <div className="sticky top-24 rounded-ui border border-line bg-white p-3 shadow-card">
            <div className="border-b border-line px-3 py-4">
              <p className="text-xs font-bold uppercase text-brand">Campus</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">{userName || "SimplyLaw"}</p>
            </div>
            <nav className="mt-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-ui-sm px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-brand-50 hover:text-brand",
                    active === item.key && "bg-brand-50 text-brand"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link className="block rounded-ui-sm px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-ink" href="/auth/signout">
                Logout
              </Link>
            </nav>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
      <MobileNavigation isAdmin={isAdmin} active={active} />
    </div>
  );
}
