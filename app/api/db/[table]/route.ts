import { getAuthedServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type Filter = { op: "eq" | "in" | "match"; column?: string; value: unknown; values?: unknown[] };
type Order = { column: string; ascending?: boolean };
type DbPayload = {
  select?: string;
  filters?: Filter[];
  order?: Order[];
  limit?: number;
  single?: boolean;
  maybeSingle?: boolean;
  count?: "exact";
  head?: boolean;
  payload?: unknown;
  onConflict?: string;
};

const allowedTables = new Set([
  "families",
  "profiles",
  "children",
  "courses",
  "sources",
  "units",
  "lessons",
  "topics",
  "decks",
  "cards",
  "grammar_patterns",
  "dialogues",
  "practice_sessions",
  "practice_attempts",
  "review_schedule",
  "rewards",
  "learning_texts"
]);

function applyFilters(query: any, filters: Filter[] = []) {
  let next = query;
  for (const filter of filters) {
    if (filter.op === "eq" && filter.column) next = next.eq(filter.column, filter.value);
    if (filter.op === "in" && filter.column) next = next.in(filter.column, filter.values ?? []);
    if (filter.op === "match") next = next.match(filter.value as Record<string, unknown>);
  }
  return next;
}

function applyReadModifiers(query: any, body: DbPayload) {
  let next = applyFilters(query, body.filters);
  for (const order of body.order ?? []) {
    next = next.order(order.column, { ascending: order.ascending ?? true });
  }
  if (typeof body.limit === "number") next = next.limit(body.limit);
  if (body.single) next = next.single();
  if (body.maybeSingle) next = next.maybeSingle();
  return next;
}

async function run(table: string, operation: "select" | "insert" | "update" | "delete" | "upsert", body: DbPayload) {
  if (!allowedTables.has(table)) {
    return NextResponse.json({ error: "Table is not allowed." }, { status: 400 });
  }

  const auth = await getAuthedServerSupabase();
  if (!("client" in auth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const client = auth.client;
  if (!client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query: any;
  if (operation === "select") {
    query = client.from(table).select(body.select ?? "*", { count: body.count, head: body.head });
    query = applyReadModifiers(query, body);
  } else if (operation === "insert") {
    query = client.from(table).insert(body.payload as any);
    if (body.select) query = query.select(body.select);
    if (body.single) query = query.single();
  } else if (operation === "update") {
    query = client.from(table).update(body.payload as any);
    query = applyFilters(query, body.filters);
    if (body.select) query = query.select(body.select);
    if (body.single) query = query.single();
  } else if (operation === "delete") {
    query = client.from(table).delete();
    query = applyFilters(query, body.filters);
  } else {
    query = client.from(table).upsert(body.payload as any, body.onConflict ? { onConflict: body.onConflict } : undefined);
    if (body.select) query = query.select(body.select);
    if (body.single) query = query.single();
  }

  const result = await query;
  return NextResponse.json({
    data: result.data ?? null,
    error: result.error ? { message: result.error.message, code: result.error.code } : null,
    count: result.count ?? null,
    status: result.status
  });
}

export async function POST(request: Request, { params }: { params: { table: string } }) {
  const body = (await request.json()) as DbPayload & { operation?: "select" | "insert" | "update" | "delete" | "upsert" };
  return run(params.table, body.operation ?? "select", body);
}
