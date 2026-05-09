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

const fallbackRussianOptions = [
  "да",
  "нет",
  "пожалуйста",
  "спасибо",
  "кошка",
  "собака",
  "яблоко",
  "карандаш"
];

const fallbackEnglishOptions = [
  "Yes, please.",
  "No, thank you.",
  "Yes, I can.",
  "No, I can't.",
  "I can swim.",
  "I like apples.",
  "a cat",
  "a pencil"
];

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
    explanationRu: "an используется перед словами, которые начинаются с гласного звука: an apple."
  },
  {
    prompt: "I have got ___ cat.",
    answer: "a",
    explanationRu: "a используется, когда предмет один и мы говорим о нем впервые: a cat."
  },
  {
    prompt: "I have got a cat. ___ cat is black.",
    answer: "the",
    explanationRu: "the используется, когда мы уже знаем, о каком предмете говорим: сначала a cat, потом the cat."
  },
  {
    prompt: "___ sun is yellow.",
    answer: "the",
    explanationRu: "the используется с единственным известным предметом: the sun."
  },
  {
    prompt: "Open ___ door.",
    answer: "the",
    explanationRu: "the подходит, когда понятно, какую именно дверь нужно открыть."
  }
];

const shortAnswerExamples = [
  {
    key: "have got",
    prompt: "Have you got a dog?",
    answer: "Yes, I have.",
    options: ["Yes, I have.", "No, I haven't.", "Yes, I do.", "No, thank you."]
  },
  {
    key: "have got",
    prompt: "Have you got a pencil?",
    answer: "No, I haven't.",
    options: ["No, I haven't.", "Yes, I have.", "No, I can't.", "No, I don't."]
  },
  {
    key: "can",
    prompt: "Can you swim?",
    answer: "Yes, I can.",
    options: ["Yes, I can.", "No, I can't.", "Yes, I do.", "Yes, please."]
  },
  {
    key: "can",
    prompt: "Can you jump?",
    answer: "No, I can't.",
    options: ["No, I can't.", "Yes, I can.", "No, I don't.", "No, I haven't."]
  },
  {
    key: "like",
    prompt: "Do you like bananas?",
    answer: "Yes, I do.",
    options: ["Yes, I do.", "No, I don't.", "Yes, I can.", "Yes, please."]
  },
  {
    key: "like",
    prompt: "Do you like apples?",
    answer: "No, I don't.",
    options: ["No, I don't.", "Yes, I do.", "No, I can't.", "No, thank you."]
  },
  {
    key: "would like",
    prompt: "Would you like an apple?",
    answer: "Yes, please.",
    options: ["Yes, please.", "No, thank you.", "Yes, I can.", "No, I don't."]
  },
  {
    key: "would like",
    prompt: "Would you like some juice?",
    answer: "No, thank you.",
    options: ["No, thank you.", "Yes, please.", "No, I don't.", "No, I haven't."]
  }
];

const miniDialogueExamples = [
  {
    prompt: "Would you like some juice?",
    answer: "Yes, please.",
    options: ["Yes, please.", "I can swim.", "It is blue.", "I have got a pencil."]
  },
  {
    prompt: "Have you got a pencil?",
    answer: "No, I haven't.",
    options: ["No, I haven't.", "Yes, please.", "I like apples.", "It is black."]
  },
  {
    prompt: "Do you like bananas?",
    answer: "Yes, I do.",
    options: ["Yes, I do.", "No, I can't.", "Yes, I have.", "No, thank you."]
  }
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[?.!,]/g, "").replace(/\s+/g, " ").trim();
}

