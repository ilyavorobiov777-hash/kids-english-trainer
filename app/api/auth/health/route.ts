import { createAnonServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const started = Date.now();

  try {
    const supabase = createAnonServerSupabase();
    const { error } = await supabase.from("profiles").select("id", { count: "exact", head: true });

    return NextResponse.json({
      ok: !error,
      status: error ? "Supabase reachable, query failed" : "Server can reach Supabase",
      error: error?.message ?? null,
      ms: Date.now() - started
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: "Server cannot reach Supabase",
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - started
      },
      { status: 503 }
    );
  }
}
