"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase env variables are missing. Check .env.local.");
  }

  return { url, anonKey };
}

export function createBrowserSupabase() {
  if (browserClient) return browserClient;

  const { url, anonKey } = getSupabaseBrowserConfig();

  browserClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      lockAcquireTimeout: 3000,
      lock: async (_name, _acquireTimeout, fn) => fn()
    }
  });

  return browserClient;
}
