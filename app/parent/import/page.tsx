"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { CsvImporter } from "@/components/csv-importer";
import { Button, PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import { useState } from "react";

type StarterSeedResult = {
  inserted_cards?: number;
  total_cards?: number;
  inserted_grammar_patterns?: number;
  total_grammar_patterns?: number;
};

export default function ParentImportPage() {
  const { supabase, family, loading, error } = useFamily();
  const [message, setMessage] = useState<string | null>(null);

  async function seedDemo() {
    const { error: rpcError } = await supabase.rpc("seed_demo_content");
    setMessage(rpcError ? rpcError.message : "Демо-набор добавлен: 30 слов, 10 фраз, 5 грамматических паттернов.");
  }

  async function seedStarterContent() {
    const { data, error: rpcError } = await supabase.rpc("seed_starter_learning_content");
    if (rpcError) {
      setMessage(rpcError.message);
      return;
    }
    const result = data as StarterSeedResult | null;
    setMessage(
      `Starter 350 загружен: добавлено карточек ${result?.inserted_cards ?? 0}, всего карточек ${result?.total_cards ?? 0}, добавлено grammar patterns ${result?.inserted_grammar_patterns ?? 0}, всего grammar patterns ${result?.total_grammar_patterns ?? 0}.`
    );
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
              <h2 className="mb-3 text-lg font-bold">Стартовые наборы</h2>
              <div className="flex flex-wrap gap-3">
                <Button onClick={seedDemo}>Добавить демо-набор</Button>
                <Button className="bg-berry" onClick={seedStarterContent}>Добавить Starter 350</Button>
              </div>
              {message ? <p className="mt-4 rounded-lg bg-mint p-3">{message}</p> : null}
            </Panel>
          </div>
        </>
      )}
    </AuthRequired>
  );
}
