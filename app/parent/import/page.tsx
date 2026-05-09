"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { Button, PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import { useState } from "react";

export default function ParentImportPage() {
  const { supabase, family, loading, error } = useFamily();
  const [message, setMessage] = useState<string | null>(null);

  async function seed() {
    const { error: rpcError } = await supabase.rpc("seed_demo_content");
    setMessage(rpcError ? rpcError.message : "Seed-данные добавлены: 30 слов, 10 фраз, 5 грамматических паттернов.");
  }

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? <NeedLogin /> : (
        <>
          <PageHeader title="Импорт" subtitle="Для MVP здесь доступна загрузка демонстрационного набора через Supabase RPC." />
          <Panel>
            <Button onClick={seed}>Добавить seed-карточки</Button>
            {message ? <p className="mt-4 rounded-lg bg-mint p-3">{message}</p> : null}
          </Panel>
        </>
      )}
    </AuthRequired>
  );
}
