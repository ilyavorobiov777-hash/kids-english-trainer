import type { Card, ExerciseType, GrammarPattern, PracticeAttempt, ReviewSchedule } from "@/lib/database.types";
import { shuffle } from "@/lib/supabase/helpers";

export type PracticeExercise = {
  id: string;
  type: ExerciseType;
  prompt: string;
  context?: string;
  promptRu?: string;
  card?: Card;
  grammarPattern?: GrammarPattern;
  options: string[];
  correctAnswer: string;
  correctAnswerRu?: string;
  translationRu?: string;
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
  },
  {
    key: "demonstratives_this_that_these_those",
    statement: "These are my books.",
    question: "Are these your books?",
    options: ["Are these your books?", "Is these your books?", "Are this your books?", "Do these your books?"]
  },
  {
    key: "demonstratives_this_that_these_those",
    statement: "Those are your pencils.",
    question: "Are those your pencils?",
    options: ["Are those your pencils?", "Is those your pencils?", "Are that your pencils?", "Do those your pencils?"]
  },
  {
    key: "demonstratives_this_that_these_those",
    statement: "These are apples.",
    question: "What are these?",
    options: ["What are these?", "What is these?", "What are this?", "What do these?"]
  },
  {
    key: "demonstratives_this_that_these_those",
    statement: "Those are toys.",
    question: "What are those?",
    options: ["What are those?", "What is those?", "What are that?", "What do those?"]
  },
  {
    key: "present_continuous_ing",
    statement: "I am running.",
    question: "Are you running?",
    options: ["Are you running?", "Do you running?", "Is you running?", "Are you run?"]
  },
  {
    key: "present_continuous_ing",
    statement: "She is sleeping.",
    question: "Is she sleeping?",
    options: ["Is she sleeping?", "Are she sleeping?", "Does she sleeping?", "Is she sleep?"]
  },
  {
    key: "present_continuous_ing",
    statement: "They are jumping.",
    question: "Are they jumping?",
    options: ["Are they jumping?", "Is they jumping?", "Do they jumping?", "Are they jump?"]
  },
  {
    key: "present_continuous_ing",
    statement: "You are drawing.",
    question: "What are you doing?",
    options: ["What are you doing?", "What is you doing?", "What do you doing?", "What are you do?"]
  },
  {
    key: "days_time_expressions",
    statement: "I play football on Sunday.",
    question: "What do you do on Sunday?",
    options: ["What do you do on Sunday?", "What do you do in Sunday?", "What do you do at Sunday?", "What are Sunday?"]
  },
  {
    key: "days_time_expressions",
    statement: "I get up at seven o'clock.",
    question: "What time do you get up?",
    options: ["What time do you get up?", "What day do you get up?", "Where time do you get up?", "What are you get up?"]
  },
  {
    key: "personal_pronouns",
    statement: "You are happy.",
    question: "Are you happy?",
    options: ["Are you happy?", "Is you happy?", "Do you happy?", "You are happy?"]
  },
  {
    key: "personal_pronouns",
    statement: "He is my brother.",
    question: "Is he your brother?",
    options: ["Is he your brother?", "Are he your brother?", "Is she your brother?", "Does he your brother?"]
  },
  {
    key: "personal_pronouns",
    statement: "She is my sister.",
    question: "Is she your sister?",
    options: ["Is she your sister?", "Are she your sister?", "Is he your sister?", "Does she your sister?"]
  },
  {
    key: "personal_pronouns",
    statement: "They are pupils.",
    question: "Are they pupils?",
    options: ["Are they pupils?", "Is they pupils?", "Do they pupils?", "Are it pupils?"]
  },
  {
    key: "possessive_adjectives",
    statement: "This is your book.",
    question: "Is this your book?",
    options: ["Is this your book?", "Are this your book?", "Is this you book?", "Does this your book?"]
  },
  {
    key: "possessive_adjectives",
    statement: "These are your toys.",
    question: "Are these your toys?",
    options: ["Are these your toys?", "Is these your toys?", "Are these you toys?", "Do these your toys?"]
  },
  {
    key: "possessive_adjectives",
    statement: "This is my book.",
    question: "Whose book is this?",
    options: ["Whose book is this?", "Who book is this?", "Whose is this book?", "What book this is?"]
  },
  {
    key: "possessive_adjectives",
    statement: "These are my pencils.",
    question: "Whose pencils are these?",
    options: ["Whose pencils are these?", "Whose pencil is these?", "Who pencils are these?", "What pencils is these?"]
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

const demonstrativeGapExamples = [
  {
    prompt: "___ are my books.",
    answer: "These",
    explanationRu: "These используется для нескольких предметов рядом: These are my books."
  },
  {
    prompt: "___ are her pencils.",
    answer: "Those",
    explanationRu: "Those используется для нескольких предметов далеко: Those are her pencils."
  },
  {
    prompt: "What are ___?",
    answer: "these",
    explanationRu: "В вопросе про несколько предметов рядом говорим: What are these?"
  },
  {
    prompt: "What are ___?",
    answer: "those",
    explanationRu: "В вопросе про несколько предметов далеко говорим: What are those?"
  },
  {
    prompt: "___ is my book.",
    answer: "This",
    explanationRu: "This используется для одного предмета рядом: This is my book."
  },
  {
    prompt: "___ is her bag.",
    answer: "That",
    explanationRu: "That используется для одного предмета далеко: That is her bag."
  },
  {
    prompt: "These ___ my books.",
    answer: "are",
    explanationRu: "С these всегда используем are: These are my books."
  },
  {
    prompt: "Those ___ her toys.",
    answer: "are",
    explanationRu: "С those всегда используем are: Those are her toys."
  }
];

const ingGapExamples = [
  {
    prompt: "I ___ running.",
    answer: "am",
    explanationRu: "С I используем am: I am running."
  },
  {
    prompt: "She ___ sleeping.",
    answer: "is",
    explanationRu: "С she используем is: She is sleeping."
  },
  {
    prompt: "He ___ playing.",
    answer: "is",
    explanationRu: "С he используем is: He is playing."
  },
  {
    prompt: "They ___ jumping.",
    answer: "are",
    explanationRu: "С they используем are: They are jumping."
  },
  {
    prompt: "We ___ going to school.",
    answer: "are",
    explanationRu: "С we используем are: We are going to school."
  },
  {
    prompt: "What ___ you doing?",
    answer: "are",
    explanationRu: "В вопросе с you используем are: What are you doing?"
  },
  {
    prompt: "___ she sleeping?",
    answer: "Is",
    explanationRu: "В вопросе с she ставим is вперед: Is she sleeping?"
  },
  {
    prompt: "___ they playing?",
    answer: "Are",
    explanationRu: "В вопросе с they ставим are вперед: Are they playing?"
  }
];

const timeGapExamples = [
  {
    prompt: "I go to school ___ Monday.",
    answer: "on",
    explanationRu: "С днями недели используем on: on Monday."
  },
  {
    prompt: "I read ___ the evening.",
    answer: "in",
    explanationRu: "С частями дня используем in: in the evening."
  },
  {
    prompt: "I sleep ___ night.",
    answer: "at",
    explanationRu: "Правильно: at night."
  },
  {
    prompt: "I get up ___ seven o'clock.",
    answer: "at",
    explanationRu: "Со временем на часах используем at: at seven o'clock."
  },
  {
    prompt: "I played football ___ weekend.",
    answer: "last",
    explanationRu: "С last предлог не нужен: last weekend."
  },
  {
    prompt: "I will play ___ weekend.",
    answer: "next",
    explanationRu: "С next предлог не нужен: next weekend."
  },
  {
    prompt: "I have breakfast ___ the morning.",
    answer: "in",
    explanationRu: "Правильно: in the morning."
  },
  {
    prompt: "I have English ___ Wednesday.",
    answer: "on",
    explanationRu: "С днями недели используем on: on Wednesday."
  }
];

const pronounGapExamples = [
  {
    prompt: "___ am eight.",
    answer: "I",
    explanationRu: "После I используется am: I am eight. I всегда пишется с большой буквы."
  },
  {
    prompt: "___ is my brother.",
    answer: "He",
    explanationRu: "He значит он. После he используется is: He is my brother."
  },
  {
    prompt: "___ is my sister.",
    answer: "She",
    explanationRu: "She значит она. После she используется is: She is my sister."
  },
  {
    prompt: "___ are pupils.",
    answer: "We",
    explanationRu: "We значит мы. После we используется are: We are pupils."
  },
  {
    prompt: "___ are happy.",
    answer: "They",
    explanationRu: "They значит они. После they используется are: They are happy."
  }
];

const possessiveGapExamples = [
  {
    context: "I have a book.",
    prompt: "This is ___ book.",
    answer: "my",
    explanationRu: "I = я, поэтому говорим my book. Не говорим I book."
  },
  {
    context: "You have a pencil.",
    prompt: "This is ___ pencil.",
    answer: "your",
    explanationRu: "You = ты/вы, поэтому говорим your pencil."
  },
  {
    context: "Tom has a dog.",
    prompt: "This is ___ dog.",
    answer: "his",
    explanationRu: "Tom - мальчик, поэтому his dog."
  },
  {
    context: "Anna has a bag.",
    prompt: "This is ___ bag.",
    answer: "her",
    explanationRu: "Anna - девочка, поэтому her bag."
  },
  {
    context: "They have toys.",
    prompt: "These are ___ toys.",
    answer: "their",
    explanationRu: "They = они, поэтому their toys."
  },
  {
    context: "We have a classroom.",
    prompt: "This is ___ classroom.",
    answer: "our",
    explanationRu: "We = мы, поэтому our classroom."
  }
];

const shortAnswerExamples = [
  {
    key: "have got",
    context: "I have got a dog.",
    prompt: "Have you got a dog?",
    answer: "Yes, I have.",
    answerRu: "Да.",
    options: ["Yes, I have.", "No, I haven't.", "Yes, I do.", "No, thank you."],
    explanationRu: "В ситуации сказано: I have got a dog. Поэтому на Have you got...? отвечаем Yes, I have."
  },
  {
    key: "have got",
    context: "I haven't got a pencil.",
    prompt: "Have you got a pencil?",
    answer: "No, I haven't.",
    answerRu: "Нет.",
    options: ["No, I haven't.", "Yes, I have.", "No, I can't.", "No, I don't."],
    explanationRu: "В ситуации сказано: I haven't got a pencil. Поэтому ответ No, I haven't."
  },
  {
    key: "can",
    context: "I can swim.",
    prompt: "Can you swim?",
    answer: "Yes, I can.",
    answerRu: "Да.",
    options: ["Yes, I can.", "No, I can't.", "Yes, I do.", "Yes, please."],
    explanationRu: "В ситуации сказано: I can swim. На Can you...? отвечаем Yes, I can."
  },
  {
    key: "can",
    context: "I can't jump.",
    prompt: "Can you jump?",
    answer: "No, I can't.",
    answerRu: "Нет.",
    options: ["No, I can't.", "Yes, I can.", "No, I don't.", "No, I haven't."],
    explanationRu: "В ситуации сказано: I can't jump. Поэтому ответ No, I can't."
  },
  {
    key: "like",
    context: "I like bananas.",
    prompt: "Do you like bananas?",
    answer: "Yes, I do.",
    answerRu: "Да.",
    options: ["Yes, I do.", "No, I don't.", "Yes, I can.", "Yes, please."],
    explanationRu: "В ситуации сказано: I like bananas. На Do you like...? отвечаем Yes, I do."
  },
  {
    key: "like",
    context: "I don't like apples.",
    prompt: "Do you like apples?",
    answer: "No, I don't.",
    answerRu: "Нет.",
    options: ["No, I don't.", "Yes, I do.", "No, I can't.", "No, thank you."],
    explanationRu: "В ситуации сказано: I don't like apples. Поэтому ответ No, I don't."
  },
  {
    key: "would like",
    context: "I would like an apple.",
    prompt: "Would you like an apple?",
    answer: "Yes, please.",
    answerRu: "Да, пожалуйста.",
    options: ["Yes, please.", "No, thank you.", "Yes, I can.", "No, I don't."],
    explanationRu: "В ситуации сказано: I would like an apple. Вежливый ответ: Yes, please."
  },
  {
    key: "would like",
    context: "I would not like juice.",
    prompt: "Would you like some juice?",
    answer: "No, thank you.",
    answerRu: "Нет, спасибо.",
    options: ["No, thank you.", "Yes, please.", "No, I don't.", "No, I haven't."],
    explanationRu: "В ситуации сказано: I would not like juice. Вежливый ответ: No, thank you."
  },
  {
    key: "demonstratives_this_that_these_those",
    context: "These are my books.",
    prompt: "Are these your books?",
    answer: "Yes, they are.",
    answerRu: "Да.",
    options: ["Yes, they are.", "No, they aren't.", "Yes, it is.", "Yes, I do."],
    explanationRu: "В ситуации сказано: These are my books. Books - несколько предметов, поэтому Yes, they are."
  },
  {
    key: "demonstratives_this_that_these_those",
    context: "Those aren't my pencils.",
    prompt: "Are those your pencils?",
    answer: "No, they aren't.",
    answerRu: "Нет.",
    options: ["No, they aren't.", "Yes, they are.", "No, it isn't.", "No, I don't."],
    explanationRu: "В ситуации сказано: Those aren't my pencils. Pencils - несколько предметов, поэтому No, they aren't."
  },
  {
    key: "demonstratives_this_that_these_those",
    context: "These are my books.",
    prompt: "Whose books are these?",
    answer: "These are my books.",
    answerRu: "Это мои книги.",
    options: ["These are my books.", "This is my book.", "Those is my books.", "Yes, they are."],
    explanationRu: "В ситуации сказано: These are my books. Whose значит чьи, поэтому отвечаем These are my books."
  },
  {
    key: "demonstratives_this_that_these_those",
    context: "Those are her pencils.",
    prompt: "Whose pencils are those?",
    answer: "Those are her pencils.",
    answerRu: "Вон те ее карандаши.",
    options: ["Those are her pencils.", "That is her pencil.", "These is her pencils.", "No, they aren't."],
    explanationRu: "В ситуации сказано: Those are her pencils. Pencils - множественное число, поэтому Those are..."
  },
  {
    key: "personal_pronouns",
    context: "I am happy.",
    prompt: "Are you happy?",
    answer: "Yes, I am.",
    answerRu: "Да.",
    options: ["Yes, I am.", "No, I am not.", "Yes, he is.", "Yes, they are."],
    explanationRu: "В ситуации сказано: I am happy. На Are you...? отвечаем Yes, I am."
  },
  {
    key: "personal_pronouns",
    context: "He is my brother.",
    prompt: "Is he your brother?",
    answer: "Yes, he is.",
    answerRu: "Да.",
    options: ["Yes, he is.", "No, he isn't.", "Yes, she is.", "Yes, they are."],
    explanationRu: "В ситуации сказано: He is my brother. На Is he...? отвечаем Yes, he is."
  },
  {
    key: "personal_pronouns",
    context: "She isn't my sister.",
    prompt: "Is she your sister?",
    answer: "No, she isn't.",
    answerRu: "Нет.",
    options: ["No, she isn't.", "Yes, she is.", "No, he isn't.", "No, they aren't."],
    explanationRu: "В ситуации сказано: She isn't my sister. На Is she...? отвечаем No, she isn't."
  },
  {
    key: "personal_pronouns",
    context: "It is a dog.",
    prompt: "Is it a dog?",
    answer: "Yes, it is.",
    answerRu: "Да.",
    options: ["Yes, it is.", "No, it isn't.", "Yes, he is.", "Yes, they are."],
    explanationRu: "В ситуации сказано: It is a dog. На Is it...? отвечаем Yes, it is."
  },
  {
    key: "personal_pronouns",
    context: "They are pupils.",
    prompt: "Are they pupils?",
    answer: "Yes, they are.",
    answerRu: "Да.",
    options: ["Yes, they are.", "No, they aren't.", "Yes, it is.", "Yes, I am."],
    explanationRu: "В ситуации сказано: They are pupils. На Are they...? отвечаем Yes, they are."
  },
  {
    key: "possessive_adjectives",
    context: "This is my book.",
    prompt: "Is this your book?",
    answer: "Yes, it is.",
    answerRu: "Да.",
    options: ["Yes, it is.", "No, it isn't.", "Yes, they are.", "Yes, I am."],
    explanationRu: "В ситуации сказано: This is my book. Book - один предмет, поэтому Yes, it is."
  },
  {
    key: "possessive_adjectives",
    context: "These aren't my toys.",
    prompt: "Are these your toys?",
    answer: "No, they aren't.",
    answerRu: "Нет.",
    options: ["No, they aren't.", "Yes, they are.", "No, it isn't.", "No, I am not."],
    explanationRu: "В ситуации сказано: These aren't my toys. Toys - несколько предметов, поэтому No, they aren't."
  },
  {
    key: "possessive_adjectives",
    context: "I have a book.",
    prompt: "Whose book is this?",
    answer: "It is my book.",
    answerRu: "Это моя книга.",
    options: ["It is my book.", "They are her pencils.", "This is I book.", "Yes, they are."],
    explanationRu: "В ситуации сказано: I have a book. Поэтому это my book."
  },
  {
    key: "possessive_adjectives",
    context: "Anna has pencils.",
    prompt: "Whose pencils are these?",
    answer: "They are her pencils.",
    answerRu: "Это ее карандаши.",
    options: ["They are her pencils.", "It is my book.", "These is her pencils.", "No, it isn't."],
    explanationRu: "В ситуации сказано: Anna has pencils. Anna - девочка, поэтому her pencils."
  },
  {
    key: "present_continuous_ing",
    context: "I am running.",
    prompt: "Are you running?",
    answer: "Yes, I am.",
    answerRu: "Да.",
    options: ["Yes, I am.", "No, I am not.", "Yes, I do.", "Yes, they are."],
    explanationRu: "В ситуации сказано: I am running. На Are you...? отвечаем Yes, I am."
  },
  {
    key: "present_continuous_ing",
    context: "She isn't sleeping.",
    prompt: "Is she sleeping?",
    answer: "No, she isn't.",
    answerRu: "Нет.",
    options: ["No, she isn't.", "Yes, she is.", "No, she doesn't.", "No, they aren't."],
    explanationRu: "В ситуации сказано: She isn't sleeping. На Is she...? отвечаем No, she isn't."
  },
  {
    key: "present_continuous_ing",
    context: "He is playing.",
    prompt: "Is he playing?",
    answer: "Yes, he is.",
    answerRu: "Да.",
    options: ["Yes, he is.", "No, he isn't.", "Yes, he does.", "Yes, I am."],
    explanationRu: "В ситуации сказано: He is playing. На Is he...? отвечаем Yes, he is."
  },
  {
    key: "present_continuous_ing",
    context: "They aren't jumping.",
    prompt: "Are they jumping?",
    answer: "No, they aren't.",
    answerRu: "Нет.",
    options: ["No, they aren't.", "Yes, they are.", "No, they don't.", "No, it isn't."],
    explanationRu: "В ситуации сказано: They aren't jumping. На Are they...? отвечаем No, they aren't."
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
  },
  {
    prompt: "What are these?",
    answer: "These are my books.",
    options: ["These are my books.", "This is my book.", "That is my bag.", "Yes, please."]
  },
  {
    prompt: "Are those your toys?",
    answer: "No, they aren't.",
    options: ["No, they aren't.", "No, it isn't.", "No, I don't.", "No, thank you."]
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

/**
 * Reject obviously-broken or misleading distractor strings.
 * Same logic as in word-learning-flow but applied to mixed daily practice too,
 * so single-word prompts like "dog" don't get sentence distractors like "This is your pencil."
 */
function isPlausibleDistractor(item: string, correct: string): boolean {
  if (!item) return false;
  if (/___|Correct:/i.test(item)) return false;
  if (item.includes("/")) return false;
  const correctWords = correct.trim().split(/\s+/).length;
  const itemWords = item.trim().split(/\s+/).length;
  if (correctWords <= 2 && itemWords > 4) return false;
  if (correctWords >= 4 && itemWords <= 1) return false;
  return true;
}

function pickOptions(correct: string, candidates: string[], count = 4, fallback: string[] = []) {
  const correctAnswer = correct.trim();
  const distractors = uniqueValues([...candidates, ...fallback]).filter(
    (item) => normalize(item) !== normalize(correctAnswer) && isPlausibleDistractor(item, correctAnswer)
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

function isDemonstrativesKey(key?: string) {
  return normalize(key ?? "").includes("demonstratives") || normalize(key ?? "").includes("these");
}

function isIngKey(key?: string) {
  const value = normalize(key ?? "");
  return value.includes("present_continuous") || value.includes("continuous") || value.includes("ing");
}

function isTimeKey(key?: string) {
  const value = normalize(key ?? "");
  return value.includes("days_time") || value.includes("time expressions") || value.includes("monday") || value.includes("weekend");
}

function isPersonalPronounsKey(key?: string) {
  const value = normalize(key ?? "");
  return value.includes("personal_pronouns") || value.includes("personal pronouns") || value.includes("i you he she");
}

function isPossessiveAdjectivesKey(key?: string) {
  const value = normalize(key ?? "");
  return value.includes("possessive_adjectives") || value.includes("possessive") || value.includes("my your his her");
}

function matchesGrammarKey(card: Card, key: string) {
  const value = normalize(key);
  const compactValue = value.replace(/\s+/g, "_");
  const haystack = normalize(`${card.english} ${card.russian} ${card.type} ${card.tags.join(" ")}`);

  if (isDemonstrativesKey(value)) return card.tags.some((tag) => normalize(tag).includes("demonstratives")) || haystack.includes("these") || haystack.includes("those");
  if (isIngKey(value)) return card.tags.some((tag) => normalize(tag).includes("present_continuous")) || haystack.includes("running") || haystack.includes("sleeping") || haystack.includes("jumping");
  if (isTimeKey(value)) return card.tags.some((tag) => normalize(tag).includes("days_time")) || haystack.includes("monday") || haystack.includes("morning") || haystack.includes("weekend");
  if (isPersonalPronounsKey(value)) return card.tags.some((tag) => normalize(tag).includes("personal_pronouns")) || card.tags.some((tag) => normalize(tag).includes("pronouns")) || /\b(i|you|he|she|it|we|they)\b/i.test(card.english);
  if (isPossessiveAdjectivesKey(value)) return card.tags.some((tag) => normalize(tag).includes("possessive_adjectives")) || haystack.includes("my book") || haystack.includes("your pencil") || haystack.includes("his ") || haystack.includes("her ") || haystack.includes("their ") || haystack.includes("our ");

  const tokens = uniqueValues([...value.split(/[_\s/+-]+/), ...compactValue.split("_")]).filter((token) => token.length >= 3);
  return tokens.some((token) => haystack.includes(token));
}

function buildDemonstrativesPractice(cards: Card[], grammarPatterns: GrammarPattern[]) {
  const activeCards = cards.filter((card) => card.status === "active");
  const grammarPattern = findPattern(grammarPatterns, "demonstratives") ?? findPattern(grammarPatterns, "this that these those");
  const demonstrativeCards = activeCards.filter((card) =>
    card.tags.some((tag) => normalize(tag).includes("demonstratives")) ||
    normalize(`${card.english} ${card.russian}`).includes("these") ||
    normalize(`${card.english} ${card.russian}`).includes("those")
  );

  const cardExercises = demonstrativeCards.slice(0, 6).map((card, index) => {
    const cycle: ExerciseType[] = ["choose_translation", "russian_to_english", "listen_and_choose", "build_sentence"];
    return buildCardExercise(card, activeCards.length ? activeCards : demonstrativeCards, cycle[index % cycle.length]);
  });

  const gapExercises = demonstrativeGapExamples.map((item, index) => ({
    id: `demonstratives_fill:${index}:${item.prompt}`,
    type: "fill_the_gap" as ExerciseType,
    grammarPattern,
    prompt: item.prompt,
    promptRu: "Выбери правильное слово",
    options: pickOptions(item.answer, ["This", "That", "These", "Those", "is", "are"], 4),
    correctAnswer: item.answer,
    explanationRu: item.explanationRu
  }));

  const questionExercises = questionFormExamples
    .filter((item) => isDemonstrativesKey(item.key))
    .map((item, index) => ({
      id: `demonstratives_question:${index}:${item.statement}`,
      type: "question_form" as ExerciseType,
      grammarPattern,
      prompt: item.statement,
      promptRu: "Выбери правильный вопрос",
      options: shuffle(item.options),
      correctAnswer: item.question,
      explanationRu: "Для these/those нужен are: What are these? Are those your pencils?"
    }));

  const shortAnswerExercises = shortAnswerExamples
    .filter((item) => isDemonstrativesKey(item.key))
    .map((item, index) => ({
      id: `demonstratives_short:${index}:${item.prompt}`,
      type: "short_answer" as ExerciseType,
      grammarPattern,
      context: item.context,
      prompt: item.prompt,
      promptRu: "Выбери короткий ответ",
      options: shuffle(item.options),
      correctAnswer: item.answer,
      correctAnswerRu: item.answerRu,
      listenText: item.prompt,
      explanationRu: item.explanationRu
    }));

  const dialogueExercises = miniDialogueExamples
    .filter((item) => normalize(item.prompt).includes("these") || normalize(item.prompt).includes("those"))
    .map((item, index) => ({
      id: `demonstratives_dialogue:${index}:${item.prompt}`,
      type: "mini_dialogue" as ExerciseType,
      grammarPattern,
      prompt: item.prompt,
      promptRu: "Выбери подходящую реплику",
      options: shuffle(item.options),
      correctAnswer: item.answer,
      listenText: item.prompt
    }));

  return dedupeValidExercises(
    shuffle([...cardExercises, ...gapExercises, ...questionExercises, ...shortAnswerExercises, ...dialogueExercises]),
    12
  );
}

function buildIngPractice(cards: Card[], grammarPatterns: GrammarPattern[]) {
  const activeCards = cards.filter((card) => card.status === "active");
  const grammarPattern = findPattern(grammarPatterns, "present_continuous_ing") ?? findPattern(grammarPatterns, "continuous");
  const ingCards = activeCards.filter((card) => matchesGrammarKey(card, "present_continuous_ing"));

  const cardExercises = ingCards.slice(0, 6).map((card, index) => {
    const cycle: ExerciseType[] = ["choose_translation", "russian_to_english", "listen_and_choose", "build_sentence"];
    return buildCardExercise(card, activeCards.length ? activeCards : ingCards, cycle[index % cycle.length]);
  });

  const gapExercises = ingGapExamples.map((item, index) => ({
    id: `ing_fill:${index}:${item.prompt}`,
    type: "fill_the_gap" as ExerciseType,
    grammarPattern,
    prompt: item.prompt,
    promptRu: "Выбери am / is / are",
    options: pickOptions(item.answer, ["am", "is", "are", "do", "does"], 4),
    correctAnswer: item.answer,
    explanationRu: item.explanationRu
  }));

  const questionExercises = questionFormExamples
    .filter((item) => isIngKey(item.key))
    .map((item, index) => ({
      id: `ing_question:${index}:${item.statement}`,
      type: "question_form" as ExerciseType,
      grammarPattern,
      prompt: item.statement,
      promptRu: "Выбери правильный вопрос",
      options: shuffle(item.options),
      correctAnswer: item.question,
      explanationRu: "В Present Continuous am/is/are выходит вперед: Are you running? Is she sleeping?"
    }));

  const shortAnswerExercises = shortAnswerExamples
    .filter((item) => isIngKey(item.key))
    .map((item, index) => ({
      id: `ing_short:${index}:${item.prompt}`,
      type: "short_answer" as ExerciseType,
      grammarPattern,
      context: item.context,
      prompt: item.prompt,
      promptRu: "Выбери короткий ответ",
      options: shuffle(item.options),
      correctAnswer: item.answer,
      correctAnswerRu: item.answerRu,
      listenText: item.prompt,
      explanationRu: item.explanationRu
    }));

  return dedupeValidExercises(shuffle([...cardExercises, ...gapExercises, ...questionExercises, ...shortAnswerExercises]), 12);
}

function buildTimePractice(cards: Card[], grammarPatterns: GrammarPattern[]) {
  const activeCards = cards.filter((card) => card.status === "active");
  const grammarPattern = findPattern(grammarPatterns, "days_time_expressions") ?? findPattern(grammarPatterns, "time expressions");
  const timeCards = activeCards.filter((card) => matchesGrammarKey(card, "days_time_expressions"));

  const cardExercises = timeCards.slice(0, 6).map((card, index) => {
    const cycle: ExerciseType[] = ["choose_translation", "russian_to_english", "listen_and_choose", "build_sentence"];
    return buildCardExercise(card, activeCards.length ? activeCards : timeCards, cycle[index % cycle.length]);
  });

  const gapExercises = timeGapExamples.map((item, index) => ({
    id: `time_fill:${index}:${item.prompt}`,
    type: "fill_the_gap" as ExerciseType,
    grammarPattern,
    prompt: item.prompt,
    promptRu: "Выбери on / in / at / last / next",
    options: pickOptions(item.answer, ["on", "in", "at", "last", "next"], 4),
    correctAnswer: item.answer,
    explanationRu: item.explanationRu
  }));

  const questionExercises = questionFormExamples
    .filter((item) => isTimeKey(item.key))
    .map((item, index) => ({
      id: `time_question:${index}:${item.statement}`,
      type: "question_form" as ExerciseType,
      grammarPattern,
      prompt: item.statement,
      promptRu: "Выбери правильный вопрос",
      options: shuffle(item.options),
      correctAnswer: item.question,
      explanationRu: "С днями недели говорим on Sunday. С частями дня: in the morning, но at night."
    }));

  return dedupeValidExercises(shuffle([...cardExercises, ...gapExercises, ...questionExercises]), 12);
}

function buildPronounsPractice(cards: Card[], grammarPatterns: GrammarPattern[], grammarKey: string) {
  const activeCards = cards.filter((card) => card.status === "active");
  const personalMode = isPersonalPronounsKey(grammarKey);
  const grammarPattern =
    findPattern(grammarPatterns, personalMode ? "personal_pronouns" : "possessive_adjectives") ??
    findPattern(grammarPatterns, "pronouns");
  const pronounCards = activeCards.filter((card) => matchesGrammarKey(card, grammarKey));
  const gapSource = personalMode ? pronounGapExamples : possessiveGapExamples;
  const optionSource = personalMode
    ? ["I", "You", "He", "She", "It", "We", "They"]
    : ["my", "your", "his", "her", "its", "our", "their"];

  const cardExercises = pronounCards.slice(0, 6).map((card, index) => {
    const cycle: ExerciseType[] = ["choose_translation", "russian_to_english", "listen_and_choose", "build_sentence"];
    return buildCardExercise(card, activeCards.length ? activeCards : pronounCards, cycle[index % cycle.length]);
  });

  const gapExercises = gapSource.map((item, index) => ({
    id: `${personalMode ? "personal" : "possessive"}_fill:${index}:${item.prompt}`,
    type: "fill_the_gap" as ExerciseType,
    grammarPattern,
    context: "context" in item ? item.context : undefined,
    prompt: item.prompt,
    promptRu: personalMode ? "Выбери I / he / she / we / they" : "Выбери my / your / his / her / our / their",
    options: pickOptions(item.answer, optionSource, 4),
    correctAnswer: item.answer,
    explanationRu: item.explanationRu
  }));

  const questionExercises = questionFormExamples
    .filter((item) => (personalMode ? isPersonalPronounsKey(item.key) : isPossessiveAdjectivesKey(item.key)))
    .map((item, index) => ({
      id: `${personalMode ? "personal" : "possessive"}_question:${index}:${item.statement}`,
      type: "question_form" as ExerciseType,
      grammarPattern,
      prompt: item.statement,
      promptRu: "Выбери правильный вопрос",
      options: shuffle(item.options),
      correctAnswer: item.question,
      explanationRu: personalMode
        ? "В вопросе am/is/are выходит вперед: Are you happy? Is he your brother?"
        : "В вопросах с this/these и my/your/his/her важно сохранить possessive word: Is this your book?"
    }));

  const shortAnswerExercises = shortAnswerExamples
    .filter((item) => (personalMode ? isPersonalPronounsKey(item.key) : isPossessiveAdjectivesKey(item.key)))
    .map((item, index) => ({
      id: `${personalMode ? "personal" : "possessive"}_short:${index}:${item.prompt}`,
      type: "short_answer" as ExerciseType,
      grammarPattern,
      context: item.context,
      prompt: item.prompt,
      promptRu: "Выбери короткий ответ",
      options: shuffle(item.options),
      correctAnswer: item.answer,
      correctAnswerRu: item.answerRu,
      listenText: item.prompt,
      explanationRu: item.explanationRu
    }));

  return dedupeValidExercises(shuffle([...cardExercises, ...gapExercises, ...questionExercises, ...shortAnswerExercises]), 12);
}

function buildGenericGrammarPractice(cards: Card[], grammarPatterns: GrammarPattern[], grammarKey: string) {
  const activeCards = cards.filter((card) => card.status === "active");
  const grammarPattern = findPattern(grammarPatterns, grammarKey);
  const matchedCards = activeCards.filter((card) => matchesGrammarKey(card, grammarKey));
  const sourceCards = matchedCards.length ? matchedCards : activeCards.filter((card) => card.type === "grammar_pattern");
  if (!matchedCards.length) return [];

  const cardExercises = sourceCards.slice(0, 10).map((card, index) => {
    const cycle: ExerciseType[] = ["choose_translation", "russian_to_english", "listen_and_choose", "build_sentence", "fill_the_gap"];
    return buildCardExercise(card, activeCards.length ? activeCards : sourceCards, cycle[index % cycle.length]);
  });

  const questionExercises = questionFormExamples
    .filter((item) => findPattern([grammarPattern].filter(Boolean) as GrammarPattern[], item.key) || normalize(grammarKey).includes(normalize(item.key)))
    .map((item, index) => ({
      id: `generic_question:${index}:${item.statement}`,
      type: "question_form" as ExerciseType,
      grammarPattern,
      prompt: item.statement,
      promptRu: "Выбери правильный вопрос",
      options: shuffle(item.options),
      correctAnswer: item.question
    }));

  const shortAnswerExercises = shortAnswerExamples
    .filter((item) => findPattern([grammarPattern].filter(Boolean) as GrammarPattern[], item.key) || normalize(grammarKey).includes(normalize(item.key)))
    .map((item, index) => ({
      id: `generic_short:${index}:${item.prompt}`,
      type: "short_answer" as ExerciseType,
      grammarPattern,
      context: item.context,
      prompt: item.prompt,
      promptRu: "Выбери короткий ответ",
      options: shuffle(item.options),
      correctAnswer: item.answer,
      correctAnswerRu: item.answerRu,
      listenText: item.prompt,
      explanationRu: item.explanationRu
    }));

  return dedupeValidExercises(shuffle([...questionExercises, ...shortAnswerExercises, ...cardExercises]), 12);
}

function isValidExercise(exercise: PracticeExercise) {
  if (!exercise.prompt.trim() || !exercise.correctAnswer.trim()) return false;

  if (exercise.type === "build_sentence") {
    return (exercise.words?.length ?? 0) >= 2;
  }

  if (exercise.type === "short_answer" && !exercise.context?.trim()) {
    return false;
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
  grammarKey?: string | null;
}) {
  const { cards, attempts, schedules, grammarPatterns, grammarKey } = params;
  if (isDemonstrativesKey(grammarKey ?? undefined)) {
    return buildDemonstrativesPractice(cards, grammarPatterns);
  }
  if (isIngKey(grammarKey ?? undefined)) {
    return buildIngPractice(cards, grammarPatterns);
  }
  if (isTimeKey(grammarKey ?? undefined)) {
    return buildTimePractice(cards, grammarPatterns);
  }
  if (isPersonalPronounsKey(grammarKey ?? undefined)) {
    return buildPronounsPractice(cards, grammarPatterns, "personal_pronouns");
  }
  if (isPossessiveAdjectivesKey(grammarKey ?? undefined)) {
    return buildPronounsPractice(cards, grammarPatterns, "possessive_adjectives");
  }
  if (grammarKey) {
    return buildGenericGrammarPractice(cards, grammarPatterns, grammarKey);
  }

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

  const demonstrativePattern = findPattern(grammarPatterns, "demonstratives") ?? findPattern(grammarPatterns, "this that these those");
  const demonstrativeExercise = shuffle(demonstrativeGapExamples).slice(0, 1).map((item, index) => ({
    id: `demonstratives_daily:${index}:${item.prompt}`,
    type: "fill_the_gap" as ExerciseType,
    grammarPattern: demonstrativePattern,
    prompt: item.prompt,
    promptRu: "This/that или these/those?",
    options: pickOptions(item.answer, ["This", "That", "These", "Those", "is", "are"], 4),
    correctAnswer: item.answer,
    explanationRu: item.explanationRu
  }));

  const ingPattern = findPattern(grammarPatterns, "present_continuous_ing") ?? findPattern(grammarPatterns, "continuous");
  const ingExercise = shuffle(ingGapExamples).slice(0, 1).map((item, index) => ({
    id: `ing_daily:${index}:${item.prompt}`,
    type: "fill_the_gap" as ExerciseType,
    grammarPattern: ingPattern,
    prompt: item.prompt,
    promptRu: "am / is / are + -ing",
    options: pickOptions(item.answer, ["am", "is", "are", "do", "does"], 4),
    correctAnswer: item.answer,
    explanationRu: item.explanationRu
  }));

  const timePattern = findPattern(grammarPatterns, "days_time_expressions") ?? findPattern(grammarPatterns, "time expressions");
  const timeExercise = shuffle(timeGapExamples).slice(0, 1).map((item, index) => ({
    id: `time_daily:${index}:${item.prompt}`,
    type: "fill_the_gap" as ExerciseType,
    grammarPattern: timePattern,
    prompt: item.prompt,
    promptRu: "on / in / at / last / next",
    options: pickOptions(item.answer, ["on", "in", "at", "last", "next"], 4),
    correctAnswer: item.answer,
    explanationRu: item.explanationRu
  }));

  const pronounPattern = findPattern(grammarPatterns, "personal_pronouns") ?? findPattern(grammarPatterns, "possessive_adjectives");
  const pronounExercise = shuffle([...pronounGapExamples, ...possessiveGapExamples]).slice(0, 1).map((item, index) => ({
    id: `pronouns_daily:${index}:${item.prompt}`,
    type: "fill_the_gap" as ExerciseType,
    grammarPattern: pronounPattern,
    context: "context" in item ? item.context : undefined,
    prompt: item.prompt,
    promptRu: "Местоимение или притяжательное слово",
    options: pickOptions(item.answer, ["I", "He", "She", "We", "They", "my", "your", "his", "her", "our", "their"], 4),
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
      ...demonstrativeExercise,
      ...ingExercise,
      ...timeExercise,
      ...pronounExercise,
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
