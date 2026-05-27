"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/env";

export function createSupabaseBrowserClient(): SupabaseClient<Database, "public"> {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey) as unknown as SupabaseClient<Database, "public">;
}
