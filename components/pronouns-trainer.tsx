"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { Button, Input, PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { ExerciseType, PracticeSession } from "@/lib/database.types";
import { shuffle } from "@/lib/supabase/helpers";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type PronounMode = "mix" | "en_ru" | "ru_en" | "pairs";

type PronounItem = {
  english: string;
  russian: string;
  kind: "personal" | "possessive";
  pair?: string;
  note: string;
};

type PronounTask = {
  id: string;
  mode: PronounMode;
  prompt: string;
  promptLabel: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  answerLabel: string;
  explanationRu: string;
  exerciseType: ExerciseType;
  item: PronounItem;
};

type Mistake = {
  task: PronounTask;
  answer: string;
};

const personalPronouns: PronounItem[] = [
  { english: "I", russian: "я", kind: "personal", pair: "my", note: "I всегда пишется с большой буквы." },
  { english: "you", russian: "ты / вы", kind: "personal", pair: "your", note: "you может значить ты или вы." },
  { english: "he", russian: "он", kind: "personal", pair: "his", note: "he используем для мальчика или мужчины." },
  { english: "she", russian: "она", kind: "personal", pair: "her", note: "she используем для девочки или женщины." },
  { english: "it", russian: "оно / это", kind: "personal", pair: "its", note: "it используем для предмета или животного." },
  { english: "we", russian: "мы", kind: "personal", pair: "our", note: "we значит мы." },
  { english: "they", russian: "они", kind: "personal", pair: "their", note: "they значит они." }
];

const possessiveWords: PronounItem[] = [
  { english: "my", russian: "мой / моя / мое / мои", kind: "possessive", note: "my значит мой, моя, мое или мои." },
  { english: "your", russian: "твой / ваш", kind: "possessive", note: "your значит твой или ваш." },
  { english: "his", russian: "его", kind: "possessive", note: "his значит его, когда говорим о мальчике или мужчине." },
  { english: "her", russian: "ее", kind: "possessive", note: "her значит ее, когда говорим о девочке или женщине." },
  { english: "its", russian: "его / ее", kind: "possessive", note: "its используют для предмета или животного." },
  { english: "our", russian: "наш / наша / наше / наши", kind: "possessive", note: "our значит наш, наша, наше или наши." },
  { english: "their", russian: "их", kind: "possessive", note: "their значит их." }
];

const allPronounItems = [...personalPronouns, ...possessiveWords];

