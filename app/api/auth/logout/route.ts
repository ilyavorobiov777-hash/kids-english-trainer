import { clearAuthCookies, getAuthedServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const auth = await getAuthedServerSupabase();
  if ("client" in auth && auth.client) {
    await auth.client.auth.signOut().catch(() => undefined);
  }
  clearAuthCookies();
  return NextResponse.json({ ok: true });
}
