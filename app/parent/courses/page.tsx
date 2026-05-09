"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { Button, Field, Input, PageHeader, Panel, Textarea } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Course } from "@/lib/database.types";
import { useCallback, useEffect, useState } from "react";

export default function ParentCoursesPage() {
  const { supabase, family, loading, error } = useFamily();
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const load = useCallback(async () => {
    if (!family) return;
    const { data } = await supabase.from("courses").select("*").eq("family_id", family.familyId).order("created_at", { ascending: false });
    setCourses((data ?? []) as Course[]);
  }, [family, supabase]);

  useEffect(() => { void load(); }, [load]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!family) return;
    await supabase.from("courses").insert({ family_id: family.familyId, title, description });
    setTitle("");
    setDescription("");
    await load();
  }

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? <NeedLogin /> : (
        <>
          <PageHeader title="Курсы" subtitle="Минимальное управление курсами для привязки карточек." />
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <Panel><form className="grid gap-3" onSubmit={submit}><Field label="Название"><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></Field><Field label="Описание"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></Field><Button>Создать курс</Button></form></Panel>
            <div className="grid gap-3">{courses.map((course) => <Panel key={course.id}><h2 className="font-bold">{course.title}</h2><p className="text-slate-600">{course.description}</p></Panel>)}</div>
          </div>
        </>
      )}
    </AuthRequired>
  );
}
