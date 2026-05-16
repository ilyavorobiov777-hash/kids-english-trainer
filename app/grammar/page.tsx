"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type GrammarPattern = {
  id: string;
  title: string;
  title_ru?: string | null;
  pattern: string;
  pattern_key?: string | null;
  explanation_ru: string | null;
  example_en: string | null;
  example_ru: string | null;
  question_examples?: string[];
  common_mistakes?: string[];
};

function grammarPracticeHref(patternKey: string | null | undefined, title: string) {
  return `/child/practice?grammar_key=${encodeURIComponent(patternKey || title)}`;
}

function normalizeGrammarKey(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const hardcodedGrammarKeys = new Set([
  "demonstratives this that these those",
  "present continuous ing",
  "days time expressions",
  "personal pronouns",
  "possessive adjectives"
]);

function isHardcodedGrammarDuplicate(item: GrammarPattern) {
  const key = normalizeGrammarKey(item.pattern_key || item.title);
  const title = normalizeGrammarKey(`${item.title} ${item.title_ru ?? ""}`);
  return (
    hardcodedGrammarKeys.has(key) ||
    title.includes("personal pronouns") ||
    title.includes("possessive") ||
    title.includes("pronouns") ||
    title.includes("this that these those") ||
    title.includes("present continuous") ||
    title.includes("days and time")
  );
}

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

  const displayedItems = useMemo(() => {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (isHardcodedGrammarDuplicate(item)) return false;
      const key = normalizeGrammarKey(item.pattern_key || item.title_ru || item.title);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [items]);

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
          <div className="mb-5 grid gap-5 lg:grid-cols-2">
            <Panel className="bg-mint">
              <h2 className="text-2xl font-bold">-ing: что кто-то делает сейчас</h2>
              <p className="mt-3 text-slate-700">
                Окончание <b>-ing</b> показывает действие, которое происходит сейчас:
                <b> I am running</b>, <b>She is sleeping</b>, <b>They are playing</b>.
                Важно не забывать <b>am / is / are</b>.
              </p>
              <div className="mt-4 grid gap-1 text-sm">
                <p>I am running. - Я бегу.</p>
                <p>She is sleeping. - Она спит.</p>
                <p>He is playing. - Он играет.</p>
                <p>They are jumping. - Они прыгают.</p>
                <p>What are you doing? - Что ты делаешь?</p>
                <p>Are they jumping? - Они прыгают?</p>
              </div>
              <p className="mt-3 rounded-lg bg-white p-3 text-sm">
                Правило: I am + ing; He / She / It is + ing; You / We / They are + ing.
              </p>
              <Link className="mt-5 inline-block rounded-lg bg-berry px-5 py-3 font-bold text-white" href={grammarPracticeHref("present_continuous_ing", "-ing / Present Continuous")}>
                Потренировать
              </Link>
            </Panel>

            <Panel className="bg-peach">
              <h2 className="text-2xl font-bold">Дни недели и время: on, in, at, last, next</h2>
              <p className="mt-3 text-slate-700">
                С днями недели часто говорят <b>on</b>: on Monday. С частями дня - <b>in</b>: in the morning.
                Но: <b>at night</b> и <b>at seven o&apos;clock</b>. С <b>last / next / this</b> предлог обычно не нужен.
              </p>
              <div className="mt-4 grid gap-1 text-sm">
                <p>I go to school on Monday. - Я хожу в школу в понедельник.</p>
                <p>I have breakfast in the morning. - Я завтракаю утром.</p>
                <p>I sleep at night. - Я сплю ночью.</p>
                <p>I get up at seven o&apos;clock. - Я встаю в семь часов.</p>
                <p>I visited my grandma last weekend. - Я навещал бабушку на прошлых выходных.</p>
                <p>I will play next weekend. - Я буду играть на следующих выходных.</p>
              </div>
              <p className="mt-3 rounded-lg bg-white p-3 text-sm">
                Правило: on + day, in + part of day, at night/time, last/next/this без предлога.
              </p>
              <Link className="mt-5 inline-block rounded-lg bg-ink px-5 py-3 font-bold text-white" href={grammarPracticeHref("days_time_expressions", "Days and time expressions")}>
                Потренировать
              </Link>
            </Panel>
          </div>
          <div className="mb-5 grid gap-5 lg:grid-cols-2">
            <Panel className="bg-skysoft">
              <h2 className="text-2xl font-bold">Личные местоимения: I, you, he, she, it, we, they</h2>
              <p className="mt-3 text-slate-700">
                Личные местоимения заменяют имена людей, животных или предметы. <b>I</b> - я, <b>you</b> - ты/вы,
                <b> he</b> - он, <b>she</b> - она, <b>it</b> - оно/это, <b>we</b> - мы, <b>they</b> - они.
              </p>
              <div className="mt-4 overflow-hidden rounded-lg border border-white/70 bg-white">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {[
                      ["I", "я", "I am eight."],
                      ["you", "ты / вы", "You are my friend."],
                      ["he", "он", "He is my brother."],
                      ["she", "она", "She is my sister."],
                      ["it", "оно / это", "It is a cat."],
                      ["we", "мы", "We are pupils."],
                      ["they", "они", "They are happy."]
                    ].map(([word, ru, example]) => (
                      <tr key={word} className="border-t border-slate-100 first:border-t-0">
                        <td className="p-2 font-bold">{word}</td>
                        <td className="p-2">{ru}</td>
                        <td className="p-2 text-slate-600">{example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 grid gap-1 text-sm">
                <p>Are you happy? - Ты счастлив?</p>
                <p>Is he your brother? - Он твой брат?</p>
                <p>Is she your sister? - Она твоя сестра?</p>
                <p>Are they pupils? - Они ученики?</p>
                <p>Yes, they are. / No, they aren&apos;t.</p>
              </div>
              <p className="mt-3 rounded-lg bg-white p-3 text-sm">
                Правило: I am; he/she/it is; you/we/they are. I всегда пишется с большой буквы.
              </p>
              <Link className="mt-5 inline-block rounded-lg bg-berry px-5 py-3 font-bold text-white" href={grammarPracticeHref("personal_pronouns", "Personal pronouns")}>
                Потренировать
              </Link>
            </Panel>

            <Panel className="bg-mint">
              <h2 className="text-2xl font-bold">Притяжательные слова: my, your, his, her, our, their</h2>
              <p className="mt-3 text-slate-700">
                Эти слова показывают, кому принадлежит предмет. После них обычно идет предмет:
                <b> my book</b>, <b>your pencil</b>, <b>his dog</b>, <b>her bag</b>, <b>our classroom</b>, <b>their toys</b>.
              </p>
              <div className="mt-4 overflow-hidden rounded-lg border border-white/70 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2">Кто?</th>
                      <th className="p-2">Чей?</th>
                      <th className="p-2">Пример</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["I", "my", "my book"],
                      ["you", "your", "your pencil"],
                      ["he", "his", "his dog"],
                      ["she", "her", "her bag"],
                      ["it", "its", "its tail"],
                      ["we", "our", "our classroom"],
                      ["they", "their", "their toys"]
                    ].map(([person, word, example]) => (
                      <tr key={word} className="border-t border-slate-100">
                        <td className="p-2 font-bold">{person}</td>
                        <td className="p-2">{word}</td>
                        <td className="p-2 text-slate-600">{example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 grid gap-1 text-sm">
                <p>This is my book. - Это моя книга.</p>
                <p>This is your pencil. - Это твой карандаш.</p>
                <p>This is his dog. - Это его собака.</p>
                <p>This is her bag. - Это ее сумка.</p>
                <p>These are their toys. - Это их игрушки.</p>
                <p>Whose book is this? - Чья это книга?</p>
              </div>
              <p className="mt-3 rounded-lg bg-white p-3 text-sm">
                Не говорим I book. Правильно: my book. His - его, her - ее, their - их, our - наш.
              </p>
              <Link className="mt-5 inline-block rounded-lg bg-ink px-5 py-3 font-bold text-white" href={grammarPracticeHref("possessive_adjectives", "Possessive words")}>
                Потренировать
              </Link>
            </Panel>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {displayedItems.map((item) => (
              <Panel key={item.id}>
                <h2 className="text-xl font-bold">{item.title_ru || item.title}</h2>
                <p className="mt-2 rounded-lg bg-slate-50 p-3 font-mono text-sm">{item.pattern}</p>
                <p className="mt-3 text-slate-700">{item.explanation_ru}</p>
                <p className="mt-3 font-semibold">{item.example_en}</p>
                <p className="text-slate-500">{item.example_ru}</p>
                {item.question_examples?.length ? (
                  <div className="mt-3 text-sm text-slate-600">
                    <p className="font-semibold">Вопросы:</p>
                    {item.question_examples.slice(0, 4).map((example) => <p key={example}>{example}</p>)}
                  </div>
                ) : null}
                {item.common_mistakes?.length ? (
                  <div className="mt-3 text-sm text-slate-600">
                    <p className="font-semibold">Частые ошибки:</p>
                    {item.common_mistakes.slice(0, 3).map((mistake) => <p key={mistake}>{mistake}</p>)}
                  </div>
                ) : null}
                <Link
                  className="mt-4 inline-block rounded-lg bg-berry px-4 py-3 font-bold text-white"
                  href={grammarPracticeHref(item.pattern_key, item.title)}
                >
                  Потренировать
                </Link>
              </Panel>
            ))}
            {!items.length ? <Panel>Грамматические паттерны появятся после seed или ручного добавления.</Panel> : null}
          </div>
        </>
      )}
    </AuthRequired>
  );
}
