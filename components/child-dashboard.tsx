"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { PracticeAttempt } from "@/lib/database.types";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    load();
  }, [family?.familyId]);

  const correct = attempts.filter((attempt) => attempt.is_correct).length;

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? <NeedLogin /> : (
        <>
          <PageHeader title={childName ? `Привет, ${childName}!` : "Детский домик"} subtitle="Здесь только простые действия: слушать, выбирать, радоваться прогрессу." />
          <div className="grid gap-4 md:grid-cols-3">
            <Panel><p className="text-sm text-slate-500">Ответов</p><p className="text-4xl font-bold">{attempts.length}</p></Panel>
            <Panel><p className="text-sm text-slate-500">Верно</p><p className="text-4xl font-bold">{correct}</p></Panel>
            <Panel><p className="text-sm text-slate-500">Звезды</p><p className="text-4xl font-bold">{Math.floor(correct / 3)}</p></Panel>
          </div>
          <div className="mt-6">
            <Link className="inline-block rounded-lg bg-berry px-6 py-4 text-xl font-bold text-white" href="/child/practice">Начать тренировку</Link>
          </div>
        </>
      )}
    </AuthRequired>
  );
}
