import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase-route";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const code = requestUrl.searchParams.get("code");
  const oauthError = requestUrl.searchParams.get("error_description") || requestUrl.searchParams.get("error");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, request.url));

  if (oauthError) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(oauthError)}`, request.url));
  }

  if (code) {
    const supabase = createSupabaseRouteClient(request, response);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const message = encodeURIComponent("Login-Link konnte nicht bestätigt werden.");
      return NextResponse.redirect(new URL(`/login?error=${message}`, request.url));
    }
  }

  if (!code) {
    const message = encodeURIComponent("Google Login konnte nicht abgeschlossen werden.");
    return NextResponse.redirect(new URL(`/login?error=${message}`, request.url));
  }

  return response;
}
