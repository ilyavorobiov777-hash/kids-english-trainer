"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Card, GrammarPattern, PracticeAttempt, PracticeSession, ReviewSchedule } from "@/lib/database.types";
import { formatPercent } from "@/lib/supabase/helpers";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function accuracy(attempts: PracticeAttempt[]) {
  if (!attempts.length) return 0;
  return (attempts.filter((item) => item.is_correct).length / attempts.length) * 100;
}

function dateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function calculateStreak(sessions: PracticeSession[]) {
  const practicedDates = new Set(sessions.map((session) => dateKey(session.started_at)));
  if (!practicedDates.size) return 0;

  const today = new Date();
  let cursor = new Date(today);
  let streak = 0;

  if (!practicedDates.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (practicedDates.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function StatsPanel({ detailed = false }: { detailed?: boolean }) {
  const { supabase, family, loading, error } = useFamily();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [grammarPatterns, setGrammarPatterns] = useState<GrammarPattern[]>([]);
  const [reviewSchedule, setReviewSchedule] = useState<ReviewSchedule[]>([]);

  useEffect(() => {
    async function load() {
      if (!family) return;
      const [sessionsRes, attemptsRes, cardsRes, grammarRes, scheduleRes] = await Promise.all([
        supabase
          .from("practice_sessions")
          .select("*")
          .eq("family_id", family.familyId)
          .order("started_at", { ascending: false })
          .limit(100),
        supabase
          .from("practice_attempts")
          .select("*")
          .eq("family_id", family.familyId)
          .order("created_at", { ascending: false })
          .limit(1500),
        supabase.from("cards").select("*").eq("family_id", family.familyId),
        supabase.from("grammar_patterns").select("*").eq("family_id", family.familyId),
        supabase
          .from("review_schedule")
          .select("*")
          .eq("family_id", family.familyId)
          .order("due_at", { ascending: true })
          .limit(150)
      ]);
      setSessions((sessionsRes.data ?? []) as PracticeSession[]);
      setAttempts((attemptsRes.data ?? []) as PracticeAttempt[]);
      setCards((cardsRes.data ?? []) as Card[]);
      setGrammarPatterns((grammarRes.data ?? []) as GrammarPattern[]);
      setReviewSchedule((scheduleRes.data ?? []) as ReviewSchedule[]);
    }
    void load();
  }, [family, supabase]);

  const stats = useMemo(() => {
    const correct = attempts.filter((item) => item.is_correct).length;
    const incorrect = attempts.length - correct;
    const byType = attempts.reduce<Record<string, PracticeAttempt[]>>((acc, attempt) => {
      acc[attempt.exercise_type] ??= [];
      acc[attempt.exercise_type].push(attempt);
      return acc;
    }, {});
    const byCard = attempts.reduce<Record<string, { total: number; wrong: number }>>((acc, attempt) => {
      if (!attempt.card_id) return acc;
      acc[attempt.card_id] ??= { total: 0, wrong: 0 };
      acc[attempt.card_id].total += 1;
      if (!attempt.is_correct) acc[attempt.card_id].wrong += 1;
      return acc;
    }, {});
    const byGrammar = attempts.reduce<Record<string, { total: number; wrong: number }>>((acc, attempt) => {
      if (!attempt.grammar_pattern_id) return acc;
      acc[attempt.grammar_pattern_id] ??= { total: 0, wrong: 0 };
      acc[attempt.grammar_pattern_id].total += 1;
      if (!attempt.is_correct) acc[attempt.grammar_pattern_id].wrong += 1;
      return acc;
    }, {});
    const weakestCards = Object.entries(byCard)
      .map(([cardId, value]) => ({ card: cards.find((card) => card.id === cardId), ...value, rate: value.wrong / value.total }))
      .filter((item) => item.card && item.wrong > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
    const weakestGrammar = Object.entries(byGrammar)
      .map(([grammarId, value]) => ({
        grammar: grammarPatterns.find((item) => item.id === grammarId),
        ...value,
        rate: value.wrong / value.total
      }))
      .filter((item) => item.grammar && item.wrong > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
    return { correct, incorrect, accuracy: accuracy(attempts), byType, weakestCards, weakestGrammar };
  }, [attempts, cards, grammarPatterns]);

  const lastSession = sessions[0];
  const dueToday = reviewSchedule.filter((item) => new Date(item.due_at).getTime() <= Date.now());
  const streak = calculateStreak(sessions);

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : (
        <>
          <PageHeader
            title={detailed ? "Прогресс" : "Дашборд родителя"}
            subtitle="Статистика считается из реальных practice_attempts, practice_sessions и review_schedule."
          />
          <div className="grid gap-4 md:grid-cols-5">
            <Panel><p className="text-sm text-slate-500">Занятий</p><p className="text-3xl font-bold">{sessions.length}</p></Panel>
            <Panel><p className="text-sm text-slate-500">Попыток</p><p className="text-3xl font-bold">{attempts.length}</p></Panel>
            <Panel><p className="text-sm text-slate-500">Верно</p><p className="text-3xl font-bold">{stats.correct}</p></Panel>
            <Panel><p className="text-sm text-slate-500">Accuracy</p><p className="text-3xl font-bold">{formatPercent(stats.accuracy)}</p></Panel>
            <Panel><p className="text-sm text-slate-500">Streak</p><p className="text-3xl font-bold">{streak}</p></Panel>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Panel>
              <h2 className="mb-3 text-lg font-bold">Последнее занятие</h2>
              {lastSession ? (
                <div className="grid gap-2 text-sm">
                  <p>Начато: {new Date(lastSession.started_at).toLocaleString("ru-RU")}</p>
                  <p>Попыток: {lastSession.total_attempts}</p>
                  <p>Ошибок: {lastSession.incorrect_attempts}</p>
                  <p>Accuracy: {formatPercent(lastSession.accuracy)}</p>
                  <p>Звезд: {lastSession.stars_earned}</p>
                </div>
              ) : (
                <p className="text-slate-500">Занятий пока нет. Начните с детской тренировки.</p>
              )}
            </Panel>
            <Panel>
              <h2 className="mb-3 text-lg font-bold">Accuracy по типам</h2>
              {Object.keys(stats.byType).length ? (
                <div className="grid gap-2">
                  {Object.entries(stats.byType).map(([type, typeAttempts]) => (
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3" key={type}>
                      <span className="font-semibold">{type}</span>
                      <span>{formatPercent(accuracy(typeAttempts))} ({typeAttempts.length})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Пока нет попыток для расчета.</p>
              )}
            </Panel>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <Panel>
              <h2 className="mb-3 text-lg font-bold">Слабые карточки</h2>
              <div className="grid gap-2">
                {stats.weakestCards.length ? (
                  stats.weakestCards.map((item) => (
                    <div key={item.card?.id} className="rounded-lg bg-slate-50 p-3">
                      <b>{item.card?.english}</b> - {item.card?.russian}
                      <p className="text-sm text-slate-500">Ошибок: {item.wrong} из {item.total}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">Ошибок по карточкам пока нет.</p>
                )}
              </div>
            </Panel>
            <Panel>
              <h2 className="mb-3 text-lg font-bold">Слабая грамматика</h2>
              {stats.weakestGrammar.length ? (
                stats.weakestGrammar.map((item) => (
                  <div key={item.grammar?.id} className="rounded-lg bg-slate-50 p-3">
                    <b>{item.grammar?.title_ru || item.grammar?.title}</b>
                    <p className="text-sm text-slate-500">Ошибок: {item.wrong} из {item.total}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">Ошибок по грамматике пока нет.</p>
              )}
            </Panel>
            <Panel>
              <h2 className="mb-3 text-lg font-bold">Повторить сегодня</h2>
              {dueToday.length ? (
                dueToday.slice(0, 6).map((item) => {
                  const card = cards.find((candidate) => candidate.id === item.card_id);
                  return <p key={item.id} className="border-b border-slate-100 py-2">{card ? `${card.english} - ${card.russian}` : item.card_id}</p>;
                })
              ) : (
                <p className="text-slate-500">На сегодня повторений нет.</p>
              )}
            </Panel>
          </div>
          {detailed ? (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <Panel>
                <h2 className="mb-3 text-lg font-bold">Фокусные тренажеры</h2>
                <div className="grid gap-2 text-sm">
                  <p>Articles accuracy: {formatPercent(accuracy(stats.byType.articles ?? []))}</p>
                  <p>Question forms accuracy: {formatPercent(accuracy(stats.byType.question_form ?? []))}</p>
                  <p>Short answers accuracy: {formatPercent(accuracy(stats.byType.short_answer ?? []))}</p>
                  <p>Last practice date: {lastSession ? new Date(lastSession.started_at).toLocaleDateString("ru-RU") : "нет данных"}</p>
                </div>
              </Panel>
              <Panel>
                <h2 className="mb-3 text-lg font-bold">Быстрые действия</h2>
                <div className="flex flex-wrap gap-2">
                  <Link className="rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/parent/cards">Добавить карточки</Link>
                  <Link className="rounded-lg bg-mint px-4 py-3 font-semibold" href="/parent/import">Импорт CSV</Link>
                  <Link className="rounded-lg bg-berry px-4 py-3 font-semibold text-white" href="/child/practice">Открыть тренировку</Link>
                </div>
              </Panel>
            </div>
          ) : null}
        </>
      )}
    </AuthRequired>
  );
}
