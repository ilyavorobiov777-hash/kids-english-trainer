"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { Button, Field, Input, PageHeader, Panel, Select, Textarea } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { LearningText, LearningTextQuestion, LearningTextVocabularyWord, Topic } from "@/lib/database.types";
import { useCallback, useEffect, useMemo, useState } from "react";

type TextForm = {
  id?: string;
  title_en: string;
  title_ru: string;
  text_en: string;
  text_ru: string;
  topic_id: string;
  level: string;
  difficulty: number;
  vocabulary_words: string;
  grammar_focus: string;
  comprehension_questions: string;
  status: "draft" | "active" | "archived";
};

const emptyForm: TextForm = {
  title_en: "",
  title_ru: "",
  text_en: "",
  text_ru: "",
  topic_id: "",
  level: "pre_a1",
  difficulty: 1,
  vocabulary_words: JSON.stringify([{ english: "cat", russian: "кошка" }], null, 2),
  grammar_focus: "have got, articles a/the",
  comprehension_questions: JSON.stringify(
    [
      {
        type: "choose_answer",
        question: "What is in the text?",
        correctAnswer: "a cat",
        options: ["a cat", "a dog", "a pencil"]
      }
    ],
    null,
    2
  ),
  status: "active"
};

function asForm(text: LearningText): TextForm {
  return {
    id: text.id,
    title_en: text.title_en,
    title_ru: text.title_ru,
    text_en: text.text_en,
    text_ru: text.text_ru,
    topic_id: text.topic_id ?? "",
    level: text.level,
    difficulty: text.difficulty,
    vocabulary_words: JSON.stringify(text.vocabulary_words ?? [], null, 2),
    grammar_focus: (text.grammar_focus ?? []).join(", "),
    comprehension_questions: JSON.stringify(text.comprehension_questions ?? [], null, 2),
    status: text.status
  };
}

function parseVocabulary(value: string): LearningTextVocabularyWord[] {
  const parsed = JSON.parse(value || "[]");
  if (!Array.isArray(parsed)) throw new Error("vocabulary_words должен быть JSON-массивом");
  return parsed.map((item) => ({ english: String(item.english ?? ""), russian: String(item.russian ?? "") })).filter((item) => item.english && item.russian);
}

function parseQuestions(value: string): LearningTextQuestion[] {
  const parsed = JSON.parse(value || "[]");
  if (!Array.isArray(parsed)) throw new Error("comprehension_questions должен быть JSON-массивом");
  return parsed as LearningTextQuestion[];
}

