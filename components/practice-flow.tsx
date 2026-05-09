"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { Button, PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Card, PracticeSession } from "@/lib/database.types";
import { buildTranslationOptions, shuffle } from "@/lib/supabase/helpers";
import { speakEnglish } from "@/lib/speech";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function PracticeFlow() {
  const { supabase, family, loading, error } = useFamily();
  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [speechMessage, setSpeechMessage] = useState<string | null>(null);
  const [rate, setRate] = useState(0.9);
  const [stats, setStats] = useState({ total: 0, correct: 0 });

  useEffect(() => {
    setChildId(window.localStorage.getItem("selected_child_id"));
    setChildName(window.localStorage.getItem("selected_child_name"));
  }, []);

  useEffect(() => {
    async function load() {
      if (!family || !childId) return;
      const { data } = await supabase
        .from("cards")
        .select("*")
        .eq("family_id", family.familyId)
        .eq("status", "active")
        .limit(50);
      setCards(shuffle((data ?? []) as Card[]).slice(0, 10));

      const { data: newSession } = await supabase
        .from("practice_sessions")
        .insert({ family_id: family.familyId, child_id: childId })
        .select()
        .single();
      setSession(newSession as PracticeSession);
      setStartedAt(Date.now());
    }
    load();
  }, [family?.familyId, childId]);

  const currentCard = cards[index];
  const options = useMemo(() => (currentCard ? buildTranslationOptions(currentCard, cards) : []), [currentCard?.id, cards]);
  const finished = cards.length > 0 && index >= cards.length;

  async function answer(option: string) {
    if (!family || !childId || !currentCard || !session || feedback) return;
    const isCorrect = option === currentCard.russian;
    const responseTime = Date.now() - startedAt;
    const nextStats = { total: stats.total + 1, correct: stats.correct + (isCorrect ? 1 : 0) };
    setStats(nextStats);
    setFeedback(isCorrect ? "Отлично!" : "Почти! Давай еще раз");

    await supabase.from("practice_attempts").insert({
      family_id: family.familyId,
      child_id: childId,
      session_id: session.id,
      card_id: currentCard.id,
      exercise_type: "choose_translation",
      answer: option,
      correct_answer: currentCard.russian,
      is_correct: isCorrect,
      response_time_ms: responseTime,
      rating: isCorrect ? 5 : 2
    });

    const duration = Math.max(1, Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000));
    await supabase.from("practice_sessions").update({
      duration_seconds: duration,
      total_attempts: nextStats.total,
      correct_attempts: nextStats.correct,
      incorrect_attempts: nextStats.total - nextStats.correct,
      accuracy: nextStats.total ? (nextStats.correct / nextStats.total) * 100 : 0,
      stars_earned: Math.floor(nextStats.correct / 3)
    }).eq("id", session.id);

    await supabase.from("review_schedule").upsert({
      family_id: family.familyId,
      child_id: childId,
      card_id: currentCard.id,
      due_at: isCorrect ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString(),
      repetitions: isCorrect ? 1 : 0,
      lapses: isCorrect ? 0 : 1
    }, { onConflict: "child_id,card_id" });

    window.setTimeout(() => {
      setFeedback(null);
      setIndex((value) => value + 1);
      setStartedAt(Date.now());
    }, isCorrect ? 800 : 1200);
  }

  async function finishSession() {
    if (!session) return;
    const duration = Math.max(1, Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000));
    const incorrect = stats.total - stats.correct;
    const accuracy = stats.total ? (stats.correct / stats.total) * 100 : 0;
    await supabase.from("practice_sessions").update({
      finished_at: new Date().toISOString(),
      duration_seconds: duration,
      total_attempts: stats.total,
      correct_attempts: stats.correct,
      incorrect_attempts: incorrect,
      accuracy,
      stars_earned: Math.floor(stats.correct / 3)
    }).eq("id", session.id);
  }

  useEffect(() => {
    if (finished) finishSession();
  }, [finished]);

  function listen(customRate = rate) {
    if (!currentCard) return;
    const result = speakEnglish(currentCard.english, customRate);
    setSpeechMessage(result.message ?? null);
  }

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? <NeedLogin /> : !childId ? (
        <Panel>
          <p className="mb-4 font-medium">Сначала выбери детский профиль.</p>
          <Link className="rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/child/select">Выбрать профиль</Link>
        </Panel>
      ) : (
        <>
          <PageHeader title="Тренировка" subtitle={childName ? `${childName}, выбери русский перевод.` : "Выбери русский перевод."} />
          {!cards.length ? (
            <Panel>Активных карточек пока нет. Родитель может добавить карточки или seed-данные.</Panel>
          ) : finished ? (
            <Panel className="text-center">
              <h2 className="text-3xl font-bold">Готово!</h2>
              <p className="mt-3 text-xl">Правильно: {stats.correct} из {stats.total}</p>
              <Link className="mt-5 inline-block rounded-lg bg-berry px-6 py-4 font-bold text-white" href="/child/dashboard">В домик</Link>
            </Panel>
          ) : currentCard ? (
            <Panel className="mx-auto max-w-2xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">Карточка {index + 1} из {cards.length}</p>
                <p className="text-sm font-semibold text-slate-500">Верно: {stats.correct}</p>
              </div>
              <div className="rounded-lg bg-skysoft p-6 text-center">
                <p className="text-4xl font-bold">{currentCard.english}</p>
                {currentCard.example_en ? <p className="mt-3 text-lg text-slate-700">{currentCard.example_en}</p> : null}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_140px]">
                <Button type="button" onClick={() => listen(rate)}>Listen</Button>
                <Button type="button" className="bg-slate-700" onClick={() => listen(0.6)}>Listen slowly</Button>
                <label className="grid gap-1 text-sm text-slate-600">
                  Rate {rate.toFixed(1)}
                  <input min="0.5" max="1.2" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} type="range" />
                </label>
              </div>
              {speechMessage ? <p className="mt-3 rounded-lg bg-peach p-3 text-sm">{speechMessage}</p> : null}
              <div className="mt-5 grid gap-3">
                {options.map((option) => (
                  <button key={option} className="focus-ring rounded-lg border-2 border-slate-200 bg-white p-4 text-left text-xl font-bold hover:border-berry" onClick={() => answer(option)} type="button">
                    {option}
                  </button>
                ))}
              </div>
              {feedback ? <p className="mt-5 rounded-lg bg-mint p-4 text-center text-2xl font-bold">{feedback}</p> : null}
            </Panel>
          ) : null}
        </>
      )}
    </AuthRequired>
  );
}
