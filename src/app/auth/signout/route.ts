import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase-route";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  const supabase = createSupabaseRouteClient(request, response);
  await supabase.auth.signOut();

  return response;
}
