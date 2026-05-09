import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const ACCESS_COOKIE = "sb-access-token";
const REFRESH_COOKIE = "sb-refresh-token";

function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Server Supabase env variables are missing.");
  }

  return { url, anonKey };
}

function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge ? { maxAge } : {})
  };
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar = cookies();
  jar.set(ACCESS_COOKIE, accessToken, cookieOptions(60 * 60));
  jar.set(REFRESH_COOKIE, refreshToken, cookieOptions(60 * 60 * 24 * 30));
}

export function clearAuthCookies() {
  const jar = cookies();
  jar.set(ACCESS_COOKIE, "", cookieOptions(1));
  jar.set(REFRESH_COOKIE, "", cookieOptions(1));
}

export function createAnonServerSupabase() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}

function createTokenServerSupabase(accessToken: string) {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
}

export async function getAuthedServerSupabase() {
  const jar = cookies();
  let accessToken = jar.get(ACCESS_COOKIE)?.value;
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return { error: "Unauthorized" as const, status: 401 };
  }

  if (accessToken) {
    const client = createTokenServerSupabase(accessToken);
    const { data, error } = await client.auth.getUser();
    if (!error && data.user) return { client, user: data.user, accessToken };
  }

  if (!refreshToken) {
    clearAuthCookies();
    return { error: "Unauthorized" as const, status: 401 };
  }

  const anon = createAnonServerSupabase();
  const refreshed = await anon.auth.refreshSession({ refresh_token: refreshToken });

  if (refreshed.error || !refreshed.data.session) {
    clearAuthCookies();
    return { error: "Unauthorized" as const, status: 401 };
  }

  accessToken = refreshed.data.session.access_token;
  setAuthCookies(accessToken, refreshed.data.session.refresh_token);

  const client = createTokenServerSupabase(accessToken);
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) {
    clearAuthCookies();
    return { error: "Unauthorized" as const, status: 401 };
  }

  return { client, user: data.user, accessToken };
}
