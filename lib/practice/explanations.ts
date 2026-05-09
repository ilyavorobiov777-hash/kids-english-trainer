import type { PracticeExercise } from "@/lib/practice/exercises";

function normalize(value: string) {
  return value.toLowerCase().replace(/[?.!,]/g, "").replace(/\s+/g, " ").trim();
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
    if (prompt.startsWith("have you got")) return "В вопросе Have you got...? короткий ответ строится с have.";
    if (prompt.startsWith("can you")) return "В вопросе Can you...? короткий ответ строится с can.";
    if (prompt.startsWith("do you like")) return "В вопросе Do you like...? короткий ответ строится с do.";
    if (prompt.startsWith("would you like")) return "В ответе на Would you like...? обычно говорят Yes, please или No, thank you.";
    return "Короткий ответ повторяет главное вспомогательное слово из вопроса.";
  }

  if (exercise.type === "question_form") {
    const correct = normalize(exercise.correctAnswer);
    if (correct.startsWith("have you got")) return "Вопрос с have got начинается с Have you got...";
    if (correct.startsWith("can you")) return "Вопрос с can начинается с Can you...";
    if (correct.startsWith("do you like")) return "Вопрос с like начинается с Do you like...";
    if (correct.startsWith("would you like")) return "Вежливый вопрос начинается с Would you like...";
    return "В английском вопросе вспомогательное слово обычно ставится перед подлежащим.";
  }

  if (exercise.type === "build_sentence") {
    return "В английском обычно сначала идет подлежащее, потом действие, потом остальные слова.";
  }

  if (["choose_translation", "russian_to_english", "listen_and_choose"].includes(exercise.type)) {
    return "Запомни эту пару: английский вариант и перевод.";
  }

  if (exercise.type === "mini_dialogue") {
    return "В мини-диалоге важно выбрать естественный короткий ответ на реплику.";
  }

  return "Посмотри на правильный ответ и попробуй еще раз.";
}
