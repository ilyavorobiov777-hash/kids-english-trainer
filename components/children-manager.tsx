"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { Button, Field, Input, PageHeader, Panel } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Child } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export function ChildrenManager() {
  const { api, family, loading, error } = useFamily();
  const [children, setChildren] = useState<Child[]>([]);
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [resetChild, setResetChild] = useState<Child | null>(null);
  const [resetConfirm, setResetConfirm] = useState("");
  const [busyChildId, setBusyChildId] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    if (!family) return;
    const { data } = await api.from("children").select("*").eq("family_id", family.familyId).order("created_at");
    setChildren((data ?? []) as Child[]);
  }, [family, api]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeChildren = useMemo(() => children.filter((child) => child.status !== "archived"), [children]);
  const archivedChildren = useMemo(() => children.filter((child) => child.status === "archived"), [children]);

  async function createChild(event: React.FormEvent) {
    event.preventDefault();
    if (!family || !name.trim()) return;
    await api.from("children").insert({
      family_id: family.familyId,
      name: name.trim(),
      birth_year: birthYear ? Number(birthYear) : null,
      avatar_color: ["#7ED7C1", "#FFE1C8", "#D8F1FF", "#F7B2BD"][children.length % 4]
    });
    setName("");
    setBirthYear("");
    setMessage("Профиль ребенка создан.");
    await load();
  }

  function startPractice(child: Child) {
    window.localStorage.setItem("selected_child_id", child.id);
    window.localStorage.setItem("selected_child_name", child.name);
    router.push("/child/practice");
  }

  async function archiveChild(child: Child) {
    if (!family) return;
    setBusyChildId(child.id);
    const { error: archiveError } = await api
      .from("children")
      .update({
        status: "archived",
        archived_at: new Date().toISOString(),
        archived_by: family.userId
      })
      .eq("family_id", family.familyId)
      .eq("id", child.id);
    setBusyChildId(null);
    setMessage(archiveError ? archiveError.message : `Профиль ${child.name} архивирован. История сохранена.`);
    await load();
  }

  async function restoreChild(child: Child) {
    if (!family) return;
    setBusyChildId(child.id);
    const { error: restoreError } = await api
      .from("children")
      .update({
        status: "active",
        archived_at: null,
        archived_by: null
      })
      .eq("family_id", family.familyId)
      .eq("id", child.id);
    setBusyChildId(null);
    setMessage(restoreError ? restoreError.message : `Профиль ${child.name} восстановлен.`);
    await load();
  }

  async function resetProgress() {
    if (!family || !resetChild || resetConfirm !== "RESET") return;
    setBusyChildId(resetChild.id);

    const scoped = { family_id: family.familyId, child_id: resetChild.id };
    const [attemptsRes, sessionsRes, reviewRes, rewardsRes] = await Promise.all([
      api.from("practice_attempts").delete().match(scoped),
      api.from("practice_sessions").delete().match(scoped),
      api.from("review_schedule").delete().match(scoped),
      api.from("rewards").delete().match(scoped)
    ]);

    const resetError = attemptsRes.error || sessionsRes.error || reviewRes.error || rewardsRes.error;
    setBusyChildId(null);

    if (resetError) {
      setMessage(resetError.message);
      return;
    }

    setMessage(`Статистика ${resetChild.name} обнулена. Карточки и курсы не тронуты.`);
    setResetChild(null);
    setResetConfirm("");
    await load();
  }

  function ChildCard({ child, archived = false }: { child: Child; archived?: boolean }) {
    return (
      <Panel>
        <div className="flex items-start gap-3">
          <span className="h-12 w-12 shrink-0 rounded-lg" style={{ background: child.avatar_color }} />
          <div className="min-w-0 flex-1">
            <h2 className="font-bold">{child.name}</h2>
            <p className="text-sm text-slate-500">{child.birth_year ? `${child.birth_year} г.` : "Возраст не указан"}</p>
            {archived ? <p className="mt-1 text-xs font-semibold text-slate-500">Архивирован</p> : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {!archived ? (
            <>
              <Button type="button" onClick={() => startPractice(child)}>Начать занятие</Button>
              <Button type="button" className="bg-slate-700" onClick={() => setResetChild(child)}>Обнулить статистику</Button>
              <Button type="button" className="bg-peach text-ink" disabled={busyChildId === child.id} onClick={() => archiveChild(child)}>
                Архивировать
              </Button>
            </>
          ) : (
            <Button type="button" disabled={busyChildId === child.id} onClick={() => restoreChild(child)}>
              Восстановить
            </Button>
          )}
        </div>
      </Panel>
    );
  }

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? (
        <NeedLogin />
      ) : (
        <>
          <PageHeader
            title="Профили детей"
            subtitle="Ребенок выбирает профиль без email. Родитель может начать занятие, архивировать профиль или обнулить только учебную статистику конкретного ребенка."
          />
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <Panel>
              <form className="grid gap-4" onSubmit={createChild}>
                <Field label="Имя ребенка">
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Миша" required />
                </Field>
                <Field label="Год рождения">
                  <Input value={birthYear} onChange={(event) => setBirthYear(event.target.value)} type="number" min="2010" max="2022" />
                </Field>
                <Button>Создать профиль</Button>
                {message ? <p className="rounded-lg bg-mint p-3 text-sm font-semibold">{message}</p> : null}
              </form>
            </Panel>
            <div className="grid gap-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {activeChildren.map((child) => <ChildCard child={child} key={child.id} />)}
                {!activeChildren.length ? <Panel>Активных профилей пока нет. Создайте ребенка слева или восстановите архивный профиль.</Panel> : null}
              </div>
              {archivedChildren.length ? (
                <div>
                  <h2 className="mb-3 text-lg font-bold">Архивные профили</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {archivedChildren.map((child) => <ChildCard archived child={child} key={child.id} />)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {resetChild ? (
            <div className="fixed inset-0 z-20 grid place-items-center bg-ink/40 p-4">
              <Panel className="max-w-lg">
                <h2 className="text-xl font-bold">Обнулить статистику ребенка?</h2>
                <p className="mt-3 text-sm text-slate-600">
                  Это удалит только прогресс профиля {resetChild.name}: попытки, занятия, расписание повторения и награды.
                  Карточки, курсы, Starter 350 и другие дети не будут затронуты.
                </p>
                <Field label="Для подтверждения введите RESET">
                  <Input value={resetConfirm} onChange={(event) => setResetConfirm(event.target.value)} />
                </Field>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" className="bg-berry" disabled={resetConfirm !== "RESET" || busyChildId === resetChild.id} onClick={resetProgress}>
                    Обнулить статистику
                  </Button>
                  <Button type="button" className="bg-slate-600" onClick={() => { setResetChild(null); setResetConfirm(""); }}>
                    Отмена
                  </Button>
                </div>
              </Panel>
            </div>
          ) : null}
        </>
      )}
    </AuthRequired>
  );
}
