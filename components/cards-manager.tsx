"use client";

import { AuthRequired, NeedLogin } from "@/components/auth-required";
import { Button, Field, Input, PageHeader, Panel, Select, Textarea } from "@/components/ui";
import { useFamily } from "@/hooks/use-family";
import type { Card, CardStatus, CardType, Course, Lesson, Source, Topic, Unit } from "@/lib/database.types";
import { normalizeTags } from "@/lib/supabase/helpers";
import { Edit3, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { speakEnglish } from "@/lib/speech";

const cardTypes: CardType[] = ["word", "phrase", "sentence", "grammar_pattern", "dialogue", "mini_story"];
const statuses: CardStatus[] = ["draft", "active", "archived"];

const emptyForm = {
  english: "",
  russian: "",
  type: "word" as CardType,
  topic_id: "",
  source_id: "",
  course_id: "",
  unit_id: "",
  lesson_id: "",
  example_en: "",
  example_ru: "",
  difficulty: 1,
  tags: "",
  status: "active" as CardStatus
};

export function CardsManager() {
  const { supabase, family, loading, error } = useFamily();
  const [cards, setCards] = useState<Card[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    if (!family) return;
    const [cardsRes, topicsRes, coursesRes, sourcesRes, unitsRes, lessonsRes] = await Promise.all([
      supabase.from("cards").select("*").eq("family_id", family.familyId).order("created_at", { ascending: false }),
      supabase.from("topics").select("*").eq("family_id", family.familyId).order("title"),
      supabase.from("courses").select("*").eq("family_id", family.familyId).order("title"),
      supabase.from("sources").select("*").eq("family_id", family.familyId).order("title"),
      supabase.from("units").select("*").eq("family_id", family.familyId).order("position"),
      supabase.from("lessons").select("*").eq("family_id", family.familyId).order("position")
    ]);
    setCards((cardsRes.data ?? []) as Card[]);
    setTopics((topicsRes.data ?? []) as Topic[]);
    setCourses((coursesRes.data ?? []) as Course[]);
    setSources((sourcesRes.data ?? []) as Source[]);
    setUnits((unitsRes.data ?? []) as Unit[]);
    setLessons((lessonsRes.data ?? []) as Lesson[]);
  }

  useEffect(() => {
    load();
  }, [family?.familyId]);

  const filteredCards = useMemo(
    () =>
      cards.filter((card) => {
        const typeOk = typeFilter === "all" || card.type === typeFilter;
        const topicOk = topicFilter === "all" || card.topic_id === topicFilter;
        return typeOk && topicOk;
      }),
    [cards, typeFilter, topicFilter]
  );

  function edit(card: Card) {
    setEditingId(card.id);
    setForm({
      english: card.english,
      russian: card.russian,
      type: card.type,
      topic_id: card.topic_id ?? "",
      source_id: card.source_id ?? "",
      course_id: card.course_id ?? "",
      unit_id: card.unit_id ?? "",
      lesson_id: card.lesson_id ?? "",
      example_en: card.example_en ?? "",
      example_ru: card.example_ru ?? "",
      difficulty: card.difficulty,
      tags: card.tags.join(", "),
      status: card.status
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!family) return;
    const payload = {
      family_id: family.familyId,
      created_by: family.userId,
      english: form.english.trim(),
      russian: form.russian.trim(),
      type: form.type,
      topic_id: form.topic_id || null,
      source_id: form.source_id || null,
      course_id: form.course_id || null,
      unit_id: form.unit_id || null,
      lesson_id: form.lesson_id || null,
      example_en: form.example_en || null,
      example_ru: form.example_ru || null,
      difficulty: Number(form.difficulty),
      tags: normalizeTags(form.tags),
      status: form.status
    };

    const result = editingId
      ? await supabase.from("cards").update(payload).eq("id", editingId)
      : await supabase.from("cards").insert(payload);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    setMessage(editingId ? "Карточка обновлена." : "Карточка добавлена.");
    setEditingId(null);
    setForm(emptyForm);
    await load();
  }

  async function archive(id: string) {
    await supabase.from("cards").update({ status: "archived" }).eq("id", id);
    await load();
  }

  return (
    <AuthRequired loading={loading} error={error}>
      {!family ? <NeedLogin /> : (
        <>
          <PageHeader title="Карточки" subtitle="Добавляйте слова, фразы, предложения, грамматические паттерны, диалоги и мини-истории." />
          <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
            <Panel>
              <form className="grid gap-3" onSubmit={submit}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="English"><Input value={form.english} onChange={(e) => setForm({ ...form, english: e.target.value })} required /></Field>
                  <Field label="Russian"><Input value={form.russian} onChange={(e) => setForm({ ...form, russian: e.target.value })} required /></Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CardType })}>{cardTypes.map((type) => <option key={type}>{type}</option>)}</Select></Field>
                  <Field label="Topic"><Select value={form.topic_id} onChange={(e) => setForm({ ...form, topic_id: e.target.value })}><option value="">Без темы</option>{topics.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Source"><Select value={form.source_id} onChange={(e) => setForm({ ...form, source_id: e.target.value })}><option value="">Без источника</option>{sources.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></Field>
                  <Field label="Course"><Select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}><option value="">Без курса</option>{courses.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Unit"><Select value={form.unit_id} onChange={(e) => setForm({ ...form, unit_id: e.target.value })}><option value="">Без юнита</option>{units.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></Field>
                  <Field label="Lesson"><Select value={form.lesson_id} onChange={(e) => setForm({ ...form, lesson_id: e.target.value })}><option value="">Без урока</option>{lessons.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></Field>
                </div>
                <Field label="Example English"><Textarea value={form.example_en} onChange={(e) => setForm({ ...form, example_en: e.target.value })} rows={2} /></Field>
                <Field label="Example Russian"><Textarea value={form.example_ru} onChange={(e) => setForm({ ...form, example_ru: e.target.value })} rows={2} /></Field>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Difficulty"><Input value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })} min={1} max={5} type="number" /></Field>
                  <Field label="Tags"><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="food, can" /></Field>
                  <Field label="Status"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CardStatus })}>{statuses.map((status) => <option key={status}>{status}</option>)}</Select></Field>
                </div>
                <Button>{editingId ? "Сохранить" : "Добавить карточку"}</Button>
                {editingId ? <button className="text-sm text-slate-500" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Отменить редактирование</button> : null}
                {message ? <p className="rounded-lg bg-mint p-3 text-sm">{message}</p> : null}
              </form>
            </Panel>
            <div className="grid gap-4">
              <Panel className="grid gap-3 sm:grid-cols-2">
                <Field label="Фильтр по типу"><Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="all">Все типы</option>{cardTypes.map((type) => <option key={type}>{type}</option>)}</Select></Field>
                <Field label="Фильтр по теме"><Select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)}><option value="all">Все темы</option>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}</Select></Field>
              </Panel>
              <div className="grid gap-3">
                {filteredCards.map((card) => (
                  <Panel key={card.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-bold">{card.english}</p>
                        <p className="text-slate-600">{card.russian}</p>
                        <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{card.type} · difficulty {card.difficulty} · {card.status}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="focus-ring rounded-lg bg-skysoft p-3" type="button" onClick={() => speakEnglish(card.english)} title="Listen"><Volume2 size={18} /></button>
                        <button className="focus-ring rounded-lg bg-mint p-3" type="button" onClick={() => edit(card)} title="Edit"><Edit3 size={18} /></button>
                        <button className="focus-ring rounded-lg bg-peach px-3 py-2 text-sm font-semibold" type="button" onClick={() => archive(card.id)}>Архив</button>
                      </div>
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AuthRequired>
  );
}
