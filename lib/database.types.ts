export type CardType =
  | "word"
  | "phrase"
  | "sentence"
  | "grammar_pattern"
  | "dialogue"
  | "mini_story";

export type CardStatus = "draft" | "active" | "archived";

export type ExerciseType =
  | "choose_translation"
  | "russian_to_english"
  | "listen_and_choose"
  | "build_sentence"
  | "fill_the_gap"
  | "question_form"
  | "short_answer"
  | "articles"
  | "mini_dialogue"
  | "choose_answer"
  | "true_false"
  | "match_word_translation"
  | "build_sentence_from_text"
  | "vocabulary_review_from_text";

export type Card = {
  id: string;
  family_id: string;
  course_id: string | null;
  source_id: string | null;
  unit_id: string | null;
  lesson_id: string | null;
  deck_id: string | null;
  topic_id: string | null;
  english: string;
  russian: string;
  type: CardType;
  difficulty: number;
  tags: string[];
  example_en: string | null;
  example_ru: string | null;
  audio_url: string | null;
  image_url: string | null;
  status: CardStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Child = {
  id: string;
  family_id: string;
  name: string;
  avatar_color: string;
  birth_year: number | null;
  status?: "active" | "archived";
  archived_at?: string | null;
  archived_by?: string | null;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Source = {
  id: string;
  family_id: string;
  course_id: string | null;
  title: string;
  kind: string;
  created_at: string;
  updated_at: string;
};

export type Topic = {
  id: string;
  family_id: string;
  course_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
};

export type Unit = {
  id: string;
  family_id: string;
  course_id: string | null;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  family_id: string;
  course_id: string | null;
  unit_id: string | null;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type GrammarPattern = {
  id: string;
  family_id: string;
  course_id: string | null;
  title: string;
  title_ru: string | null;
  pattern: string;
  pattern_key: string | null;
  explanation_ru: string | null;
  example_en: string | null;
  example_ru: string | null;
  affirmative_examples: string[];
  negative_examples: string[];
  question_examples: string[];
  short_positive_answers: string[];
  short_negative_answers: string[];
  common_mistakes: string[];
  exercise_templates: unknown[];
  created_at: string;
  updated_at: string;
};

export type PracticeAttempt = {
  id: string;
  family_id: string;
  child_id: string;
  session_id: string | null;
  card_id: string | null;
  grammar_pattern_id: string | null;
  text_id: string | null;
  exercise_type: ExerciseType;
  question: string | null;
  exercise_payload: Record<string, unknown>;
  answer: string;
  correct_answer: string;
  is_correct: boolean;
  response_time_ms: number;
  rating: number | null;
  created_at: string;
};

export type PracticeSession = {
  id: string;
  family_id: string;
  child_id: string;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number;
  total_attempts: number;
  correct_attempts: number;
  incorrect_attempts: number;
  accuracy: number;
  stars_earned: number;
};

export type ReviewSchedule = {
  id: string;
  family_id: string;
  child_id: string;
  card_id: string;
  due_at: string;
  ease: number;
  interval_days: number;
  repetitions: number;
  lapses: number;
  stability: number;
  difficulty: number;
  review_count: number;
  lapse_count: number;
  created_at: string;
  updated_at: string;
};

export type LearningTextVocabularyWord = {
  english: string;
  russian: string;
};

export type LearningTextQuestion = {
  id?: string;
  type: "choose_answer" | "true_false" | "match_word_translation" | "build_sentence_from_text" | "vocabulary_review_from_text";
  question: string;
  prompt?: string;
  correctAnswer: string;
  options: string[];
  explanationRu?: string;
};

export type LearningText = {
  id: string;
  family_id: string;
  course_id: string | null;
  source_id: string | null;
  topic_id: string | null;
  title_en: string;
  title_ru: string;
  text_en: string;
  text_ru: string;
  level: string;
  difficulty: number;
  tags: string[];
  vocabulary_words: LearningTextVocabularyWord[];
  grammar_focus: string[];
  comprehension_questions: LearningTextQuestion[];
  status: "draft" | "active" | "archived";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
