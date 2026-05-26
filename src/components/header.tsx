import Link from "next/link";
import { getCurrentUserAndProfile } from "@/lib/auth";

export async function Header() {
  let isSignedIn = false;
  let isAdmin = false;

  try {
    const { user, profile } = await getCurrentUserAndProfile();
    isSignedIn = Boolean(user);
    isAdmin = profile?.role === "admin";
  } catch {
    isSignedIn = false;
    isAdmin = false;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-shell flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label="SimplyLaw Campus Startseite">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand text-sm font-bold text-white">
            SL
          </span>
          <span className="text-base font-bold text-ink">SimplyLaw Campus</span>
        </Link>

        <nav className="flex items-center gap-2 overflow-x-auto text-sm font-semibold text-slate-700">
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-brand" href="/courses">
            Kurse
          </Link>
          {isSignedIn ? (
            <>
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-brand" href="/dashboard">
                Dashboard
              </Link>
              {isAdmin ? (
                <Link className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-brand" href="/admin">
                  Admin
                </Link>
              ) : null}
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-brand" href="/auth/signout">
                Logout
              </Link>
            </>
          ) : (
            <Link className="rounded-md px-3 py-2 text-brand hover:bg-brand-light" href="/login">
              Einloggen
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
