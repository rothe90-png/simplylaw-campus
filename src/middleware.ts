import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import type { Database, Profile } from "@/types/database";
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

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtectedPath = isInternalPath(pathname);
  const isOnboardingPath = pathname === "/onboarding";
  let onboardingCompleted = false;

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    const onboardingProfile = profile as Pick<Profile, "onboarding_completed"> | null;

    onboardingCompleted = Boolean(onboardingProfile?.onboarding_completed);
  }

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL(onboardingCompleted ? "/dashboard" : "/onboarding", request.url));
  }

  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isProtectedPath && !isOnboardingPath && !onboardingCompleted) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (user && isOnboardingPath && onboardingCompleted) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (COMING_SOON_MODE) {
    if (hiddenComingSoonPaths.has(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (publicComingSoonPaths.has(pathname)) {
      return response;
    }

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
