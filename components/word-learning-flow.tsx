"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { Button, PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Card, PracticeAttempt, PracticeSession, ReviewSchedule, Topic } from "@/lib/database.types";
import { explainAnswer } from "@/lib/practice/explanations";
import { isCorrectAnswer, nextReviewState, type PracticeExercise } from "@/lib/practice/exercises";
import { speakEnglish } from "@/lib/speech";
import { shuffle } from "@/lib/supabase/helpers";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type WordMode = "new" | "review" | "mistakes" | "topic";

type WordTask = {
  id: string;
  card: Card;
  step: "presentation" | "choose_translation" | "russian_to_english" | "listen_and_choose" | "quick_recall";
  exercise?: PracticeExercise;
};

type Mistake = {
  task: WordTask;
  answer: string;
  correctAnswer: string;
  explanationRu: string;
};

const modeCopy: Record<WordMode, { title: string; subtitle: string; empty: string }> = {
  new: {
    title: "Учить новые слова",
    subtitle: "Короткий цикл: посмотри, послушай, выбери перевод и найди английский вариант.",
    empty: "Новых слов пока нет. Можно повторить слова или выбрать тему."
  },
  review: {
    title: "Повторить слова",
    subtitle: "Здесь появляются слова и фразы, которые пора повторить сегодня.",
    empty: "На сегодня повторений нет. Можно выучить новые слова."
  },
  mistakes: {
    title: "Повторить ошибки",
    subtitle: "Короткая тренировка по словам, где недавно были ошибки.",
    empty: "Ошибок пока нет. Отличная работа!"
  },
  topic: {
    title: "Слова по теме",
    subtitle: "Небольшая тренировка по выбранной теме.",
    empty: "В этой теме пока нет активных слов."
  }
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[?.!,]/g, "").replace(/\s+/g, " ").trim();
}

function uniqueCards(cards: Card[]) {
  return Array.from(new Map(cards.map((card) => [card.id, card])).values());
}

function options(correct: string, candidates: string[], fallback: string[]) {
  const used = new Set<string>([normalize(correct)]);
  const distractors = shuffle([...candidates, ...fallback])
    .map((item) => item.trim())
    .filter((item) => {
      const key = normalize(item);
      if (!item || used.has(key)) return false;
      used.add(key);
      return true;
    })
    .slice(0, 3);
  return shuffle([correct, ...distractors]);
}

function buildExercise(card: Card, cards: Card[], step: Exclude<WordTask["step"], "presentation">): PracticeExercise {
  if (step === "russian_to_english" || step === "quick_recall") {
    return {
      id: `${step}:${card.id}`,
      type: "russian_to_english",
      card,
      prompt: card.russian,
      promptRu: step === "quick_recall" ? "Вспомни английское слово" : "Выбери английский вариант",
      options: options(card.english, cards.map((item) => item.english), ["Yes, please.", "a cat", "a pencil", "I can run."]),
      correctAnswer: card.english,
      listenText: card.english,
      explanationRu: step === "quick_recall" ? "Так это слово пишется по-английски." : "Так это слово пишется по-английски."
    };
  }

  if (step === "listen_and_choose") {
    return {
      id: `${step}:${card.id}`,
      type: "listen_and_choose",
      card,
      prompt: "Послушай слово и выбери перевод",
      promptRu: card.english,
      options: options(card.russian, cards.map((item) => item.russian), ["да", "нет", "пожалуйста", "спасибо"]),
      correctAnswer: card.russian,
      listenText: card.english,
      explanationRu: "Слушай звучание и связывай его с переводом."
    };
  }

  return {
    id: `${step}:${card.id}`,
    type: "choose_translation",
    card,
    prompt: card.english,
    promptRu: "Выбери перевод",
    options: options(card.russian, cards.map((item) => item.russian), ["да", "нет", "пожалуйста", "спасибо"]),
    correctAnswer: card.russian,
    listenText: card.english,
    explanationRu: `Запомни эту пару: ${card.english} - ${card.russian}.`
  };
}

function buildLearningTasks(cards: Card[], allCards: Card[], includePresentation = true) {
  const steps: WordTask["step"][] = includePresentation
    ? ["presentation", "choose_translation", "russian_to_english", "listen_and_choose", "quick_recall"]
    : ["choose_translation", "russian_to_english", "listen_and_choose"];

  return cards.flatMap((card) =>
    steps.map((step) => ({
      id: `${step}:${card.id}`,
      card,
      step,
      exercise: step === "presentation" ? undefined : buildExercise(card, allCards, step)
    }))
  );
}

