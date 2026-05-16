export const pronounPatterns = [
  {
    title: "Personal pronouns",
    title_ru: "Личные местоимения: I, you, he, she, it, we, they",
    pattern_key: "personal_pronouns"
  },
  {
    title: "Possessive words: my, your, his, her, our, their",
    title_ru: "Притяжательные слова: my, your, his, her, our, their",
    pattern_key: "possessive_adjectives"
  }
];

export const pronounCards = [
  ...["I", "you", "he", "she", "it", "we", "they"].map((english) => ({
    type: "word",
    topic: "pronouns",
    english
  })),
  ...["my", "your", "his", "her", "its", "our", "their"].map((english) => ({
    type: "word",
    topic: "pronouns",
    english
  })),
  ...[
    "my book",
    "your pencil",
    "his dog",
    "her bag",
    "our classroom",
    "their toys",
    "my sister",
    "his brother",
    "her dress",
    "their books",
    "our school",
    "your friend"
  ].map((english) => ({ type: "phrase", topic: "pronouns", english })),
  ...[
    "I am eight.",
    "You are my friend.",
    "He is my brother.",
    "She is my sister.",
    "It is a cat.",
    "We are pupils.",
    "They are happy.",
    "This is my book.",
    "This is your pencil.",
    "This is his dog.",
    "This is her bag.",
    "This is our classroom.",
    "These are their toys.",
    "My cat is black.",
    "Her dress is red.",
    "His shoes are blue.",
    "Their books are on the table.",
    "Our school is big."
  ].map((english) => ({ type: "sentence", topic: "pronouns", english })),
  ...[
    "Are you happy?",
    "Is he your brother?",
    "Is she your sister?",
    "Is it a dog?",
    "Are they pupils?",
    "Is this your book?",
    "Is this his pencil?",
    "Is this her bag?",
    "Are these your toys?",
    "Are those their books?",
    "Whose book is this?",
    "Whose pencils are these?"
  ].map((english) => ({ type: "phrase", topic: "simple questions", english })),
  ...[
    "Yes, I am.",
    "No, I am not.",
    "Yes, he is.",
    "No, he isn't.",
    "Yes, she is.",
    "No, she isn't.",
    "Yes, it is.",
    "No, it isn't.",
    "Yes, they are.",
    "No, they aren't."
  ].map((english) => ({ type: "grammar_pattern", topic: "simple questions", english })),
  ...[
    "___ am eight. Correct: I",
    "___ is my brother. Correct: He",
    "___ is my sister. Correct: She",
    "___ are pupils. Correct: We",
    "___ are happy. Correct: They",
    "This is ___ book. Correct: my",
    "This is ___ pencil. Correct: your",
    "This is ___ dog. Correct: his",
    "This is ___ bag. Correct: her",
    "These are ___ toys. Correct: their",
    "This is ___ classroom. Correct: our"
  ].map((english) => ({ type: "grammar_pattern", topic: "pronouns", english })),
  ...[
    "I / am / eight",
    "He / is / my / brother",
    "She / is / my / sister",
    "This / is / my / book",
    "These / are / their / toys",
    "Is / this / your / pencil",
    "Are / these / your / books",
    "Whose / book / is / this"
  ].map((english) => ({ type: "grammar_pattern", topic: "pronouns", english }))
];

export const pronounTexts = [
  {
    title_en: "My family",
    title_ru: "Моя семья",
    topic: "family",
    difficulty: 1,
    questions: 3,
    grammar_focus: ["personal_pronouns", "possessive_adjectives", "to be"]
  },
  {
    title_en: "Our classroom",
    title_ru: "Наш класс",
    topic: "classroom objects",
    difficulty: 1,
    questions: 3,
    grammar_focus: ["possessive_adjectives", "demonstratives_this_that_these_those"]
  }
];
