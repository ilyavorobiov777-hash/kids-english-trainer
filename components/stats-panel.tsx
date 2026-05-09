"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Card, GrammarPattern, LearningText, PracticeAttempt, PracticeSession, ReviewSchedule } from "@/lib/database.types";
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

function isCompletedSession(session: PracticeSession) {
  return Boolean(session.finished_at) && session.total_attempts > 0;
}

function calculateStreak(completedSessions: PracticeSession[]) {
  const practicedDates = new Set(completedSessions.map((session) => dateKey(session.finished_at ?? session.started_at)));
  if (!practicedDates.size) return 0;

  const cursor = new Date();
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

function formatStreak(streak: number) {
  if (streak <= 0) return "Пока нет серии";
  const word = streak === 1 ? "день" : streak >= 2 && streak <= 4 ? "дня" : "дней";
  return `${streak} ${word} подряд`;
}

function cardLabel(card: Card | undefined) {
  if (!card) return "Карточка не найдена";
  return `${card.english} - ${card.russian}`;
}

function grammarLabel(grammar: GrammarPattern | undefined) {
  return grammar?.title_ru || grammar?.title || "Грамматика не найдена";
}

export function StatsPanel({ detailed = false }: { detailed?: boolean }) {
  const { api, family, loading, error } = useFamily();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [learningTexts, setLearningTexts] = useState<LearningText[]>([]);
  const [grammarPatterns, setGrammarPatterns] = useState<GrammarPattern[]>([]);
  const [reviewSchedule, setReviewSchedule] = useState<ReviewSchedule[]>([]);

  useEffect(() => {
    async function load() {
      if (!family) return;
      const [sessionsRes, attemptsRes, cardsRes, textsRes, grammarRes, scheduleRes] = await Promise.all([
        api
          .from("practice_sessions")
          .select("*")
          .eq("family_id", family.familyId)
          .order("started_at", { ascending: false })
          .limit(100),
        api
          .from("practice_attempts")
          .select("*")
          .eq("family_id", family.familyId)
          .order("created_at", { ascending: false })
          .limit(1500),
        api.from("cards").select("*").eq("family_id", family.familyId),
        api.from("learning_texts").select("*").eq("family_id", family.familyId),
        api.from("grammar_patterns").select("*").eq("family_id", family.familyId),
        api
          .from("review_schedule")
          .select("*")
          .eq("family_id", family.familyId)
          .order("due_at", { ascending: true })
          .limit(150)
      ]);
      setSessions((sessionsRes.data ?? []) as PracticeSession[]);
      setAttempts((attemptsRes.data ?? []) as PracticeAttempt[]);
      setCards((cardsRes.data ?? []) as Card[]);
      setLearningTexts((textsRes.data ?? []) as LearningText[]);
      setGrammarPatterns((grammarRes.data ?? []) as GrammarPattern[]);
      setReviewSchedule((scheduleRes.data ?? []) as ReviewSchedule[]);
    }
    void load();
  }, [family, api]);

  const stats = useMemo(() => {
    const completedSessions = sessions.filter(isCompletedSession);
    const lastCompletedSession = completedSessions[0];
    const correct = attempts.filter((item) => item.is_correct).length;
    const incorrect = attempts.length - correct;
    const byType = attempts.reduce<Record<string, PracticeAttempt[]>>((acc, attempt) => {
      acc[attempt.exercise_type] ??= [];
      acc[attempt.exercise_type].push(attempt);
      return acc;
    }, {});
    const byCard = attempts.reduce<Record<string, { total: number; wrong: number; attempts: PracticeAttempt[] }>>((acc, attempt) => {
      if (!attempt.card_id) return acc;
      acc[attempt.card_id] ??= { total: 0, wrong: 0, attempts: [] };
      acc[attempt.card_id].total += 1;
      acc[attempt.card_id].attempts.push(attempt);
      if (!attempt.is_correct) acc[attempt.card_id].wrong += 1;
      return acc;
    }, {});
    const byGrammar = attempts.reduce<Record<string, { total: number; wrong: number; attempts: PracticeAttempt[] }>>((acc, attempt) => {
      if (!attempt.grammar_pattern_id) return acc;
      acc[attempt.grammar_pattern_id] ??= { total: 0, wrong: 0, attempts: [] };
      acc[attempt.grammar_pattern_id].total += 1;
      acc[attempt.grammar_pattern_id].attempts.push(attempt);
      if (!attempt.is_correct) acc[attempt.grammar_pattern_id].wrong += 1;
      return acc;
    }, {});
    const weakestCards = Object.entries(byCard)
      .map(([cardId, value]) => ({ card: cards.find((card) => card.id === cardId), ...value, rate: value.wrong / value.total }))
      .filter((item) => item.card && item.wrong > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
    const weakestGrammar = Object.entries(byGrammar)
      .map(([grammarId, value]) => {
        const incorrectAttempts = value.attempts.filter((attempt) => !attempt.is_correct);
        const lastMistake = incorrectAttempts[0];
        return {
          grammar: grammarPatterns.find((item) => item.id === grammarId),
          ...value,
          lastMistake,
          rate: value.wrong / value.total
        };
      })
      .filter((item) => item.grammar && item.wrong > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
    const recentMistakes = attempts.filter((attempt) => !attempt.is_correct).slice(0, 10);
    const textAttempts = attempts.filter((attempt) => attempt.text_id);
    const textCorrect = textAttempts.filter((attempt) => attempt.is_correct).length;
    const textMistakes = textAttempts.filter((attempt) => !attempt.is_correct).slice(0, 5);
    const completedTextSessionIds = new Set(textAttempts.map((attempt) => attempt.session_id).filter(Boolean));
    const lastTextAttempt = textAttempts[0];
    const lastText = learningTexts.find((item) => item.id === lastTextAttempt?.text_id);

    return {
      completedSessions,
      lastCompletedSession,
      correct,
      incorrect,
      accuracy: accuracy(attempts),
      byType,
      weakestCards,
      weakestGrammar,
      recentMistakes,
      textAttempts,
      textCorrect,
      textMistakes,
      completedTextSessionIds,
      lastText
    };
  }, [attempts, cards, grammarPatterns, learningTexts, sessions]);

  const dueToday = reviewSchedule.filter((item) => new Date(item.due_at).getTime() <= Date.now());
  const streak = calculateStreak(stats.completedSessions);

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : (
        <>
          <PageHeader
            title={detailed ? "Прогресс" : "Дашборд родителя"}
            subtitle="Статистика считается из реальных ответов ребенка. Пустые и незавершенные сессии не считаются завершенными занятиями."
          />
          {!detailed ? (
            <Panel className="mb-5 bg-skysoft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Занятие ребенка</h2>
                  <p className="text-sm text-slate-600">Выберите детский профиль и запустите короткую тренировку без прямых ссылок.</p>
                </div>
                <Link className="rounded-lg bg-berry px-5 py-3 font-bold text-white" href="/child/select">
                  Перейти к занятию ребенка
                </Link>
              </div>
            </Panel>
          ) : (
            <Panel className="mb-5 bg-skysoft">
              <h2 className="text-lg font-bold">Как читать статистику</h2>
              <p className="mt-1 text-sm text-slate-600">
                Завершенные занятия считаются только по сессиям с заданиями. Тестовые данные можно обнулить для конкретного ребенка на странице профилей детей.
              </p>
              <Link className="mt-3 inline-block rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/parent/children">
                Открыть профили детей
              </Link>
            </Panel>
          )}
          {!detailed ? (
            <Panel className="mb-5">
              <h2 className="text-lg font-bold">Как ребенок учит слова</h2>
              <p className="mt-1 text-sm text-slate-600">Выберите короткий детский режим вместо большого списка карточек.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link className="rounded-lg bg-berry px-4 py-3 font-semibold text-white" href="/child/select">Перейти в детский режим</Link>
                <Link className="rounded-lg bg-mint px-4 py-3 font-semibold text-ink" href="/child/words/new">Учить новые слова</Link>
                <Link className="rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/child/words/review">Повторить слова</Link>
                <Link className="rounded-lg bg-peach px-4 py-3 font-semibold text-ink" href="/child/words/mistakes">Повторить ошибки</Link>
              </div>
            </Panel>
          ) : null}
          {!detailed ? (
            <Panel className="mb-5">
              <h2 className="text-lg font-bold">Тексты для чтения и аудирования</h2>
              <p className="mt-1 text-sm text-slate-600">Короткие тексты помогают ребенку увидеть знакомые слова в маленьких историях, послушать английский и ответить на вопросы.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link className="rounded-lg bg-mint px-4 py-3 font-semibold text-ink" href="/child/texts">Открыть тексты</Link>
                <Link className="rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/parent/texts">Управлять текстами</Link>
              </div>
            </Panel>
          ) : null}

          <div className="grid gap-4 md:grid-cols-5">
            <Panel>
              <p className="text-sm text-slate-500">Завершенных занятий</p>
              <p className="text-3xl font-bold">{stats.completedSessions.length}</p>
              <p className="mt-1 text-xs text-slate-500">Только занятия с финалом и заданиями</p>
            </Panel>
            <Panel>
              <p className="text-sm text-slate-500">Всего попыток</p>
              <p className="text-3xl font-bold">{attempts.length}</p>
              <p className="mt-1 text-xs text-slate-500">Все ответы ребенка за все занятия</p>
            </Panel>
            <Panel>
              <p className="text-sm text-slate-500">Заданий в последнем</p>
              <p className="text-3xl font-bold">{stats.lastCompletedSession?.total_attempts ?? 0}</p>
              <p className="mt-1 text-xs text-slate-500">Только последнее завершенное занятие</p>
            </Panel>
            <Panel>
              <p className="text-sm text-slate-500">Общая точность</p>
              <p className="text-3xl font-bold">{formatPercent(stats.accuracy)}</p>
              <p className="mt-1 text-xs text-slate-500">По всем сохраненным ответам</p>
            </Panel>
            <Panel>
              <p className="text-sm text-slate-500">Серия занятий</p>
              <p className="text-2xl font-bold">{formatStreak(streak)}</p>
              <p className="mt-1 text-xs text-slate-500">Дни подряд с завершенным занятием</p>
            </Panel>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Panel>
              <h2 className="mb-3 text-lg font-bold">Последнее завершенное занятие</h2>
              {stats.lastCompletedSession ? (
                <div className="grid gap-2 text-sm">
                  <p>Дата и время: {new Date(stats.lastCompletedSession.finished_at ?? stats.lastCompletedSession.started_at).toLocaleString("ru-RU")}</p>
                  <p>Заданий: {stats.lastCompletedSession.total_attempts}</p>
                  <p>Верно: {stats.lastCompletedSession.correct_attempts}</p>
                  <p>Ошибок: {stats.lastCompletedSession.incorrect_attempts}</p>
                  <p>Accuracy: {formatPercent(stats.lastCompletedSession.accuracy)}</p>
                  <p>Звезд: {stats.lastCompletedSession.stars_earned}</p>
                </div>
              ) : (
                <p className="text-slate-500">Завершенных занятий пока нет. Пройдите тренировку в детском режиме.</p>
              )}
            </Panel>
            <Panel>
              <h2 className="mb-3 text-lg font-bold">Accuracy по типам упражнений</h2>
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
                <div className="grid gap-3">
                  {stats.weakestGrammar.map((item) => (
                    <div key={item.grammar?.id} className="rounded-lg bg-slate-50 p-3">
                      <b>{grammarLabel(item.grammar)}</b>
                      <p className="mt-1 text-sm text-slate-600">
                        Точность: {formatPercent(100 - item.rate * 100)} ({item.total - item.wrong}/{item.total})
                      </p>
                      {item.lastMistake ? (
                        <div className="mt-2 rounded-lg bg-white p-3 text-sm">
                          <p className="font-semibold">Последняя ошибка</p>
                          <p>Упражнение: {item.lastMistake.exercise_type}</p>
                          <p>Ответ ребенка: {item.lastMistake.answer || "нет ответа"}</p>
                          <p>Правильно: {item.lastMistake.correct_answer || "нет данных"}</p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">Есть ошибка. Посмотрите последние попытки.</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Ошибок по грамматике пока нет.</p>
              )}
            </Panel>
            <Panel>
              <h2 className="mb-3 text-lg font-bold">Повторить сегодня</h2>
              {dueToday.length ? (
                dueToday.slice(0, 6).map((item) => {
                  const card = cards.find((candidate) => candidate.id === item.card_id);
                  return <p key={item.id} className="border-b border-slate-100 py-2">{card ? cardLabel(card) : item.card_id}</p>;
                })
              ) : (
                <p className="text-slate-500">На сегодня повторений нет.</p>
              )}
            </Panel>
          </div>

          {detailed ? (
            <>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <Panel>
                  <h2 className="mb-3 text-lg font-bold">Фокусные тренажеры</h2>
                  <div className="grid gap-2 text-sm">
                    <p>Articles accuracy: {formatPercent(accuracy(stats.byType.articles ?? []))}</p>
                    <p>Question forms accuracy: {formatPercent(accuracy(stats.byType.question_form ?? []))}</p>
                    <p>Short answers accuracy: {formatPercent(accuracy(stats.byType.short_answer ?? []))}</p>
                    <p>
                      Last completed practice:{" "}
                      {stats.lastCompletedSession
                        ? new Date(stats.lastCompletedSession.finished_at ?? stats.lastCompletedSession.started_at).toLocaleDateString("ru-RU")
                        : "нет данных"}
                    </p>
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
              <Panel className="mt-5">
                <h2 className="mb-3 text-lg font-bold">Тексты</h2>
                {stats.textAttempts.length ? (
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm text-slate-500">Texts completed</p>
                      <p className="text-2xl font-bold">{stats.completedTextSessionIds.size}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm text-slate-500">Text attempts</p>
                      <p className="text-2xl font-bold">{stats.textAttempts.length}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm text-slate-500">Text accuracy</p>
                      <p className="text-2xl font-bold">{formatPercent((stats.textCorrect / stats.textAttempts.length) * 100)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm text-slate-500">Last text</p>
                      <p className="text-lg font-bold">{stats.lastText?.title_en ?? "Text"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">Тексты пока не проходили.</p>
                )}
                {stats.textMistakes.length ? (
                  <div className="mt-4">
                    <h3 className="font-bold">Recent text mistakes</h3>
                    <div className="mt-2 grid gap-2">
                      {stats.textMistakes.map((attempt) => {
                        const text = learningTexts.find((item) => item.id === attempt.text_id);
                        return (
                          <div className="rounded-lg bg-peach p-3 text-sm" key={attempt.id}>
                            <p className="font-semibold">{text?.title_en ?? "Text"} · {attempt.exercise_type}</p>
                            <p>Question: {attempt.question ?? text?.title_en ?? "text question"}</p>
                            <p>Answer: {attempt.answer}</p>
                            <p>Correct: {attempt.correct_answer}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </Panel>

              <Panel className="mt-5">
                <h2 className="mb-3 text-lg font-bold">Последние ошибки</h2>
                {stats.recentMistakes.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2 pr-3">Дата</th>
                          <th className="py-2 pr-3">Тип</th>
                          <th className="py-2 pr-3">Материал</th>
                          <th className="py-2 pr-3">Вопрос / English</th>
                          <th className="py-2 pr-3">Ответ ребенка</th>
                          <th className="py-2 pr-3">Правильно</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentMistakes.map((attempt) => {
                          const card = cards.find((item) => item.id === attempt.card_id);
                          const grammar = grammarPatterns.find((item) => item.id === attempt.grammar_pattern_id);
                          return (
                            <tr className="border-b border-slate-100" key={attempt.id}>
                              <td className="py-3 pr-3">{new Date(attempt.created_at).toLocaleString("ru-RU")}</td>
                              <td className="py-3 pr-3">{attempt.exercise_type}</td>
                              <td className="py-3 pr-3">{card ? "Карточка" : grammar ? "Грамматика" : "Упражнение"}</td>
                              <td className="py-3 pr-3">{card ? card.english : grammarLabel(grammar)}</td>
                              <td className="py-3 pr-3">{attempt.answer || "нет ответа"}</td>
                              <td className="py-3 pr-3">{attempt.correct_answer || "нет данных"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500">Ошибок пока нет.</p>
                )}
              </Panel>
            </>
          ) : null}
        </>
      )}
    </AuthRequired>
  );
}