function uniqueValues(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    const key = normalize(trimmed);
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

function pickOptions(correct: string, candidates: string[], count = 4, fallback: string[] = []) {
  const correctAnswer = correct.trim();
  const distractors = uniqueValues([...candidates, ...fallback]).filter(
    (item) => normalize(item) !== normalize(correctAnswer)
  );
  return shuffle(uniqueValues([correctAnswer, ...shuffle(distractors).slice(0, count - 1)])).slice(0, count);
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
      options: pickOptions(card.english, cards.map((item) => item.english), 4, fallbackEnglishOptions),
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
      options: pickOptions(card.russian, cards.map((item) => item.russian), 4, fallbackRussianOptions),
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
      options: pickOptions(
        correct,
        cards.flatMap((item) => wordsFromSentence(item.example_en || item.english)),
        4,
        fallbackEnglishOptions
      ),
      correctAnswer: correct,
      listenText: text
    };
  }

  return {
    id: `choose_translation:${card.id}`,
    type: "choose_translation",
    card,
    prompt: card.english,
    options: pickOptions(card.russian, cards.map((item) => item.russian), 4, fallbackRussianOptions),
    correctAnswer: card.russian,
    listenText: card.english
  };
}

function findPattern(patterns: GrammarPattern[], key: string) {
  return patterns.find((item) => normalize(`${item.pattern_key || ""} ${item.title || ""}`).includes(normalize(key)));
}

function isValidExercise(exercise: PracticeExercise) {
  if (!exercise.prompt.trim() || !exercise.correctAnswer.trim()) return false;

  if (exercise.type === "build_sentence") {
    return (exercise.words?.length ?? 0) >= 2;
  }

  return exercise.options.length >= 2 && exercise.options.some((option) => normalize(option) === normalize(exercise.correctAnswer));
}

function dedupeValidExercises(exercises: PracticeExercise[], limit = 15) {
  const seenTaskIds = new Set<string>();
  const result: PracticeExercise[] = [];

  for (const exercise of exercises) {
    if (seenTaskIds.has(exercise.id) || !isValidExercise(exercise)) continue;
    seenTaskIds.add(exercise.id);
    result.push(exercise);
    if (result.length >= limit) break;
  }

  return result;
}

