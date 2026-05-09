"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { PracticeAttempt } from "@/lib/database.types";
import { BookOpen, CalendarCheck, RotateCcw, Sparkles, Tags } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const actions = [
  { href: "/child/practice", title: "Занятие дня", text: "Короткая смешанная тренировка", icon: CalendarCheck, className: "bg-berry text-white" },
  { href: "/child/words/new", title: "Учить новые слова", text: "5-7 слов: послушать и запомнить", icon: Sparkles, className: "bg-mint text-ink" },
  { href: "/child/words/review", title: "Повторить слова", text: "То, что пора повторить сегодня", icon: RotateCcw, className: "bg-skysoft text-ink" },
  { href: "/child/words/mistakes", title: "Повторить ошибки", text: "Слова, где были промахи", icon: BookOpen, className: "bg-peach text-ink" },
  { href: "/child/words/topics", title: "Слова по темам", text: "Animals, Food, School и другие", icon: Tags, className: "bg-white text-ink" }
];

export function ChildDashboard() {
  const { supabase, family, loading, error } = useFamily();
  const [childName, setChildName] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);

  useEffect(() => {
    const childId = window.localStorage.getItem("selected_child_id");
    setChildName(window.localStorage.getItem("selected_child_name"));
    async function load() {
      if (!family || !childId) return;
      const { data } = await supabase.from("practice_attempts").select("*").eq("family_id", family.familyId).eq("child_id", childId).limit(100);
      setAttempts((data ?? []) as PracticeAttempt[]);
    }
    void load();
  }, [family, supabase]);

  const correct = attempts.filter((attempt) => attempt.is_correct).length;

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : (
        <>
          <PageHeader
            title={childName ? `Привет, ${childName}!` : "Детский кабинет"}
            subtitle="Выбирай: занятие дня, новые слова, повторение или темы. Большой список карточек здесь не нужен."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Panel><p className="text-sm text-slate-500">Ответов</p><p className="text-4xl font-bold">{attempts.length}</p></Panel>
            <Panel><p className="text-sm text-slate-500">Верно</p><p className="text-4xl font-bold">{correct}</p></Panel>
            <Panel><p className="text-sm text-slate-500">Звезды</p><p className="text-4xl font-bold">{Math.floor(correct / 3)}</p></Panel>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map(({ href, title, text, icon: Icon, className }) => (
              <Link className={`rounded-lg border border-sky-100 p-5 shadow-soft ${className}`} href={href} key={href}>
                <Icon size={34} />
                <span className="mt-4 block text-2xl font-bold">{title}</span>
                <span className="mt-2 block text-sm opacity-80">{text}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </AuthRequired>
  );
}
