"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { Button, PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Child } from "@/lib/database.types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

  const activeChildren = useMemo(() => children.filter((child) => child.status !== "archived"), [children]);

  function selectChild(child: Child) {
    window.localStorage.setItem("selected_child_id", child.id);
    window.localStorage.setItem("selected_child_name", child.name);
    router.push("/child/practice");
  }

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : (
        <>
          <PageHeader
            title="Кто сегодня занимается?"
            subtitle="Выберите активный профиль ребенка. Email и пароль ребенку не нужны; PIN пока не включен, поэтому занятие начинается сразу."
          />
          {activeChildren.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeChildren.map((child) => (
                <Panel key={child.id}>
                  <button className="block w-full text-left" onClick={() => selectChild(child)} type="button">
                    <span className="mb-4 block h-16 w-16 rounded-lg" style={{ background: child.avatar_color }} />
                    <span className="text-2xl font-bold">{child.name}</span>
                    <span className="mt-2 block text-sm text-slate-500">
                      {child.birth_year ? `${child.birth_year} г.` : "Возраст не указан"}
                    </span>
                  </button>
                  <Button className="mt-4 w-full" type="button" onClick={() => selectChild(child)}>
                    Начать занятие
                  </Button>
                </Panel>
              ))}
            </div>
          ) : (
            <Panel className="max-w-xl">
              <h2 className="text-xl font-bold">Сначала создайте профиль ребенка</h2>
              <p className="mt-2 text-slate-600">
                Активных детских профилей пока нет. Родитель может создать или восстановить профиль в родительском кабинете.
              </p>
              <Link className="mt-4 inline-block rounded-lg bg-ink px-4 py-3 font-semibold text-white" href="/parent/children">
                Открыть профили детей
              </Link>
            </Panel>
          )}
        </>
      )}
    </AuthRequired>
  );
}
