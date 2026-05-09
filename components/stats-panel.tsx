"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Card, PracticeAttempt, PracticeSession } from "@/lib/database.types";
import { formatPercent } from "@/lib/supabase/helpers";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function StatsPanel({ detailed = false }: { detailed?: boolean }) {
  const { supabase, family, loading, error } = useFamily();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    async function load() {
      if (!family) return;
      const [sessionsRes, attemptsRes, cardsRes] = await Promise.all([
        supabase.from("practice_sessions").select("*").eq("family_id", family.familyId).order("started_at", { ascending: false }).limit(20),
        supabase.from("practice_attempts").select("*").eq("family_id", family.familyId).order("created_at", { ascending: false }).limit(500),
        supabase.from("cards").select("*").eq("family_id", family.familyId)
      ]);
      setSessions((sessionsRes.data ?? []) as PracticeSession[]);
      setAttempts((attemptsRes.data ?? []) as PracticeAttempt[]);
      setCards((cardsRes.data ?? []) as Card[]);
    }
    load();
  }, [family?.familyId]);

  const stats = useMemo(() => {
    const correct = attempts.filter((item) => item.is_correct).length;
    const incorrect = attempts.length - correct;
    const accuracy = attempts.length ? (correct / attempts.length) * 100 : 0;
    const byCard = attempts.reduce<Record<string, { total: number; wrong: number }>>((acc, attempt) => {
      acc[attempt.card_id] ??= { total: 0, wrong: 0 };
      acc[attempt.card_id].total += 1;
      if (!attempt.is_correct) acc[attempt.card_id].wrong += 1;
      return acc;
    }, {});
    const weakest = Object.entries(byCard)
      .map(([cardId, value]) => ({ card: cards.find((card) => card.id === cardId), ...value, rate: value.wrong / value.total }))
      .filter((item) => item.card && item.wrong > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
    return { correct, incorrect, accuracy, weakest };
  }, [attempts, cards]);

  const lastSession = sessions[0];
  const dueCards = cards.filter((card) => stats.weakest.some((item) => item.card?.id === card.id)).slice(0, 6);

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? <NeedLogin /> : (
        <>
          <PageHeader title={detailed ? "Прогресс" : "Дашборд родителя"} subtitle="Статистика считается из реальных practice_attempts и practice_sessions." />
          <div className="grid gap-4 md:grid-cols-4">
            <Panel><p className="text-sm text-slate-500">Занятий</p><p className="text-3xl font-bold">{sessions.length}</p></Panel>
            <Panel><p className="text-sm text-slate-500">Попыток</p><p className="text-3xl font-bold">{attempts.length}</p></Panel>
            <Panel><p className="text-sm text-slate-500">Правильно</p><p className="text-3xl font-bold">{stats.correct}</p></Panel>
            <Panel><p className="text-sm text-slate-500">Accuracy</p><p className="text-3xl font-bold">{formatPercent(stats.accuracy)}</p></Panel>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Panel>
              <h2 className="mb-3 text-lg font-bold">Последнее занятие</h2>
              {lastSession ? (
                <div className="grid gap-2 text-sm">
                  <p>Начато: {new Date(lastSession.started_at).toLocaleString("ru-RU")}</p>
                  <p>Попыток: {lastSession.total_attempts}</p>
                  <p>Ошибок: {lastSession.incorrect_attempts}</p>
                  <p>Звезд: {lastSession.stars_earned}</p>
                </div>
              ) : <p className="text-slate-500">Занятий пока нет. Начните с детской тренировки.</p>}
            </Panel>
            <Panel>
              <h2 className="mb-3 text-lg font-bold">Слабые карточки</h2>
              <div className="grid gap-2">
                {stats.weakest.length ? stats.weakest.map((item) => (
                  <div key={item.card?.id} className="rounded-lg bg-slate-50 p-3">
                    <b>{item.card?.english}</b> — {item.card?.russian}
                    <p className="text-sm text-slate-500">Ошибок: {item.wrong} из {item.total}</p>
                  </div>
                )) : <p className="text-slate-500">Ошибок пока нет.</p>}
              </div>
            </Panel>
          </div>
          {detailed ? (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <Panel>
                <h2 className="mb-3 text-lg font-bold">Карточки на повторение</h2>
                {dueCards.length ? dueCards.map((card) => <p key={card.id} className="border-b border-slate-100 py-2">{card.english} — {card.russian}</p>) : <p className="text-slate-500">Пока система повторения ждет первых ошибок.</p>}
              </Panel>
              <Panel>
                <h2 className="mb-3 text-lg font-bold">Быстрые действия</h2>
                <div className="flex flex-wrap gap-2">
                  <Link className="rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/parent/cards">Добавить карточки</Link>
                  <Link className="rounded-lg bg-mint px-4 py-3 font-semibold" href="/child/practice">Открыть тренировку</Link>
                </div>
              </Panel>
            </div>
          ) : null}
        </>
      )}
    </AuthRequired>
  );
}
