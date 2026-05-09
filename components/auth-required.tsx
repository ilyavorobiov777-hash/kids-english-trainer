"use client";

import Link from "next/link";
import { Panel } from "@/components/ui";

export function AuthRequired({ loading, error, children }: { loading: boolean; error?: string | null; children: React.ReactNode }) {
  if (loading) return <Panel>Загружаем семейные данные...</Panel>;
  if (error) return <Panel className="text-berry">Ошибка: {error}</Panel>;
  return <>{children}</>;
}

export function NeedLogin() {
  return (
    <Panel>
      <p className="mb-4 font-medium">Нужно войти как родитель.</p>
      <Link className="rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/login">
        Перейти ко входу
      </Link>
    </Panel>
  );
}
