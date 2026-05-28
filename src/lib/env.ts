export function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing. Copy .env.example to .env.local.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

function normalizeUrl(url?: string | null) {
  const normalized = url?.trim().replace(/\/+$/, "");

  if (!normalized) {
    return "";
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `https://${normalized}`;
}

export function getSiteUrl() {
  return (
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeUrl(process.env.VERCEL_URL) ||
    "http://localhost:3000"
  );
}

export function getRequestOrigin(headerStore: Headers) {
  const origin = normalizeUrl(headerStore.get("origin"));

  if (origin) {
    return origin;
  }

  const forwardedHost = headerStore.get("x-forwarded-host") || headerStore.get("host");

  if (forwardedHost) {
    const forwardedProtocol = headerStore.get("x-forwarded-proto") || (forwardedHost.includes("localhost") ? "http" : "https");
    return normalizeUrl(`${forwardedProtocol}://${forwardedHost}`);
  }

  return getSiteUrl();
}
