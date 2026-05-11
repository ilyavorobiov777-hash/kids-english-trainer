"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import Link from "next/link";
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
          <Panel className="mb-5 bg-skysoft">
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h2 className="text-2xl font-bold">This / that / these / those</h2>
                <p className="mt-3 text-slate-700">
                  Эти слова помогают показать предметы. <b>This</b> и <b>these</b> говорят о предметах рядом.
                  <b> That</b> и <b>those</b> говорят о предметах далеко. <b>This/that</b> - для одного предмета,
                  <b> these/those</b> - для нескольких предметов.
                </p>
                <div className="mt-4 grid gap-2 text-sm">
                  <p><b>This is my book.</b> - Это моя книга.</p>
                  <p><b>That is my bag.</b> - Вон та сумка моя.</p>
                  <p><b>These are my pencils.</b> - Это мои карандаши.</p>
                  <p><b>Those are my books.</b> - Вон те книги мои.</p>
                </div>
                <Link
                  className="mt-5 inline-block rounded-lg bg-berry px-5 py-3 font-bold text-white"
                  href="/child/practice?grammar_key=demonstratives_this_that_these_those"
                >
                  Потренировать
                </Link>
              </div>
              <div className="overflow-hidden rounded-lg border border-white/70 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3">Где?</th>
                      <th className="p-3">Один предмет</th>
                      <th className="p-3">Несколько</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-100">
                      <td className="p-3 font-semibold">Рядом</td>
                      <td className="p-3">this</td>
                      <td className="p-3">these</td>
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="p-3 font-semibold">Далеко</td>
                      <td className="p-3">that</td>
                      <td className="p-3">those</td>
                    </tr>
                  </tbody>
                </table>
                <div className="grid gap-1 p-4 text-sm text-slate-700">
                  <p>What is this?</p>
                  <p>What is that?</p>
                  <p>What are these?</p>
                  <p>What are those?</p>
                  <p>Are these your books?</p>
                  <p>Are those your pencils?</p>
                </div>
              </div>
            </div>
          </Panel>
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
