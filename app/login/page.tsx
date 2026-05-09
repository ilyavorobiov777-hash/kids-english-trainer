"use client";

import { Button, Field, Input, PageHeader, Panel } from "@/components/ui";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const AUTH_TIMEOUT_MS = 20000;

function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(message)), AUTH_TIMEOUT_MS);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timeout));
  });
}

export default function LoginPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [familyName, setFamilyName] = useState("Моя семья");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await withTimeout(
        mode === "login"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({
              email,
              password,
              options: { data: { display_name: displayName || email, family_name: familyName || "Моя семья" } }
            }),
        "Не удалось дождаться ответа от Supabase. Проверьте интернет и попробуйте еще раз."
      );

      if (response.error) {
        setMessage(response.error.message);
        return;
      }

      if (mode === "signup" && !response.data.session) {
        setMessage("Проверьте email для подтверждения аккаунта, если оно включено в Supabase.");
        return;
      }

      router.replace("/parent/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось войти. Проверьте интернет и попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  }

  async function resetLocalSession() {
    setLoading(true);
    setMessage(null);
    try {
      await withTimeout(supabase.auth.signOut({ scope: "local" }), "Не удалось очистить локальную сессию.");
      setMessage("Локальная сессия очищена. Попробуйте войти еще раз.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось очистить локальную сессию.");
    } finally {
      setLoading(false);
    }
  }

  async function clearAppStorage() {
    setLoading(true);
    setMessage(null);
    try {
      window.localStorage.clear();

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith("kids-english-trainer")).map((key) => caches.delete(key)));
      }

      setMessage("Данные приложения на этом устройстве очищены. Обновите страницу и войдите снова.");
    } catch {
      setMessage("Не удалось полностью очистить данные. Закройте вкладку, откройте сайт заново и попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="py-8">
        <PageHeader
          title="Английский, который ребенок может потрогать"
          subtitle="MVP для семьи: родитель создает карточки, ребенок выбирает профиль и проходит короткие тренировки с озвучкой."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <Panel>
            <b>1.</b>
            <br />
            Создайте аккаунт родителя
          </Panel>
          <Panel>
            <b>2.</b>
            <br />
            Добавьте ребенка и карточки
          </Panel>
          <Panel>
            <b>3.</b>
            <br />
            Запустите тренировку
          </Panel>
        </div>
      </div>
      <Panel>
        <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          <button className={`rounded-md py-2 font-semibold ${mode === "login" ? "bg-white shadow-sm" : ""}`} onClick={() => setMode("login")} type="button">
            Вход
          </button>
          <button className={`rounded-md py-2 font-semibold ${mode === "signup" ? "bg-white shadow-sm" : ""}`} onClick={() => setMode("signup")} type="button">
            Регистрация
          </button>
        </div>
        <form className="grid gap-4" onSubmit={submit}>
          {mode === "signup" ? (
            <>
              <Field label="Ваше имя">
                <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Анна" />
              </Field>
              <Field label="Название семьи">
                <Input value={familyName} onChange={(event) => setFamilyName(event.target.value)} />
              </Field>
            </>
          ) : null}
          <Field label="Email">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </Field>
          <Field label="Пароль">
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={6} required />
          </Field>
          <Button disabled={loading} type="submit">
            {loading ? "Подождите..." : mode === "login" ? "Войти" : "Создать аккаунт"}
          </Button>
          {message ? <p className="rounded-lg bg-peach p-3 text-sm">{message}</p> : null}
        </form>
        <div className="mt-4 grid gap-2 text-sm text-slate-600">
          <button className="text-left font-semibold text-ink underline" disabled={loading} onClick={resetLocalSession} type="button">
            Не входит на этом устройстве? Очистить локальную сессию
          </button>
          <button className="text-left font-semibold text-ink underline" disabled={loading} onClick={clearAppStorage} type="button">
            Полностью очистить данные приложения на этом устройстве
          </button>
        </div>
      </Panel>
    </div>
  );
}
