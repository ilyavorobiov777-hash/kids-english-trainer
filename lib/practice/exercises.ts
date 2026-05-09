import type { Card, ExerciseType, GrammarPattern, PracticeAttempt, ReviewSchedule } from "@/lib/database.types";
import { shuffle } from "@/lib/supabase/helpers";

export type PracticeExercise = {
  id: string;
  type: ExerciseType;
  prompt: string;
  promptRu?: string;
  card?: Card;
  grammarPattern?: GrammarPattern;
  options: string[];
  correctAnswer: string;
  listenText?: string;
  words?: string[];
  explanationRu?: string;
};

const questionFormExamples = [
  {
    key: "have got",
    statement: "I have got a dog.",
    question: "Have you got a dog?",
    options: ["Have you got a dog?", "Do you have got a dog?", "Can you got a dog?", "Would you got a dog?"]
  },
  {
    key: "can",
    statement: "I can swim.",
    question: "Can you swim?",
    options: ["Can you swim?", "Do you can swim?", "Are you swim?", "Would you swim?"]
  },
  {
    key: "like",
    statement: "I like apples.",
    question: "Do you like apples?",
    options: ["Do you like apples?", "Like you apples?", "Can you like apples?", "Are you like apples?"]
  },
  {
    key: "would like",
    statement: "I would like some juice.",
    question: "Would you like some juice?",
    options: ["Would you like some juice?", "Do you would like juice?", "Can you would juice?", "Are you like juice?"]
  }
];

const articleExamples = [
  {
    prompt: "I have got ___ apple.",
    answer: "an",
    explanationRu: "An ставим перед словом, которое начинается с гласного звука: an apple."
  },
  {
    prompt: "I have got ___ cat.",
    answer: "a",
    explanationRu: "A ставим перед одним предметом, если следующий звук согласный: a cat."
  },
  {
    prompt: "I have got a cat. ___ cat is black.",
    answer: "the",
    explanationRu: "The ставим, когда предмет уже знаком: сначала a cat, потом the cat."
  },
  {
    prompt: "___ sun is yellow.",
    answer: "the",
    explanationRu: "The используем с единственным известным предметом: the sun."
  },
  {
    prompt: "Open ___ door.",
    answer: "the",
    explanationRu: "The подходит, когда понятно, какую именно дверь нужно открыть."
  }
];

const shortAnswerExamples = [
  {
    prompt: "Can you swim?",
    answer: "Yes, I can.",
    options: ["Yes, I can.", "Yes, I do.", "No, I am.", "Yes, please."]
  },
  {
    prompt: "Do you like bananas?",
    answer: "Yes, I do.",
    options: ["Yes, I do.", "Yes, I can.", "No, I have.", "Yes, please."]
  },
  {
    prompt: "Have you got a pencil?",
    answer: "Yes, I have.",
    options: ["Yes, I have.", "Yes, I do.", "Yes, I can.", "No, thank you."]
  },
  {
    prompt: "Would you like an apple?",
    answer: "Yes, please.",
    options: ["Yes, please.", "Yes, I can.", "Yes, I have.", "No, I do."]
  }
];

const miniDialogueExamples = [
  {
    prompt: "Would you like an apple?",
    answer: "Yes, please.",
    options: ["Yes, please.", "I can swim.", "It is blue.", "I have got a pencil."]
  },
  {
    prompt: "Thank you!",
    answer: "You are welcome.",
    options: ["You are welcome.", "I like apples.", "Can you jump?", "It is a dog."]
  }
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[?.!,]/g, "").replace(/\s+/g, " ").trim();
}

function pickOptions(correct: string, candidates: string[], count = 4) {
  const distractors = shuffle(candidates.filter((item) => normalize(item) !== normalize(correct) && item.trim().length > 0));
  return shuffle(Array.from(new Set([correct, ...distractors])).slice(0, count));
}

function wordsFromSentence(sentence: string) {
  return sentence.replace(/[?.!,]/g, "").split(/\s+/).filter(Boolean);
}

