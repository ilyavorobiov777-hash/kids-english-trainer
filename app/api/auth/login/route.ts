import { createAnonServerSupabase, setAuthCookies } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const supabase = createAnonServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Login failed." }, { status: 401 });
  }

  setAuthCookies(data.session.access_token, data.session.refresh_token);

  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email
    }
  });
}
