"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    return await fetch(input, {
      ...init,
      signal: init?.signal ?? controller.signal
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

export function createBrowserSupabase() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase env variables are missing. Check .env.local.");
  }

  browserClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      lockAcquireTimeout: 3000,
      lock: async (_name, _acquireTimeout, fn) => fn()
    },
    global: {
      fetch: fetchWithTimeout
    }
  });

  return browserClient;
}
