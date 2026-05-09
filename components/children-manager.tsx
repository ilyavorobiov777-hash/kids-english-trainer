"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { Button, Field, Input, PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Child } from "@/lib/database.types";
import { useEffect, useState } from "react";

export function ChildrenManager() {
  const { supabase, family, loading, error } = useFamily();
  const [children, setChildren] = useState<Child[]>([]);
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");

  async function load() {
    if (!family) return;
    const { data } = await supabase.from("children").select("*").eq("family_id", family.familyId).order("created_at");
    setChildren((data ?? []) as Child[]);
  }

  useEffect(() => {
    load();
  }, [family?.familyId]);

  async function createChild(event: React.FormEvent) {
    event.preventDefault();
    if (!family || !name.trim()) return;
    await supabase.from("children").insert({
      family_id: family.familyId,
      name: name.trim(),
      birth_year: birthYear ? Number(birthYear) : null,
      avatar_color: ["#7ED7C1", "#FFE1C8", "#D8F1FF", "#F7B2BD"][children.length % 4]
    });
    setName("");
    setBirthYear("");
    await load();
  }

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? <NeedLogin /> : (
        <>
          <PageHeader title="Профили детей" subtitle="Ребенок выбирает профиль без email и занимается внутри семейной сессии." />
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <Panel>
              <form className="grid gap-4" onSubmit={createChild}>
                <Field label="Имя ребенка"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Миша" required /></Field>
                <Field label="Год рождения"><Input value={birthYear} onChange={(e) => setBirthYear(e.target.value)} type="number" min="2010" max="2022" /></Field>
                <Button>Создать профиль</Button>
              </form>
            </Panel>
            <div className="grid gap-3 sm:grid-cols-2">
              {children.map((child) => (
                <Panel key={child.id}>
                  <div className="flex items-center gap-3">
                    <span className="h-12 w-12 rounded-lg" style={{ background: child.avatar_color }} />
                    <div>
                      <h2 className="font-bold">{child.name}</h2>
                      <p className="text-sm text-slate-500">{child.birth_year ? `${child.birth_year} г.` : "Возраст не указан"}</p>
                    </div>
                  </div>
                </Panel>
              ))}
            </div>
          </div>
        </>
      )}
    </AuthRequired>
  );
}
