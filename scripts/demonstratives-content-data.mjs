export const demonstrativesPattern = {
  title: "This, that, these, those",
  title_ru: "This / that / these / those - это, тот, эти, те",
  pattern_key: "demonstratives_this_that_these_those",
  covered_examples: [
    "This is my book.",
    "That is my bag.",
    "These are my pencils.",
    "Those are my books.",
    "What are these?",
    "What are those?",
    "Are these your books?",
    "Are those your pencils?"
  ]
};

const grammarPatternCards = [
  ["grammar_pattern", "grammar", "this = one near thing", "this - один предмет рядом", ["demonstratives", "this", "singular"]],
  ["grammar_pattern", "grammar", "that = one far thing", "that - один предмет далеко", ["demonstratives", "that", "singular"]],
  ["grammar_pattern", "grammar", "these = many near things", "these - несколько предметов рядом", ["demonstratives", "these", "plural"]],
  ["grammar_pattern", "grammar", "those = many far things", "those - несколько предметов далеко", ["demonstratives", "those", "plural"]],
  ["grammar_pattern", "grammar", "This is my book.", "Это моя книга.", ["demonstratives", "this", "is"]],
  ["grammar_pattern", "grammar", "That is my bag.", "Вон та сумка моя.", ["demonstratives", "that", "is"]],
  ["grammar_pattern", "grammar", "These are my pencils.", "Это мои карандаши.", ["demonstratives", "these", "are"]],
  ["grammar_pattern", "grammar", "Those are my books.", "Вон те книги мои.", ["demonstratives", "those", "are"]]
];

const sentenceCards = [
  ["sentence", "classroom objects", "These are my books.", "Это мои книги.", ["demonstratives", "these", "school"]],
  ["sentence", "classroom objects", "Those are my pencils.", "Вон те карандаши.", ["demonstratives", "those", "school"]],
  ["sentence", "food and drinks", "These are apples.", "Это яблоки.", ["demonstratives", "these", "food"]],
  ["sentence", "food and drinks", "Those are oranges.", "Вон те апельсины.", ["demonstratives", "those", "food"]],
  ["sentence", "toys", "These are my toys.", "Это мои игрушки.", ["demonstratives", "these", "toys"]],
  ["sentence", "clothes", "Those are her shoes.", "Вон те ее туфли.", ["demonstratives", "those", "clothes"]],
  ["sentence", "classroom objects", "These are blue pens.", "Это синие ручки.", ["demonstratives", "these", "colours"]],
  ["sentence", "school", "Those are red bags.", "Вон те красные сумки.", ["demonstratives", "those", "colours"]],
  ["sentence", "classroom objects", "This is my pencil.", "Это мой карандаш.", ["demonstratives", "this", "school"]],
  ["sentence", "classroom objects", "That is my ruler.", "Вон та линейка моя.", ["demonstratives", "that", "school"]],
  ["sentence", "animals", "These are small cats.", "Это маленькие кошки.", ["demonstratives", "these", "animals"]],
  ["sentence", "animals", "Those are big dogs.", "Вон те большие собаки.", ["demonstratives", "those", "animals"]],
  ["sentence", "classroom objects", "These are clean notebooks.", "Это чистые тетради.", ["demonstratives", "these", "school"]],
  ["sentence", "classroom objects", "Those are green crayons.", "Вон те зеленые мелки.", ["demonstratives", "those", "colours"]],
  ["phrase", "simple questions", "What are these?", "Что это?", ["demonstratives", "these", "question_form"]],
  ["phrase", "simple questions", "What are those?", "Что это там?", ["demonstratives", "those", "question_form"]],
  ["phrase", "simple questions", "Are these your books?", "Это твои книги?", ["demonstratives", "these", "short_answer"]],
  ["phrase", "simple questions", "Are those your toys?", "Вон те игрушки твои?", ["demonstratives", "those", "short_answer"]],
  ["phrase", "simple questions", "Whose books are these?", "Чьи это книги?", ["demonstratives", "these", "whose"]],
  ["phrase", "simple questions", "Whose bags are those?", "Чьи это сумки там?", ["demonstratives", "those", "whose"]]
];

const questionFormCards = [
  ["grammar_pattern", "grammar", "These are my books. -> Are these your books?", "Это мои книги. -> Это твои книги?", ["demonstratives", "question_form", "these"]],
  ["grammar_pattern", "grammar", "Those are your pencils. -> Are those your pencils?", "Вон те твои карандаши. -> Вон те карандаши твои?", ["demonstratives", "question_form", "those"]],
  ["grammar_pattern", "grammar", "These are apples. -> What are these?", "Это яблоки. -> Что это?", ["demonstratives", "question_form", "these"]],
  ["grammar_pattern", "grammar", "Those are toys. -> What are those?", "Вон те игрушки. -> Что это там?", ["demonstratives", "question_form", "those"]],
  ["grammar_pattern", "grammar", "These are her shoes. -> Are these her shoes?", "Это ее туфли. -> Это ее туфли?", ["demonstratives", "question_form", "these"]],
  ["grammar_pattern", "grammar", "Those are his bags. -> Are those his bags?", "Вон те его сумки. -> Вон те его сумки?", ["demonstratives", "question_form", "those"]],
  ["grammar_pattern", "grammar", "These are my pens. -> Whose pens are these?", "Это мои ручки. -> Чьи это ручки?", ["demonstratives", "question_form", "whose"]],
  ["grammar_pattern", "grammar", "Those are her pencils. -> Whose pencils are those?", "Вон те ее карандаши. -> Чьи это карандаши там?", ["demonstratives", "question_form", "whose"]],
  ["grammar_pattern", "grammar", "This is my book. -> What is this?", "Это моя книга. -> Что это?", ["demonstratives", "question_form", "this"]],
  ["grammar_pattern", "grammar", "That is my bag. -> What is that?", "Вон та моя сумка. -> Что это там?", ["demonstratives", "question_form", "that"]]
];

