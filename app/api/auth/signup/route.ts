import { createAnonServerSupabase, setAuthCookies } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password, displayName, familyName } = (await request.json()) as {
    email?: string;
    password?: string;
    displayName?: string;
    familyName?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const supabase = createAnonServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email,
        family_name: familyName || "Моя семья"
      }
    }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.session) {
    setAuthCookies(data.session.access_token, data.session.refresh_token);
  }

  return NextResponse.json({
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email
        }
      : null,
    needsEmailConfirmation: !data.session
  });
}
