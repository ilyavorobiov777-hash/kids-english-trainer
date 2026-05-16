import { getAuthedServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const allowedRpcs = new Set([
  "seed_demo_content",
  "seed_starter_learning_content",
  "seed_starter_texts",
  "seed_demonstratives_content",
  "seed_ing_time_content",
  "seed_pronouns_content"
]);

export async function POST(request: Request, { params }: { params: { name: string } }) {
  if (!allowedRpcs.has(params.name)) {
    return NextResponse.json({ error: "RPC is not allowed." }, { status: 400 });
  }

  const auth = await getAuthedServerSupabase();
  if (!("client" in auth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const client = auth.client;
  if (!client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const result = await client.rpc(params.name, body);

  return NextResponse.json({
    data: result.data ?? null,
    error: result.error ? { message: result.error.message, code: result.error.code } : null,
    status: result.status
  });
}
