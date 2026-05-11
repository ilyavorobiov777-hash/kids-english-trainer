export const ingTimePatterns = [
  {
    title: "-ing / Present Continuous",
    title_ru: "-ing: что кто-то делает сейчас",
    pattern_key: "present_continuous_ing"
  },
  {
    title: "Days and time expressions",
    title_ru: "Дни недели и время: on, in, at, last, next",
    pattern_key: "days_time_expressions"
  }
];

const ingLexicalUnits = [
  ["word", "actions", "running", "бег / бежит", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "jumping", "прыжки / прыгает", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "sleeping", "спит", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "eating", "ест", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "drinking", "пьет", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "reading", "читает", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "writing", "пишет", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "drawing", "рисует", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "singing", "поет", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "dancing", "танцует", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "playing", "играет", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "swimming", "плавает", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "walking", "идет пешком", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "going", "идет", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "sitting", "сидит", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "standing", "стоит", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "listening", "слушает", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "looking", "смотрит", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "opening", "открывает", ["present_continuous_ing", "ing", "actions"]],
  ["word", "actions", "closing", "закрывает", ["present_continuous_ing", "ing", "actions"]]
];

const ingSentences = [
  ["sentence", "actions", "I am running.", "Я бегу.", ["present_continuous_ing", "I am"]],
  ["sentence", "school", "I am reading a book.", "Я читаю книгу.", ["present_continuous_ing", "I am"]],
  ["sentence", "actions", "She is sleeping.", "Она спит.", ["present_continuous_ing", "she is"]],
  ["sentence", "hobbies", "He is playing football.", "Он играет в футбол.", ["present_continuous_ing", "he is"]],
  ["sentence", "actions", "They are jumping.", "Они прыгают.", ["present_continuous_ing", "they are"]],
  ["sentence", "school routine", "We are going to school.", "Мы идем в школу.", ["present_continuous_ing", "we are"]],
  ["sentence", "animals", "The cat is sleeping.", "Кошка спит.", ["present_continuous_ing", "is"]],
  ["sentence", "animals", "The dog is running.", "Собака бежит.", ["present_continuous_ing", "is"]],
  ["sentence", "hobbies", "You are drawing a picture.", "Ты рисуешь картинку.", ["present_continuous_ing", "you are"]],
  ["sentence", "hobbies", "The children are playing.", "Дети играют.", ["present_continuous_ing", "are"]]
];

const ingQuestions = [
  ["phrase", "simple questions", "What are you doing?", "Что ты делаешь?", ["present_continuous_ing", "question_form"]],
  ["phrase", "simple questions", "Are you running?", "Ты бежишь?", ["present_continuous_ing", "question_form", "short_answer"]],
  ["phrase", "simple questions", "Are you reading?", "Ты читаешь?", ["present_continuous_ing", "question_form", "short_answer"]],
  ["phrase", "simple questions", "Is she sleeping?", "Она спит?", ["present_continuous_ing", "question_form", "short_answer"]],
  ["phrase", "simple questions", "Is he playing?", "Он играет?", ["present_continuous_ing", "question_form", "short_answer"]],
  ["phrase", "simple questions", "Are they jumping?", "Они прыгают?", ["present_continuous_ing", "question_form", "short_answer"]],
  ["phrase", "simple questions", "Are they playing football?", "Они играют в футбол?", ["present_continuous_ing", "question_form", "short_answer"]],
  ["phrase", "simple questions", "Is the cat sleeping?", "Кошка спит?", ["present_continuous_ing", "question_form", "short_answer"]],
  ["phrase", "simple questions", "Is the dog running?", "Собака бежит?", ["present_continuous_ing", "question_form", "short_answer"]]
];

const ingShortAnswers = [
  ["grammar_pattern", "simple questions", "Are you running? Yes, I am.", "Ты бежишь? Да.", ["present_continuous_ing", "short_answer"]],
  ["grammar_pattern", "simple questions", "Are you running? No, I am not.", "Ты бежишь? Нет.", ["present_continuous_ing", "short_answer"]],
  ["grammar_pattern", "simple questions", "Is she sleeping? Yes, she is.", "Она спит? Да.", ["present_continuous_ing", "short_answer"]],
  ["grammar_pattern", "simple questions", "Is she sleeping? No, she isn't.", "Она спит? Нет.", ["present_continuous_ing", "short_answer"]],
  ["grammar_pattern", "simple questions", "Is he playing? Yes, he is.", "Он играет? Да.", ["present_continuous_ing", "short_answer"]],
  ["grammar_pattern", "simple questions", "Is he playing? No, he isn't.", "Он играет? Нет.", ["present_continuous_ing", "short_answer"]],
  ["grammar_pattern", "simple questions", "Are they jumping? Yes, they are.", "Они прыгают? Да.", ["present_continuous_ing", "short_answer"]],
  ["grammar_pattern", "simple questions", "Are they jumping? No, they aren't.", "Они прыгают? Нет.", ["present_continuous_ing", "short_answer"]]
];

