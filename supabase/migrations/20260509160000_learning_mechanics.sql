alter type public.exercise_type add value if not exists 'russian_to_english';
alter type public.exercise_type add value if not exists 'listen_and_choose';
alter type public.exercise_type add value if not exists 'build_sentence';
alter type public.exercise_type add value if not exists 'fill_the_gap';
alter type public.exercise_type add value if not exists 'question_form';
alter type public.exercise_type add value if not exists 'short_answer';
alter type public.exercise_type add value if not exists 'articles';
alter type public.exercise_type add value if not exists 'mini_dialogue';

alter table public.practice_attempts
  alter column card_id drop not null,
  add column if not exists grammar_pattern_id uuid references public.grammar_patterns(id) on delete set null;

alter table public.grammar_patterns
  add column if not exists title_ru text,
  add column if not exists pattern_key text,
  add column if not exists affirmative_examples jsonb not null default '[]'::jsonb,
  add column if not exists negative_examples jsonb not null default '[]'::jsonb,
  add column if not exists question_examples jsonb not null default '[]'::jsonb,
  add column if not exists short_positive_answers jsonb not null default '[]'::jsonb,
  add column if not exists short_negative_answers jsonb not null default '[]'::jsonb,
  add column if not exists common_mistakes jsonb not null default '[]'::jsonb,
  add column if not exists exercise_templates jsonb not null default '[]'::jsonb;

alter table public.review_schedule
  add column if not exists stability numeric(6,2) not null default 1,
  add column if not exists difficulty numeric(6,2) not null default 2.5,
  add column if not exists review_count int not null default 0,
  add column if not exists lapse_count int not null default 0;

update public.review_schedule
set
  review_count = greatest(review_count, repetitions),
  lapse_count = greatest(lapse_count, lapses),
  stability = greatest(stability, interval_days::numeric),
  difficulty = coalesce(difficulty, 2.5);

create index if not exists practice_attempts_grammar_pattern_idx
  on public.practice_attempts (family_id, grammar_pattern_id, created_at desc);

create index if not exists review_schedule_due_idx
  on public.review_schedule (family_id, child_id, due_at);

update public.grammar_patterns
set
  pattern_key = lower(title),
  title_ru = coalesce(title_ru, title),
  affirmative_examples = case
    when lower(title) like '%have got%' then '["I have got a dog."]'::jsonb
    when lower(title) = 'can' then '["I can swim."]'::jsonb
    when lower(title) = 'like' then '["I like apples."]'::jsonb
    when lower(title) like '%would like%' then '["I would like some juice."]'::jsonb
    when lower(title) like '%article%' then '["I have got an apple.","The sun is yellow."]'::jsonb
    else affirmative_examples
  end,
  question_examples = case
    when lower(title) like '%have got%' then '["Have you got a dog?"]'::jsonb
    when lower(title) = 'can' then '["Can you swim?"]'::jsonb
    when lower(title) = 'like' then '["Do you like apples?"]'::jsonb
    when lower(title) like '%would like%' then '["Would you like some juice?"]'::jsonb
    else question_examples
  end,
  short_positive_answers = case
    when lower(title) like '%have got%' then '["Yes, I have."]'::jsonb
    when lower(title) = 'can' then '["Yes, I can."]'::jsonb
    when lower(title) = 'like' then '["Yes, I do."]'::jsonb
    when lower(title) like '%would like%' then '["Yes, please."]'::jsonb
    else short_positive_answers
  end,
  short_negative_answers = case
    when lower(title) like '%have got%' then '["No, I have not."]'::jsonb
    when lower(title) = 'can' then '["No, I can not."]'::jsonb
    when lower(title) = 'like' then '["No, I do not."]'::jsonb
    when lower(title) like '%would like%' then '["No, thank you."]'::jsonb
    else short_negative_answers
  end,
  common_mistakes = case
    when lower(title) like '%have got%' then '["Do you have got a dog?"]'::jsonb
    when lower(title) = 'can' then '["Do you can swim?"]'::jsonb
    when lower(title) = 'like' then '["Like you apples?"]'::jsonb
    when lower(title) like '%would like%' then '["Do you would like juice?"]'::jsonb
    when lower(title) like '%article%' then '["a apple","an cat"]'::jsonb
    else common_mistakes
  end;
