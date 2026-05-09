import { writeFileSync } from "node:fs";
import { allCards, exerciseTypesSupported, grammarPatterns } from "./learning-content-data.mjs";

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

const byType = countBy(allCards, "type");
const byTopic = countBy(allCards, "topic");
const report = `# Content Seed Report

Generated from \`scripts/learning-content-data.mjs\`.

## Totals

- total cards: ${allCards.length}
- total words: ${byType.word ?? 0}
- total phrases: ${byType.phrase ?? 0}
- total sentences: ${byType.sentence ?? 0}
- total grammar pattern cards: ${byType.grammar_pattern ?? 0}
- total grammar patterns table rows: ${grammarPatterns.length}
- total dialogues: ${byType.dialogue ?? 0}
- total mini stories: ${byType.mini_story ?? 0}

## Count By Type

${Object.entries(byType).sort(([a], [b]) => a.localeCompare(b)).map(([type, count]) => `- ${type}: ${count}`).join("\n")}

## Count By Topic

${Object.entries(byTopic).sort(([a], [b]) => a.localeCompare(b)).map(([topic, count]) => `- ${topic}: ${count}`).join("\n")}

## Grammar Patterns Covered

${grammarPatterns.map((item) => `- ${item.title} (${item.pattern_key})`).join("\n")}

## Exercise Types Supported

${exerciseTypesSupported.map((type) => `- ${type}`).join("\n")}

## Idempotency

\`public.seed_starter_learning_content()\` inserts into a stable course/source pair and checks existing rows by \`family_id + course_id + source_id + english + type\` before inserting cards. Grammar patterns are updated by \`family_id + course_id + title\` and inserted only when missing.
`;

writeFileSync("CONTENT_SEED_REPORT.md", report, "utf8");

console.log(JSON.stringify({
  totalCards: allCards.length,
  byType,
  byTopic,
  grammarPatterns: grammarPatterns.length,
  sql: "supabase/seed_350_learning_content.sql",
  report: "CONTENT_SEED_REPORT.md"
}, null, 2));
