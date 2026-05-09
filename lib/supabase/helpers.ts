import type { Card } from "@/lib/database.types";

export function normalizeTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function buildTranslationOptions(card: Card, allCards: Card[]): string[] {
  const distractors = shuffle(
    allCards
      .filter((item) => item.id !== card.id && item.russian.trim().length > 0)
      .map((item) => item.russian)
  ).slice(0, 3);

  return shuffle(Array.from(new Set([card.russian, ...distractors]))).slice(0, 4);
}

export function formatPercent(value: number | null | undefined): string {
  if (!value || Number.isNaN(value)) return "0%";
  return `${Math.round(value)}%`;
}