function buildCardExercise(card: Card, cards: Card[], type: ExerciseType): PracticeExercise {
  if (type === "russian_to_english") {
    return {
      id: `${type}:${card.id}`,
      type,
      card,
      prompt: card.russian,
      options: pickOptions(card.english, cards.map((item) => item.english)),
      correctAnswer: card.english,
      listenText: card.english
    };
  }

  if (type === "listen_and_choose") {
    return {
      id: `${type}:${card.id}`,
      type,
      card,
      prompt: "Послушай и выбери перевод",
      promptRu: card.english,
      options: pickOptions(card.russian, cards.map((item) => item.russian)),
      correctAnswer: card.russian,
      listenText: card.english
    };
  }

  if (type === "build_sentence") {
    const text = card.example_en || card.english;
    const words = wordsFromSentence(text);
    return {
      id: `${type}:${card.id}`,
      type,
      card,
      prompt: card.russian,
      options: [],
      words: shuffle(words),
      correctAnswer: words.join(" "),
      listenText: text
    };
  }

  if (type === "fill_the_gap") {
    const text = card.example_en || card.english;
    const words = wordsFromSentence(text);
    const gapIndex = Math.max(0, Math.min(words.length - 1, Math.floor(words.length / 2)));
    const correct = words[gapIndex] || card.english;
    const promptWords = [...words];
    promptWords[gapIndex] = "___";
    return {
      id: `${type}:${card.id}`,
      type,
      card,
      prompt: promptWords.join(" "),
      options: pickOptions(correct, cards.flatMap((item) => wordsFromSentence(item.example_en || item.english))),
      correctAnswer: correct,
      listenText: text
    };
  }

  return {
    id: `choose_translation:${card.id}`,
    type: "choose_translation",
    card,
    prompt: card.english,
    options: pickOptions(card.russian, cards.map((item) => item.russian)),
    correctAnswer: card.russian,
    listenText: card.english
  };
}

function findPattern(patterns: GrammarPattern[], key: string) {
  return patterns.find((item) => normalize(item.pattern_key || item.title).includes(normalize(key)));
}

export function isCorrectAnswer(answer: string, correctAnswer: string) {
  return normalize(answer) === normalize(correctAnswer);
}

