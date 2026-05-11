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

type DemonstrativesSeedResult = {
  inserted_cards?: number;
  existing_cards?: number;
  total_cards?: number;
  inserted_grammar_patterns?: number;
  total_grammar_patterns?: number;
  inserted_texts?: number;
  existing_texts?: number;
  total_texts?: number;
};

type IngTimeSeedResult = DemonstrativesSeedResult;

type StarterStatus = {
  cards: number;
  grammarPatterns: number;
  texts: number;
  demonstrativeCards: number;
  demonstrativeTexts: number;
  ingTimeCards: number;
  ingTimeTexts: number;
  loading: boolean;
};

const starterCourseTitle = "Starter 350 Pre-A1";
const starterTextsCourseTitle = "Starter Texts Pre-A1";
const demonstrativesCourseTitle = "Grammar: Demonstratives";
const ingTimeCourseTitle = "Grammar: -ing and time";

export default function ParentImportPage() {
  const { api, family, loading, error } = useFamily();
  const [message, setMessage] = useState<string | null>(null);
  const [starterLoading, setStarterLoading] = useState(false);
  const [starterStatus, setStarterStatus] = useState<StarterStatus>({
    cards: 0,
    grammarPatterns: 0,
    texts: 0,
    demonstrativeCards: 0,
    demonstrativeTexts: 0,
    ingTimeCards: 0,
    ingTimeTexts: 0,
    loading: true
  });

  const loadStarterStatus = useCallback(async () => {
    if (!family) return;
    setStarterStatus((current) => ({ ...current, loading: true }));

    const [starterCourseRes, textsCourseRes, demonstrativesCourseRes, ingTimeCourseRes] = await Promise.all([
      api.from("courses").select("id").eq("family_id", family.familyId).eq("title", starterCourseTitle).maybeSingle(),
      api.from("courses").select("id").eq("family_id", family.familyId).eq("title", starterTextsCourseTitle).maybeSingle(),
      api.from("courses").select("id").eq("family_id", family.familyId).eq("title", demonstrativesCourseTitle).maybeSingle(),
      api.from("courses").select("id").eq("family_id", family.familyId).eq("title", ingTimeCourseTitle).maybeSingle()
    ]);

    const starterCourse = starterCourseRes.data;
    const textsCourse = textsCourseRes.data;
    const demonstrativesCourse = demonstrativesCourseRes.data;
    const ingTimeCourse = ingTimeCourseRes.data;

    const [
      { count: cardsCount },
      { count: grammarCount },
      { count: textsCount },
      { count: demonstrativeCardsCount },
      { count: demonstrativeTextsCount },
      { count: ingTimeCardsCount },
      { count: ingTimeTextsCount }
    ] = await Promise.all([
      starterCourse
        ? api.from("cards").select("id", { count: "exact", head: true }).eq("family_id", family.familyId).eq("course_id", starterCourse.id)
        : Promise.resolve({ count: 0 }),
      starterCourse
        ? api.from("grammar_patterns").select("id", { count: "exact", head: true }).eq("family_id", family.familyId).eq("course_id", starterCourse.id)
        : Promise.resolve({ count: 0 }),
      textsCourse
        ? api.from("learning_texts").select("id", { count: "exact", head: true }).eq("family_id", family.familyId).eq("course_id", textsCourse.id)
        : Promise.resolve({ count: 0 }),
      demonstrativesCourse
        ? api.from("cards").select("id", { count: "exact", head: true }).eq("family_id", family.familyId).eq("course_id", demonstrativesCourse.id)
        : Promise.resolve({ count: 0 }),
      demonstrativesCourse
        ? api.from("learning_texts").select("id", { count: "exact", head: true }).eq("family_id", family.familyId).eq("course_id", demonstrativesCourse.id)
        : Promise.resolve({ count: 0 }),
      ingTimeCourse
        ? api.from("cards").select("id", { count: "exact", head: true }).eq("family_id", family.familyId).eq("course_id", ingTimeCourse.id)
        : Promise.resolve({ count: 0 }),
      ingTimeCourse
        ? api.from("learning_texts").select("id", { count: "exact", head: true }).eq("family_id", family.familyId).eq("course_id", ingTimeCourse.id)
        : Promise.resolve({ count: 0 })
    ]);

    setStarterStatus({
      cards: cardsCount ?? 0,
      grammarPatterns: grammarCount ?? 0,
      texts: textsCount ?? 0,
      demonstrativeCards: demonstrativeCardsCount ?? 0,
      demonstrativeTexts: demonstrativeTextsCount ?? 0,
      ingTimeCards: ingTimeCardsCount ?? 0,
      ingTimeTexts: ingTimeTextsCount ?? 0,
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

  async function seedDemonstratives() {
    setStarterLoading(true);
    setMessage("Добавляю grammar: this / that / these / those. Повторный запуск безопасен...");

    const { data, error: rpcError } = await api.rpc("seed_demonstratives_content");

    if (rpcError) {
      setStarterLoading(false);
      setMessage(`Не удалось добавить demonstratives: ${rpcError.message}`);
      return;
    }

    const result = data as DemonstrativesSeedResult | null;
    const insertedCards = result?.inserted_cards ?? 0;
    const existingCards = result?.existing_cards ?? Math.max((result?.total_cards ?? 0) - insertedCards, 0);
    const totalCards = result?.total_cards ?? 0;
    const insertedTexts = result?.inserted_texts ?? 0;
    const existingTexts = result?.existing_texts ?? Math.max((result?.total_texts ?? 0) - insertedTexts, 0);
    const totalTexts = result?.total_texts ?? 0;
    const insertedGrammar = result?.inserted_grammar_patterns ?? 0;
    const totalGrammar = result?.total_grammar_patterns ?? 0;

    setMessage(
      `This/that/these/those готово: добавлено карточек ${insertedCards}, уже было ${existingCards}, всего карточек ${totalCards}. Текстов добавлено ${insertedTexts}, уже было ${existingTexts}, всего текстов ${totalTexts}. Grammar patterns: добавлено ${insertedGrammar}, всего ${totalGrammar}. Повторный запуск безопасен: дубли не создаются.`
    );
    await loadStarterStatus();
    setStarterLoading(false);
  }

  async function seedIngTime() {
    setStarterLoading(true);
    setMessage("Добавляю grammar pack: -ing + time. Повторный запуск безопасен...");

    const { data, error: rpcError } = await api.rpc("seed_ing_time_content");

    if (rpcError) {
      setStarterLoading(false);
      setMessage(`Не удалось добавить -ing + time: ${rpcError.message}`);
      return;
    }

    const result = data as IngTimeSeedResult | null;
    const insertedCards = result?.inserted_cards ?? 0;
    const existingCards = result?.existing_cards ?? Math.max((result?.total_cards ?? 0) - insertedCards, 0);
    const totalCards = result?.total_cards ?? 0;
    const insertedTexts = result?.inserted_texts ?? 0;
    const existingTexts = result?.existing_texts ?? Math.max((result?.total_texts ?? 0) - insertedTexts, 0);
    const totalTexts = result?.total_texts ?? 0;
    const insertedGrammar = result?.inserted_grammar_patterns ?? 0;
    const totalGrammar = result?.total_grammar_patterns ?? 0;

    setMessage(
      `-ing + time готово: добавлено карточек ${insertedCards}, уже было ${existingCards}, всего карточек ${totalCards}. Текстов добавлено ${insertedTexts}, уже было ${existingTexts}, всего текстов ${totalTexts}. Grammar patterns: добавлено ${insertedGrammar}, всего ${totalGrammar}. Повторный запуск безопасен: дубли не создаются.`
    );
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
                    Отдельные наборы this/that/these/those и -ing + time добавляют фокусную грамматику. Все наборы можно запускать повторно безопасно: дубли не создаются.
                  </p>
                  <p className="mt-2 text-sm text-ink/70">
                    Grammar pack -ing + time добавляет -ing, Present Continuous, дни недели, части дня и выражения времени.
                  </p>
                  <p className="mt-3 rounded-lg bg-sky/20 px-3 py-2 text-sm font-semibold">
                    Сейчас:{" "}
                    {starterStatus.loading
                      ? "считаю..."
                      : `${starterStatus.cards} карточек, ${starterStatus.grammarPatterns} grammar patterns, ${starterStatus.texts} texts, demonstratives: ${starterStatus.demonstrativeCards} карточек и ${starterStatus.demonstrativeTexts} texts, -ing + time: ${starterStatus.ingTimeCards} карточек и ${starterStatus.ingTimeTexts} texts`}
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
                  <Button className="bg-skysoft text-ink" disabled={starterLoading} onClick={seedDemonstratives}>
                    {starterLoading ? "Добавляю..." : "Добавить grammar: this/that/these/those"}
                  </Button>
                  <Button className="bg-peach text-ink" disabled={starterLoading} onClick={seedIngTime}>
                    {starterLoading ? "Добавляю..." : "Добавить grammar pack: -ing + time"}
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
