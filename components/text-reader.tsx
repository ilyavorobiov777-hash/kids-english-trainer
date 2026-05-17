"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { Button, PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Card, LearningText, LearningTextQuestion, LearningTextVocabularyWord, PracticeSession, Topic } from "@/lib/database.types";
import { correctAnswerTranslation } from "@/lib/practice/explanations";
import { isCorrectAnswer, nextReviewState } from "@/lib/practice/exercises";
import { speakEnglish } from "@/lib/speech";
import { shuffle } from "@/lib/supabase/helpers";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TextMistake = {
  question: string;
  answer: string;
  correctAnswer: string;
  explanationRu: string;
};

type VocabTask = {
  word: LearningTextVocabularyWord;
  card?: Card;
  options: string[];
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[?.!,]/g, "").replace(/\s+/g, " ").trim();
}

function questionExplanation(question: LearningTextQuestion) {
  if (question.explanationRu) return question.explanationRu;
  if (question.type === "true_false") return "Посмотри на текст: утверждение должно совпадать с тем, что там написано.";
  if (question.type === "match_word_translation" || question.type === "vocabulary_review_from_text") {
    return "Свяжи слово из текста с его русским переводом.";
  }
  if (question.type === "build_sentence_from_text") return "В английском предложении важен порядок слов: кто + что делает + остальные слова.";
  return "Найди ответ прямо в тексте и проверь ключевые слова.";
}

function textForSpeech(text: LearningText) {
  return `${text.title_en}. ${text.text_en}`;
}

function makeVocabTasks(words: LearningTextVocabularyWord[], cards: Card[]) {
  const translations = words.map((word) => word.russian);
  return words.slice(0, 5).map((word) => {
    const card = cards.find((item) => normalize(item.english) === normalize(word.english));
    const options = shuffle([
      word.russian,
      ...shuffle(translations.filter((item) => normalize(item) !== normalize(word.russian))).slice(0, 3),
      "да",
      "нет"
    ]).slice(0, 4);
    return { word, card, options };
  });
}

