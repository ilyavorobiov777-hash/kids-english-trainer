"use client";

import { Button, Field, Panel } from "@/components/ui";
import type { CardStatus, CardType, Course, Lesson, Source, Topic, Unit } from "@/lib/database.types";
import type { ApiClient } from "@/lib/api-client";
import { normalizeTags } from "@/lib/supabase/helpers";
import { useMemo, useState } from "react";

type CsvRow = {
  english: string;
  russian: string;
  type: CardType;
  topic: string;
  course: string;
  source: string;
  unit: string;
  lesson: string;
  example_en: string;
  example_ru: string;
  difficulty: number;
  tags: string[];
  status: CardStatus;
  errors: string[];
};

const cardTypes: CardType[] = ["word", "phrase", "sentence", "grammar_pattern", "dialogue", "mini_story"];
const statuses: CardStatus[] = ["draft", "active", "archived"];

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function normalizeRow(raw: Record<string, string>): CsvRow {
  const errors: string[] = [];
  const type = (raw.type?.trim() || "word") as CardType;
  const status = (raw.status?.trim() || "active") as CardStatus;
  const difficulty = Number(raw.difficulty || 1);

  if (!raw.english?.trim()) errors.push("english обязателен");
  if (!raw.russian?.trim()) errors.push("russian обязателен");
  if (!cardTypes.includes(type)) errors.push(`неизвестный type: ${type}`);
  if (!statuses.includes(status)) errors.push(`неизвестный status: ${status}`);
  if (!Number.isFinite(difficulty) || difficulty < 1 || difficulty > 5) errors.push("difficulty должен быть от 1 до 5");

  return {
    english: raw.english?.trim() ?? "",
    russian: raw.russian?.trim() ?? "",
    type: cardTypes.includes(type) ? type : "word",
    topic: raw.topic?.trim() || "Imported",
    course: raw.course?.trim() || "Imported cards",
    source: raw.source?.trim() || "CSV import",
    unit: raw.unit?.trim() || "Unit 1",
    lesson: raw.lesson?.trim() || "Lesson 1",
    example_en: raw.example_en?.trim() ?? "",
    example_ru: raw.example_ru?.trim() ?? "",
    difficulty: Number.isFinite(difficulty) ? Math.min(5, Math.max(1, difficulty)) : 1,
    tags: normalizeTags(raw.tags ?? ""),
    status: statuses.includes(status) ? status : "active",
    errors
  };
}

function makeTitleMap<T extends { id: string; title: string }>(items: unknown): Map<string, T> {
  return new Map(((Array.isArray(items) ? items : []) as T[]).map((item) => [String(item.title).toLowerCase(), item]));
}

async function getOrCreate<T extends { id: string; title: string }>(
  api: ApiClient,
  table: "courses" | "sources" | "topics" | "units" | "lessons",
  cache: Map<string, T>,
  title: string,
  payload: Record<string, unknown>
) {
  const key = title.trim().toLowerCase();
  if (!key) return null;
  const existing = cache.get(key);
  if (existing) return existing.id;

  const { data, error } = await api.from(table).insert(payload).select("id,title").single();
  if (error) throw error;
  const item = data as T;
  cache.set(key, item);
  return item.id;
}

