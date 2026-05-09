"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Child } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ChildSelector() {
  const { supabase, family, loading, error } = useFamily();
  const [children, setChildren] = useState<Child[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      if (!family) return;
      const { data } = await supabase.from("children").select("*").eq("family_id", family.familyId).order("created_at");
      setChildren((data ?? []) as Child[]);
    }
    void load();
  }, [family, supabase]);

  function selectChild(child: Child) {
    window.localStorage.setItem("selected_child_id", child.id);
    window.localStorage.setItem("selected_child_name", child.name);
    router.push("/child/dashboard");
  }

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? <NeedLogin /> : (
        <>
          <PageHeader title="Кто сегодня занимается?" subtitle="Выбери свой профиль. Email и пароль ребенку не нужны." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <button key={child.id} className="focus-ring rounded-lg border border-sky-100 bg-white p-5 text-left shadow-soft" onClick={() => selectChild(child)} type="button">
                <span className="mb-4 block h-16 w-16 rounded-lg" style={{ background: child.avatar_color }} />
                <span className="text-2xl font-bold">{child.name}</span>
                <span className="mt-2 block text-slate-500">Начать</span>
              </button>
            ))}
            {!children.length ? <Panel>Пока нет профилей. Родитель может создать ребенка на странице “Дети”.</Panel> : null}
          </div>
        </>
      )}
    </AuthRequired>
  );
}
