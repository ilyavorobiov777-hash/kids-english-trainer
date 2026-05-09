"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { CsvImporter } from "@/components/csv-importer";
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
          <PageHeader
            title="Импорт"
            subtitle="Загрузите CSV, проверьте preview, исправьте ошибки и сохраните карточки в Supabase."
          />
          <div className="grid gap-5">
            <CsvImporter supabase={supabase} familyId={family.familyId} userId={family.userId} />
            <Panel>
              <h2 className="mb-3 text-lg font-bold">Демо-набор</h2>
              <Button onClick={seed}>Добавить seed-карточки</Button>
              {message ? <p className="mt-4 rounded-lg bg-mint p-3">{message}</p> : null}
            </Panel>
          </div>
        </>
      )}
    </AuthRequired>
  );
}
