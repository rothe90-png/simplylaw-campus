import Link from "next/link";
import { cn } from "@/lib/cn";

type MobileNavigationProps = {
  isAdmin?: boolean;
  active?: "dashboard" | "courses" | "admin";
};

export function MobileNavigation({ isAdmin, active }: MobileNavigationProps) {
  const items = [
    { href: "/dashboard", label: "Dashboard", key: "dashboard" },
    { href: "/courses", label: "Kurse", key: "courses" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", key: "admin" }] : [])
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-3 py-2 shadow-card backdrop-blur md:hidden">
      <div className={cn("mx-auto grid max-w-md gap-2", items.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-ui-sm px-3 py-2 text-center text-xs font-bold text-slate-600 transition hover:bg-brand-50 hover:text-brand",
              active === item.key && "bg-brand-50 text-brand"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
