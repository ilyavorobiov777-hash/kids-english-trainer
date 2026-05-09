"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import { useEffect, useState } from "react";

type GrammarPattern = {
  id: string;
  title: string;
  pattern: string;
  explanation_ru: string | null;
  example_en: string | null;
  example_ru: string | null;
};

export default function GrammarPage() {
  const { api, family, loading, error } = useFamily();
  const [items, setItems] = useState<GrammarPattern[]>([]);

  useEffect(() => {
    async function load() {
      if (!family) return;
      const { data } = await api.from("grammar_patterns").select("*").eq("family_id", family.familyId).order("title");
      setItems((data ?? []) as GrammarPattern[]);
    }
    void load();
  }, [family, api]);

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? <NeedLogin /> : (
        <>
          <PageHeader title="Грамматика" subtitle="Короткие семейные подсказки по паттернам из карточек." />
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((item) => (
              <Panel key={item.id}>
                <h2 className="text-xl font-bold">{item.title}</h2>
                <p className="mt-2 rounded-lg bg-slate-50 p-3 font-mono text-sm">{item.pattern}</p>
                <p className="mt-3 text-slate-700">{item.explanation_ru}</p>
                <p className="mt-3 font-semibold">{item.example_en}</p>
                <p className="text-slate-500">{item.example_ru}</p>
              </Panel>
            ))}
            {!items.length ? <Panel>Грамматические паттерны появятся после seed или ручного добавления.</Panel> : null}
          </div>
        </>
      )}
    </AuthRequired>
  );
}
