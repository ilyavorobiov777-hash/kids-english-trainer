import { writeFileSync } from "node:fs";
import { allCards, exerciseTypesSupported, grammarPatterns } from "./learning-content-data.mjs";
import { starterTexts } from "./starter-texts-data.mjs";
import { demonstrativeCards, demonstrativesPattern, demonstrativeTexts } from "./demonstratives-content-data.mjs";
import { ingTimeCards, ingTimePatterns, ingTimeTexts } from "./ing-time-content-data.mjs";
import { pronounCards, pronounPatterns, pronounTexts } from "./pronouns-content-data.mjs";

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlTextArray(values) {
  return `array[${values.map(sqlString).join(", ")}]::text[]`;
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] ?? "unknown";
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

const cardsValues = allCards.map((card, index) => `    (${index + 1}, ${sqlString(card.type)}, ${sqlString(card.topic)}, ${sqlString(card.english)}, ${sqlString(card.russian)}, ${card.difficulty ?? 1}, ${sqlTextArray(card.tags ?? [card.topic])}, ${sqlString(card.example_en ?? null)}, ${sqlString(card.example_ru ?? null)})`).join(",\n");

const grammarValues = grammarPatterns.map((item, index) => `    (${index + 1}, ${sqlString(item.title)}, ${sqlString(item.title_ru)}, ${sqlString(item.pattern_key)}, ${sqlString(item.pattern)}, ${sqlString(item.explanation_ru)}, ${sqlString(item.affirmative_examples[0] ?? null)}, ${sqlString(item.explanation_ru)}, ${sqlJson(item.affirmative_examples)}, ${sqlJson(item.negative_examples)}, ${sqlJson(item.question_examples)}, ${sqlJson(item.short_positive_answers)}, ${sqlJson(item.short_negative_answers)}, ${sqlJson(item.common_mistakes)}, ${sqlJson(item.exercise_templates)})`).join(",\n");
const textValues = starterTexts.map((item, index) => `    (${index + 1}, ${sqlString(item.title_en)}, ${sqlString(item.title_ru)}, ${sqlString(item.text_en)}, ${sqlString(item.text_ru)}, ${sqlString(item.topic)}, ${sqlString(item.level)}, ${item.difficulty ?? 1}, ${sqlJson([item.topic, item.level])}, ${sqlJson(item.vocabulary_words)}, ${sqlJson(item.grammar_focus)}, ${sqlJson(item.comprehension_questions)})`).join(",\n");

