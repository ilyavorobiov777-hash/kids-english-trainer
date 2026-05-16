"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Card, PracticeAttempt, Topic } from "@/lib/database.types";
import { cardsForCuratedTopic, curatedTopicDefinitions } from "@/lib/words/curated-topics";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function WordTopics() {
  const { api, family, loading, error } = useFamily();
  const [childId, setChildId] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);

  useEffect(() => {
    setChildId(window.localStorage.getItem("selected_child_id"));
  }, []);

  useEffect(() => {
    async function load() {
      if (!family) return;
      const [topicsRes, cardsRes, attemptsRes] = await Promise.all([
        api.from("topics").select("*").eq("family_id", family.familyId).order("title"),
        api.from("cards").select("*").eq("family_id", family.familyId).eq("status", "active").in("type", ["word", "phrase", "sentence", "grammar_pattern"]),
        childId
          ? api.from("practice_attempts").select("*").eq("family_id", family.familyId).eq("child_id", childId).limit(1200)
          : Promise.resolve({ data: [] })
      ]);
      setTopics((topicsRes.data ?? []) as Topic[]);
      setCards((cardsRes.data ?? []) as Card[]);
      setAttempts((attemptsRes.data ?? []) as PracticeAttempt[]);
    }
    void load();
  }, [childId, family, api]);

  const studiedCardIds = useMemo(() => new Set(attempts.map((attempt) => attempt.card_id).filter(Boolean)), [attempts]);

  const topicRows = useMemo(
    () =>
      topics
        .map((topic) => {
          const topicCards = cards.filter((card) => card.topic_id === topic.id);
          return {
            topic,
            total: topicCards.length,
            studied: topicCards.filter((card) => studiedCardIds.has(card.id)).length
          };
        })
        .filter((row) => row.total > 0),
    [cards, studiedCardIds, topics]
  );

  const curatedRows = useMemo(
    () =>
      curatedTopicDefinitions
        .map((topic) => {
          const topicCards = cardsForCuratedTopic(cards, topic);
          return {
            topic,
            total: topicCards.length,
            studied: topicCards.filter((card) => studiedCardIds.has(card.id)).length
          };
        })
        .filter((row) => row.total > 0),
    [cards, studiedCardIds]
  );

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : (
        <>
          <PageHeader title="Слова по темам" subtitle="Выбери тему и учи маленькими порциями по 5-10 слов." />
          {curatedRows.length ? (
            <div className="mb-6">
              <h2 className="mb-3 text-xl font-bold">Быстрые учебные блоки</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {curatedRows.map(({ topic, total, studied }) => (
                  <Panel key={topic.id} className="bg-skysoft">
                    <h2 className="text-xl font-bold">{topic.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{topic.description}</p>
                    <p className="mt-3 text-sm text-slate-500">Карточек: {total}</p>
                    <p className="text-sm text-slate-500">Уже встречались: {studied}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link className="inline-block rounded-lg bg-berry px-4 py-3 font-semibold text-white" href={`/child/words/topic/${topic.key}`}>
                        Учить
                      </Link>
                      <Link className="inline-block rounded-lg bg-ink px-4 py-3 font-semibold text-white" href={`/child/words/topic/${topic.key}`}>
                        Повторить
                      </Link>
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
          ) : null}
          {topicRows.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topicRows.map(({ topic, total, studied }) => (
                <Panel key={topic.id}>
                  <h2 className="text-xl font-bold">{topic.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">Карточек: {total}</p>
                  <p className="text-sm text-slate-500">Уже встречались: {studied}</p>
                  <Link className="mt-4 inline-block rounded-lg bg-berry px-4 py-3 font-semibold text-white" href={`/child/words/topic/${topic.id}`}>
                    Учить
                  </Link>
                </Panel>
              ))}
            </div>
          ) : (
            <Panel>Темы с активными словами пока не найдены. Родитель может добавить Starter 350 или импортировать карточки.</Panel>
          )}
        </>
      )}
    </AuthRequired>
  );
}
