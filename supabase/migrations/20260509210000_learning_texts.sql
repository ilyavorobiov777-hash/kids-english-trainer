alter type public.exercise_type add value if not exists 'choose_answer';
alter type public.exercise_type add value if not exists 'true_false';
alter type public.exercise_type add value if not exists 'match_word_translation';
alter type public.exercise_type add value if not exists 'build_sentence_from_text';
alter type public.exercise_type add value if not exists 'vocabulary_review_from_text';

create table if not exists public.learning_texts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  source_id uuid references public.sources(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  title_en text not null,
  title_ru text not null,
  text_en text not null,
  text_ru text not null,
  level text not null default 'pre_a1',
  difficulty integer not null default 1 check (difficulty between 1 and 5),
  tags jsonb not null default '[]'::jsonb,
  vocabulary_words jsonb not null default '[]'::jsonb,
  grammar_focus jsonb not null default '[]'::jsonb,
  comprehension_questions jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.practice_attempts
  add column if not exists text_id uuid references public.learning_texts(id) on delete set null,
  add column if not exists question text,
  add column if not exists exercise_payload jsonb not null default '{}'::jsonb;

create index if not exists learning_texts_family_status_idx on public.learning_texts (family_id, status, topic_id);
create index if not exists learning_texts_family_title_idx on public.learning_texts (family_id, lower(title_en));
create index if not exists practice_attempts_text_idx on public.practice_attempts (family_id, text_id, created_at desc);

drop trigger if exists learning_texts_updated_at on public.learning_texts;
create trigger learning_texts_updated_at
before update on public.learning_texts
for each row execute function public.set_updated_at();

alter table public.learning_texts enable row level security;

drop policy if exists "family learning texts select" on public.learning_texts;
create policy "family learning texts select" on public.learning_texts
  for select
  using (
    family_id = public.current_family_id()
    and (status = 'active' or public.current_user_role() = 'parent')
  );

drop policy if exists "parent manage learning texts" on public.learning_texts;
create policy "parent manage learning texts" on public.learning_texts
  for all
  using (family_id = public.current_family_id() and public.current_user_role() = 'parent')
  with check (family_id = public.current_family_id() and public.current_user_role() = 'parent');
