"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { CsvImporter } from "@/components/csv-importer";
import { Button, PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import { useCallback, useEffect, useState } from "react";

type StarterSeedResult = {
  inserted_cards?: number;
  total_cards?: number;
  inserted_grammar_patterns?: number;
  total_grammar_patterns?: number;
};

type StarterTextsSeedResult = {
  inserted_texts?: number;
  existing_texts?: number;
  total_texts?: number;
};

type StarterStatus = {
  cards: number;
  grammarPatterns: number;
  texts: number;
  loading: boolean;
};

const starterCourseTitle = "Starter 350 Pre-A1";
const starterTextsCourseTitle = "Starter Texts Pre-A1";

export default function ParentImportPage() {
  const { api, family, loading, error } = useFamily();
  const [message, setMessage] = useState<string | null>(null);
  const [starterLoading, setStarterLoading] = useState(false);
  const [starterStatus, setStarterStatus] = useState<StarterStatus>({
    cards: 0,
    grammarPatterns: 0,
    texts: 0,
    loading: true
  });

  const loadStarterStatus = useCallback(async () => {
    if (!family) return;
    setStarterStatus((current) => ({ ...current, loading: true }));

    const [starterCourseRes, textsCourseRes] = await Promise.all([
      api.from("courses").select("id").eq("family_id", family.familyId).eq("title", starterCourseTitle).maybeSingle(),
      api.from("courses").select("id").eq("family_id", family.familyId).eq("title", starterTextsCourseTitle).maybeSingle()
    ]);

    const starterCourse = starterCourseRes.data;
    const textsCourse = textsCourseRes.data;

    const [{ count: cardsCount }, { count: grammarCount }, { count: textsCount }] = await Promise.all([
      starterCourse
        ? api.from("cards").select("id", { count: "exact", head: true }).eq("family_id", family.familyId).eq("course_id", starterCourse.id)
        : Promise.resolve({ count: 0 }),
      starterCourse
        ? api.from("grammar_patterns").select("id", { count: "exact", head: true }).eq("family_id", family.familyId).eq("course_id", starterCourse.id)
        : Promise.resolve({ count: 0 }),
      textsCourse
        ? api.from("learning_texts").select("id", { count: "exact", head: true }).eq("family_id", family.familyId).eq("course_id", textsCourse.id)
        : Promise.resolve({ count: 0 })
    ]);

    setStarterStatus({
      cards: cardsCount ?? 0,
      grammarPatterns: grammarCount ?? 0,
      texts: textsCount ?? 0,
      loading: false
    });
  }, [family, api]);

  useEffect(() => {
    void loadStarterStatus();
  }, [loadStarterStatus]);

  async function seedDemo() {
    const { error: rpcError } = await api.rpc("seed_demo_content");
    setMessage(rpcError ? rpcError.message : "Демо-набор добавлен: 30 слов, 10 фраз, 5 грамматических паттернов.");
    await loadStarterStatus();
  }

  async function seedStarterContent() {
    setStarterLoading(true);
    setMessage("Добавляю Starter 350. Обычно это занимает несколько секунд...");

    const { data, error: rpcError } = await api.rpc("seed_starter_learning_content");

    if (rpcError) {
      setStarterLoading(false);
      setMessage(`Не удалось добавить Starter 350: ${rpcError.message}`);
      return;
    }

    const result = data as StarterSeedResult | null;
    const insertedCards = result?.inserted_cards ?? 0;
    const totalCards = result?.total_cards ?? 0;
    const existingCards = Math.max(totalCards - insertedCards, 0);
    const insertedGrammar = result?.inserted_grammar_patterns ?? 0;
    const totalGrammar = result?.total_grammar_patterns ?? 0;

    setMessage(
      `Starter 350 готов: добавлено карточек ${insertedCards}, уже было ${existingCards}, всего карточек ${totalCards}. Grammar patterns: добавлено ${insertedGrammar}, всего ${totalGrammar}. Этот набор можно добавлять повторно безопасно: дубли не создаются.`
    );
    await loadStarterStatus();
    setStarterLoading(false);
  }

  async function seedStarterTexts() {
    setStarterLoading(true);
    setMessage("Добавляю Starter Texts. Повторный запуск безопасен: дубли не создаются...");

    const { data, error: rpcError } = await api.rpc("seed_starter_texts");

    if (rpcError) {
      setStarterLoading(false);
      setMessage(`Не удалось добавить Starter Texts: ${rpcError.message}`);
      return;
    }

    const result = data as StarterTextsSeedResult | null;
    const inserted = result?.inserted_texts ?? 0;
    const existing = result?.existing_texts ?? Math.max((result?.total_texts ?? 0) - inserted, 0);
    const total = result?.total_texts ?? 0;
    setMessage(`Starter Texts готов: добавлено текстов ${inserted}, уже было ${existing}, всего текстов ${total}. Этот набор можно запускать повторно безопасно.`);
    await loadStarterStatus();
    setStarterLoading(false);
  }

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : (
        <>
          <PageHeader
            title="Импорт"
            subtitle="Загрузите CSV, проверьте preview, исправьте ошибки и сохраните карточки в api. Здесь же можно добавить стартовые наборы."
          />
          <div className="grid gap-5">
            <CsvImporter api={api} familyId={family.familyId} userId={family.userId} />
            <Panel>
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <h2 className="text-lg font-bold">Стартовые наборы</h2>
                  <p className="mt-2 text-sm text-ink/70">
                    Starter 350 добавляет базовые слова, фразы, грамматику, диалоги и истории. Starter Texts добавляет короткие собственные тексты для чтения и аудирования.
                    Оба набора можно запускать повторно безопасно: дубли не создаются.
                  </p>
                  <p className="mt-3 rounded-lg bg-sky/20 px-3 py-2 text-sm font-semibold">
                    Сейчас:{" "}
                    {starterStatus.loading
                      ? "считаю..."
                      : `${starterStatus.cards} карточек, ${starterStatus.grammarPatterns} grammar patterns, ${starterStatus.texts} texts`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 md:justify-end">
                  <Button onClick={seedDemo}>Добавить демо-набор</Button>
                  <Button className="bg-berry" disabled={starterLoading} onClick={seedStarterContent}>
                    {starterLoading ? "Добавляю..." : "Добавить Starter 350"}
                  </Button>
                  <Button className="bg-mint text-ink" disabled={starterLoading} onClick={seedStarterTexts}>
                    {starterLoading ? "Добавляю..." : "Добавить Starter Texts"}
                  </Button>
                </div>
              </div>
              {message ? <p className="mt-4 rounded-lg bg-mint p-3 text-sm font-semibold">{message}</p> : null}
            </Panel>
          </div>
        </>
      )}
    </AuthRequired>
  );
}
