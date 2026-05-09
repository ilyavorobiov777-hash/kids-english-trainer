create extension if not exists "pgcrypto";

create type public.app_role as enum ('parent', 'child');
create type public.card_type as enum ('word', 'phrase', 'sentence', 'grammar_pattern', 'dialogue', 'mini_story');
create type public.card_status as enum ('draft', 'active', 'archived');
create type public.exercise_type as enum ('choose_translation');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Моя семья',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  role public.app_role not null default 'parent',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  avatar_color text not null default '#7ED7C1',
  birth_year int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  kind text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  position int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  title text not null,
  position int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.decks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  source_id uuid references public.sources(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  deck_id uuid references public.decks(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  english text not null,
  russian text not null,
  type public.card_type not null default 'word',
  difficulty int not null default 1 check (difficulty between 1 and 5),
  tags text[] not null default '{}',
  example_en text,
  example_ru text,
  audio_url text,
  image_url text,
  status public.card_status not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.grammar_patterns (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  pattern text not null,
  explanation_ru text,
  example_en text,
  example_ru text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dialogues (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  source_id uuid references public.sources(id) on delete set null,
  title text not null,
  lines jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_seconds int not null default 0,
  total_attempts int not null default 0,
  correct_attempts int not null default 0,
  incorrect_attempts int not null default 0,
  accuracy numeric(5,2) not null default 0,
  stars_earned int not null default 0
);

create table public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  session_id uuid references public.practice_sessions(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  exercise_type public.exercise_type not null default 'choose_translation',
  answer text not null,
  correct_answer text not null,
  is_correct boolean not null,
  response_time_ms int not null default 0,
  rating int check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create table public.review_schedule (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  due_at timestamptz not null default now(),
  ease numeric(4,2) not null default 2.5,
  interval_days int not null default 1,
  repetitions int not null default 0,
  lapses int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, card_id)
);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  kind text not null default 'star',
  amount int not null default 1,
  reason text,
  created_at timestamptz not null default now()
);

create index on public.profiles (auth_user_id, family_id);
create index on public.children (family_id);
create index on public.cards (family_id, status, type, topic_id);
create index on public.practice_attempts (family_id, child_id, created_at desc);
create index on public.practice_sessions (family_id, child_id, started_at desc);
create index on public.review_schedule (family_id, child_id, due_at);

create trigger families_updated_at before update on public.families for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger children_updated_at before update on public.children for each row execute function public.set_updated_at();
create trigger courses_updated_at before update on public.courses for each row execute function public.set_updated_at();
create trigger sources_updated_at before update on public.sources for each row execute function public.set_updated_at();
create trigger units_updated_at before update on public.units for each row execute function public.set_updated_at();
create trigger lessons_updated_at before update on public.lessons for each row execute function public.set_updated_at();
create trigger topics_updated_at before update on public.topics for each row execute function public.set_updated_at();
create trigger decks_updated_at before update on public.decks for each row execute function public.set_updated_at();
create trigger cards_updated_at before update on public.cards for each row execute function public.set_updated_at();
create trigger grammar_patterns_updated_at before update on public.grammar_patterns for each row execute function public.set_updated_at();
create trigger dialogues_updated_at before update on public.dialogues for each row execute function public.set_updated_at();
create trigger review_schedule_updated_at before update on public.review_schedule for each row execute function public.set_updated_at();

create or replace function public.current_family_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from public.profiles where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.handle_new_parent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_family_id uuid;
begin
  insert into public.families (name)
  values (coalesce(new.raw_user_meta_data ->> 'family_name', 'Моя семья'))
  returning id into new_family_id;

  insert into public.profiles (auth_user_id, family_id, role, display_name)
  values (new.id, new_family_id, 'parent', coalesce(new.raw_user_meta_data ->> 'display_name', new.email));

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_parent();

alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.courses enable row level security;
alter table public.sources enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.topics enable row level security;
alter table public.decks enable row level security;
alter table public.cards enable row level security;
alter table public.grammar_patterns enable row level security;
alter table public.dialogues enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.review_schedule enable row level security;
alter table public.rewards enable row level security;

create policy "family select" on public.families for select using (id = public.current_family_id());
create policy "parent update family" on public.families for update using (id = public.current_family_id() and public.current_user_role() = 'parent');

create policy "own family profiles select" on public.profiles for select using (family_id = public.current_family_id());
create policy "parent update own profile" on public.profiles for update using (family_id = public.current_family_id() and public.current_user_role() = 'parent');

create policy "family children select" on public.children for select using (family_id = public.current_family_id());
create policy "parent manage children" on public.children for all using (family_id = public.current_family_id() and public.current_user_role() = 'parent') with check (family_id = public.current_family_id() and public.current_user_role() = 'parent');

create policy "family courses select" on public.courses for select using (family_id = public.current_family_id());
create policy "parent manage courses" on public.courses for all using (family_id = public.current_family_id() and public.current_user_role() = 'parent') with check (family_id = public.current_family_id() and public.current_user_role() = 'parent');

create policy "family sources select" on public.sources for select using (family_id = public.current_family_id());
create policy "parent manage sources" on public.sources for all using (family_id = public.current_family_id() and public.current_user_role() = 'parent') with check (family_id = public.current_family_id() and public.current_user_role() = 'parent');

create policy "family units select" on public.units for select using (family_id = public.current_family_id());
create policy "parent manage units" on public.units for all using (family_id = public.current_family_id() and public.current_user_role() = 'parent') with check (family_id = public.current_family_id() and public.current_user_role() = 'parent');

create policy "family lessons select" on public.lessons for select using (family_id = public.current_family_id());
create policy "parent manage lessons" on public.lessons for all using (family_id = public.current_family_id() and public.current_user_role() = 'parent') with check (family_id = public.current_family_id() and public.current_user_role() = 'parent');

create policy "family topics select" on public.topics for select using (family_id = public.current_family_id());
create policy "parent manage topics" on public.topics for all using (family_id = public.current_family_id() and public.current_user_role() = 'parent') with check (family_id = public.current_family_id() and public.current_user_role() = 'parent');

create policy "family decks select" on public.decks for select using (family_id = public.current_family_id());
create policy "parent manage decks" on public.decks for all using (family_id = public.current_family_id() and public.current_user_role() = 'parent') with check (family_id = public.current_family_id() and public.current_user_role() = 'parent');

create policy "family cards select" on public.cards for select using (family_id = public.current_family_id() and status <> 'archived');
create policy "parent manage cards" on public.cards for all using (family_id = public.current_family_id() and public.current_user_role() = 'parent') with check (family_id = public.current_family_id() and public.current_user_role() = 'parent');

create policy "family grammar select" on public.grammar_patterns for select using (family_id = public.current_family_id());
create policy "parent manage grammar" on public.grammar_patterns for all using (family_id = public.current_family_id() and public.current_user_role() = 'parent') with check (family_id = public.current_family_id() and public.current_user_role() = 'parent');

create policy "family dialogues select" on public.dialogues for select using (family_id = public.current_family_id());
create policy "parent manage dialogues" on public.dialogues for all using (family_id = public.current_family_id() and public.current_user_role() = 'parent') with check (family_id = public.current_family_id() and public.current_user_role() = 'parent');

create policy "family sessions select" on public.practice_sessions for select using (family_id = public.current_family_id());
create policy "family sessions insert" on public.practice_sessions for insert with check (family_id = public.current_family_id());
create policy "family sessions update" on public.practice_sessions for update using (family_id = public.current_family_id()) with check (family_id = public.current_family_id());

create policy "family attempts select" on public.practice_attempts for select using (family_id = public.current_family_id());
create policy "family attempts insert" on public.practice_attempts for insert with check (family_id = public.current_family_id());

create policy "family review select" on public.review_schedule for select using (family_id = public.current_family_id());
create policy "family review upsert" on public.review_schedule for all using (family_id = public.current_family_id()) with check (family_id = public.current_family_id());

create policy "family rewards select" on public.rewards for select using (family_id = public.current_family_id());
create policy "family rewards insert" on public.rewards for insert with check (family_id = public.current_family_id());