export function buildDailyPractice(params: {
  cards: Card[];
  attempts: PracticeAttempt[];
  schedules: ReviewSchedule[];
  grammarPatterns: GrammarPattern[];
}) {
  const { cards, attempts, schedules, grammarPatterns } = params;
  const activeCards = cards.filter((card) => card.status === "active");
  const now = Date.now();
  const dueCardIds = new Set(schedules.filter((item) => new Date(item.due_at).getTime() <= now).map((item) => item.card_id));
  const weakCardIds = new Set(
    Object.entries(
      attempts.reduce<Record<string, { total: number; wrong: number }>>((acc, attempt) => {
        if (!attempt.card_id) return acc;
        acc[attempt.card_id] ??= { total: 0, wrong: 0 };
        acc[attempt.card_id].total += 1;
        if (!attempt.is_correct) acc[attempt.card_id].wrong += 1;
        return acc;
      }, {})
    )
      .filter(([, value]) => value.wrong > 0)
      .sort((a, b) => b[1].wrong / b[1].total - a[1].wrong / a[1].total)
      .slice(0, 6)
      .map(([cardId]) => cardId)
  );

  const dueCards = shuffle(activeCards.filter((card) => dueCardIds.has(card.id))).slice(0, 5);
  const weakCards = shuffle(activeCards.filter((card) => weakCardIds.has(card.id) && !dueCardIds.has(card.id))).slice(0, 3);
  const phraseCards = shuffle(activeCards.filter((card) => ["phrase", "sentence", "mini_story"].includes(card.type))).slice(0, 2);
  const newCards = shuffle(activeCards.filter((card) => !dueCardIds.has(card.id) && !weakCardIds.has(card.id))).slice(0, 5);
  const selected = Array.from(new Map([...dueCards, ...weakCards, ...phraseCards, ...newCards].map((card) => [card.id, card])).values()).slice(0, 10);

  const cardExercises = selected.map((card, index) => {
    const cycle: ExerciseType[] = ["choose_translation", "russian_to_english", "listen_and_choose", "build_sentence", "fill_the_gap"];
    const preferred = card.type === "word" ? cycle[index % 3] : cycle[index % cycle.length];
    return buildCardExercise(card, activeCards, preferred);
  });

  const questionExercises = questionFormExamples.slice(0, 1).map((item) => ({
    id: `question_form:${item.key}`,
    type: "question_form" as ExerciseType,
    grammarPattern: findPattern(grammarPatterns, item.key),
    prompt: item.statement,
    promptRu: "Выбери правильный вопрос",
    options: shuffle(item.options),
    correctAnswer: item.question,
    explanationRu: "В вопросе вспомогательное слово выходит вперед."
  }));

  const articlePattern = findPattern(grammarPatterns, "articles");
  const articleExercises = shuffle(articleExamples).slice(0, 1).map((item, index) => ({
    id: `articles:${index}:${item.prompt}`,
    type: "articles" as ExerciseType,
    grammarPattern: articlePattern,
    prompt: item.prompt,
    promptRu: "Выбери артикль",
    options: ["a", "an", "the", "no article"],
    correctAnswer: item.answer,
    explanationRu: item.explanationRu
  }));

  const shortAnswerExercises = shuffle(shortAnswerExamples).slice(0, 1).map((item, index) => ({
    id: `short_answer:${index}:${item.prompt}`,
    type: "short_answer" as ExerciseType,
    grammarPattern: findPattern(grammarPatterns, "can") || findPattern(grammarPatterns, "like"),
    prompt: item.prompt,
    promptRu: "Выбери короткий ответ",
    options: shuffle(item.options),
    correctAnswer: item.answer,
    listenText: item.prompt
  }));

  const dialogueCards = activeCards.filter((card) => card.type === "dialogue");
  const miniDialogueExercises = (dialogueCards.length ? dialogueCards.slice(0, 1).map((card) => ({
    id: `mini_dialogue:${card.id}`,
    type: "mini_dialogue" as ExerciseType,
    card,
    prompt: card.english,
    promptRu: "Выбери ответ",
    options: pickOptions(card.russian, activeCards.map((item) => item.russian)),
    correctAnswer: card.russian,
    listenText: card.english
  })) : shuffle(miniDialogueExamples).slice(0, selected.length >= 4 ? 1 : 0).map((item, index) => ({
    id: `mini_dialogue:${index}:${item.prompt}`,
    type: "mini_dialogue" as ExerciseType,
    prompt: item.prompt,
    promptRu: "Выбери подходящую реплику",
    options: shuffle(item.options),
    correctAnswer: item.answer,
    listenText: item.prompt
  })));

  return shuffle([...cardExercises, ...questionExercises, ...articleExercises, ...shortAnswerExercises, ...miniDialogueExercises]).slice(0, 12);
}

export function nextReviewState(schedule: ReviewSchedule | undefined, isCorrect: boolean, rating: number) {
  const previousReviews = schedule?.review_count ?? schedule?.repetitions ?? 0;
  const previousLapses = schedule?.lapse_count ?? schedule?.lapses ?? 0;
  const reviewCount = previousReviews + 1;
  const lapseCount = isCorrect ? previousLapses : previousLapses + 1;
  let intervalDays = 0;

  if (!isCorrect) intervalDays = rating <= 1 ? 0 : 1;
  else if (previousReviews === 0) intervalDays = 1;
  else if (rating >= 5) intervalDays = 7;
  else intervalDays = 3;

  return {
    due_at: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString(),
    interval_days: Math.max(1, intervalDays),
    repetitions: isCorrect ? (schedule?.repetitions ?? 0) + 1 : 0,
    lapses: lapseCount,
    review_count: reviewCount,
    lapse_count: lapseCount,
    stability: isCorrect ? Math.max(schedule?.stability ?? 1, intervalDays || 1) : 0.5,
    difficulty: Math.min(5, Math.max(1, (schedule?.difficulty ?? 2.5) + (isCorrect ? -0.2 : 0.5))),
    ease: Math.min(3, Math.max(1.3, (schedule?.ease ?? 2.5) + (isCorrect ? 0.05 : -0.2)))
  };
}
