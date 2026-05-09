"use client";

import { Button, PageHeader, Panel } from "@/components/ui";
import { useState } from "react";

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
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(false);

  async function runChecks() {
    setRunning(true);
    const nextChecks: Check[] = [
      { name: "App URL", status: "info", details: window.location.href },
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
        "Vercel API Auth health",
        () => fetch("/api/auth/health", { cache: "no-store" }).then(async (response) => ({ response, body: await response.json() })),
        ({ response, body }) => `HTTP ${response.status}: ${body.status ?? "no status"}${body.ms ? `, server ${body.ms} ms` : ""}`
      )
    );

    nextChecks.push(
      await timed(
        "Vercel API current session",
        () => fetch("/api/auth/me", { cache: "no-store", credentials: "include" }),
        (response) => (response.status === 401 ? "HTTP 401: no active session" : `HTTP ${response.status}`)
      )
    );

    setChecks(nextChecks);
    setRunning(false);
  }

  async function clearLocalData() {
    window.localStorage.clear();
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
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
        subtitle="Эта страница не показывает ключи и пароли. Браузер проверяет только Vercel API, а Vercel уже проверяет Supabase server-side."
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
