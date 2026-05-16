import type { Card } from "@/lib/database.types";

export type CuratedTopicDefinition = {
  id: string;
  key: string;
  title: string;
  description: string;
  english: string[];
  tags: string[];
};

export const curatedTopicDefinitions: CuratedTopicDefinition[] = [
  {
    id: "curated-question_words",
    key: "question_words",
    title: "Вопросительные слова",
    description: "What, where, who, whose, when, how many и похожие вопросы.",
    english: [
      "what",
      "where",
      "who",
      "whose",
      "when",
      "why",
      "how",
      "how many",
      "how old",
      "what time",
      "What is this?",
      "Where is my bag?",
      "Who is this?",
      "Whose book is this?",
      "Whose pencils are these?",
      "When do you go to school?",
      "How many apples are there?",
      "How old are you?",
      "What time do you get up?"
    ],
    tags: ["question_words", "simple questions", "question_form"]
  },
  {
    id: "curated-pronouns_mixed",
    key: "pronouns_mixed",
    title: "Местоимения",
    description: "I, you, he, she, we, they и my, your, his, her, our, their.",
    english: [
      "I",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "my",
      "your",
      "his",
      "her",
      "its",
      "our",
      "their",
      "I am eight.",
      "He is my brother.",
      "She is my sister.",
      "This is my book.",
      "These are their toys."
    ],
    tags: ["pronouns", "personal_pronouns", "possessive_adjectives"]
  },
  {
    id: "curated-days_time_prepositions",
    key: "days_time_prepositions",
    title: "Дни недели и время",
    description: "on Monday, in the morning, at night, last weekend, next week.",
    english: [
      "on Monday",
      "on Tuesday",
      "on Sunday",
      "in the morning",
      "in the afternoon",
      "in the evening",
      "at night",
      "at seven o'clock",
      "last weekend",
      "next weekend",
      "this morning",
      "next week",
      "I go to school on Monday.",
      "I read in the evening.",
      "I sleep at night.",
      "I get up at seven o'clock."
    ],
    tags: ["days_time_expressions", "time", "days of the week"]
  },
  {
    id: "curated-demonstratives",
    key: "demonstratives",
    title: "This / that / these / those",
    description: "Рядом или далеко, один предмет или несколько предметов.",
    english: [
      "this",
      "that",
      "these",
      "those",
      "This is my book.",
      "That is my bag.",
      "These are my pencils.",
      "Those are my books.",
      "What are these?",
      "What are those?"
    ],
    tags: ["demonstratives", "demonstratives_this_that_these_those"]
  },
  {
    id: "curated-ing_actions",
    key: "ing_actions",
    title: "-ing actions",
    description: "running, sleeping, playing, reading и действия, которые происходят сейчас.",
    english: [
      "running",
      "sleeping",
      "going",
      "playing",
      "reading",
      "writing",
      "drawing",
      "jumping",
      "eating",
      "drinking",
      "I am running.",
      "She is sleeping.",
      "They are playing.",
      "We are going to school.",
      "What are you doing?"
    ],
    tags: ["present_continuous_ing", "ing_actions", "actions"]
  }
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[?.!,]/g, "").replace(/\s+/g, " ").trim();
}

export function findCuratedTopic(id: string | undefined) {
  if (!id) return null;
  return curatedTopicDefinitions.find((topic) => topic.id === id || topic.key === id) ?? null;
}

export function cardMatchesCuratedTopic(card: Card, topic: CuratedTopicDefinition) {
  const english = normalize(card.english);
  const russian = normalize(card.russian);
  const titleAndTags = normalize(`${card.english} ${card.russian} ${card.tags.join(" ")}`);
  const exactEnglish = new Set(topic.english.map(normalize));

  return (
    exactEnglish.has(english) ||
    topic.english.some((item) => {
      const key = normalize(item);
      return key.length > 3 && (english.includes(key) || russian.includes(key));
    }) ||
    topic.tags.some((tag) => titleAndTags.includes(normalize(tag)))
  );
}

export function cardsForCuratedTopic(cards: Card[], topic: CuratedTopicDefinition) {
  return cards.filter((card) => card.status === "active" && cardMatchesCuratedTopic(card, topic));
}