const timeWords = [
  ["word", "days of the week", "Monday", "понедельник", ["days_time_expressions", "days"]],
  ["word", "days of the week", "Tuesday", "вторник", ["days_time_expressions", "days"]],
  ["word", "days of the week", "Wednesday", "среда", ["days_time_expressions", "days"]],
  ["word", "days of the week", "Thursday", "четверг", ["days_time_expressions", "days"]],
  ["word", "days of the week", "Friday", "пятница", ["days_time_expressions", "days"]],
  ["word", "days of the week", "Saturday", "суббота", ["days_time_expressions", "days"]],
  ["word", "days of the week", "Sunday", "воскресенье", ["days_time_expressions", "days"]],
  ["word", "days of the week", "weekend", "выходные", ["days_time_expressions", "time"]],
  ["word", "days of the week", "today", "сегодня", ["days_time_expressions", "time"]],
  ["word", "days of the week", "tomorrow", "завтра", ["days_time_expressions", "time"]],
  ["word", "days of the week", "yesterday", "вчера", ["days_time_expressions", "time"]],
  ["word", "time and daily routine", "morning", "утро", ["days_time_expressions", "time"]],
  ["word", "time and daily routine", "afternoon", "день / после обеда", ["days_time_expressions", "time"]],
  ["word", "time and daily routine", "evening", "вечер", ["days_time_expressions", "time"]],
  ["word", "time and daily routine", "night", "ночь", ["days_time_expressions", "time"]],
  ["word", "days of the week", "week", "неделя", ["days_time_expressions", "time"]],
  ["phrase", "days of the week", "next week", "следующая неделя", ["days_time_expressions", "next"]],
  ["phrase", "days of the week", "last weekend", "прошлые выходные", ["days_time_expressions", "last"]],
  ["phrase", "time and daily routine", "this morning", "этим утром", ["days_time_expressions", "this"]],
  ["phrase", "time and daily routine", "this evening", "этим вечером", ["days_time_expressions", "this"]]
];

const timePhrases = [
  ["phrase", "days of the week", "on Monday", "в понедельник", ["days_time_expressions", "on"]],
  ["phrase", "days of the week", "on Tuesday", "во вторник", ["days_time_expressions", "on"]],
  ["phrase", "days of the week", "on Sunday", "в воскресенье", ["days_time_expressions", "on"]],
  ["phrase", "days of the week", "at the weekend", "на выходных", ["days_time_expressions", "at"]],
  ["phrase", "time and daily routine", "in the morning", "утром", ["days_time_expressions", "in"]],
  ["phrase", "time and daily routine", "in the afternoon", "днем / после обеда", ["days_time_expressions", "in"]],
  ["phrase", "time and daily routine", "in the evening", "вечером", ["days_time_expressions", "in"]],
  ["phrase", "time and daily routine", "at night", "ночью", ["days_time_expressions", "at"]],
  ["phrase", "time and daily routine", "at seven o'clock", "в семь часов", ["days_time_expressions", "at"]],
  ["phrase", "days of the week", "last weekend", "на прошлых выходных", ["days_time_expressions", "last"]],
  ["phrase", "days of the week", "next weekend", "на следующих выходных", ["days_time_expressions", "next"]],
  ["phrase", "days of the week", "next week", "на следующей неделе", ["days_time_expressions", "next"]],
  ["phrase", "time and daily routine", "this morning", "этим утром", ["days_time_expressions", "this"]],
  ["phrase", "time and daily routine", "this evening", "этим вечером", ["days_time_expressions", "this"]]
];

const timeSentences = [
  ["sentence", "school routine", "I go to school on Monday.", "Я хожу в школу в понедельник.", ["days_time_expressions", "on"]],
  ["sentence", "hobbies", "I play football on Sunday.", "Я играю в футбол в воскресенье.", ["days_time_expressions", "on"]],
  ["sentence", "time and daily routine", "I read in the evening.", "Я читаю вечером.", ["days_time_expressions", "in"]],
  ["sentence", "time and daily routine", "I sleep at night.", "Я сплю ночью.", ["days_time_expressions", "at"]],
  ["sentence", "time and daily routine", "I have breakfast in the morning.", "Я завтракаю утром.", ["days_time_expressions", "in"]],
  ["sentence", "school routine", "I do my homework in the afternoon.", "Я делаю домашку днем.", ["days_time_expressions", "in"]],
  ["sentence", "time and daily routine", "I get up at seven o'clock.", "Я встаю в семь часов.", ["days_time_expressions", "at"]],
  ["sentence", "family", "I visited my grandma last weekend.", "Я навещал бабушку на прошлых выходных.", ["days_time_expressions", "last"]],
  ["sentence", "hobbies", "I will play next weekend.", "Я буду играть на следующих выходных.", ["days_time_expressions", "next"]],
  ["sentence", "school", "I have English on Wednesday.", "У меня английский в среду.", ["days_time_expressions", "on"]],
  ["sentence", "actions", "I am running in the morning.", "Я бегаю утром.", ["days_time_expressions", "present_continuous_ing", "in"]],
  ["sentence", "school routine", "We are going to school on Monday.", "Мы идем в школу в понедельник.", ["days_time_expressions", "present_continuous_ing", "on"]]
];