const modeCopy: Record<PronounMode, { title: string; subtitle: string }> = {
  mix: {
    title: "Быстрый микс",
    subtitle: "Личные и притяжательные местоимения вперемешку."
  },
  en_ru: {
    title: "Английский -> русский",
    subtitle: "Введи русский перевод английского местоимения."
  },
  ru_en: {
    title: "Русский -> английский",
    subtitle: "Введи английское местоимение."
  },
  pairs: {
    title: "Пары I -> my",
    subtitle: "Введи притяжательное слово: I -> my, she -> her, they -> their."
  }
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitRussianAnswers(value: string) {
  return value.split("/").map((item) => normalize(item)).filter(Boolean);
}

function isCorrectAnswer(answer: string, acceptedAnswers: string[]) {
  const normalizedAnswer = normalize(answer);
  return acceptedAnswers.some((accepted) => normalize(accepted) === normalizedAnswer);
}

function taskForItem(item: PronounItem, mode: PronounMode, index: number): PronounTask {
  if (mode === "en_ru") {
    return {
      id: `${mode}:${item.english}:${index}`,
      mode,
      prompt: item.english,
      promptLabel: "Напиши по-русски",
      correctAnswer: item.russian,
      acceptedAnswers: splitRussianAnswers(item.russian),
      answerLabel: "Русский перевод",
      explanationRu: item.note,
      exerciseType: "choose_translation",
      item
    };
  }

  if (mode === "pairs") {
    const pair = item.pair ?? item.english;
    return {
      id: `${mode}:${item.english}:${index}`,
      mode,
      prompt: item.english,
      promptLabel: "Напиши пару",
      correctAnswer: pair,
      acceptedAnswers: [pair],
      answerLabel: "Притяжательное слово",
      explanationRu: `${item.english} -> ${pair}. ${pair} показывает, кому принадлежит предмет.`,
      exerciseType: "fill_the_gap",
      item
    };
  }

  return {
    id: `${mode}:${item.english}:${index}`,
    mode,
    prompt: item.russian,
    promptLabel: "Напиши по-английски",
    correctAnswer: item.english,
    acceptedAnswers: [item.english],
    answerLabel: "English",
    explanationRu: item.note,
    exerciseType: "russian_to_english",
    item
  };
}

function buildTasks(mode: PronounMode) {
  if (mode === "pairs") {
    return shuffle(personalPronouns).map((item, index) => taskForItem(item, mode, index));
  }

  if (mode === "mix") {
    return shuffle(allPronounItems).slice(0, 12).map((item, index) => {
      const mixedMode: PronounMode = index % 2 === 0 ? "en_ru" : "ru_en";
      return taskForItem(item, mixedMode, index);
    });
  }

  return shuffle(allPronounItems).map((item, index) => taskForItem(item, mode, index));
}

export function PronounsTrainer() {
  const { api, family, loading, error } = useFamily();
  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState<string | null>(null);
  const [mode, setMode] = useState<PronounMode | null>(null);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [tasks, setTasks] = useState<PronounTask[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answering, setAnswering] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastAnswer, setLastAnswer] = useState("");
  const [stats, setStats] = useState({ total: 0, correct: 0 });
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [startedAt, setStartedAt] = useState(Date.now());
  const answeringRef = useRef(false);

  useEffect(() => {
    setChildId(window.localStorage.getItem("selected_child_id"));
    setChildName(window.localStorage.getItem("selected_child_name"));
  }, []);

  const current = tasks[index];
  const finished = tasks.length > 0 && index >= tasks.length;
  const stars = Math.min(3, Math.floor(stats.correct / 4) + (stats.total > 0 && stats.correct === stats.total ? 1 : 0));

  useEffect(() => {
    answeringRef.current = false;
    setAnswering(false);
    setAnswer("");
    setFeedback(null);
    setLastAnswer("");
    setStartedAt(Date.now());
  }, [index, mode]);

  const updateSession = useCallback(
    async (targetSession: PracticeSession, nextStats = stats, done = false) => {
      await api
        .from("practice_sessions")
        .update({
          finished_at: done ? new Date().toISOString() : null,
          duration_seconds: Math.max(1, Math.round((Date.now() - new Date(targetSession.started_at).getTime()) / 1000)),
          total_attempts: nextStats.total,
          correct_attempts: nextStats.correct,
          incorrect_attempts: nextStats.total - nextStats.correct,
          accuracy: nextStats.total ? (nextStats.correct / nextStats.total) * 100 : 0,
          stars_earned: Math.min(3, Math.floor(nextStats.correct / 4))
        })
        .eq("id", targetSession.id);
    },
    [api, stats]
  );

  useEffect(() => {
    if (!finished || !session) return;
    void updateSession(session, stats, true);
  }, [finished, session, stats, updateSession]);

  async function startMode(nextMode: PronounMode, retryTasks?: PronounTask[]) {
    if (!family || !childId) return;
    const { data } = await api
      .from("practice_sessions")
      .insert({ family_id: family.familyId, child_id: childId })
      .select()
      .single();

    setSession(data as PracticeSession);
    setMode(nextMode);
    setTasks(retryTasks ? shuffle(retryTasks).map((task, taskIndex) => ({ ...task, id: `retry:${taskIndex}:${task.id}` })) : buildTasks(nextMode));
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setLastAnswer("");
    setStats({ total: 0, correct: 0 });
    setMistakes([]);
    setStartedAt(Date.now());
  }

  function goNext() {
    setIndex((value) => value + 1);
    setAnswer("");
    setFeedback(null);
    setLastAnswer("");
    setStartedAt(Date.now());
  }

  function submitAnswer(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!family || !childId || !session || !current || feedback || answeringRef.current) return;
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) return;

    answeringRef.current = true;
    setAnswering(true);

    const correct = isCorrectAnswer(trimmedAnswer, current.acceptedAnswers);
    const nextStats = { total: stats.total + 1, correct: stats.correct + (correct ? 1 : 0) };
    const answeredTask = current;
    const activeSession = session;
    const responseTime = Date.now() - startedAt;

    setStats(nextStats);
    setLastAnswer(trimmedAnswer);

    if (correct) {
      goNext();
    } else {
      setFeedback("Почти! Давай разберем.");
      setMistakes((items) => [...items, { task: answeredTask, answer: trimmedAnswer }]);
    }

    void (async () => {
      await api.from("practice_attempts").insert({
        family_id: family.familyId,
        child_id: childId,
        session_id: activeSession.id,
        card_id: null,
        grammar_pattern_id: null,
        text_id: null,
        exercise_type: answeredTask.exerciseType,
        question: answeredTask.prompt,
        exercise_payload: {
          pronouns_mode: answeredTask.mode,
          prompt_label: answeredTask.promptLabel,
          answer_label: answeredTask.answerLabel,
          accepted_answers: answeredTask.acceptedAnswers,
          item_kind: answeredTask.item.kind
        },
        answer: trimmedAnswer,
        correct_answer: answeredTask.correctAnswer,
        is_correct: correct,
        response_time_ms: responseTime,
        rating: correct ? 5 : 2
      });
      await updateSession(activeSession, nextStats, false);
    })().catch((saveError) => console.error("Failed to save pronouns answer", saveError));
  }

  function repeatMistakes() {
    if (!mode || mistakes.length === 0) return;
    void startMode(mode, mistakes.map((mistake) => mistake.task));
  }

  const modeCards = useMemo(
    () =>
      ([
        ["mix", "Быстрый микс", "Все местоимения вперемешку"],
        ["en_ru", "Английский -> русский", "Напиши перевод"],
        ["ru_en", "Русский -> английский", "Вспомни English"],
        ["pairs", "Пары I -> my", "I -> my, she -> her"]
      ] as const),
    []
  );

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : !childId ? (
        <Panel>
          <p className="mb-4 font-medium">Сначала выберите детский профиль.</p>
          <Link className="rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/child/select">
            Выбрать профиль
          </Link>
        </Panel>
      ) : (
        <>
          <PageHeader
            title="Местоимения"
            subtitle={childName ? `${childName}, быстрый тренажер I, you, he, she, my, your, his, her...` : "Быстрый тренажер личных и притяжательных местоимений."}
          />

          {!mode ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {modeCards.map(([modeKey, title, text]) => (
                <button
                  className="focus-ring rounded-lg border border-sky-100 bg-white p-5 text-left shadow-soft hover:border-berry"
                  key={modeKey}
                  onClick={() => void startMode(modeKey)}
                  type="button"
                >
                  <span className="block text-2xl font-bold">{title}</span>
                  <span className="mt-2 block text-sm text-slate-600">{text}</span>
                </button>
              ))}
            </div>
          ) : finished ? (
            <Panel className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold">Готово!</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <Panel><p className="text-sm text-slate-500">Заданий</p><p className="text-2xl font-bold">{stats.total}</p></Panel>
                <Panel><p className="text-sm text-slate-500">Верно</p><p className="text-2xl font-bold">{stats.correct}</p></Panel>
                <Panel><p className="text-sm text-slate-500">Ошибок</p><p className="text-2xl font-bold">{stats.total - stats.correct}</p></Panel>
                <Panel><p className="text-sm text-slate-500">Звезды</p><p className="text-2xl font-bold">{"★".repeat(stars)}{"☆".repeat(Math.max(0, 3 - stars))}</p></Panel>
              </div>

              {mistakes.length ? (
                <div className="mt-5 rounded-lg bg-peach p-4 text-left">
                  <h3 className="text-xl font-bold">Ошибки</h3>
                  <div className="mt-3 grid gap-3">
                    {mistakes.map((mistake, mistakeIndex) => (
                      <div className="rounded-lg bg-white p-3" key={`${mistake.task.id}-${mistakeIndex}`}>
                        <p className="font-bold">{mistake.task.prompt}</p>
                        <p className="text-sm">Твой ответ: {mistake.answer}</p>
                        <p className="text-sm">Правильно: {mistake.task.correctAnswer}</p>
                        <p className="text-sm text-slate-600">Почему: {mistake.task.explanationRu}</p>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-4 bg-berry" type="button" onClick={repeatMistakes}>
                    Повторить ошибки
                  </Button>
                </div>
              ) : (
                <p className="mt-5 rounded-lg bg-mint p-4 text-lg font-bold">Ошибок нет. Отличная работа!</p>
              )}

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button type="button" onClick={() => setMode(null)}>Выбрать другой режим</Button>
                <Link className="rounded-lg bg-berry px-5 py-3 font-bold text-white" href="/child/dashboard">В детский кабинет</Link>
              </div>
            </Panel>
          ) : current ? (
            <Panel className="mx-auto max-w-2xl">
              <div className="mb-4 flex items-center justify-between text-sm font-semibold text-slate-500">
                <span>{index + 1} / {tasks.length}</span>
                <span>{modeCopy[mode].title}</span>
              </div>
              <div className="rounded-lg bg-skysoft p-6 text-center">
                <p className="text-sm font-semibold text-slate-500">{current.promptLabel}</p>
                <p className="mt-2 text-5xl font-bold">{current.prompt}</p>
              </div>
              <form className="mt-5 grid gap-3" onSubmit={submitAnswer}>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  {current.answerLabel}
                  <Input
                    autoComplete="off"
                    disabled={answering || Boolean(feedback)}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="Введи ответ"
                    value={answer}
                  />
                </label>
                <Button disabled={answering || Boolean(feedback) || !answer.trim()} type="submit">
                  Проверить
                </Button>
              </form>

              {feedback ? (
                <div className="mt-5 rounded-lg bg-peach p-4 text-left">
                  <p className="text-2xl font-bold">{feedback}</p>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700">
                    <p><b>Твой ответ:</b> {lastAnswer}</p>
                    <p><b>Правильно:</b> {current.correctAnswer}</p>
                    <p><b>Перевод:</b> {current.mode === "ru_en" || current.mode === "pairs" ? current.item.russian : current.correctAnswer}</p>
                    <p><b>Почему:</b> {current.explanationRu}</p>
                    <Button className="mt-2 bg-berry" type="button" onClick={goNext}>
                      Продолжить
                    </Button>
                  </div>
                </div>
              ) : null}
            </Panel>
          ) : null}
        </>
      )}
    </AuthRequired>
  );
}