const shortAnswerCards = [
  ["grammar_pattern", "simple questions", "Are these your books? Yes, they are.", "Это твои книги? Да.", ["demonstratives", "short_answer", "these"]],
  ["grammar_pattern", "simple questions", "Are these your books? No, they aren't.", "Это твои книги? Нет.", ["demonstratives", "short_answer", "these"]],
  ["grammar_pattern", "simple questions", "Are those your pencils? Yes, they are.", "Вон те карандаши твои? Да.", ["demonstratives", "short_answer", "those"]],
  ["grammar_pattern", "simple questions", "Are those your pencils? No, they aren't.", "Вон те карандаши твои? Нет.", ["demonstratives", "short_answer", "those"]],
  ["grammar_pattern", "simple questions", "Are these apples? Yes, they are.", "Это яблоки? Да.", ["demonstratives", "short_answer", "these"]],
  ["grammar_pattern", "simple questions", "Are those toys? No, they aren't.", "Вон те игрушки? Нет.", ["demonstratives", "short_answer", "those"]],
  ["grammar_pattern", "simple questions", "These are my books.", "Это мои книги.", ["demonstratives", "short_answer", "these"]],
  ["grammar_pattern", "simple questions", "Those are her pencils.", "Вон те ее карандаши.", ["demonstratives", "short_answer", "those"]],
  ["grammar_pattern", "simple questions", "These are apples.", "Это яблоки.", ["demonstratives", "short_answer", "these"]],
  ["grammar_pattern", "simple questions", "Those are toys.", "Вон те игрушки.", ["demonstratives", "short_answer", "those"]]
];

const gapCards = [
  ["grammar_pattern", "grammar", "___ are my books. Correct: These", "Пропуск: These are my books.", ["demonstratives", "fill_the_gap", "these"]],
  ["grammar_pattern", "grammar", "___ are her pencils. Correct: Those", "Пропуск: Those are her pencils.", ["demonstratives", "fill_the_gap", "those"]],
  ["grammar_pattern", "grammar", "What are ___? Correct: these", "Пропуск: What are these?", ["demonstratives", "fill_the_gap", "these"]],
  ["grammar_pattern", "grammar", "What are ___? Correct: those", "Пропуск: What are those?", ["demonstratives", "fill_the_gap", "those"]],
  ["grammar_pattern", "grammar", "___ is my book. Correct: This", "Пропуск: This is my book.", ["demonstratives", "fill_the_gap", "this"]],
  ["grammar_pattern", "grammar", "___ is her bag. Correct: That", "Пропуск: That is her bag.", ["demonstratives", "fill_the_gap", "that"]],
  ["grammar_pattern", "grammar", "These ___ my books. Correct: are", "Пропуск: These are my books.", ["demonstratives", "fill_the_gap", "are"]],
  ["grammar_pattern", "grammar", "Those ___ her toys. Correct: are", "Пропуск: Those are her toys.", ["demonstratives", "fill_the_gap", "are"]],
  ["grammar_pattern", "grammar", "This ___ my pencil. Correct: is", "Пропуск: This is my pencil.", ["demonstratives", "fill_the_gap", "is"]],
  ["grammar_pattern", "grammar", "That ___ my ruler. Correct: is", "Пропуск: That is my ruler.", ["demonstratives", "fill_the_gap", "is"]]
];

const dialogueCards = [
  ["dialogue", "simple questions", "What are these?", "These are my books.", ["demonstratives", "mini_dialogue", "these"]],
  ["dialogue", "simple questions", "What are those?", "Those are her pencils.", ["demonstratives", "mini_dialogue", "those"]],
  ["dialogue", "simple questions", "Are these your books?", "Yes, they are.", ["demonstratives", "mini_dialogue", "these"]],
  ["dialogue", "simple questions", "Are those your toys?", "No, they aren't.", ["demonstratives", "mini_dialogue", "those"]]
];

export const demonstrativeCards = [
  ...grammarPatternCards,
  ...sentenceCards,
  ...questionFormCards,
  ...shortAnswerCards,
  ...gapCards,
  ...dialogueCards
].map(([type, topic, english, russian, tags]) => ({
  type,
  topic,
  english,
  russian,
  difficulty: 2,
  tags
}));

export const demonstrativeTexts = [
  {
    title_en: "My school things",
    title_ru: "Мои школьные вещи",
    topic: "classroom objects",
    difficulty: 1,
    questions: 3
  },
  {
    title_en: "In the classroom",
    title_ru: "В классе",
    topic: "school",
    difficulty: 1,
    questions: 3
  }
];