const timeQuestions = [
  ["phrase", "simple questions", "What day is it today?", "Какой сегодня день?", ["days_time_expressions", "question_form"]],
  ["phrase", "simple questions", "What do you do on Sunday?", "Что ты делаешь в воскресенье?", ["days_time_expressions", "question_form"]],
  ["phrase", "simple questions", "What do you do in the morning?", "Что ты делаешь утром?", ["days_time_expressions", "question_form"]],
  ["phrase", "simple questions", "What do you do in the evening?", "Что ты делаешь вечером?", ["days_time_expressions", "question_form"]],
  ["phrase", "simple questions", "What time do you get up?", "Во сколько ты встаешь?", ["days_time_expressions", "question_form"]],
  ["phrase", "simple questions", "What did you do last weekend?", "Что ты делал на прошлых выходных?", ["days_time_expressions", "question_form"]],
  ["phrase", "simple questions", "What will you do next weekend?", "Что ты будешь делать на следующих выходных?", ["days_time_expressions", "question_form"]]
];

const timeGaps = [
  ["grammar_pattern", "grammar", "I go to school ___ Monday. Correct: on", "Пропуск: on Monday.", ["days_time_expressions", "fill_the_gap", "on"]],
  ["grammar_pattern", "grammar", "I read ___ the evening. Correct: in", "Пропуск: in the evening.", ["days_time_expressions", "fill_the_gap", "in"]],
  ["grammar_pattern", "grammar", "I sleep ___ night. Correct: at", "Пропуск: at night.", ["days_time_expressions", "fill_the_gap", "at"]],
  ["grammar_pattern", "grammar", "I get up ___ seven o'clock. Correct: at", "Пропуск: at seven o'clock.", ["days_time_expressions", "fill_the_gap", "at"]],
  ["grammar_pattern", "grammar", "I played football ___ weekend. Correct: last", "Пропуск: last weekend.", ["days_time_expressions", "fill_the_gap", "last"]],
  ["grammar_pattern", "grammar", "I will play ___ weekend. Correct: next", "Пропуск: next weekend.", ["days_time_expressions", "fill_the_gap", "next"]],
  ["grammar_pattern", "grammar", "I have breakfast ___ the morning. Correct: in", "Пропуск: in the morning.", ["days_time_expressions", "fill_the_gap", "in"]],
  ["grammar_pattern", "grammar", "I do homework ___ the afternoon. Correct: in", "Пропуск: in the afternoon.", ["days_time_expressions", "fill_the_gap", "in"]],
  ["grammar_pattern", "grammar", "I have English ___ Wednesday. Correct: on", "Пропуск: on Wednesday.", ["days_time_expressions", "fill_the_gap", "on"]]
];

export const ingTimeCards = [
  ...ingLexicalUnits,
  ...ingSentences,
  ...ingQuestions,
  ...ingShortAnswers,
  ...timeWords,
  ...timePhrases,
  ...timeSentences,
  ...timeQuestions,
  ...timeGaps
].map(([type, topic, english, russian, tags]) => ({
  type,
  topic,
  english,
  russian,
  difficulty: 2,
  tags
}));

export const ingTimeTexts = [
  {
    title_en: "My morning",
    title_ru: "Мое утро",
    topic: "time and daily routine",
    difficulty: 2,
    questions: 3,
    grammar_focus: ["present_continuous_ing", "in the morning", "on Monday", "at eight o'clock"]
  },
  {
    title_en: "In the park",
    title_ru: "В парке",
    topic: "places",
    difficulty: 2,
    questions: 3,
    grammar_focus: ["present_continuous_ing", "on Sunday"]
  },
  {
    title_en: "Last weekend",
    title_ru: "Прошлые выходные",
    topic: "days of the week",
    difficulty: 2,
    questions: 3,
    grammar_focus: ["last weekend", "in the evening", "next weekend", "would like"]
  }
];
