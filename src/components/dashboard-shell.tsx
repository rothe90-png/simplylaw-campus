import Link from "next/link";
import type { ReactNode } from "react";
import { MobileNavigation } from "@/components/mobile-navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/cn";

type DashboardShellProps = {
  children: ReactNode;
  userName?: string;
  isAdmin?: boolean;
  active?: "dashboard" | "courses" | "learning-plans" | "flashcards" | "profile" | "admin";
};

export function DashboardShell({ children, userName, isAdmin, active = "dashboard" }: DashboardShellProps) {
  const navItems = [
    { href: "/dashboard", label: "Home", key: "dashboard" },
    { href: "/courses", label: "Kurse", key: "courses" },
    { href: "/learning-plans", label: "Lernpläne", key: "learning-plans" },
    { href: "/flashcards", label: "Karteikarten", key: "flashcards" },
    { href: "/profile", label: "Profil", key: "profile" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", key: "admin" }] : [])
  ] as const;

  return (
    <div className="min-h-screen bg-[#060a14] pb-24 text-white md:pb-0">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(0,76,145,0.32),transparent_55%),linear-gradient(135deg,rgba(0,76,145,0.18),rgba(93,63,211,0.12)_45%,transparent_80%)]" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-6 px-4 py-5 sm:px-6 md:grid-cols-[220px_1fr] lg:px-8 lg:py-8">
        <aside className="hidden md:block">
          <div className="sticky top-8 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-3 shadow-[0_22px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="border-b border-white/10 px-3 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-white shadow-[0_0_28px_rgba(0,76,145,0.45)]">SL</div>
              <p className="mt-4 text-xs font-bold uppercase text-brand-200">SimplyLaw Campus</p>
              <p className="mt-1 text-sm font-semibold text-slate-400">{userName || "SimplyLaw"}</p>
            </div>
            <nav className="mt-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    "block rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-400 transition hover:bg-white/10 hover:text-white",
                    active === item.key && "bg-brand/25 text-white shadow-[0_0_24px_rgba(0,76,145,0.28)]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <SignOutButton className="block w-full rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-slate-500 transition hover:bg-white/10 hover:text-white">
                Logout
              </SignOutButton>
            </nav>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
      <MobileNavigation isAdmin={isAdmin} active={active} />
    </div>
  );
}