const sql = `create or replace function public.seed_starter_learning_content()
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_family uuid := public.current_family_id();
  v_course uuid;
  v_source uuid;
  v_unit uuid;
  v_lesson uuid;
  v_deck uuid;
  v_inserted_cards int := 0;
  v_inserted_grammar int := 0;
  v_total_cards int := 0;
  v_total_grammar int := 0;
begin
  if v_family is null then
    raise exception 'Sign in as a parent before running select public.seed_starter_learning_content();';
  end if;

  insert into public.courses (family_id, title, description)
  select v_family, 'Starter 350 Pre-A1', 'Idempotent Pre-A1 / early A1 starter content pack'
  where not exists (
    select 1 from public.courses where family_id = v_family and title = 'Starter 350 Pre-A1'
  );
  select id into v_course from public.courses where family_id = v_family and title = 'Starter 350 Pre-A1' limit 1;

  insert into public.sources (family_id, course_id, title, kind)
  select v_family, v_course, 'Starter 350 generated seed', 'seed'
  where not exists (
    select 1 from public.sources where family_id = v_family and title = 'Starter 350 generated seed'
  );
  select id into v_source from public.sources where family_id = v_family and title = 'Starter 350 generated seed' limit 1;

  insert into public.units (family_id, course_id, title, position)
  select v_family, v_course, 'Starter content', 1
  where not exists (
    select 1 from public.units where family_id = v_family and course_id = v_course and title = 'Starter content'
  );
  select id into v_unit from public.units where family_id = v_family and course_id = v_course and title = 'Starter content' limit 1;

  insert into public.lessons (family_id, course_id, unit_id, title, position)
  select v_family, v_course, v_unit, 'Core vocabulary and patterns', 1
  where not exists (
    select 1 from public.lessons where family_id = v_family and course_id = v_course and title = 'Core vocabulary and patterns'
  );
  select id into v_lesson from public.lessons where family_id = v_family and course_id = v_course and title = 'Core vocabulary and patterns' limit 1;

  insert into public.decks (family_id, course_id, title)
  select v_family, v_course, 'Starter 350 deck'
  where not exists (
    select 1 from public.decks where family_id = v_family and course_id = v_course and title = 'Starter 350 deck'
  );
  select id into v_deck from public.decks where family_id = v_family and course_id = v_course and title = 'Starter 350 deck' limit 1;

  with seed_cards(position, type, topic, english, russian, difficulty, tags, example_en, example_ru) as (
  values
${cardsValues}
  )
  insert into public.topics (family_id, course_id, title)
  select distinct v_family, v_course, topic
  from seed_cards
  where not exists (
    select 1 from public.topics t where t.family_id = v_family and t.course_id = v_course and t.title = seed_cards.topic
  );

  with seed_cards(position, type, topic, english, russian, difficulty, tags, example_en, example_ru) as (
  values
${cardsValues}
  ),
  inserted as (
  insert into public.cards (
    family_id, course_id, source_id, unit_id, lesson_id, deck_id, topic_id,
    english, russian, type, difficulty, tags, example_en, example_ru, status
  )
  select
    v_family, v_course, v_source, v_unit, v_lesson, v_deck, t.id,
    c.english, c.russian, c.type::public.card_type, c.difficulty, c.tags, c.example_en, c.example_ru, 'active'::public.card_status
  from seed_cards c
  join public.topics t on t.family_id = v_family and t.course_id = v_course and t.title = c.topic
  where not exists (
    select 1
    from public.cards existing
    where existing.family_id = v_family
      and existing.course_id = v_course
      and existing.source_id = v_source
      and lower(existing.english) = lower(c.english)
      and existing.type = c.type::public.card_type
  )
  returning id
  )
  select count(*) into v_inserted_cards from inserted;

  with seed_grammar(position, title, title_ru, pattern_key, pattern, explanation_ru, example_en, example_ru, affirmative_examples, negative_examples, question_examples, short_positive_answers, short_negative_answers, common_mistakes, exercise_templates) as (
  values
${grammarValues}
  ),
  updated as (
    update public.grammar_patterns gp
    set
      title_ru = sg.title_ru,
      pattern_key = sg.pattern_key,
      pattern = sg.pattern,
      explanation_ru = sg.explanation_ru,
      example_en = sg.example_en,
      example_ru = sg.example_ru,
      affirmative_examples = sg.affirmative_examples,
      negative_examples = sg.negative_examples,
      question_examples = sg.question_examples,
      short_positive_answers = sg.short_positive_answers,
      short_negative_answers = sg.short_negative_answers,
      common_mistakes = sg.common_mistakes,
      exercise_templates = sg.exercise_templates
    from seed_grammar sg
    where gp.family_id = v_family and gp.course_id = v_course and lower(gp.title) = lower(sg.title)
    returning gp.id
  ),
  inserted as (
    insert into public.grammar_patterns (
      family_id, course_id, title, title_ru, pattern_key, pattern, explanation_ru, example_en, example_ru,
      affirmative_examples, negative_examples, question_examples, short_positive_answers, short_negative_answers, common_mistakes, exercise_templates
    )
    select
      v_family, v_course, title, title_ru, pattern_key, pattern, explanation_ru, example_en, example_ru,
      affirmative_examples, negative_examples, question_examples, short_positive_answers, short_negative_answers, common_mistakes, exercise_templates
    from seed_grammar sg
    where not exists (
      select 1 from public.grammar_patterns gp
      where gp.family_id = v_family and gp.course_id = v_course and lower(gp.title) = lower(sg.title)
    )
    returning id
  )
  select count(*) into v_inserted_grammar from inserted;

  select count(*) into v_total_cards from public.cards where family_id = v_family and course_id = v_course and source_id = v_source;
  select count(*) into v_total_grammar from public.grammar_patterns where family_id = v_family and course_id = v_course;

  return jsonb_build_object(
    'inserted_cards', v_inserted_cards,
    'inserted_grammar_patterns', v_inserted_grammar,
    'total_cards', v_total_cards,
    'total_grammar_patterns', v_total_grammar,
    'course_title', 'Starter 350 Pre-A1'
  );
end;
$$;
`;