function takeUniqueCards(cards: Card[], count: number, usedCardIds: Set<string>) {
  const result: Card[] = [];

  for (const card of cards) {
    if (usedCardIds.has(card.id)) continue;
    usedCardIds.add(card.id);
    result.push(card);
    if (result.length >= count) break;
  }

  return result;
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
  const usedCardIds = new Set<string>();
  const attemptsByCard = attempts.reduce<Record<string, { total: number; wrong: number }>>((acc, attempt) => {
    if (!attempt.card_id) return acc;
    acc[attempt.card_id] ??= { total: 0, wrong: 0 };
    acc[attempt.card_id].total += 1;
    if (!attempt.is_correct) acc[attempt.card_id].wrong += 1;
    return acc;
  }, {});
  const seenCardIds = new Set(Object.keys(attemptsByCard));
  const dueCardIds = new Set(schedules.filter((item) => new Date(item.due_at).getTime() <= now).map((item) => item.card_id));

  const dueCards = takeUniqueCards(
    schedules
      .filter((item) => new Date(item.due_at).getTime() <= now)
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
      .map((item) => activeCards.find((card) => card.id === item.card_id))
      .filter((card): card is Card => Boolean(card)),
    5,
    usedCardIds
  );

  const weakCards = takeUniqueCards(
    activeCards
      .filter((card) => !dueCardIds.has(card.id) && attemptsByCard[card.id]?.wrong > 0)
      .sort((a, b) => {
        const left = attemptsByCard[a.id];
        const right = attemptsByCard[b.id];
        return right.wrong / right.total - left.wrong / left.total;
      }),
    3,
    usedCardIds
  );

  const newCards = takeUniqueCards(
    shuffle(activeCards.filter((card) => !seenCardIds.has(card.id))),
    4,
    usedCardIds
  );

  const lessPracticedCards = takeUniqueCards(
    activeCards
      .filter((card) => !usedCardIds.has(card.id))
      .sort((a, b) => (attemptsByCard[a.id]?.total ?? 0) - (attemptsByCard[b.id]?.total ?? 0)),
    Math.max(0, 4 - newCards.length),
    usedCardIds
  );

  const phraseCards = takeUniqueCards(
    shuffle(activeCards.filter((card) => ["phrase", "sentence", "mini_story"].includes(card.type))),
    2,
    usedCardIds
  );

  const dueExercises = dueCards.map((card, index) =>
    buildCardExercise(card, activeCards, index % 2 === 0 ? "choose_translation" : "russian_to_english")
  );
  const weakExercises = weakCards.map((card, index) =>
    buildCardExercise(card, activeCards, index % 2 === 0 ? "choose_translation" : "fill_the_gap")
  );
  const newExercises = [...newCards, ...lessPracticedCards].map((card, index) => {
    const cycle: ExerciseType[] = ["choose_translation", "listen_and_choose", "russian_to_english"];
    return buildCardExercise(card, activeCards, cycle[index % cycle.length]);
  });
  const phraseExercises = phraseCards.map((card, index) =>
    buildCardExercise(card, activeCards, index % 2 === 0 ? "build_sentence" : "fill_the_gap")
  );

  const questionExercise = shuffle(questionFormExamples).slice(0, 1).map((item) => ({
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
  const articleExercise = shuffle(articleExamples).slice(0, 1).map((item, index) => ({
    id: `articles:${index}:${item.prompt}`,
    type: "articles" as ExerciseType,
    grammarPattern: articlePattern,
    prompt: item.prompt,
    promptRu: "Выбери артикль",
    options: ["a", "an", "the", "no article"],
    correctAnswer: item.answer,
    explanationRu: item.explanationRu
  }));

  const shortAnswerExercise = shuffle(shortAnswerExamples).slice(0, 1).map((item, index) => ({
    id: `short_answer:${index}:${item.prompt}`,
    type: "short_answer" as ExerciseType,
    grammarPattern: findPattern(grammarPatterns, item.key),
    prompt: item.prompt,
    promptRu: "Выбери короткий ответ",
    options: shuffle(item.options),
    correctAnswer: item.answer,
    listenText: item.prompt
  }));

  const dialogueCards = activeCards.filter((card) => card.type === "dialogue");
  const selectedDialogue = shuffle(dialogueCards).find((card) => !usedCardIds.has(card.id));
  if (selectedDialogue) usedCardIds.add(selectedDialogue.id);
  const miniDialogueExercise = selectedDialogue
    ? [
        {
          id: `mini_dialogue:${selectedDialogue.id}`,
          type: "mini_dialogue" as ExerciseType,
          card: selectedDialogue,
          prompt: selectedDialogue.english,
          promptRu: "Выбери ответ",
          options: pickOptions(
            selectedDialogue.russian,
            [...dialogueCards.map((item) => item.russian), ...miniDialogueExamples.map((item) => item.answer)],
            4,
            fallbackEnglishOptions
          ),
          correctAnswer: selectedDialogue.russian,
          listenText: selectedDialogue.english
        }
      ]
    : shuffle(miniDialogueExamples)
        .slice(0, 1)
        .map((item, index) => ({
          id: `mini_dialogue:${index}:${item.prompt}`,
          type: "mini_dialogue" as ExerciseType,
          prompt: item.prompt,
          promptRu: "Выбери подходящую реплику",
          options: shuffle(item.options),
          correctAnswer: item.answer,
          listenText: item.prompt
        }));

  const listenExercise = activeCards.find((card) => !usedCardIds.has(card.id))
    ? [buildCardExercise(activeCards.find((card) => !usedCardIds.has(card.id)) as Card, activeCards, "listen_and_choose")]
    : [];

  return dedupeValidExercises(
    shuffle([
      ...dueExercises,
      ...weakExercises,
      ...newExercises,
      ...phraseExercises,
      ...questionExercise,
      ...shortAnswerExercise,
      ...articleExercise,
      ...miniDialogueExercise,
      ...listenExercise
    ]),
    15
  );
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
