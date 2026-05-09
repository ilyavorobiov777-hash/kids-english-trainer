import { getAuthedServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await getAuthedServerSupabase();
  if (!("client" in auth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const client = auth.client;
  const user = auth.user;
  if (!client || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await client
    .from("profiles")
    .select("family_id, display_name")
    .eq("auth_user_id", user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: error?.message ?? "Profile not found." }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email
    },
    family: {
      userId: user.id,
      familyId: profile.family_id,
      displayName: profile.display_name
    }
  });
}
