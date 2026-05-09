"use client";

import { Button, Field, Input, PageHeader, Panel } from "@/components/ui";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

    const response =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: displayName || email, family_name: familyName || "Моя семья" } }
          });

    setLoading(false);
    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    if (mode === "signup" && !response.data.session) {
      setMessage("Проверьте email для подтверждения аккаунта, если оно включено в Supabase.");
      return;
    }

    router.push("/parent/dashboard");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="py-8">
        <PageHeader title="Английский, который ребенок может потрогать" subtitle="MVP для семьи: родитель создает карточки, ребенок выбирает профиль и проходит короткие тренировки с озвучкой." />
        <div className="grid gap-3 sm:grid-cols-3">
          <Panel><b>1.</b><br />Создайте аккаунт родителя</Panel>
          <Panel><b>2.</b><br />Добавьте ребенка и карточки</Panel>
          <Panel><b>3.</b><br />Запустите тренировку</Panel>
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
              <Field label="Ваше имя"><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Анна" /></Field>
              <Field label="Название семьи"><Input value={familyName} onChange={(e) => setFamilyName(e.target.value)} /></Field>
            </>
          ) : null}
          <Field label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></Field>
          <Field label="Пароль"><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required /></Field>
          <Button disabled={loading}>{loading ? "Подождите..." : mode === "login" ? "Войти" : "Создать аккаунт"}</Button>
          {message ? <p className="rounded-lg bg-peach p-3 text-sm">{message}</p> : null}
        </form>
      </Panel>
    </div>
  );
}
