import Link from "next/link";
import { cn } from "@/lib/cn";

type MobileNavigationProps = {
  isAdmin?: boolean;
  active?: "dashboard" | "courses" | "learning-plans" | "flashcards" | "profile" | "admin";
};

function NavIcon({ name }: { name: MobileNavigationProps["active"] }) {
  const base = "h-5 w-5";

  if (name === "courses") {
    return (
      <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 4.75h9.25A2.75 2.75 0 0 1 18 7.5v11.75H8.75A2.75 2.75 0 0 1 6 16.5V4.75Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.75 19.25A2.75 2.75 0 0 1 6 16.5V6.75" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "learning-plans") {
    return (
      <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 6.5h10M7 12h10M7 17.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="4" y="3.75" width="16" height="16.5" rx="3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "flashcards") {
    return (
      <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="6" width="12.5" height="12.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 6V5.5A2.5 2.5 0 0 1 10.5 3H17a2 2 0 0 1 2 2v8.5A2.5 2.5 0 0 1 16.5 16H16" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 12.25a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4.75 20.25a7.25 7.25 0 0 1 14.5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.75 11.25 12 5l7.25 6.25v7A1.75 1.75 0 0 1 17.5 20h-11a1.75 1.75 0 0 1-1.75-1.75v-7Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.25 20v-6.25h5.5V20" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function MobileNavigation({ isAdmin, active }: MobileNavigationProps) {
  const items = [
    { href: "/dashboard", label: "Home", key: "dashboard" },
    { href: "/courses", label: "Kurse", key: "courses" },
    { href: "/learning-plans", label: "Lernpläne", key: "learning-plans" },
    { href: "/flashcards", label: "Karten", key: "flashcards" },
    { href: "/profile", label: "Profil", key: "profile" }
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080d1a]/90 px-2 pb-3 pt-2 shadow-[0_-20px_45px_rgba(0,0,0,0.38)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[0.68rem] font-bold text-slate-500 transition hover:bg-white/10 hover:text-white",
              active === item.key && "bg-brand/25 text-white shadow-[0_0_24px_rgba(0,76,145,0.35)]"
            )}
          >
            <NavIcon name={item.key} />
            {item.label}
          </Link>
        ))}
      </div>
      {isAdmin ? <Link className="sr-only" href="/admin">Admin</Link> : null}
    </nav>
  );
}