export function CsvImporter({ api, familyId, userId }: { api: ApiClient; familyId: string; userId: string }) {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const summary = useMemo(() => {
    const errors = rows.filter((row) => row.errors.length).length;
    return { valid: rows.length - errors, errors };
  }, [rows]);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setMessage(null);
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsv(text);
    const [headers, ...body] = parsed;
    const headerKeys = headers.map(normalizeHeader);
    const normalized = body.map((cells) => {
      const raw = Object.fromEntries(headerKeys.map((header, index) => [header, cells[index] ?? ""]));
      return normalizeRow(raw);
    });
    setRows(normalized);
  }

  async function importRows() {
    setBusy(true);
    setMessage(null);
    try {
      const validRows = rows.filter((row) => !row.errors.length);
      const [coursesRes, sourcesRes, topicsRes, unitsRes, lessonsRes] = await Promise.all([
        api.from("courses").select("id,title").eq("family_id", familyId),
        api.from("sources").select("id,title").eq("family_id", familyId),
        api.from("topics").select("id,title").eq("family_id", familyId),
        api.from("units").select("id,title").eq("family_id", familyId),
        api.from("lessons").select("id,title").eq("family_id", familyId)
      ]);

      const courses = makeTitleMap<Course>(coursesRes.data);
      const sources = makeTitleMap<Source>(sourcesRes.data);
      const topics = makeTitleMap<Topic>(topicsRes.data);
      const units = makeTitleMap<Unit>(unitsRes.data);
      const lessons = makeTitleMap<Lesson>(lessonsRes.data);

      let imported = 0;
      for (const row of validRows) {
        const courseId = await getOrCreate(api, "courses", courses, row.course, {
          family_id: familyId,
          title: row.course,
          description: "Создано при CSV-импорте"
        });
        const sourceId = await getOrCreate(api, "sources", sources, row.source, {
          family_id: familyId,
          course_id: courseId,
          title: row.source,
          kind: "csv"
        });
        const topicId = await getOrCreate(api, "topics", topics, row.topic, {
          family_id: familyId,
          course_id: courseId,
          title: row.topic
        });
        const unitId = await getOrCreate(api, "units", units, row.unit, {
          family_id: familyId,
          course_id: courseId,
          title: row.unit,
          position: 1
        });
        const lessonId = await getOrCreate(api, "lessons", lessons, row.lesson, {
          family_id: familyId,
          course_id: courseId,
          unit_id: unitId,
          title: row.lesson,
          position: 1
        });

        const { error } = await api.from("cards").insert({
          family_id: familyId,
          created_by: userId,
          english: row.english,
          russian: row.russian,
          type: row.type,
          topic_id: topicId,
          source_id: sourceId,
          course_id: courseId,
          unit_id: unitId,
          lesson_id: lessonId,
          example_en: row.example_en || null,
          example_ru: row.example_ru || null,
          difficulty: row.difficulty,
          tags: row.tags,
          status: row.status
        });
        if (error) throw error;
        imported += 1;
      }
      setMessage(`Импорт завершен: imported ${imported}, skipped ${rows.length - validRows.length}, errors ${summary.errors}.`);
    } catch (importError) {
      setMessage(importError instanceof Error ? importError.message : "Ошибка импорта CSV");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel>
      <div className="grid gap-4">
        <Field label="CSV-файл">
          <input className="focus-ring w-full rounded-lg border border-slate-200 px-3 py-3" accept=".csv,text/csv" type="file" onChange={onFileChange} />
        </Field>
        <p className="text-sm text-slate-500">
          Нужные колонки: english, russian, type, topic, course, source, unit, lesson, example_en, example_ru, difficulty, tags, status.
          Пример лежит в <a className="font-semibold text-berry" href="/samples/cards-import-sample.csv">public/samples/cards-import-sample.csv</a>.
        </p>
        {rows.length ? (
          <>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <span className="rounded-lg bg-mint px-3 py-2">Valid: {summary.valid}</span>
              <span className="rounded-lg bg-peach px-3 py-2">Errors: {summary.errors}</span>
            </div>
            <div className="max-h-96 overflow-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50">
                  <tr>
                    {["English", "Russian", "Type", "Topic", "Course", "Status", "Errors"].map((title) => (
                      <th className="p-3 font-bold" key={title}>{title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr className={row.errors.length ? "bg-red-50" : "bg-white"} key={`${row.english}-${rowIndex}`}>
                      <td className="border-t border-slate-100 p-3">{row.english}</td>
                      <td className="border-t border-slate-100 p-3">{row.russian}</td>
                      <td className="border-t border-slate-100 p-3">{row.type}</td>
                      <td className="border-t border-slate-100 p-3">{row.topic || "default"}</td>
                      <td className="border-t border-slate-100 p-3">{row.course || "default"}</td>
                      <td className="border-t border-slate-100 p-3">{row.status}</td>
                      <td className="border-t border-slate-100 p-3 text-red-700">{row.errors.join("; ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button disabled={!summary.valid || busy} onClick={importRows} type="button">
              {busy ? "Импорт..." : "Подтвердить импорт"}
            </Button>
          </>
        ) : null}
        {message ? <p className="rounded-lg bg-skysoft p-3 text-sm">{message}</p> : null}
      </div>
    </Panel>
  );
}
