"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { CatMascot } from "@/components/cat-mascot";
import { StarsRow } from "@/components/stars-row";
import { Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { PracticeAttempt } from "@/lib/database.types";
import { BookOpen, CalendarCheck, Headphones, RotateCcw, Sparkles, Tags, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Primary, kid-friendly tiles — only 3 big targets to keep the start screen calm.
const primary = [
  {
    href: "/child/practice",
    title: "Занятие дня",
    text: "Короткая смешанная тренировка",
    icon: CalendarCheck,
    className: "bg-berry text-white"
  },
  {
    href: "/child/words",
    title: "Слова",
    text: "Учить, повторять и темы",
    icon: BookOpen,
    className: "bg-mint text-ink"
  },
  {
    href: "/child/texts",
    title: "Тексты",
    text: "Читать, слушать и отвечать на вопросы",
    icon: Headphones,
    className: "bg-skysoft text-ink"
  }
];

// Secondary shortcuts — smaller, available below for quick access without overloading.
const secondary = [
  { href: "/child/words/new", title: "Новые слова", icon: Sparkles },
  { href: "/child/words/review", title: "Повторить", icon: RotateCcw },
  { href: "/child/words/mistakes", title: "Ошибки", icon: BookOpen },
  { href: "/child/words/topics", title: "Темы", icon: Tags },
  { href: "/child/pronouns", title: "Местоимения", icon: UserRound }
];

export function ChildDashboard() {
  const { api, family, loading, error } = useFamily();
  const [childName, setChildName] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);

  useEffect(() => {
    const childId = window.localStorage.getItem("selected_child_id");
    setChildName(window.localStorage.getItem("selected_child_name"));
    async function load() {
      if (!family || !childId) return;
      const { data } = await api
        .from("practice_attempts")
        .select("*")
        .eq("family_id", family.familyId)
        .eq("child_id", childId)
        .limit(100);
      setAttempts((data ?? []) as PracticeAttempt[]);
    }
    void load();
  }, [family, api]);

  const correct = attempts.filter((attempt) => attempt.is_correct).length;
  const stars = Math.min(3, Math.floor(correct / 10));
  const greeting = childName ? `Привет, ${childName}!` : "Детский кабинет";

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-soft">
            <CatMascot mood="wave" size={96} speech={`${greeting} Готов учить английский?`} />
            <div className="grow">
              <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">{greeting}</h1>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                Выбери одно из трёх занятий ниже. Я буду помогать!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StarsRow value={stars} size={28} />
            </div>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <Panel>
              <p className="text-sm text-slate-500">Ответов</p>
              <p className="text-3xl font-bold">{attempts.length}</p>
            </Panel>
            <Panel>
              <p className="text-sm text-slate-500">Верно</p>
              <p className="text-3xl font-bold">{correct}</p>
            </Panel>
            <Panel>
              <p className="text-sm text-slate-500">Звезды</p>
              <p className="text-3xl font-bold">{Math.floor(correct / 3)}</p>
            </Panel>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {primary.map(({ href, title, text, icon: Icon, className }) => (
              <Link
                className={`group rounded-2xl border border-sky-100 p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg ${className}`}
                href={href}
                key={href}
              >
                <Icon size={42} />
                <span className="mt-4 block text-3xl font-bold leading-tight">{title}</span>
                <span className="mt-2 block text-base opacity-90">{text}</span>
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Быстрые тренировки</p>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {secondary.map(({ href, title, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 py-3 text-sm font-semibold text-ink shadow-soft hover:border-berry"
                >
                  <Icon size={18} />
                  {title}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </AuthRequired>
  );
}
