import type { PracticeExercise } from "@/lib/practice/exercises";

function normalize(value: string) {
  return value.toLowerCase().replace(/[?.!,']/g, "").replace(/\s+/g, " ").trim();
}

const answerTranslations: Record<string, string> = {
  "yes i have": "Да.",
  "no i havent": "Нет.",
  "yes i can": "Да.",
  "no i cant": "Нет.",
  "yes i do": "Да.",
  "no i dont": "Нет.",
  "yes please": "Да, пожалуйста.",
  "no thank you": "Нет, спасибо.",
  "yes i am": "Да.",
  "no i am not": "Нет.",
  "yes you are": "Да.",
  "no you arent": "Нет.",
  "yes he is": "Да.",
  "no he isnt": "Нет.",
  "yes she is": "Да.",
  "no she isnt": "Нет.",
  "yes it is": "Да.",
  "no it isnt": "Нет.",
  "yes we are": "Да.",
  "no we arent": "Нет.",
  "yes they are": "Да.",
  "no they arent": "Нет.",
  "this is my book": "Это моя книга.",
  "this is your pencil": "Это твой карандаш.",
  "this is his dog": "Это его собака.",
  "this is her bag": "Это ее сумка.",
  "this is our classroom": "Это наш класс.",
  "these are their toys": "Это их игрушки.",
  "they are happy": "Они счастливы.",
  "i am eight": "Мне восемь.",
  "he is my brother": "Он мой брат.",
  "she is my sister": "Она моя сестра.",
  "we are pupils": "Мы ученики.",
  "it is a cat": "Это кошка.",
  "my": "мой / моя / мое / мои",
  "your": "твой / ваш",
  "his": "его",
  "her": "ее",
  "our": "наш",
  "their": "их",
  "i": "я",
  "you": "ты / вы",
  "he": "он",
  "she": "она",
  "it": "оно / это",
  "we": "мы",
  "they": "они",
  "a": "неопределенный артикль для одного предмета",
  "an": "неопределенный артикль перед гласным звуком",
  "the": "определенный артикль",
  "no article": "артикль не нужен",
  "am": "am после I",
  "is": "is после he / she / it",
  "are": "are после you / we / they или these / those",
  "on": "on: в день недели",
  "in": "in: утром, днем или вечером",
  "at": "at: ночью или в точное время",
  "last": "last: прошлый",
  "next": "next: следующий",
  "have you got a dog": "У тебя есть собака?",
  "have you got a pencil": "У тебя есть карандаш?",
  "have you got a book": "У тебя есть книга?",
  "do you like apples": "Тебе нравятся яблоки?",
  "do you like bananas": "Тебе нравятся бананы?",
  "would you like some juice": "Ты хочешь сока?",
  "would you like some tea": "Ты хочешь чаю?",
  "can you swim": "Ты умеешь плавать?",
  "can you jump": "Ты умеешь прыгать?",
  "what is this": "Что это?",
  "what is that": "Что это там?",
  "what are these": "Что это?",
  "what are those": "Что это там?",
  "are these your books": "Это твои книги?",
  "are those your pencils": "Вон те твои карандаши?",
  "are those their books": "Вон те их книги?",
  "whose book is this": "Чья это книга?",
  "whose pencils are these": "Чьи это карандаши?",
  "what are you doing": "Что ты делаешь?",
  "are you running": "Ты бежишь?",
  "are you reading": "Ты читаешь?",
  "is she sleeping": "Она спит?",
  "is he playing": "Он играет?",
  "are they jumping": "Они прыгают?",
  "what do you do on sunday": "Что ты делаешь в воскресенье?",
  "what time do you get up": "Во сколько ты встаешь?",
  "these are my pencils": "Это мои карандаши.",
  "those are my books": "Вон те мои книги.",
  "anna has a bag this is her bag": "У Анны есть сумка. Это ее сумка.",
  "tom has a dog this is his dog": "У Тома есть собака. Это его собака.",
  "they have toys these are their toys": "У них есть игрушки. Это их игрушки.",
  "i have a book this is my book": "У меня есть книга. Это моя книга.",
  "you have a pencil this is your pencil": "У тебя есть карандаш. Это твой карандаш.",
  "we have a classroom this is our classroom": "У нас есть класс. Это наш класс."
};

function looksRussian(value: string) {
  return /[А-Яа-яЁё]/.test(value);
}

export function correctAnswerTranslation(
  exercise: Pick<PracticeExercise, "correctAnswer"> & Partial<Pick<PracticeExercise, "type" | "prompt" | "context" | "correctAnswerRu" | "translationRu" | "card">>
) {
  if (exercise.correctAnswerRu?.trim()) return exercise.correctAnswerRu;
  if (exercise.translationRu?.trim()) return exercise.translationRu;
  if (looksRussian(exercise.correctAnswer)) return exercise.correctAnswer;
  if (exercise.card && normalize(exercise.correctAnswer) === normalize(exercise.card.english)) return exercise.card.russian;
  if (exercise.card?.example_en && normalize(exercise.correctAnswer) === normalize(exercise.card.example_en)) {
    return exercise.card.example_ru || exercise.card.russian;
  }

  if (exercise.type === "fill_the_gap" && exercise.prompt?.includes("___")) {
    const completed = exercise.prompt.replace("___", exercise.correctAnswer);
    const full = exercise.context ? `${exercise.context} ${completed}` : completed;
    const fullKnown = answerTranslations[normalize(full)];
    if (fullKnown) return fullKnown;
    const completedKnown = answerTranslations[normalize(completed)];
    if (completedKnown) return completedKnown;
  }

  const known = answerTranslations[normalize(exercise.correctAnswer)];
  if (known) return known;

  return "Перевод пока не добавлен.";
}

export function explainAnswer(exercise: Pick<PracticeExercise, "type" | "prompt" | "correctAnswer" | "explanationRu">) {
  if (exercise.explanationRu) return exercise.explanationRu;

  if (exercise.type === "articles") {
    const answer = normalize(exercise.correctAnswer);
    if (answer === "an") return "an используется перед словами, которые начинаются с гласного звука.";
    if (answer === "a") return "a используется, когда предмет один и мы говорим о нем впервые.";
    if (answer === "the") return "the используется, когда мы уже знаем, о каком предмете говорим.";
    return "Здесь артикль не нужен.";
  }

  if (exercise.type === "short_answer") {
    const prompt = normalize(exercise.prompt);
    if (prompt.startsWith("are these") || prompt.startsWith("are those")) {
      return "В вопросах Are these...? и Are those...? короткий ответ строится с they are: Yes, they are / No, they aren't.";
    }
    if (prompt.startsWith("is this") && (prompt.includes("your") || prompt.includes("his") || prompt.includes("her"))) {
      return "В вопросе про один предмет отвечаем Yes, it is / No, it isn't. My/your/his/her показывают, чей предмет.";
    }
    if (prompt.startsWith("are you")) return "В вопросе Are you ...? короткий ответ строится с am: Yes, I am / No, I am not.";
    if (prompt.startsWith("is she")) return "В вопросе Is she ...? короткий ответ строится с is: Yes, she is / No, she isn't.";
    if (prompt.startsWith("is he")) return "В вопросе Is he ...? короткий ответ строится с is: Yes, he is / No, he isn't.";
    if (prompt.startsWith("are they")) return "В вопросе Are they ...? короткий ответ строится с are: Yes, they are / No, they aren't.";
    if (prompt.startsWith("have you got")) return "В вопросе Have you got...? короткий ответ строится с have.";
    if (prompt.startsWith("can you")) return "В вопросе Can you...? короткий ответ строится с can.";
    if (prompt.startsWith("do you like")) return "В вопросе Do you like...? короткий ответ строится с do.";
    if (prompt.startsWith("would you like")) return "В ответе на Would you like...? обычно говорят Yes, please или No, thank you.";
    return "Короткий ответ повторяет главное вспомогательное слово из вопроса.";
  }

  if (exercise.type === "question_form") {
    const correct = normalize(exercise.correctAnswer);
    if (correct.startsWith("whose")) {
      if (correct.includes("pencils") || correct.includes("books") || correct.includes("toys")) {
        return "Whose значит 'чей/чья/чьи'. Если предметов несколько, нужен are: Whose pencils are these?";
      }
      return "Whose значит 'чей/чья/чьи'. В вопросе Whose book is this? мы спрашиваем, кому принадлежит предмет.";
    }
    if (correct.startsWith("who")) return "Who значит 'кто'. Его используем, когда спрашиваем о человеке: Who is this?";
    if (correct.startsWith("where")) return "Where значит 'где/куда'. Его используем, когда спрашиваем о месте.";
    if (correct.startsWith("when")) return "When значит 'когда'. Его используем, когда спрашиваем о времени или дне.";
    if (correct.startsWith("how many")) return "How many значит 'сколько'. После него обычно идут предметы во множественном числе.";
    if (correct.startsWith("what are these")) return "These - это несколько предметов рядом, поэтому вопрос: What are these?";
    if (correct.startsWith("what are those")) return "Those - это несколько предметов далеко, поэтому вопрос: What are those?";
    if (correct.startsWith("are these") || correct.startsWith("are those")) return "С these/those используем are, не is.";
    if (correct.startsWith("are you") || correct.startsWith("is she") || correct.startsWith("is he") || correct.startsWith("are they")) {
      return "В Present Continuous am/is/are ставится перед человеком: Are you running? Is she sleeping?";
    }
    if (correct.startsWith("what time") || correct.includes(" on sunday")) {
      return "В вопросах про время ищи day/time слова: on Sunday, in the morning, at seven o'clock.";
    }
    if (correct.startsWith("is he") || correct.startsWith("is she") || correct.startsWith("are they")) {
      return "С he/she используем is, с they используем are. В вопросе is/are ставим в начало.";
    }
    if (correct.startsWith("is this your") || correct.startsWith("whose")) {
      return "Possessive words показывают, чей предмет: my book, your pencil, his dog, her bag, their toys.";
    }
    if (correct.startsWith("have you got")) return "Вопрос с have got начинается с Have you got...";
    if (correct.startsWith("can you")) return "Вопрос с can начинается с Can you...";
    if (correct.startsWith("do you like")) return "Вопрос с like начинается с Do you like...";
    if (correct.startsWith("would you like")) return "Вежливый вопрос начинается с Would you like...";
    return "В английском вопросе вспомогательное слово обычно ставится перед подлежащим.";
  }

  if (exercise.type === "build_sentence") {
    if (normalize(exercise.correctAnswer).includes("these are") || normalize(exercise.correctAnswer).includes("those are")) {
      return "These/those используются для нескольких предметов, поэтому после них ставим are.";
    }
    return "В английском обычно сначала идет подлежащее, потом действие, потом остальные слова.";
  }

  if (exercise.type === "fill_the_gap") {
    const prompt = normalize(exercise.prompt);
    const answer = normalize(exercise.correctAnswer);
    if (["these", "those", "this", "that"].includes(answer)) {
      return "This/that - один предмет, these/those - несколько. This/these рядом, that/those далеко.";
    }
    if ((prompt.includes("these") || prompt.includes("those")) && answer === "are") {
      return "С these и those всегда используем are: These are..., Those are...";
    }
    if ((prompt.includes("this") || prompt.includes("that")) && answer === "is") {
      return "С this и that используем is: This is..., That is...";
    }
    if ((prompt.includes("running") || prompt.includes("sleeping") || prompt.includes("playing") || prompt.includes("jumping") || prompt.includes("doing")) && ["am", "is", "are"].includes(answer)) {
      return "В -ing форме не забываем am/is/are: I am, she/he/it is, you/we/they are.";
    }
    if (answer === "on") return "С днями недели используем on: on Monday, on Sunday.";
    if (answer === "in") return "С частями дня используем in: in the morning, in the afternoon, in the evening.";
    if (answer === "at") return "At используем для at night и времени на часах: at seven o'clock.";
    if (answer === "last" || answer === "next") return "С last/next предлог не нужен: last weekend, next week.";
    if (["i", "he", "she", "we", "they"].includes(answer)) {
      return "I - я, he - он, she - она, we - мы, they - они. После I говорим am, после he/she - is, после we/they - are.";
    }
    if (["my", "your", "his", "her", "our", "their"].includes(answer)) {
      return "После my/your/his/her/our/their нужен предмет: my book, her bag. Не говорим I book.";
    }
  }

  if (["choose_translation", "russian_to_english", "listen_and_choose"].includes(exercise.type)) {
    return "Запомни эту пару: английский вариант и перевод.";
  }

  if (exercise.type === "mini_dialogue") {
    return "В мини-диалоге важно выбрать естественный короткий ответ на реплику.";
  }

  return "Посмотри на правильный ответ и попробуй еще раз.";
}
