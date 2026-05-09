"use client";

type ApiResponse<T = any> = {
  data: T | null;
  error: { message: string; code?: string } | null;
  count?: number | null;
  status?: number;
};

type Filter = { op: "eq" | "in" | "match"; column?: string; value: unknown; values?: unknown[] };
type Order = { column: string; ascending?: boolean };

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok && !("error" in body)) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return body as T;
}

class QueryBuilder<T = any> implements PromiseLike<ApiResponse<T>> {
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private maxRows?: number;
  private selected = "*";
  private wantSingle = false;
  private wantMaybeSingle = false;
  private count?: "exact";
  private head?: boolean;
  private conflict?: string;

  constructor(
    private readonly table: string,
    private readonly operation: "select" | "insert" | "update" | "delete" | "upsert" = "select",
    private readonly payload?: unknown
  ) {}

  select(columns = "*", options?: { count?: "exact"; head?: boolean }) {
    this.selected = columns;
    this.count = options?.count;
    this.head = options?.head;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ op: "eq", column, value });
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push({ op: "in", column, values, value: null });
    return this;
  }

  match(value: Record<string, unknown>) {
    this.filters.push({ op: "match", value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending });
    return this;
  }

  limit(count: number) {
    this.maxRows = count;
    return this;
  }

  single() {
    this.wantSingle = true;
    return this;
  }

  maybeSingle() {
    this.wantMaybeSingle = true;
    return this;
  }

  onConflict(value?: string) {
    this.conflict = value;
    return this;
  }

  private execute(): Promise<ApiResponse<T>> {
    return apiFetch<ApiResponse<T>>(`/api/db/${this.table}`, {
      method: "POST",
      body: JSON.stringify({
        operation: this.operation,
        select: this.selected,
        filters: this.filters,
        order: this.orders,
        limit: this.maxRows,
        single: this.wantSingle,
        maybeSingle: this.wantMaybeSingle,
        count: this.count,
        head: this.head,
        payload: this.payload,
        onConflict: this.conflict
      })
    });
  }

  then<TResult1 = ApiResponse<T>, TResult2 = never>(
    onfulfilled?: ((value: ApiResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export function createApiClient() {
  return {
    from(table: string) {
      return {
        select: (columns = "*", options?: { count?: "exact"; head?: boolean }) => new QueryBuilder(table).select(columns, options),
        insert: (payload: unknown) => new QueryBuilder(table, "insert", payload),
        update: (payload: unknown) => new QueryBuilder(table, "update", payload),
        delete: () => new QueryBuilder(table, "delete"),
        upsert: (payload: unknown, options?: { onConflict?: string }) => new QueryBuilder(table, "upsert", payload).onConflict(options?.onConflict)
      };
    },
    rpc(name: string, args?: Record<string, unknown>) {
      return apiFetch<ApiResponse>(`/api/rpc/${name}`, {
        method: "POST",
        body: JSON.stringify(args ?? {})
      });
    },
    auth: {
      async signOut() {
        return apiFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
      }
    }
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

export async function getCurrentFamily() {
  const response = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
  if (response.status === 401) return { family: null, error: null };
  const body = await response.json().catch(() => ({}));
  if (!response.ok) return { family: null, error: body.error ?? "Unable to load session." };
  return { family: body.family ?? null, error: null };
}

export async function postAuth(path: "/api/auth/login" | "/api/auth/signup", payload: unknown) {
  return apiFetch<{ user?: { id: string; email?: string }; needsEmailConfirmation?: boolean; error?: string }>(path, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
