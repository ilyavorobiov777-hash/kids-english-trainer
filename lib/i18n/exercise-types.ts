// Human-readable Russian labels for exercise types.
// Used in parent dashboard and stats so the child/parent doesn't see raw technical names.

export const EXERCISE_TYPE_LABELS_RU: Record<string, string> = {
  choose_translation: "Выбери перевод",
  russian_to_english: "Англ. перевод",
  listen_and_choose: "Послушай и выбери",
  build_sentence: "Собери предложение",
  fill_the_gap: "Заполни пропуск",
  question_form: "Сделай вопрос",
  short_answer: "Короткий ответ",
  articles: "Артикли (a/an/the)",
  mini_dialogue: "Мини-диалог",
  quick_recall: "Быстрое припоминание",
  vocabulary_review_from_text: "Слова из текста",
  choose_answer: "Выбери ответ"
};

export function exerciseTypeLabel(type: string): string {
  return EXERCISE_TYPE_LABELS_RU[type] ?? type;
}