writeFileSync("supabase/seed_350_learning_content.sql", sql, "utf8");

const textSql = `create or replace function public.seed_starter_texts()
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_family uuid := public.current_family_id();
  v_course uuid;
  v_source uuid;
  v_inserted_texts int := 0;
  v_total_texts int := 0;
begin
  if v_family is null then
    raise exception 'Sign in as a parent before running select public.seed_starter_texts();';
  end if;

  insert into public.courses (family_id, title, description)
  select v_family, 'Starter Texts Pre-A1', 'Idempotent Pre-A1 reading and listening text pack'
  where not exists (
    select 1 from public.courses where family_id = v_family and title = 'Starter Texts Pre-A1'
  );
  select id into v_course from public.courses where family_id = v_family and title = 'Starter Texts Pre-A1' limit 1;

  insert into public.sources (family_id, course_id, title, kind)
  select v_family, v_course, 'Starter texts generated seed', 'seed'
  where not exists (
    select 1 from public.sources where family_id = v_family and title = 'Starter texts generated seed'
  );
  select id into v_source from public.sources where family_id = v_family and title = 'Starter texts generated seed' limit 1;

  with seed_texts(position, title_en, title_ru, text_en, text_ru, topic, level, difficulty, tags, vocabulary_words, grammar_focus, comprehension_questions) as (
  values
${textValues}
  )
  insert into public.topics (family_id, course_id, title)
  select distinct v_family, v_course, topic
  from seed_texts
  where not exists (
    select 1 from public.topics t where t.family_id = v_family and t.course_id = v_course and t.title = seed_texts.topic
  );

  with seed_texts(position, title_en, title_ru, text_en, text_ru, topic, level, difficulty, tags, vocabulary_words, grammar_focus, comprehension_questions) as (
  values
${textValues}
  ),
  inserted as (
    insert into public.learning_texts (
      family_id, course_id, source_id, topic_id, title_en, title_ru, text_en, text_ru,
      level, difficulty, tags, vocabulary_words, grammar_focus, comprehension_questions, status, created_by
    )
    select
      v_family, v_course, v_source, t.id, s.title_en, s.title_ru, s.text_en, s.text_ru,
      s.level, s.difficulty, s.tags, s.vocabulary_words, s.grammar_focus, s.comprehension_questions,
      'active', auth.uid()
    from seed_texts s
    join public.topics t on t.family_id = v_family and t.course_id = v_course and t.title = s.topic
    where not exists (
      select 1
      from public.learning_texts existing
      where existing.family_id = v_family
        and existing.source_id = v_source
        and lower(existing.title_en) = lower(s.title_en)
    )
    returning id
  )
  select count(*) into v_inserted_texts from inserted;

  select count(*) into v_total_texts
  from public.learning_texts
  where family_id = v_family and source_id = v_source;

  return jsonb_build_object(
    'inserted_texts', v_inserted_texts,
    'existing_texts', greatest(v_total_texts - v_inserted_texts, 0),
    'total_texts', v_total_texts,
    'course_title', 'Starter Texts Pre-A1'
  );
end;
$$;
`;

writeFileSync("supabase/seed_starter_texts.sql", textSql, "utf8");