export function TextsManager() {
  const { api, family, loading, error } = useFamily();
  const [texts, setTexts] = useState<LearningText[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [form, setForm] = useState<TextForm>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!family) return;
    const [textsRes, topicsRes] = await Promise.all([
      api.from("learning_texts").select("*").eq("family_id", family.familyId).order("created_at", { ascending: false }),
      api.from("topics").select("*").eq("family_id", family.familyId).order("title")
    ]);
    setTexts((textsRes.data ?? []) as LearningText[]);
    setTopics((topicsRes.data ?? []) as Topic[]);
  }, [family, api]);

  useEffect(() => {
    void load();
  }, [load]);

  const topicById = useMemo(() => new Map(topics.map((topic) => [topic.id, topic.title])), [topics]);

  function setField<K extends keyof TextForm>(key: K, value: TextForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveText(event: React.FormEvent) {
    event.preventDefault();
    if (!family) return;
    setBusy(true);
    setMessage(null);

    try {
      const payload = {
        family_id: family.familyId,
        created_by: family.userId,
        title_en: form.title_en.trim(),
        title_ru: form.title_ru.trim(),
        text_en: form.text_en.trim(),
        text_ru: form.text_ru.trim(),
        topic_id: form.topic_id || null,
        level: form.level.trim() || "pre_a1",
        difficulty: form.difficulty,
        vocabulary_words: parseVocabulary(form.vocabulary_words),
        grammar_focus: form.grammar_focus.split(",").map((item) => item.trim()).filter(Boolean),
        comprehension_questions: parseQuestions(form.comprehension_questions),
        status: form.status
      };

      const result = form.id
        ? await api.from("learning_texts").update(payload).eq("family_id", family.familyId).eq("id", form.id)
        : await api.from("learning_texts").insert(payload);

      if (result.error) throw result.error;
      setForm(emptyForm);
      setMessage(form.id ? "Текст обновлен." : "Текст создан.");
      await load();
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : "Не удалось сохранить текст");
    } finally {
      setBusy(false);
    }
  }

  async function archiveText(text: LearningText) {
    if (!family) return;
    const { error: archiveError } = await api
      .from("learning_texts")
      .update({ status: text.status === "archived" ? "active" : "archived" })
      .eq("family_id", family.familyId)
      .eq("id", text.id);
    setMessage(archiveError ? archiveError.message : text.status === "archived" ? "Текст восстановлен." : "Текст архивирован.");
    await load();
  }

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : (
        <>
          <PageHeader
            title="Тексты для чтения и аудирования"
            subtitle="Родитель управляет короткими текстами: английский текст, перевод, слова, грамматика и вопросы на понимание."
          />
          <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
            <Panel>
              <form className="grid gap-4" onSubmit={saveText}>
                <Field label="Title EN">
                  <Input value={form.title_en} onChange={(event) => setField("title_en", event.target.value)} required />
                </Field>
                <Field label="Title RU">
                  <Input value={form.title_ru} onChange={(event) => setField("title_ru", event.target.value)} required />
                </Field>
                <Field label="Text EN">
                  <Textarea rows={5} value={form.text_en} onChange={(event) => setField("text_en", event.target.value)} required />
                </Field>
                <Field label="Text RU">
                  <Textarea rows={5} value={form.text_ru} onChange={(event) => setField("text_ru", event.target.value)} required />
                </Field>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Topic">
                    <Select value={form.topic_id} onChange={(event) => setField("topic_id", event.target.value)}>
                      <option value="">Без темы</option>
                      {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
                    </Select>
                  </Field>
                  <Field label="Level">
                    <Input value={form.level} onChange={(event) => setField("level", event.target.value)} />
                  </Field>
                  <Field label="Difficulty">
                    <Input min={1} max={5} type="number" value={form.difficulty} onChange={(event) => setField("difficulty", Number(event.target.value))} />
                  </Field>
                </div>
                <Field label="Vocabulary words JSON">
                  <Textarea rows={5} value={form.vocabulary_words} onChange={(event) => setField("vocabulary_words", event.target.value)} />
                </Field>
                <Field label="Grammar focus, comma-separated">
                  <Input value={form.grammar_focus} onChange={(event) => setField("grammar_focus", event.target.value)} />
                </Field>
                <Field label="Comprehension questions JSON">
                  <Textarea rows={7} value={form.comprehension_questions} onChange={(event) => setField("comprehension_questions", event.target.value)} />
                </Field>
                <Field label="Status">
                  <Select value={form.status} onChange={(event) => setField("status", event.target.value as TextForm["status"])}>
                    <option value="active">active</option>
                    <option value="draft">draft</option>
                    <option value="archived">archived</option>
                  </Select>
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button disabled={busy}>{busy ? "Сохраняю..." : form.id ? "Сохранить изменения" : "Создать текст"}</Button>
                  {form.id ? <Button className="bg-slate-700" type="button" onClick={() => setForm(emptyForm)}>Отмена</Button> : null}
                </div>
                {message ? <p className="rounded-lg bg-mint p-3 text-sm font-semibold">{message}</p> : null}
              </form>
            </Panel>

            <div className="grid gap-3">
              {texts.map((text) => (
                <Panel key={text.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">{text.status} · {topicById.get(text.topic_id ?? "") ?? "Без темы"}</p>
                      <h2 className="mt-1 text-xl font-bold">{text.title_ru}</h2>
                      <p className="text-slate-700">{text.title_en}</p>
                      <p className="mt-2 text-sm text-slate-500">{text.text_en.split(/\s+/).filter(Boolean).length} words · {text.comprehension_questions.length} questions</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" onClick={() => setForm(asForm(text))}>Редактировать</Button>
                      <Button className={text.status === "archived" ? "bg-mint text-ink" : "bg-peach text-ink"} type="button" onClick={() => archiveText(text)}>
                        {text.status === "archived" ? "Восстановить" : "Архивировать"}
                      </Button>
                    </div>
                  </div>
                </Panel>
              ))}
              {!texts.length ? <Panel>Текстов пока нет. Создайте первый текст слева или добавьте Starter Texts через импорт.</Panel> : null}
            </div>
          </div>
        </>
      )}
    </AuthRequired>
  );
}
