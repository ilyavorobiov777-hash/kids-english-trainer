"use client";

import { Button, PageHeader, Panel } from "@/components/ui";
import { createBrowserSupabase, getSupabaseBrowserConfig } from "@/lib/supabase/client";
import { useMemo, useState } from "react";

type Check = {
  name: string;
  status: "ok" | "fail" | "info";
  details: string;
  ms?: number;
};

function safeError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function timed<T>(name: string, action: () => Promise<T>, describe: (value: T) => string): Promise<Check> {
  const started = performance.now();
  try {
    const value = await action();
    return { name, status: "ok", details: describe(value), ms: Math.round(performance.now() - started) };
  } catch (error) {
    return { name, status: "fail", details: safeError(error), ms: Math.round(performance.now() - started) };
  }
}

export default function DiagnosticsPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(false);

  async function runChecks() {
    setRunning(true);
    const { url, anonKey } = getSupabaseBrowserConfig();
    const supabaseHost = new URL(url).host;
    const nextChecks: Check[] = [
      { name: "App URL", status: "info", details: window.location.href },
      { name: "Supabase host", status: "info", details: supabaseHost },
      { name: "Browser online", status: navigator.onLine ? "ok" : "fail", details: navigator.onLine ? "online" : "offline" },
      { name: "Secure context", status: window.isSecureContext ? "ok" : "fail", details: window.isSecureContext ? "https/secure" : "not secure" },
      { name: "User agent", status: "info", details: navigator.userAgent }
    ];

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      nextChecks.push({
        name: "Service worker",
        status: "info",
        details: registrations.length
          ? registrations.map((registration) => registration.active?.scriptURL ?? registration.installing?.scriptURL ?? "registered").join(", ")
          : "no registrations"
      });
    } else {
      nextChecks.push({ name: "Service worker", status: "info", details: "not supported" });
    }

    if ("caches" in window) {
      const keys = await caches.keys();
      nextChecks.push({ name: "Cache storage", status: "info", details: keys.length ? keys.join(", ") : "empty" });
    }

    nextChecks.push(
      await timed(
        "Supabase Auth health",
        () => fetch(`${url}/auth/v1/health`, { cache: "no-store" }),
        (response) => `HTTP ${response.status}`
      )
    );

    nextChecks.push(
      await timed(
        "Supabase REST reachability",
        () =>
          fetch(`${url}/rest/v1/`, {
            cache: "no-store",
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${anonKey}`
            }
          }),
        (response) => `HTTP ${response.status}`
      )
    );

    nextChecks.push(
      await timed(
        "Supabase SDK getSession",
        () => supabase.auth.getSession(),
        (response) => (response.error ? `error: ${response.error.message}` : response.data.session ? "session found" : "no active session")
      )
    );

    setChecks(nextChecks);
    setRunning(false);
  }

  async function clearLocalData() {
    window.localStorage.clear();
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith("kids-english-trainer")).map((key) => caches.delete(key)));
    }
    setChecks([{ name: "Cleanup", status: "ok", details: "Local app data cleared. Close this tab, open the site again, and retry login." }]);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Диагностика входа"
        subtitle="Эта страница не показывает ключи и пароли. Она проверяет, видит ли устройство production-сайт и Supabase."
      />
      <Panel>
        <div className="flex flex-wrap gap-3">
          <Button disabled={running} onClick={runChecks} type="button">
            {running ? "Проверяем..." : "Запустить диагностику"}
          </Button>
          <Button className="bg-slate-700" disabled={running} onClick={clearLocalData} type="button">
            Очистить данные на устройстве
          </Button>
        </div>
        <div className="mt-5 grid gap-3">
          {checks.map((check) => (
            <div
              className={`rounded-lg border p-3 ${
                check.status === "ok" ? "border-mint bg-mint/20" : check.status === "fail" ? "border-berry bg-peach" : "border-slate-200 bg-slate-50"
              }`}
              key={check.name}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold">{check.name}</p>
                <p className="text-xs uppercase text-slate-500">
                  {check.status}
                  {typeof check.ms === "number" ? `, ${check.ms} ms` : ""}
                </p>
              </div>
              <p className="mt-2 break-words text-sm text-slate-700">{check.details}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