const byType = countBy(allCards, "type");
const byTopic = countBy(allCards, "topic");
const demonstrativesByType = countBy(demonstrativeCards, "type");
const demonstrativesByTopic = countBy(demonstrativeCards, "topic");
const ingTimeByType = countBy(ingTimeCards, "type");
const ingTimeByTopic = countBy(ingTimeCards, "topic");
const pronounsByType = countBy(pronounCards, "type");
const pronounsByTopic = countBy(pronounCards, "topic");
const textsByTopic = countBy(starterTexts, "topic");
const textsByDifficulty = countBy(starterTexts, "difficulty");
const grammarFocus = countBy(starterTexts.flatMap((text) => text.grammar_focus.map((focus) => ({ focus }))), "focus");
const totalTextQuestions = starterTexts.reduce((sum, text) => sum + text.comprehension_questions.length, 0);
const totalIngTimeTextQuestions = ingTimeTexts.reduce((sum, text) => sum + text.questions, 0);
const totalPronounTextQuestions = pronounTexts.reduce((sum, text) => sum + text.questions, 0);
const report = `# Content Seed Report

Generated from \`scripts/learning-content-data.mjs\`.

## Totals

- total cards: ${allCards.length}
- total cards with demonstratives extension: ${allCards.length + demonstrativeCards.length}
- total cards with demonstratives + ing/time extensions: ${allCards.length + demonstrativeCards.length + ingTimeCards.length}
- total cards with all grammar extensions: ${allCards.length + demonstrativeCards.length + ingTimeCards.length + pronounCards.length}
- total words: ${byType.word ?? 0}
- total phrases: ${byType.phrase ?? 0}
- total sentences: ${byType.sentence ?? 0}
- total grammar pattern cards: ${byType.grammar_pattern ?? 0}
- total grammar patterns table rows: ${grammarPatterns.length}
- total dialogues: ${byType.dialogue ?? 0}
- total mini stories: ${byType.mini_story ?? 0}
- total learning texts: ${starterTexts.length}
- total text comprehension questions: ${totalTextQuestions}

## Count By Type

${Object.entries(byType).sort(([a], [b]) => a.localeCompare(b)).map(([type, count]) => `- ${type}: ${count}`).join("\n")}

## Count By Topic

${Object.entries(byTopic).sort(([a], [b]) => a.localeCompare(b)).map(([topic, count]) => `- ${topic}: ${count}`).join("\n")}

## Grammar Patterns Covered

${grammarPatterns.map((item) => `- ${item.title} (${item.pattern_key})`).join("\n")}

## Exercise Types Supported

${exerciseTypesSupported.map((type) => `- ${type}`).join("\n")}

## Demonstratives Extension

- RPC: \`public.seed_demonstratives_content()\`
- seed helper: \`supabase/seed_demonstratives_content.sql\`
- migration: \`supabase/migrations/20260511100000_demonstratives_content.sql\`
- grammar pattern: ${demonstrativesPattern.title} (${demonstrativesPattern.pattern_key})
- extension cards: ${demonstrativeCards.length}
- extension texts: ${demonstrativeTexts.length}
- focus: this / that / these / those, especially these/those + are

### Demonstratives Cards By Type

${Object.entries(demonstrativesByType).sort(([a], [b]) => a.localeCompare(b)).map(([type, count]) => `- ${type}: ${count}`).join("\n")}

### Demonstratives Cards By Topic

${Object.entries(demonstrativesByTopic).sort(([a], [b]) => a.localeCompare(b)).map(([topic, count]) => `- ${topic}: ${count}`).join("\n")}

### Demonstratives Texts

${demonstrativeTexts.map((text) => `- ${text.title_en} / ${text.title_ru}: ${text.topic}, difficulty ${text.difficulty}, questions ${text.questions}`).join("\n")}

### Demonstratives Examples Covered

${demonstrativesPattern.covered_examples.map((example) => `- ${example}`).join("\n")}

## -ing And Time Extension

- RPC: \`public.seed_ing_time_content()\`
- seed helper: \`supabase/seed_ing_time_content.sql\`
- migration: \`supabase/migrations/20260511110000_ing_time_content.sql\`
- grammar patterns: ${ingTimePatterns.map((pattern) => `${pattern.title} (${pattern.pattern_key})`).join(", ")}
- extension cards: ${ingTimeCards.length}
- extension texts: ${ingTimeTexts.length}
- extension text comprehension questions: ${totalIngTimeTextQuestions}
- focus: -ing / Present Continuous, days of the week, in/on/at, last/next/this time expressions

### -ing And Time Cards By Type

${Object.entries(ingTimeByType).sort(([a], [b]) => a.localeCompare(b)).map(([type, count]) => `- ${type}: ${count}`).join("\n")}

### -ing And Time Cards By Topic

${Object.entries(ingTimeByTopic).sort(([a], [b]) => a.localeCompare(b)).map(([topic, count]) => `- ${topic}: ${count}`).join("\n")}

### -ing And Time Texts

${ingTimeTexts.map((text) => `- ${text.title_en} / ${text.title_ru}: ${text.topic}, difficulty ${text.difficulty}, questions ${text.questions}, grammar focus ${text.grammar_focus.join(", ")}`).join("\n")}

## Pronouns Extension

- RPC: \`public.seed_pronouns_content()\`
- seed helper: \`supabase/seed_pronouns_content.sql\`
- migration: \`supabase/migrations/20260516103000_pronouns_content.sql\`
- ambiguity fix migration: \`supabase/migrations/20260516113000_fix_pronouns_ambiguity.sql\`
- grammar patterns: ${pronounPatterns.map((pattern) => `${pattern.title} (${pattern.pattern_key})`).join(", ")}
- extension cards: ${pronounCards.length}
- extension texts: ${pronounTexts.length}
- extension text comprehension questions: ${totalPronounTextQuestions}
- focus: personal pronouns I/you/he/she/it/we/they and possessive adjectives my/your/his/her/its/our/their
- ambiguity guard: possessive fill gaps use context, for example \`Anna has a bag. This is ___ bag.\` -> \`her\`

### Pronouns Cards By Type

${Object.entries(pronounsByType).sort(([a], [b]) => a.localeCompare(b)).map(([type, count]) => `- ${type}: ${count}`).join("\n")}

### Pronouns Cards By Topic

${Object.entries(pronounsByTopic).sort(([a], [b]) => a.localeCompare(b)).map(([topic, count]) => `- ${topic}: ${count}`).join("\n")}

### Pronouns Texts

${pronounTexts.map((text) => `- ${text.title_en} / ${text.title_ru}: ${text.topic}, difficulty ${text.difficulty}, questions ${text.questions}, grammar focus ${text.grammar_focus.join(", ")}`).join("\n")}

## Starter Texts

- total texts: ${starterTexts.length}
- total comprehension questions: ${totalTextQuestions}

### Texts By Topic

${Object.entries(textsByTopic).sort(([a], [b]) => a.localeCompare(b)).map(([topic, count]) => `- ${topic}: ${count}`).join("\n")}

### Texts By Difficulty

${Object.entries(textsByDifficulty).sort(([a], [b]) => a.localeCompare(b)).map(([difficulty, count]) => `- difficulty ${difficulty}: ${count}`).join("\n")}

### Text Grammar Focus Coverage

${Object.entries(grammarFocus).sort(([a], [b]) => a.localeCompare(b)).map(([focus, count]) => `- ${focus}: ${count}`).join("\n")}

## Idempotency

\`public.seed_starter_learning_content()\` inserts into a stable course/source pair and checks existing rows by \`family_id + course_id + source_id + english + type\` before inserting cards. Grammar patterns are updated by \`family_id + course_id + title\` and inserted only when missing.

\`public.seed_starter_texts()\` inserts into a stable course/source pair and checks existing rows by \`family_id + source_id + title_en\` before inserting texts.

\`public.seed_demonstratives_content()\` inserts into a stable course/source pair and checks existing rows by \`family_id + course_id + source_id + english + type\` for cards and by \`family_id + source_id + title_en\` for texts. Re-running it adds zero duplicates and updates the grammar pattern row by \`pattern_key\`.

\`public.seed_ing_time_content()\` inserts into a stable course/source pair and checks existing rows by \`family_id + course_id + source_id + english + type\` for cards and by \`family_id + source_id + title_en\` for texts. Re-running it adds zero duplicates and updates the two grammar pattern rows by \`pattern_key\`.

\`public.seed_pronouns_content()\` inserts into a stable course/source pair and checks existing rows by \`family_id + course_id + source_id + english + type\` for cards and by \`family_id + source_id + title_en\` for texts. Re-running it adds zero duplicates, updates the two grammar pattern rows by \`pattern_key\`, and archives the old bare possessive fill-gap cards when they exist.
`;

writeFileSync("CONTENT_SEED_REPORT.md", report, "utf8");

console.log(JSON.stringify({
  totalCards: allCards.length,
  byType,
  byTopic,
  grammarPatterns: grammarPatterns.length,
  starterTexts: starterTexts.length,
  demonstrativeCards: demonstrativeCards.length,
  demonstrativeTexts: demonstrativeTexts.length,
  ingTimeCards: ingTimeCards.length,
  ingTimeTexts: ingTimeTexts.length,
  ingTimeTextQuestions: totalIngTimeTextQuestions,
  pronounCards: pronounCards.length,
  pronounTexts: pronounTexts.length,
  pronounTextQuestions: totalPronounTextQuestions,
  textQuestions: totalTextQuestions,
  sql: "supabase/seed_350_learning_content.sql",
  textSql: "supabase/seed_starter_texts.sql",
  report: "CONTENT_SEED_REPORT.md"
}, null, 2));