function attemptsByCard(attempts: PracticeAttempt[]) {
  return attempts.reduce<Record<string, { total: number; wrong: number }>>((acc, attempt) => {
    if (!attempt.card_id) return acc;
    acc[attempt.card_id] ??= { total: 0, wrong: 0 };
    acc[attempt.card_id].total += 1;
    if (!attempt.is_correct) acc[attempt.card_id].wrong += 1;
    return acc;
  }, {});
}

function selectCards(params: {
  mode: WordMode;
  cards: Card[];
  attempts: PracticeAttempt[];
  schedules: ReviewSchedule[];
  topicId?: string;
}) {
  const { mode, cards, attempts, schedules, topicId } = params;
  const wordCards = cards.filter((card) => card.status === "active" && (card.type === "word" || card.type === "phrase"));
  const wordOnly = wordCards.filter((card) => card.type === "word");
  const stats = attemptsByCard(attempts);
  const seen = new Set(Object.keys(stats));

  if (mode === "review") {
    const dueIds = new Set(schedules.filter((item) => new Date(item.due_at).getTime() <= Date.now()).map((item) => item.card_id));
    return uniqueCards(wordCards.filter((card) => dueIds.has(card.id))).slice(0, 8);
  }

  if (mode === "mistakes") {
    const mistakeCardIds = attempts.filter((attempt) => !attempt.is_correct && attempt.card_id).map((attempt) => attempt.card_id as string);
    return uniqueCards(mistakeCardIds.map((id) => wordCards.find((card) => card.id === id)).filter((card): card is Card => Boolean(card))).slice(0, 8);
  }

  if (mode === "topic") {
    return uniqueCards(wordCards.filter((card) => card.topic_id === topicId)).slice(0, 8);
  }

  const unseen = shuffle(wordOnly.filter((card) => !seen.has(card.id))).slice(0, 7);
  if (unseen.length >= 5) return unseen;

  const leastPracticed = wordOnly
    .filter((card) => !unseen.some((item) => item.id === card.id))
    .sort((a, b) => (stats[a.id]?.total ?? 0) - (stats[b.id]?.total ?? 0))
    .slice(0, 7 - unseen.length);
  return [...unseen, ...leastPracticed];
}

