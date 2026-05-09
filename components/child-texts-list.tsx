"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { LearningText, Topic } from "@/lib/database.types";
import { BookOpen, Headphones } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

export function ChildTextsList() {
  const { supabase, family, loading, error } = useFamily();
  const [texts, setTexts] = useState<LearningText[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    async function load() {
      if (!family) return;
      const [textsRes, topicsRes] = await Promise.all([
        supabase
          .from("learning_texts")
          .select("*")
          .eq("family_id", family.familyId)
          .eq("status", "active")
          .order("difficulty", { ascending: true })
          .order("title_en", { ascending: true }),
        supabase.from("topics").select("*").eq("family_id", family.familyId)
      ]);
      setTexts((textsRes.data ?? []) as LearningText[]);
      setTopics((topicsRes.data ?? []) as Topic[]);
    }
    void load();
  }, [family, supabase]);

  const topicById = useMemo(() => new Map(topics.map((topic) => [topic.id, topic.title])), [topics]);

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : (
        <>
          <PageHeader
            title="Тексты"
            subtitle="Читай маленькие тексты, слушай английский, открывай перевод только когда нужно и отвечай на простые вопросы."
          />
          {!texts.length ? (
            <Panel>
              <p className="text-lg font-bold">Текстов пока нет.</p>
              <p className="mt-2 text-slate-600">Родитель может добавить их в контент или загрузить Starter Texts на странице импорта.</p>
              <Link className="mt-4 inline-block rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/parent/import">
                Открыть импорт
              </Link>
            </Panel>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {texts.map((text) => (
                <Link
                  className="rounded-lg border border-sky-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-berry"
                  href={`/child/texts/${text.id}`}
                  key={text.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <BookOpen className="text-berry" size={34} />
                    <span className="rounded-lg bg-skysoft px-3 py-1 text-sm font-bold">Level {text.level.toUpperCase()}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold">{text.title_ru}</h2>
                  <p className="mt-1 text-lg font-semibold text-slate-700">{text.title_en}</p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p>Тема: {text.topic_id ? topicById.get(text.topic_id) ?? "Topic" : "Без темы"}</p>
                    <p>Сложность: {text.difficulty}</p>
                    <p>Слов: примерно {wordCount(text.text_en)}</p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-mint px-4 py-3 font-bold text-ink">
                    <Headphones size={18} />
                    Открыть текст
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </AuthRequired>
  );
}