export function TextReader({ textId }: { textId: string }) {
  const { api, family, loading, error } = useFamily();
  const [childId, setChildId] = useState<string | null>(null);
  const [text, setText] = useState<LearningText | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [answers, setAnswers] = useState<{ total: number; correct: number }>({ total: 0, correct: 0 });
  const [mistakes, setMistakes] = useState<TextMistake[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [usedWordIndexes, setUsedWordIndexes] = useState<number[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [vocabIndex, setVocabIndex] = useState(0);
  const [vocabStats, setVocabStats] = useState({ total: 0, correct: 0 });
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string | null>(null);
  const [lastCorrectTranslation, setLastCorrectTranslation] = useState<string | null>(null);
  const [lastExplanation, setLastExplanation] = useState<string | null>(null);
  const [pendingAdvance, setPendingAdvance] = useState<"question" | "vocab" | null>(null);
  const [answering, setAnswering] = useState(false);
  const answeringRef = useRef(false);

  useEffect(() => {
    answeringRef.current = false;
    setAnswering(false);
  }, [questionIndex, vocabIndex, showQuestions, showVocabulary]);

  useEffect(() => {
    setChildId(window.localStorage.getItem("selected_child_id"));
  }, []);

  useEffect(() => {
    async function load() {
      if (!family) return;
      const { data } = await api.from("learning_texts").select("*").eq("family_id", family.familyId).eq("id", textId).maybeSingle();
      const loadedText = data as LearningText | null;
      setText(loadedText);
      if (!loadedText) return;

      const [topicRes, cardsRes] = await Promise.all([
        loadedText.topic_id ? api.from("topics").select("*").eq("family_id", family.familyId).eq("id", loadedText.topic_id).maybeSingle() : Promise.resolve({ data: null }),
        api.from("cards").select("*").eq("family_id", family.familyId).eq("status", "active").limit(600)
      ]);
      setTopic((topicRes.data ?? null) as Topic | null);
      setCards((cardsRes.data ?? []) as Card[]);
    }
    void load();
  }, [family, api, textId]);

  const questions = text?.comprehension_questions ?? [];
  const currentQuestion = questions[questionIndex];
  const vocabTasks = useMemo(() => makeVocabTasks(text?.vocabulary_words ?? [], cards), [cards, text?.vocabulary_words]);
  const currentVocab = vocabTasks[vocabIndex];

  const ensureSession = useCallback(async () => {
    if (session || !family || !childId) return session;
    const { data } = await api
      .from("practice_sessions")
      .insert({ family_id: family.familyId, child_id: childId })
      .select()
      .single();
    const nextSession = data as PracticeSession;
    setSession(nextSession);
    return nextSession;
  }, [childId, family, session, api]);

  const updateSession = useCallback(
    async (nextTotal: number, nextCorrect: number, finished = false, targetSession = session) => {
      if (!targetSession) return;
      await api
        .from("practice_sessions")
        .update({
          finished_at: finished ? new Date().toISOString() : null,
          duration_seconds: Math.max(1, Math.round((Date.now() - new Date(targetSession.started_at).getTime()) / 1000)),
          total_attempts: nextTotal,
          correct_attempts: nextCorrect,
          incorrect_attempts: nextTotal - nextCorrect,
          accuracy: nextTotal ? (nextCorrect / nextTotal) * 100 : 0,
          stars_earned: Math.min(3, Math.floor(nextCorrect / 2))
        })
        .eq("id", targetSession.id);
    },
    [session, api]
  );

  function goToNextQuestion() {
    setFeedback(null);
    setFeedbackCorrect(null);
    setLastAnswer(null);
    setLastCorrectAnswer(null);
    setLastCorrectTranslation(null);
    setLastExplanation(null);
    setSelectedWords([]);
    setUsedWordIndexes([]);
    setQuestionIndex((value) => value + 1);
    setStartedAt(Date.now());
  }

  async function saveQuestionAnswer(answer: string) {
    if (!family || !childId || !text || !currentQuestion || feedback || answeringRef.current) return;
    answeringRef.current = true;
    setAnswering(true);
    const activeSessionPromise = ensureSession();
    const correct = isCorrectAnswer(answer, currentQuestion.correctAnswer);
    const nextAnswers = { total: answers.total + 1, correct: answers.correct + (correct ? 1 : 0) };
    setAnswers(nextAnswers);
    setFeedback(correct ? "Отлично!" : "Почти! Давай разберем.");
    setFeedbackCorrect(correct);
    setLastAnswer(answer);
    setLastCorrectAnswer(currentQuestion.correctAnswer);
    setLastCorrectTranslation(correctAnswerTranslation({ correctAnswer: currentQuestion.correctAnswer }));
    setLastExplanation(questionExplanation(currentQuestion));
    setPendingAdvance(correct ? null : "question");

    if (correct) {
      goToNextQuestion();
    }

    if (!correct) {
      setMistakes((items) => [
        ...items,
        {
          question: currentQuestion.question,
          answer,
          correctAnswer: currentQuestion.correctAnswer,
          explanationRu: questionExplanation(currentQuestion)
        }
      ]);
    }

    const activeSession = await activeSessionPromise;
    if (!activeSession) return;

    await api.from("practice_attempts").insert({
      family_id: family.familyId,
      child_id: childId,
      session_id: activeSession.id,
      card_id: null,
      grammar_pattern_id: null,
      text_id: text.id,
      exercise_type: currentQuestion.type,
      question: currentQuestion.question,
      exercise_payload: currentQuestion,
      answer,
      correct_answer: currentQuestion.correctAnswer,
      is_correct: correct,
      response_time_ms: Date.now() - startedAt,
      rating: correct ? 5 : 2
    });

    await updateSession(nextAnswers.total + vocabStats.total, nextAnswers.correct + vocabStats.correct, false, activeSession);

  }

  function goToNextVocab() {
    setFeedback(null);
    setFeedbackCorrect(null);
    setLastAnswer(null);
    setLastCorrectAnswer(null);
    setLastCorrectTranslation(null);
    setLastExplanation(null);
    setVocabIndex((value) => value + 1);
    setStartedAt(Date.now());
  }

  async function saveVocabularyAnswer(task: VocabTask, answer: string) {
    if (!family || !childId || !text || feedback || answeringRef.current) return;
    answeringRef.current = true;
    setAnswering(true);
    const activeSessionPromise = ensureSession();
    const correct = isCorrectAnswer(answer, task.word.russian);
    const nextStats = { total: vocabStats.total + 1, correct: vocabStats.correct + (correct ? 1 : 0) };
    setVocabStats(nextStats);
    setFeedback(correct ? "Отлично!" : "Почти! Давай разберем.");
    setFeedbackCorrect(correct);
    setLastAnswer(answer);
    setLastCorrectAnswer(task.word.russian);
    setLastCorrectTranslation(task.word.russian);
    setLastExplanation("Запомни слово из текста и его перевод.");
    setPendingAdvance(correct ? null : "vocab");

    if (correct) {
      goToNextVocab();
    }

    if (!correct) {
      setMistakes((items) => [
        ...items,
        {
          question: task.word.english,
          answer,
          correctAnswer: task.word.russian,
          explanationRu: "Запомни слово из текста и его перевод."
        }
      ]);
    }

    const activeSession = await activeSessionPromise;
    if (!activeSession) return;

    await api.from("practice_attempts").insert({
      family_id: family.familyId,
      child_id: childId,
      session_id: activeSession.id,
      card_id: task.card?.id ?? null,
      grammar_pattern_id: null,
      text_id: text.id,
      exercise_type: "vocabulary_review_from_text",
      question: task.word.english,
      exercise_payload: task.word,
      answer,
      correct_answer: task.word.russian,
      is_correct: correct,
      response_time_ms: Date.now() - startedAt,
      rating: correct ? 5 : 2
    });

    if (task.card) {
      await api.from("review_schedule").upsert(
        {
          family_id: family.familyId,
          child_id: childId,
          card_id: task.card.id,
          ...nextReviewState(undefined, correct, correct ? 5 : 2)
        },
        { onConflict: "child_id,card_id" }
      );
    }

    await updateSession(answers.total + nextStats.total, answers.correct + nextStats.correct, false, activeSession);

  }

  function continueAfterFeedback() {
    if (!feedback || feedbackCorrect !== false) return;
    setFeedback(null);
    setFeedbackCorrect(null);
    setLastAnswer(null);
    setLastCorrectAnswer(null);
    setLastCorrectTranslation(null);
    setLastExplanation(null);
    if (pendingAdvance === "question") {
      setSelectedWords([]);
      setUsedWordIndexes([]);
      setQuestionIndex((value) => value + 1);
    }
    if (pendingAdvance === "vocab") {
      setVocabIndex((value) => value + 1);
    }
    setPendingAdvance(null);
    setStartedAt(Date.now());
  }

  async function finishTextSession() {
    await updateSession(answers.total + vocabStats.total, answers.correct + vocabStats.correct, true);
  }

  function addWord(word: string, wordIndex: number) {
    if (usedWordIndexes.includes(wordIndex) || answering || Boolean(feedback)) return;
    setSelectedWords([...selectedWords, word]);
    setUsedWordIndexes([...usedWordIndexes, wordIndex]);
  }

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : !text ? (
        <Panel>
          <p className="font-bold">Текст не найден или недоступен.</p>
          <Link className="mt-4 inline-block rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/child/texts">К списку текстов</Link>
        </Panel>
      ) : (
        <>
          <PageHeader title={text.title_en} subtitle={topic ? `Тема: ${topic.title}` : "Чтение и аудирование"} />
          {!childId ? (
            <Panel className="mb-5 bg-peach">
              <p className="font-bold">Сначала выберите детский профиль, чтобы сохранять ответы.</p>
              <Link className="mt-3 inline-block rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/child/select">Выбрать профиль</Link>
            </Panel>
          ) : null}

          <Panel className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl font-bold">{text.title_en}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Level {text.level.toUpperCase()} · difficulty {text.difficulty}</p>
              </div>
              <Link className="rounded-lg bg-slate-100 px-4 py-3 font-semibold" href="/child/texts">Вернуться к текстам</Link>
            </div>

            <div className="mt-5 rounded-lg bg-skysoft p-5 text-2xl font-semibold leading-relaxed">
              {text.text_en.split("\n").map((line) => <p className="mb-3 last:mb-0" key={line}>{line}</p>)}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="button" onClick={() => speakEnglish(textForSpeech(text), 0.9)}>Слушать</Button>
              <Button className="bg-slate-700" type="button" onClick={() => speakEnglish(textForSpeech(text), 0.6)}>Слушать медленно</Button>
              <Button className="bg-mint text-ink" type="button" onClick={() => setShowTranslation((value) => !value)}>
                {showTranslation ? "Скрыть перевод" : "Показать перевод"}
              </Button>
            </div>

            {showTranslation ? (
              <div className="mt-5 rounded-lg bg-peach p-5">
                <h3 className="text-2xl font-bold">{text.title_ru}</h3>
                <div className="mt-3 text-lg leading-relaxed">
                  {text.text_ru.split("\n").map((line) => <p className="mb-2 last:mb-0" key={line}>{line}</p>)}
                </div>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="button" onClick={() => { setShowQuestions(true); setShowVocabulary(false); setStartedAt(Date.now()); }}>
                Ответить на вопросы
              </Button>
              <Button className="bg-berry" type="button" onClick={() => { setShowVocabulary(true); setShowQuestions(false); setStartedAt(Date.now()); }}>
                Повторить слова из текста
              </Button>
            </div>
          </Panel>

          {showQuestions ? (
            <Panel className="mx-auto mt-5 max-w-3xl">
              <h2 className="text-xl font-bold">Проверь понимание</h2>
              {questionIndex >= questions.length ? (
                <div className="mt-4">
                  <p className="text-lg font-semibold">Вопросов выполнено: {answers.total}</p>
                  <p className="text-lg font-semibold">Правильно: {answers.correct}</p>
                  <p className="text-lg font-semibold">Ошибок: {answers.total - answers.correct}</p>
                  {mistakes.length ? (
                    <div className="mt-4 grid gap-3">
                      {mistakes.map((mistake, index) => (
                        <div className="rounded-lg bg-peach p-4" key={`${mistake.question}-${index}`}>
                          <p className="font-bold">{mistake.question}</p>
                          <p className="mt-1 text-sm">Ответ ребенка: {mistake.answer}</p>
                          <p className="text-sm">Правильно: {mistake.correctAnswer}</p>
                          <p className="text-sm text-slate-700">Почему: {mistake.explanationRu}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-lg bg-mint p-3 font-bold">Ошибок нет. Отличная работа!</p>
                  )}
                  <Button className="mt-4" type="button" onClick={finishTextSession}>Сохранить итог</Button>
                </div>
              ) : currentQuestion ? (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-500">{questionIndex + 1} / {questions.length}</p>
                  <p className="mt-3 text-2xl font-bold">{currentQuestion.prompt || currentQuestion.question}</p>
                  {currentQuestion.type === "build_sentence_from_text" ? (
                    <div className="mt-5 grid gap-4">
                      <div className="min-h-16 rounded-lg border-2 border-dashed border-slate-200 bg-white p-4 text-xl font-bold">
                        {selectedWords.length ? selectedWords.join(" ") : "Нажимай слова по порядку"}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentQuestion.options.map((word, wordIndex) => (
                          <button
                            className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-bold disabled:opacity-40"
                            disabled={usedWordIndexes.includes(wordIndex) || answering || Boolean(feedback)}
                            key={`${word}-${wordIndex}`}
                            onClick={() => addWord(word, wordIndex)}
                            type="button"
                          >
                            {word}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" onClick={() => saveQuestionAnswer(selectedWords.join(" "))}>Проверить</Button>
                        <Button className="bg-slate-700" type="button" onClick={() => { setSelectedWords([]); setUsedWordIndexes([]); }}>Reset</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-3">
                      {currentQuestion.options.map((option) => (
                        <button className="rounded-lg border-2 border-slate-200 bg-white p-4 text-left text-xl font-bold hover:border-berry disabled:opacity-60" disabled={answering || Boolean(feedback)} key={option} type="button" onClick={() => saveQuestionAnswer(option)}>
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  {feedback ? (
                    <div className={`mt-4 rounded-lg p-4 ${feedbackCorrect === false ? "bg-peach text-left" : "bg-mint text-center"}`}>
                      <p className="text-xl font-bold">{feedback}</p>
                      {feedbackCorrect === false ? (
                        <div className="mt-3 grid gap-2 text-sm text-slate-700">
                          <p><b>Твой ответ:</b> {lastAnswer}</p>
                          <p><b>Правильно:</b> {lastCorrectAnswer}</p>
                          <p><b>Перевод:</b> {lastCorrectTranslation || "Перевод пока не добавлен."}</p>
                          <p><b>Почему:</b> {lastExplanation || "Посмотри на правильный ответ и попробуй запомнить."}</p>
                          <Button className="mt-2 bg-berry" type="button" onClick={continueAfterFeedback}>
                            Продолжить
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </Panel>
          ) : null}

          {showVocabulary ? (
            <Panel className="mx-auto mt-5 max-w-3xl">
              <h2 className="text-xl font-bold">Слова из текста</h2>
              {!vocabTasks.length ? (
                <p className="mt-3 text-slate-600">В этом тексте пока нет списка слов.</p>
              ) : vocabIndex >= vocabTasks.length ? (
                <div className="mt-4">
                  <p className="text-lg font-semibold">Слов повторено: {vocabStats.total}</p>
                  <p className="text-lg font-semibold">Правильно: {vocabStats.correct}</p>
                  <Button className="mt-4" type="button" onClick={finishTextSession}>Сохранить итог</Button>
                </div>
              ) : currentVocab ? (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-500">{vocabIndex + 1} / {vocabTasks.length}</p>
                  <div className="mt-3 rounded-lg bg-skysoft p-5 text-center">
                    <p className="text-4xl font-bold">{currentVocab.word.english}</p>
                    <Button className="mt-4" type="button" onClick={() => speakEnglish(currentVocab.word.english, 0.8)}>Listen</Button>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {currentVocab.options.map((option) => (
                      <button className="rounded-lg border-2 border-slate-200 bg-white p-4 text-left text-xl font-bold hover:border-berry disabled:opacity-60" disabled={answering || Boolean(feedback)} key={option} type="button" onClick={() => saveVocabularyAnswer(currentVocab, option)}>
                        {option}
                      </button>
                    ))}
                  </div>
                  {feedback ? (
                    <div className={`mt-4 rounded-lg p-4 ${feedbackCorrect === false ? "bg-peach text-left" : "bg-mint text-center"}`}>
                      <p className="text-xl font-bold">{feedback}</p>
                      {feedbackCorrect === false ? (
                        <div className="mt-3 grid gap-2 text-sm text-slate-700">
                          <p><b>Твой ответ:</b> {lastAnswer}</p>
                          <p><b>Правильно:</b> {lastCorrectAnswer}</p>
                          <p><b>Перевод:</b> {lastCorrectTranslation || "Перевод пока не добавлен."}</p>
                          <p><b>Почему:</b> {lastExplanation || "Посмотри на правильный ответ и попробуй запомнить."}</p>
                          <Button className="mt-2 bg-berry" type="button" onClick={continueAfterFeedback}>
                            Продолжить
                          </Button>
                        </div>
                      ) : null}
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