export function WordLearningFlow({ mode, topicId }: { mode: WordMode; topicId?: string }) {
  const { api, family, loading, error } = useFamily();
  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [tasks, setTasks] = useState<WordTask[]>([]);
  const [schedules, setSchedules] = useState<ReviewSchedule[]>([]);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [stats, setStats] = useState({ total: 0, correct: 0 });
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);

  useEffect(() => {
    setChildId(window.localStorage.getItem("selected_child_id"));
    setChildName(window.localStorage.getItem("selected_child_name"));
  }, []);

  useEffect(() => {
    async function load() {
      if (!family || !childId) return;
      const [cardsRes, attemptsRes, schedulesRes, topicRes] = await Promise.all([
        api.from("cards").select("*").eq("family_id", family.familyId).eq("status", "active").limit(500),
        api.from("practice_attempts").select("*").eq("family_id", family.familyId).eq("child_id", childId).order("created_at", { ascending: false }).limit(1000),
        api.from("review_schedule").select("*").eq("family_id", family.familyId).eq("child_id", childId),
        topicId ? api.from("topics").select("*").eq("family_id", family.familyId).eq("id", topicId).maybeSingle() : Promise.resolve({ data: null })
      ]);

      const loadedCards = (cardsRes.data ?? []) as Card[];
      const loadedAttempts = (attemptsRes.data ?? []) as PracticeAttempt[];
      const loadedSchedules = (schedulesRes.data ?? []) as ReviewSchedule[];
      const pickedCards = selectCards({ mode, cards: loadedCards, attempts: loadedAttempts, schedules: loadedSchedules, topicId });
      const includePresentation = mode === "new" || mode === "topic";

      setCards(loadedCards);
      setSelectedCards(pickedCards);
      setSchedules(loadedSchedules);
      setTasks(buildLearningTasks(pickedCards, loadedCards, includePresentation));
      setTopic((topicRes.data ?? null) as Topic | null);

      if (pickedCards.length) {
        const { data: newSession } = await api
          .from("practice_sessions")
          .insert({ family_id: family.familyId, child_id: childId })
          .select()
          .single();
        setSession(newSession as PracticeSession);
      }
    }
    void load();
  }, [childId, family, mode, api, topicId]);

  const current = tasks[index];
  const finished = tasks.length > 0 && index >= tasks.length;
  const copy = modeCopy[mode];
  const stars = Math.min(3, Math.floor(stats.correct / 4) + (stats.total && stats.correct === stats.total ? 1 : 0));

  const finishSession = useCallback(async () => {
    if (!session) return;
    await api
      .from("practice_sessions")
      .update({
        finished_at: new Date().toISOString(),
        duration_seconds: Math.max(1, Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000)),
        total_attempts: stats.total,
        correct_attempts: stats.correct,
        incorrect_attempts: stats.total - stats.correct,
        accuracy: stats.total ? (stats.correct / stats.total) * 100 : 0,
        stars_earned: stars
      })
      .eq("id", session.id);
  }, [session, stars, stats.correct, stats.total, api]);

  useEffect(() => {
    if (finished) void finishSession();
  }, [finishSession, finished]);

  async function saveAnswer(answer: string) {
    if (!family || !childId || !session || !current?.exercise || feedback) return;
    const exercise = current.exercise;
    const correct = isCorrectAnswer(answer, exercise.correctAnswer);
    const nextStats = { total: stats.total + 1, correct: stats.correct + (correct ? 1 : 0) };
    setStats(nextStats);
    setLastCorrect(correct);
    setFeedback(correct ? "Отлично!" : "Почти! Посмотри правильный ответ.");

    if (!correct) {
      setMistakes((items) => [
        ...items,
        {
          task: current,
          answer,
          correctAnswer: exercise.correctAnswer,
          explanationRu: explainAnswer(exercise)
        }
      ]);
    }

    await api.from("practice_attempts").insert({
      family_id: family.familyId,
      child_id: childId,
      session_id: session.id,
      card_id: current.card.id,
      grammar_pattern_id: null,
      exercise_type: exercise.type,
      answer,
      correct_answer: exercise.correctAnswer,
      is_correct: correct,
      response_time_ms: Date.now() - startedAt,
      rating: correct ? 5 : 2
    });

    const existing = schedules.find((item) => item.card_id === current.card.id);
    await api.from("review_schedule").upsert(
      {
        family_id: family.familyId,
        child_id: childId,
        card_id: current.card.id,
        ...nextReviewState(existing, correct, correct ? 5 : 2)
      },
      { onConflict: "child_id,card_id" }
    );

    window.setTimeout(() => {
      setFeedback(null);
      setLastCorrect(null);
      setIndex((value) => value + 1);
      setStartedAt(Date.now());
    }, correct ? 750 : 1400);
  }

  function nextPresentation() {
    setIndex((value) => value + 1);
    setStartedAt(Date.now());
  }

  async function repeatWords() {
    if (!family || !childId) return;
    const { data: newSession } = await api
      .from("practice_sessions")
      .insert({ family_id: family.familyId, child_id: childId })
      .select()
      .single();
    setSession(newSession as PracticeSession);
    setTasks(buildLearningTasks(selectedCards, cards, false));
    setIndex(0);
    setStats({ total: 0, correct: 0 });
    setMistakes([]);
    setFeedback(null);
    setLastCorrect(null);
    setStartedAt(Date.now());
  }

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : !childId ? (
        <Panel>
          <p className="mb-4 font-medium">Сначала выберите детский профиль.</p>
          <Link className="rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/child/select">Выбрать профиль</Link>
        </Panel>
      ) : (
        <>
          <PageHeader
            title={topic ? `${copy.title}: ${topic.title}` : copy.title}
            subtitle={childName ? `${childName}, ${copy.subtitle}` : copy.subtitle}
          />
          {!tasks.length ? (
            <Panel className="max-w-xl">
              <p className="text-lg font-bold">{copy.empty}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="rounded-lg bg-berry px-4 py-3 font-semibold text-white" href="/child/words/new">Учить новые слова</Link>
                <Link className="rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/child/words/topics">Слова по темам</Link>
              </div>
            </Panel>
          ) : finished ? (
            <Panel className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold">Готово!</h2>
              <div className="mt-4 grid gap-3 text-center sm:grid-cols-4">
                <Panel><p className="text-sm text-slate-500">Слов</p><p className="text-2xl font-bold">{selectedCards.length}</p></Panel>
                <Panel><p className="text-sm text-slate-500">Ответов</p><p className="text-2xl font-bold">{stats.total}</p></Panel>
                <Panel><p className="text-sm text-slate-500">Верно</p><p className="text-2xl font-bold">{stats.correct}</p></Panel>
                <Panel><p className="text-sm text-slate-500">Звезды</p><p className="text-2xl font-bold">{"★".repeat(stars)}{"☆".repeat(Math.max(0, 3 - stars))}</p></Panel>
              </div>
              <div className="mt-5 rounded-lg bg-skysoft p-4">
                <h3 className="font-bold">Изученные слова</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedCards.map((card) => <span className="rounded-lg bg-white px-3 py-2 font-semibold" key={card.id}>{card.english} - {card.russian}</span>)}
                </div>
              </div>
              <div className="mt-5 rounded-lg bg-peach p-4">
                <h3 className="font-bold">Ошибки</h3>
                {mistakes.length ? (
                  <div className="mt-3 grid gap-3">
                    {mistakes.map((mistake, mistakeIndex) => (
                      <div className="rounded-lg bg-white p-3" key={`${mistake.task.id}-${mistakeIndex}`}>
                        <p className="font-semibold">{mistake.task.card.english}</p>
                        <p className="text-sm">Ответ: {mistake.answer}</p>
                        <p className="text-sm">Правильно: {mistake.correctAnswer}</p>
                        <p className="text-sm text-slate-600">{mistake.explanationRu}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2">Ошибок нет. Отличная работа!</p>
                )}
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button type="button" onClick={repeatWords}>Повторить эти слова</Button>
                <Link className="rounded-lg bg-berry px-5 py-3 font-bold text-white" href="/child/dashboard">В детский кабинет</Link>
              </div>
            </Panel>
          ) : current ? (
            <Panel className="mx-auto max-w-2xl">
              <div className="mb-4 flex items-center justify-between text-sm font-semibold text-slate-500">
                <span>{index + 1} / {tasks.length}</span>
                <span>{current.card.english}</span>
              </div>
              {current.step === "presentation" ? (
                <div className="text-center">
                  <p className="text-5xl font-bold">{current.card.english}</p>
                  <p className="mt-3 text-3xl text-slate-700">{current.card.russian}</p>
                  {current.card.example_en ? <p className="mt-4 rounded-lg bg-skysoft p-4 text-xl">{current.card.example_en}</p> : null}
                  {current.card.example_ru ? <p className="mt-2 text-slate-500">{current.card.example_ru}</p> : null}
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Button type="button" onClick={() => speakEnglish(current.card.english, 0.9)}>Listen</Button>
                    <Button className="bg-slate-700" type="button" onClick={() => speakEnglish(current.card.english, 0.6)}>Listen slowly</Button>
                    <Button className="bg-berry" type="button" onClick={nextPresentation}>Понятно</Button>
                  </div>
                </div>
              ) : current.exercise ? (
                <div>
                  <div className="rounded-lg bg-skysoft p-6 text-center">
                    <p className="text-sm font-semibold text-slate-500">{current.exercise.promptRu}</p>
                    <p className="mt-2 text-3xl font-bold">{current.exercise.prompt}</p>
                  </div>
                  {current.exercise.listenText ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" onClick={() => speakEnglish(current.exercise?.listenText ?? "", 0.9)}>Listen</Button>
                      <Button className="bg-slate-700" type="button" onClick={() => speakEnglish(current.exercise?.listenText ?? "", 0.6)}>Listen slowly</Button>
                    </div>
                  ) : null}
                  <div className="mt-5 grid gap-3">
                    {current.exercise.options.map((option) => (
                      <button className="focus-ring rounded-lg border-2 border-slate-200 bg-white p-4 text-left text-xl font-bold hover:border-berry" key={option} type="button" onClick={() => saveAnswer(option)}>
                        {option}
                      </button>
                    ))}
                  </div>
                  {feedback ? (
                    <div className="mt-5 rounded-lg bg-mint p-4 text-center">
                      <p className="text-2xl font-bold">{feedback}</p>
                      <p className="mt-2 text-sm">{explainAnswer(current.exercise)}</p>
                      {lastCorrect === false ? <p className="mt-2 text-sm text-slate-600">Правильно: {current.exercise.correctAnswer}</p> : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </Panel>
          ) : null}
        </>
      )}
    </AuthRequired>
  );
}
