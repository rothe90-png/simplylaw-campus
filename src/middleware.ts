import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { COMING_SOON_MODE } from "@/lib/site-mode";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const publicComingSoonPaths = new Set(["/", "/login", "/auth/callback", "/auth/signout"]);
const hiddenComingSoonPaths = new Set(["/register", "/reset-password", "/update-password"]);
const internalProtectedPrefixes = ["/dashboard", "/courses", "/admin", "/learning-plans", "/flashcards", "/profile", "/onboarding"];

function isInternalPath(pathname: string) {
  return internalProtectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  let pendingCookies: CookieToSet[] = [];

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        pendingCookies = cookiesToSet;
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  function redirectWithSessionCookies(path: string) {
    const redirectResponse = NextResponse.redirect(new URL(path, request.url));
    pendingCookies.forEach(({ name, value, options }) => redirectResponse.cookies.set(name, value, options));
    return redirectResponse;
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  let hasSessionCookie = Boolean(user);

  if (!hasSessionCookie && userError) {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    hasSessionCookie = Boolean(session);
  }

  const pathname = request.nextUrl.pathname;
  const isProtectedPath = isInternalPath(pathname);

  if (pathname === "/login" && user) {
    return redirectWithSessionCookies("/dashboard");
  }

  if (isProtectedPath && !hasSessionCookie) {
    return redirectWithSessionCookies("/login");
  }

  if (COMING_SOON_MODE) {
    if (hiddenComingSoonPaths.has(pathname)) {
      return redirectWithSessionCookies("/");
    }

    if (publicComingSoonPaths.has(pathname)) {
      return response;
    }

    if (!hasSessionCookie) {
      return redirectWithSessionCookies("/login");
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
