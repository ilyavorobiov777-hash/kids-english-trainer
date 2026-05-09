"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { Button, PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Card, GrammarPattern, PracticeAttempt, PracticeSession, ReviewSchedule } from "@/lib/database.types";
import { buildDailyPractice, isCorrectAnswer, nextReviewState, type PracticeExercise } from "@/lib/practice/exercises";
import { speakEnglish } from "@/lib/speech";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const positiveFeedback = ["Отлично!", "Здорово!", "Так держать!"];
const retryFeedback = ["Почти! Давай еще раз", "Хорошая попытка", "Не страшно, повторим"];

export function PracticeFlow() {
  const { supabase, family, loading, error } = useFamily();
  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState<string | null>(null);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [exercises, setExercises] = useState<PracticeExercise[]>([]);
  const [schedules, setSchedules] = useState<ReviewSchedule[]>([]);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [speechMessage, setSpeechMessage] = useState<string | null>(null);
  const [rate, setRate] = useState(0.9);
  const [stats, setStats] = useState({ total: 0, correct: 0 });
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [usedWordIndexes, setUsedWordIndexes] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setChildId(window.localStorage.getItem("selected_child_id"));
    setChildName(window.localStorage.getItem("selected_child_name"));
  }, []);

  useEffect(() => {
    async function load() {
      if (!family || !childId) return;
      const [cardsRes, attemptsRes, scheduleRes, grammarRes] = await Promise.all([
        supabase.from("cards").select("*").eq("family_id", family.familyId).eq("status", "active").limit(500),
        supabase
          .from("practice_attempts")
          .select("*")
          .eq("family_id", family.familyId)
          .eq("child_id", childId)
          .order("created_at", { ascending: false })
          .limit(800),
        supabase.from("review_schedule").select("*").eq("family_id", family.familyId).eq("child_id", childId),
        supabase.from("grammar_patterns").select("*").eq("family_id", family.familyId)
      ]);

      const cards = (cardsRes.data ?? []) as Card[];
      const attempts = (attemptsRes.data ?? []) as PracticeAttempt[];
      const reviewSchedules = (scheduleRes.data ?? []) as ReviewSchedule[];
      const grammarPatterns = (grammarRes.data ?? []) as GrammarPattern[];
      setSchedules(reviewSchedules);
      setExercises(buildDailyPractice({ cards, attempts, schedules: reviewSchedules, grammarPatterns }));

      const { data: newSession } = await supabase
        .from("practice_sessions")
        .insert({ family_id: family.familyId, child_id: childId })
        .select()
        .single();
      setSession(newSession as PracticeSession);
      setStartedAt(Date.now());
    }
    void load();
  }, [family, childId, supabase]);

  const current = exercises[index];
  const finished = exercises.length > 0 && index >= exercises.length;
  const stars = Math.min(3, Math.floor(stats.correct / 3) + (stats.total && stats.correct === stats.total ? 1 : 0));

  const finishSession = useCallback(async () => {
    if (!session || completed) return;
    const duration = Math.max(1, Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000));
    const incorrect = stats.total - stats.correct;
    const accuracy = stats.total ? (stats.correct / stats.total) * 100 : 0;
    await supabase
      .from("practice_sessions")
      .update({
        finished_at: new Date().toISOString(),
        duration_seconds: duration,
        total_attempts: stats.total,
        correct_attempts: stats.correct,
        incorrect_attempts: incorrect,
        accuracy,
        stars_earned: stars
      })
      .eq("id", session.id);
    setCompleted(true);
  }, [completed, session, stars, stats.correct, stats.total, supabase]);

  useEffect(() => {
    if (finished) void finishSession();
  }, [finished, finishSession]);

  const title = useMemo(() => {
    if (!current) return "Тренировка";
    const names: Record<string, string> = {
      choose_translation: "Выбери перевод",
      russian_to_english: "Найди английский вариант",
      listen_and_choose: "Послушай и выбери",
      build_sentence: "Собери предложение",
      fill_the_gap: "Заполни пропуск",
      question_form: "Сделай вопрос",
      short_answer: "Короткий ответ",
      articles: "Артикли",
      mini_dialogue: "Мини-диалог"
    };
    return names[current.type] ?? "Тренировка";
  }, [current]);

  function listen(customRate = rate) {
    if (!current?.listenText) return;
    const result = speakEnglish(current.listenText, customRate);
    setSpeechMessage(result.message ?? null);
  }

  async function saveAnswer(answer: string) {
    if (!family || !childId || !current || !session || feedback) return;
    const isCorrect = isCorrectAnswer(answer, current.correctAnswer);
    const responseTime = Date.now() - startedAt;
    const rating = isCorrect ? 5 : 2;
    const nextStats = { total: stats.total + 1, correct: stats.correct + (isCorrect ? 1 : 0) };
    setStats(nextStats);
    setLastCorrect(isCorrect);
    setFeedback(isCorrect ? positiveFeedback[nextStats.correct % positiveFeedback.length] : retryFeedback[nextStats.total % retryFeedback.length]);

    await supabase.from("practice_attempts").insert({
      family_id: family.familyId,
      child_id: childId,
      session_id: session.id,
      card_id: current.card?.id ?? null,
      grammar_pattern_id: current.grammarPattern?.id ?? null,
      exercise_type: current.type,
      answer,
      correct_answer: current.correctAnswer,
      is_correct: isCorrect,
      response_time_ms: responseTime,
      rating
    });

    const duration = Math.max(1, Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000));
    await supabase
      .from("practice_sessions")
      .update({
        duration_seconds: duration,
        total_attempts: nextStats.total,
        correct_attempts: nextStats.correct,
        incorrect_attempts: nextStats.total - nextStats.correct,
        accuracy: nextStats.total ? (nextStats.correct / nextStats.total) * 100 : 0,
        stars_earned: Math.min(3, Math.floor(nextStats.correct / 3))
      })
      .eq("id", session.id);

    if (current.card?.id) {
      const existing = schedules.find((item) => item.card_id === current.card?.id);
      const review = nextReviewState(existing, isCorrect, rating);
      await supabase.from("review_schedule").upsert(
        {
          family_id: family.familyId,
          child_id: childId,
          card_id: current.card.id,
          ...review
        },
        { onConflict: "child_id,card_id" }
      );
    }

    window.setTimeout(() => {
      setFeedback(null);
      setLastCorrect(null);
      setSpeechMessage(null);
      setSelectedWords([]);
      setUsedWordIndexes([]);
      setIndex((value) => value + 1);
      setStartedAt(Date.now());
    }, isCorrect ? 850 : 1600);
  }

  function addWord(word: string, wordIndex: number) {
    if (usedWordIndexes.includes(wordIndex) || feedback) return;
    setSelectedWords([...selectedWords, word]);
    setUsedWordIndexes([...usedWordIndexes, wordIndex]);
  }

  function resetSentence() {
    setSelectedWords([]);
    setUsedWordIndexes([]);
  }

  const isChoiceExerciseBroken =
    current && current.type !== "build_sentence" && (!current.options.length || current.options.length < 2);
  const sentenceReady = current?.type === "build_sentence" && selectedWords.length === (current.words?.length ?? 0);

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : !childId ? (
        <Panel>
          <p className="mb-4 font-medium">Сначала выбери детский профиль.</p>
          <Link className="rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/child/select">
            Выбрать профиль
          </Link>
        </Panel>
      ) : (
        <>
          <PageHeader
            title={title}
            subtitle={childName ? `${childName}, короткое занятие на сегодня.` : "Короткое занятие на сегодня."}
          />
          {!exercises.length ? (
            <Panel>
              Активных карточек пока нет. Родитель может добавить карточки, импортировать CSV или загрузить Starter 350.
            </Panel>
          ) : finished ? (
            <Panel className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold">Готово!</h2>
              <p className="mt-3 text-xl">Заданий выполнено: {stats.total}</p>
              <p className="mt-2 text-xl">Правильных ответов: {stats.correct}</p>
              <p className="mt-2 text-2xl font-bold text-berry">Звезды: {"★".repeat(stars)}{"☆".repeat(Math.max(0, 3 - stars))}</p>
              <p className="mt-4 rounded-lg bg-skysoft p-4">
                Завтра повторим карточки, где были ошибки, и добавим несколько новых.
              </p>
              <Link className="mt-5 inline-block rounded-lg bg-berry px-6 py-4 font-bold text-white" href="/child/dashboard">
                В детский кабинет
              </Link>
            </Panel>
          ) : current ? (
            <Panel className="mx-auto max-w-2xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">Задание {index + 1} / {exercises.length}</p>
                <p className="text-sm font-semibold text-slate-500">Верно: {stats.correct}</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-berry" style={{ width: `${((index + 1) / exercises.length) * 100}%` }} />
              </div>

              <div className="mt-5 rounded-lg bg-skysoft p-6 text-center">
                {current.promptRu ? <p className="mb-2 text-sm font-semibold text-slate-500">{current.promptRu}</p> : null}
                <p className="text-3xl font-bold leading-tight">{current.prompt}</p>
                {current.card?.example_en && current.type === "choose_translation" ? (
                  <p className="mt-3 text-lg text-slate-700">{current.card.example_en}</p>
                ) : null}
              </div>

              {current.listenText ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_140px]">
                  <Button type="button" onClick={() => listen(rate)}>Listen</Button>
                  <Button type="button" className="bg-slate-700" onClick={() => listen(0.6)}>Listen slowly</Button>
                  <label className="grid gap-1 text-sm text-slate-600">
                    Rate {rate.toFixed(1)}
                    <input
                      min="0.5"
                      max="1.2"
                      step="0.1"
                      value={rate}
                      onChange={(event) => setRate(Number(event.target.value))}
                      type="range"
                    />
                  </label>
                </div>
              ) : null}
              {speechMessage ? <p className="mt-3 rounded-lg bg-peach p-3 text-sm">{speechMessage}</p> : null}

              {isChoiceExerciseBroken ? (
                <div className="mt-5 rounded-lg bg-peach p-4">
                  <p className="font-semibold">Это задание пропущено: не хватает вариантов ответа.</p>
                  <Button className="mt-3" type="button" onClick={() => setIndex((value) => value + 1)}>
                    Следующее задание
                  </Button>
                </div>
              ) : current.type === "build_sentence" ? (
                <div className="mt-5 grid gap-4">
                  <div className="min-h-16 rounded-lg border-2 border-dashed border-slate-200 bg-white p-4 text-xl font-bold">
                    {selectedWords.length ? selectedWords.join(" ") : "Нажимай слова по порядку"}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(current.words ?? []).map((word, wordIndex) => (
                      <button
                        key={`${word}-${wordIndex}`}
                        className="focus-ring rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold disabled:opacity-40"
                        disabled={usedWordIndexes.includes(wordIndex)}
                        onClick={() => addWord(word, wordIndex)}
                        type="button"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" onClick={() => saveAnswer(selectedWords.join(" "))} disabled={!sentenceReady}>
                      Проверить
                    </Button>
                    <Button type="button" className="bg-slate-600" onClick={resetSentence}>Reset</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-3">
                  {current.options.map((option) => (
                    <button
                      key={option}
                      className="focus-ring rounded-lg border-2 border-slate-200 bg-white p-4 text-left text-xl font-bold hover:border-berry"
                      onClick={() => saveAnswer(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {feedback ? (
                <div className="mt-5 rounded-lg bg-mint p-4 text-center">
                  <p className="text-2xl font-bold">{feedback}</p>
                  {current.explanationRu ? <p className="mt-2 text-sm">{current.explanationRu}</p> : null}
                  {lastCorrect === false ? <p className="mt-2 text-sm text-slate-600">Правильный ответ: {current.correctAnswer}</p> : null}
                </div>
              ) : null}
            </Panel>
          ) : null}
        </>
      )}
    </AuthRequired>
  );
}
