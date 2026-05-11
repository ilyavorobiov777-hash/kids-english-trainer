create or replace function public.seed_demonstratives_content()
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
  v_total_cards int := 0;
  v_inserted_grammar int := 0;
  v_total_grammar int := 0;
  v_inserted_texts int := 0;
  v_total_texts int := 0;
begin
  if v_family is null then
    raise exception 'Sign in as a parent before running select public.seed_demonstratives_content();';
  end if;

  if public.current_user_role() <> 'parent' then
    raise exception 'Only parent accounts can add demonstratives content.';
  end if;

  insert into public.courses (family_id, title, description)
  select v_family, 'Grammar: Demonstratives', 'Idempotent this / that / these / those grammar extension'
  where not exists (
    select 1 from public.courses where family_id = v_family and title = 'Grammar: Demonstratives'
  );
  select id into v_course from public.courses where family_id = v_family and title = 'Grammar: Demonstratives' limit 1;

  insert into public.sources (family_id, course_id, title, kind)
  select v_family, v_course, 'Demonstratives generated seed', 'seed'
  where not exists (
    select 1 from public.sources where family_id = v_family and course_id = v_course and title = 'Demonstratives generated seed'
  );
  select id into v_source from public.sources where family_id = v_family and course_id = v_course and title = 'Demonstratives generated seed' limit 1;

  insert into public.units (family_id, course_id, title, position)
  select v_family, v_course, 'This, that, these, those', 1
  where not exists (
    select 1 from public.units where family_id = v_family and course_id = v_course and title = 'This, that, these, those'
  );
  select id into v_unit from public.units where family_id = v_family and course_id = v_course and title = 'This, that, these, those' limit 1;

  insert into public.lessons (family_id, course_id, unit_id, title, position)
  select v_family, v_course, v_unit, 'Near and far things', 1
  where not exists (
    select 1 from public.lessons where family_id = v_family and course_id = v_course and title = 'Near and far things'
  );
  select id into v_lesson from public.lessons where family_id = v_family and course_id = v_course and title = 'Near and far things' limit 1;

  insert into public.decks (family_id, course_id, title)
  select v_family, v_course, 'Demonstratives practice deck'
  where not exists (
    select 1 from public.decks where family_id = v_family and course_id = v_course and title = 'Demonstratives practice deck'
  );
  select id into v_deck from public.decks where family_id = v_family and course_id = v_course and title = 'Demonstratives practice deck' limit 1;

  with seed_cards(position, type, topic, english, russian, difficulty, tags, example_en, example_ru) as (
    values
      (1, 'grammar_pattern', 'grammar', 'this = one near thing', 'this - один предмет рядом', 1, array['demonstratives','this','singular']::text[], 'This is my book.', 'Это моя книга.'),
      (2, 'grammar_pattern', 'grammar', 'that = one far thing', 'that - один предмет далеко', 1, array['demonstratives','that','singular']::text[], 'That is my bag.', 'Вон та сумка моя.'),
      (3, 'grammar_pattern', 'grammar', 'these = many near things', 'these - несколько предметов рядом', 1, array['demonstratives','these','plural']::text[], 'These are my pencils.', 'Это мои карандаши.'),
      (4, 'grammar_pattern', 'grammar', 'those = many far things', 'those - несколько предметов далеко', 1, array['demonstratives','those','plural']::text[], 'Those are my books.', 'Вон те книги мои.'),
      (5, 'grammar_pattern', 'grammar', 'This is my book.', 'Это моя книга.', 1, array['demonstratives','this','is']::text[], 'This is my book.', 'Это моя книга.'),
      (6, 'grammar_pattern', 'grammar', 'That is my bag.', 'Вон та сумка моя.', 1, array['demonstratives','that','is']::text[], 'That is my bag.', 'Вон та сумка моя.'),
      (7, 'grammar_pattern', 'grammar', 'These are my pencils.', 'Это мои карандаши.', 1, array['demonstratives','these','are']::text[], 'These are my pencils.', 'Это мои карандаши.'),
      (8, 'grammar_pattern', 'grammar', 'Those are my books.', 'Вон те книги мои.', 1, array['demonstratives','those','are']::text[], 'Those are my books.', 'Вон те книги мои.'),
      (9, 'sentence', 'classroom objects', 'These are my books.', 'Это мои книги.', 2, array['demonstratives','these','school']::text[], 'These are my books.', 'Это мои книги.'),
      (10, 'sentence', 'classroom objects', 'Those are my pencils.', 'Вон те карандаши.', 2, array['demonstratives','those','school']::text[], 'Those are my pencils.', 'Вон те карандаши.'),
      (11, 'sentence', 'food and drinks', 'These are apples.', 'Это яблоки.', 2, array['demonstratives','these','food']::text[], 'These are apples.', 'Это яблоки.'),
      (12, 'sentence', 'food and drinks', 'Those are oranges.', 'Вон те апельсины.', 2, array['demonstratives','those','food']::text[], 'Those are oranges.', 'Вон те апельсины.'),
      (13, 'sentence', 'toys', 'These are my toys.', 'Это мои игрушки.', 2, array['demonstratives','these','toys']::text[], 'These are my toys.', 'Это мои игрушки.'),
      (14, 'sentence', 'clothes', 'Those are her shoes.', 'Вон те ее туфли.', 2, array['demonstratives','those','clothes']::text[], 'Those are her shoes.', 'Вон те ее туфли.'),
      (15, 'sentence', 'classroom objects', 'These are blue pens.', 'Это синие ручки.', 2, array['demonstratives','these','colours']::text[], 'These are blue pens.', 'Это синие ручки.'),
      (16, 'sentence', 'school', 'Those are red bags.', 'Вон те красные сумки.', 2, array['demonstratives','those','colours']::text[], 'Those are red bags.', 'Вон те красные сумки.'),
      (17, 'sentence', 'classroom objects', 'This is my pencil.', 'Это мой карандаш.', 1, array['demonstratives','this','school']::text[], 'This is my pencil.', 'Это мой карандаш.'),
      (18, 'sentence', 'classroom objects', 'That is my ruler.', 'Вон та линейка моя.', 1, array['demonstratives','that','school']::text[], 'That is my ruler.', 'Вон та линейка моя.'),
      (19, 'sentence', 'animals', 'These are small cats.', 'Это маленькие кошки.', 2, array['demonstratives','these','animals']::text[], 'These are small cats.', 'Это маленькие кошки.'),
      (20, 'sentence', 'animals', 'Those are big dogs.', 'Вон те большие собаки.', 2, array['demonstratives','those','animals']::text[], 'Those are big dogs.', 'Вон те большие собаки.'),
      (21, 'sentence', 'classroom objects', 'These are clean notebooks.', 'Это чистые тетради.', 2, array['demonstratives','these','school']::text[], 'These are clean notebooks.', 'Это чистые тетради.'),
      (22, 'sentence', 'classroom objects', 'Those are green crayons.', 'Вон те зеленые мелки.', 2, array['demonstratives','those','colours']::text[], 'Those are green crayons.', 'Вон те зеленые мелки.'),
      (23, 'phrase', 'simple questions', 'What are these?', 'Что это?', 2, array['demonstratives','these','question_form']::text[], 'What are these?', 'Что это?'),
      (24, 'phrase', 'simple questions', 'What are those?', 'Что это там?', 2, array['demonstratives','those','question_form']::text[], 'What are those?', 'Что это там?'),
      (25, 'phrase', 'simple questions', 'Are these your books?', 'Это твои книги?', 2, array['demonstratives','these','short_answer']::text[], 'Are these your books?', 'Это твои книги?'),
      (26, 'phrase', 'simple questions', 'Are those your toys?', 'Вон те игрушки твои?', 2, array['demonstratives','those','short_answer']::text[], 'Are those your toys?', 'Вон те игрушки твои?'),
      (27, 'phrase', 'simple questions', 'Whose books are these?', 'Чьи это книги?', 2, array['demonstratives','these','whose']::text[], 'Whose books are these?', 'Чьи это книги?'),
      (28, 'phrase', 'simple questions', 'Whose bags are those?', 'Чьи это сумки там?', 2, array['demonstratives','those','whose']::text[], 'Whose bags are those?', 'Чьи это сумки там?'),
      (29, 'grammar_pattern', 'grammar', 'These are my books. -> Are these your books?', 'Это мои книги. -> Это твои книги?', 2, array['demonstratives','question_form','these']::text[], 'These are my books.', 'Are these your books?'),
      (30, 'grammar_pattern', 'grammar', 'Those are your pencils. -> Are those your pencils?', 'Вон те твои карандаши. -> Вон те карандаши твои?', 2, array['demonstratives','question_form','those']::text[], 'Those are your pencils.', 'Are those your pencils?'),
      (31, 'grammar_pattern', 'grammar', 'These are apples. -> What are these?', 'Это яблоки. -> Что это?', 2, array['demonstratives','question_form','these']::text[], 'These are apples.', 'What are these?'),
      (32, 'grammar_pattern', 'grammar', 'Those are toys. -> What are those?', 'Вон те игрушки. -> Что это там?', 2, array['demonstratives','question_form','those']::text[], 'Those are toys.', 'What are those?'),
      (33, 'grammar_pattern', 'grammar', 'These are her shoes. -> Are these her shoes?', 'Это ее туфли. -> Это ее туфли?', 2, array['demonstratives','question_form','these']::text[], 'These are her shoes.', 'Are these her shoes?'),
      (34, 'grammar_pattern', 'grammar', 'Those are his bags. -> Are those his bags?', 'Вон те его сумки. -> Вон те его сумки?', 2, array['demonstratives','question_form','those']::text[], 'Those are his bags.', 'Are those his bags?'),
      (35, 'grammar_pattern', 'grammar', 'These are my pens. -> Whose pens are these?', 'Это мои ручки. -> Чьи это ручки?', 2, array['demonstratives','question_form','whose']::text[], 'These are my pens.', 'Whose pens are these?'),
      (36, 'grammar_pattern', 'grammar', 'Those are her pencils. -> Whose pencils are those?', 'Вон те ее карандаши. -> Чьи это карандаши там?', 2, array['demonstratives','question_form','whose']::text[], 'Those are her pencils.', 'Whose pencils are those?'),
      (37, 'grammar_pattern', 'grammar', 'This is my book. -> What is this?', 'Это моя книга. -> Что это?', 2, array['demonstratives','question_form','this']::text[], 'This is my book.', 'What is this?'),
      (38, 'grammar_pattern', 'grammar', 'That is my bag. -> What is that?', 'Вон та моя сумка. -> Что это там?', 2, array['demonstratives','question_form','that']::text[], 'That is my bag.', 'What is that?'),
      (39, 'grammar_pattern', 'simple questions', 'Are these your books? Yes, they are.', 'Это твои книги? Да.', 2, array['demonstratives','short_answer','these']::text[], 'Are these your books?', 'Yes, they are.'),
      (40, 'grammar_pattern', 'simple questions', 'Are these your books? No, they aren''t.', 'Это твои книги? Нет.', 2, array['demonstratives','short_answer','these']::text[], 'Are these your books?', 'No, they aren''t.'),
      (41, 'grammar_pattern', 'simple questions', 'Are those your pencils? Yes, they are.', 'Вон те карандаши твои? Да.', 2, array['demonstratives','short_answer','those']::text[], 'Are those your pencils?', 'Yes, they are.'),
      (42, 'grammar_pattern', 'simple questions', 'Are those your pencils? No, they aren''t.', 'Вон те карандаши твои? Нет.', 2, array['demonstratives','short_answer','those']::text[], 'Are those your pencils?', 'No, they aren''t.'),
      (43, 'grammar_pattern', 'simple questions', 'Are these apples? Yes, they are.', 'Это яблоки? Да.', 2, array['demonstratives','short_answer','these']::text[], 'Are these apples?', 'Yes, they are.'),
      (44, 'grammar_pattern', 'simple questions', 'Are those toys? No, they aren''t.', 'Вон те игрушки? Нет.', 2, array['demonstratives','short_answer','those']::text[], 'Are those toys?', 'No, they aren''t.'),
      (45, 'grammar_pattern', 'simple questions', 'These are my books.', 'Это мои книги.', 2, array['demonstratives','short_answer','these']::text[], 'Whose books are these?', 'These are my books.'),
      (46, 'grammar_pattern', 'simple questions', 'Those are her pencils.', 'Вон те ее карандаши.', 2, array['demonstratives','short_answer','those']::text[], 'Whose pencils are those?', 'Those are her pencils.'),
      (47, 'grammar_pattern', 'simple questions', 'These are apples.', 'Это яблоки.', 2, array['demonstratives','short_answer','these']::text[], 'What are these?', 'These are apples.'),
      (48, 'grammar_pattern', 'simple questions', 'Those are toys.', 'Вон те игрушки.', 2, array['demonstratives','short_answer','those']::text[], 'What are those?', 'Those are toys.'),
      (49, 'grammar_pattern', 'grammar', '___ are my books. Correct: These', 'Пропуск: These are my books.', 2, array['demonstratives','fill_the_gap','these']::text[], '___ are my books.', 'These'),
      (50, 'grammar_pattern', 'grammar', '___ are her pencils. Correct: Those', 'Пропуск: Those are her pencils.', 2, array['demonstratives','fill_the_gap','those']::text[], '___ are her pencils.', 'Those'),
      (51, 'grammar_pattern', 'grammar', 'What are ___? Correct: these', 'Пропуск: What are these?', 2, array['demonstratives','fill_the_gap','these']::text[], 'What are ___?', 'these'),
      (52, 'grammar_pattern', 'grammar', 'What are ___? Correct: those', 'Пропуск: What are those?', 2, array['demonstratives','fill_the_gap','those']::text[], 'What are ___?', 'those'),
      (53, 'grammar_pattern', 'grammar', '___ is my book. Correct: This', 'Пропуск: This is my book.', 2, array['demonstratives','fill_the_gap','this']::text[], '___ is my book.', 'This'),
      (54, 'grammar_pattern', 'grammar', '___ is her bag. Correct: That', 'Пропуск: That is her bag.', 2, array['demonstratives','fill_the_gap','that']::text[], '___ is her bag.', 'That'),
      (55, 'grammar_pattern', 'grammar', 'These ___ my books. Correct: are', 'Пропуск: These are my books.', 2, array['demonstratives','fill_the_gap','are']::text[], 'These ___ my books.', 'are'),
      (56, 'grammar_pattern', 'grammar', 'Those ___ her toys. Correct: are', 'Пропуск: Those are her toys.', 2, array['demonstratives','fill_the_gap','are']::text[], 'Those ___ her toys.', 'are'),
      (57, 'grammar_pattern', 'grammar', 'This ___ my pencil. Correct: is', 'Пропуск: This is my pencil.', 2, array['demonstratives','fill_the_gap','is']::text[], 'This ___ my pencil.', 'is'),
      (58, 'grammar_pattern', 'grammar', 'That ___ my ruler. Correct: is', 'Пропуск: That is my ruler.', 2, array['demonstratives','fill_the_gap','is']::text[], 'That ___ my ruler.', 'is'),
      (59, 'dialogue', 'simple questions', 'What are these?', 'These are my books.', 2, array['demonstratives','mini_dialogue','these']::text[], 'What are these?', 'These are my books.'),
      (60, 'dialogue', 'simple questions', 'What are those?', 'Those are her pencils.', 2, array['demonstratives','mini_dialogue','those']::text[], 'What are those?', 'Those are her pencils.'),
      (61, 'dialogue', 'simple questions', 'Are these your books?', 'Yes, they are.', 2, array['demonstratives','mini_dialogue','these']::text[], 'Are these your books?', 'Yes, they are.'),
      (62, 'dialogue', 'simple questions', 'Are those your toys?', 'No, they aren''t.', 2, array['demonstratives','mini_dialogue','those']::text[], 'Are those your toys?', 'No, they aren''t.')
  )
  insert into public.topics (family_id, course_id, title)
  select distinct v_family, v_course, topic
  from seed_cards
  where not exists (
    select 1 from public.topics t where t.family_id = v_family and t.course_id = v_course and t.title = seed_cards.topic
  );

  with seed_cards(position, type, topic, english, russian, difficulty, tags, example_en, example_ru) as (
    values
      (1, 'grammar_pattern', 'grammar', 'this = one near thing', 'this - один предмет рядом', 1, array['demonstratives','this','singular']::text[], 'This is my book.', 'Это моя книга.'),
      (2, 'grammar_pattern', 'grammar', 'that = one far thing', 'that - один предмет далеко', 1, array['demonstratives','that','singular']::text[], 'That is my bag.', 'Вон та сумка моя.'),
      (3, 'grammar_pattern', 'grammar', 'these = many near things', 'these - несколько предметов рядом', 1, array['demonstratives','these','plural']::text[], 'These are my pencils.', 'Это мои карандаши.'),
      (4, 'grammar_pattern', 'grammar', 'those = many far things', 'those - несколько предметов далеко', 1, array['demonstratives','those','plural']::text[], 'Those are my books.', 'Вон те книги мои.'),
      (5, 'grammar_pattern', 'grammar', 'This is my book.', 'Это моя книга.', 1, array['demonstratives','this','is']::text[], 'This is my book.', 'Это моя книга.'),
      (6, 'grammar_pattern', 'grammar', 'That is my bag.', 'Вон та сумка моя.', 1, array['demonstratives','that','is']::text[], 'That is my bag.', 'Вон та сумка моя.'),
      (7, 'grammar_pattern', 'grammar', 'These are my pencils.', 'Это мои карандаши.', 1, array['demonstratives','these','are']::text[], 'These are my pencils.', 'Это мои карандаши.'),
      (8, 'grammar_pattern', 'grammar', 'Those are my books.', 'Вон те книги мои.', 1, array['demonstratives','those','are']::text[], 'Those are my books.', 'Вон те книги мои.'),
      (9, 'sentence', 'classroom objects', 'These are my books.', 'Это мои книги.', 2, array['demonstratives','these','school']::text[], 'These are my books.', 'Это мои книги.'),
      (10, 'sentence', 'classroom objects', 'Those are my pencils.', 'Вон те карандаши.', 2, array['demonstratives','those','school']::text[], 'Those are my pencils.', 'Вон те карандаши.'),
      (11, 'sentence', 'food and drinks', 'These are apples.', 'Это яблоки.', 2, array['demonstratives','these','food']::text[], 'These are apples.', 'Это яблоки.'),
      (12, 'sentence', 'food and drinks', 'Those are oranges.', 'Вон те апельсины.', 2, array['demonstratives','those','food']::text[], 'Those are oranges.', 'Вон те апельсины.'),
      (13, 'sentence', 'toys', 'These are my toys.', 'Это мои игрушки.', 2, array['demonstratives','these','toys']::text[], 'These are my toys.', 'Это мои игрушки.'),
      (14, 'sentence', 'clothes', 'Those are her shoes.', 'Вон те ее туфли.', 2, array['demonstratives','those','clothes']::text[], 'Those are her shoes.', 'Вон те ее туфли.'),
      (15, 'sentence', 'classroom objects', 'These are blue pens.', 'Это синие ручки.', 2, array['demonstratives','these','colours']::text[], 'These are blue pens.', 'Это синие ручки.'),
      (16, 'sentence', 'school', 'Those are red bags.', 'Вон те красные сумки.', 2, array['demonstratives','those','colours']::text[], 'Those are red bags.', 'Вон те красные сумки.'),
      (17, 'sentence', 'classroom objects', 'This is my pencil.', 'Это мой карандаш.', 1, array['demonstratives','this','school']::text[], 'This is my pencil.', 'Это мой карандаш.'),
      (18, 'sentence', 'classroom objects', 'That is my ruler.', 'Вон та линейка моя.', 1, array['demonstratives','that','school']::text[], 'That is my ruler.', 'Вон та линейка моя.'),
      (19, 'sentence', 'animals', 'These are small cats.', 'Это маленькие кошки.', 2, array['demonstratives','these','animals']::text[], 'These are small cats.', 'Это маленькие кошки.'),
      (20, 'sentence', 'animals', 'Those are big dogs.', 'Вон те большие собаки.', 2, array['demonstratives','those','animals']::text[], 'Those are big dogs.', 'Вон те большие собаки.'),
      (21, 'sentence', 'classroom objects', 'These are clean notebooks.', 'Это чистые тетради.', 2, array['demonstratives','these','school']::text[], 'These are clean notebooks.', 'Это чистые тетради.'),
      (22, 'sentence', 'classroom objects', 'Those are green crayons.', 'Вон те зеленые мелки.', 2, array['demonstratives','those','colours']::text[], 'Those are green crayons.', 'Вон те зеленые мелки.'),
      (23, 'phrase', 'simple questions', 'What are these?', 'Что это?', 2, array['demonstratives','these','question_form']::text[], 'What are these?', 'Что это?'),
      (24, 'phrase', 'simple questions', 'What are those?', 'Что это там?', 2, array['demonstratives','those','question_form']::text[], 'What are those?', 'Что это там?'),
      (25, 'phrase', 'simple questions', 'Are these your books?', 'Это твои книги?', 2, array['demonstratives','these','short_answer']::text[], 'Are these your books?', 'Это твои книги?'),
      (26, 'phrase', 'simple questions', 'Are those your toys?', 'Вон те игрушки твои?', 2, array['demonstratives','those','short_answer']::text[], 'Are those your toys?', 'Вон те игрушки твои?'),
      (27, 'phrase', 'simple questions', 'Whose books are these?', 'Чьи это книги?', 2, array['demonstratives','these','whose']::text[], 'Whose books are these?', 'Чьи это книги?'),
      (28, 'phrase', 'simple questions', 'Whose bags are those?', 'Чьи это сумки там?', 2, array['demonstratives','those','whose']::text[], 'Whose bags are those?', 'Чьи это сумки там?'),
      (29, 'grammar_pattern', 'grammar', 'These are my books. -> Are these your books?', 'Это мои книги. -> Это твои книги?', 2, array['demonstratives','question_form','these']::text[], 'These are my books.', 'Are these your books?'),
      (30, 'grammar_pattern', 'grammar', 'Those are your pencils. -> Are those your pencils?', 'Вон те твои карандаши. -> Вон те карандаши твои?', 2, array['demonstratives','question_form','those']::text[], 'Those are your pencils.', 'Are those your pencils?'),
      (31, 'grammar_pattern', 'grammar', 'These are apples. -> What are these?', 'Это яблоки. -> Что это?', 2, array['demonstratives','question_form','these']::text[], 'These are apples.', 'What are these?'),
      (32, 'grammar_pattern', 'grammar', 'Those are toys. -> What are those?', 'Вон те игрушки. -> Что это там?', 2, array['demonstratives','question_form','those']::text[], 'Those are toys.', 'What are those?'),
      (33, 'grammar_pattern', 'grammar', 'These are her shoes. -> Are these her shoes?', 'Это ее туфли. -> Это ее туфли?', 2, array['demonstratives','question_form','these']::text[], 'These are her shoes.', 'Are these her shoes?'),
      (34, 'grammar_pattern', 'grammar', 'Those are his bags. -> Are those his bags?', 'Вон те его сумки. -> Вон те его сумки?', 2, array['demonstratives','question_form','those']::text[], 'Those are his bags.', 'Are those his bags?'),
      (35, 'grammar_pattern', 'grammar', 'These are my pens. -> Whose pens are these?', 'Это мои ручки. -> Чьи это ручки?', 2, array['demonstratives','question_form','whose']::text[], 'These are my pens.', 'Whose pens are these?'),
      (36, 'grammar_pattern', 'grammar', 'Those are her pencils. -> Whose pencils are those?', 'Вон те ее карандаши. -> Чьи это карандаши там?', 2, array['demonstratives','question_form','whose']::text[], 'Those are her pencils.', 'Whose pencils are those?'),
      (37, 'grammar_pattern', 'grammar', 'This is my book. -> What is this?', 'Это моя книга. -> Что это?', 2, array['demonstratives','question_form','this']::text[], 'This is my book.', 'What is this?'),
      (38, 'grammar_pattern', 'grammar', 'That is my bag. -> What is that?', 'Вон та моя сумка. -> Что это там?', 2, array['demonstratives','question_form','that']::text[], 'That is my bag.', 'What is that?'),
      (39, 'grammar_pattern', 'simple questions', 'Are these your books? Yes, they are.', 'Это твои книги? Да.', 2, array['demonstratives','short_answer','these']::text[], 'Are these your books?', 'Yes, they are.'),
      (40, 'grammar_pattern', 'simple questions', 'Are these your books? No, they aren''t.', 'Это твои книги? Нет.', 2, array['demonstratives','short_answer','these']::text[], 'Are these your books?', 'No, they aren''t.'),
      (41, 'grammar_pattern', 'simple questions', 'Are those your pencils? Yes, they are.', 'Вон те карандаши твои? Да.', 2, array['demonstratives','short_answer','those']::text[], 'Are those your pencils?', 'Yes, they are.'),
      (42, 'grammar_pattern', 'simple questions', 'Are those your pencils? No, they aren''t.', 'Вон те карандаши твои? Нет.', 2, array['demonstratives','short_answer','those']::text[], 'Are those your pencils?', 'No, they aren''t.'),
      (43, 'grammar_pattern', 'simple questions', 'Are these apples? Yes, they are.', 'Это яблоки? Да.', 2, array['demonstratives','short_answer','these']::text[], 'Are these apples?', 'Yes, they are.'),
      (44, 'grammar_pattern', 'simple questions', 'Are those toys? No, they aren''t.', 'Вон те игрушки? Нет.', 2, array['demonstratives','short_answer','those']::text[], 'Are those toys?', 'No, they aren''t.'),
      (45, 'grammar_pattern', 'simple questions', 'These are my books.', 'Это мои книги.', 2, array['demonstratives','short_answer','these']::text[], 'Whose books are these?', 'These are my books.'),
      (46, 'grammar_pattern', 'simple questions', 'Those are her pencils.', 'Вон те ее карандаши.', 2, array['demonstratives','short_answer','those']::text[], 'Whose pencils are those?', 'Those are her pencils.'),
      (47, 'grammar_pattern', 'simple questions', 'These are apples.', 'Это яблоки.', 2, array['demonstratives','short_answer','these']::text[], 'What are these?', 'These are apples.'),
      (48, 'grammar_pattern', 'simple questions', 'Those are toys.', 'Вон те игрушки.', 2, array['demonstratives','short_answer','those']::text[], 'What are those?', 'Those are toys.'),
      (49, 'grammar_pattern', 'grammar', '___ are my books. Correct: These', 'Пропуск: These are my books.', 2, array['demonstratives','fill_the_gap','these']::text[], '___ are my books.', 'These'),
      (50, 'grammar_pattern', 'grammar', '___ are her pencils. Correct: Those', 'Пропуск: Those are her pencils.', 2, array['demonstratives','fill_the_gap','those']::text[], '___ are her pencils.', 'Those'),
      (51, 'grammar_pattern', 'grammar', 'What are ___? Correct: these', 'Пропуск: What are these?', 2, array['demonstratives','fill_the_gap','these']::text[], 'What are ___?', 'these'),
      (52, 'grammar_pattern', 'grammar', 'What are ___? Correct: those', 'Пропуск: What are those?', 2, array['demonstratives','fill_the_gap','those']::text[], 'What are ___?', 'those'),
      (53, 'grammar_pattern', 'grammar', '___ is my book. Correct: This', 'Пропуск: This is my book.', 2, array['demonstratives','fill_the_gap','this']::text[], '___ is my book.', 'This'),
      (54, 'grammar_pattern', 'grammar', '___ is her bag. Correct: That', 'Пропуск: That is her bag.', 2, array['demonstratives','fill_the_gap','that']::text[], '___ is her bag.', 'That'),
      (55, 'grammar_pattern', 'grammar', 'These ___ my books. Correct: are', 'Пропуск: These are my books.', 2, array['demonstratives','fill_the_gap','are']::text[], 'These ___ my books.', 'are'),
      (56, 'grammar_pattern', 'grammar', 'Those ___ her toys. Correct: are', 'Пропуск: Those are her toys.', 2, array['demonstratives','fill_the_gap','are']::text[], 'Those ___ her toys.', 'are'),
      (57, 'grammar_pattern', 'grammar', 'This ___ my pencil. Correct: is', 'Пропуск: This is my pencil.', 2, array['demonstratives','fill_the_gap','is']::text[], 'This ___ my pencil.', 'is'),
      (58, 'grammar_pattern', 'grammar', 'That ___ my ruler. Correct: is', 'Пропуск: That is my ruler.', 2, array['demonstratives','fill_the_gap','is']::text[], 'That ___ my ruler.', 'is'),
      (59, 'dialogue', 'simple questions', 'What are these?', 'These are my books.', 2, array['demonstratives','mini_dialogue','these']::text[], 'What are these?', 'These are my books.'),
      (60, 'dialogue', 'simple questions', 'What are those?', 'Those are her pencils.', 2, array['demonstratives','mini_dialogue','those']::text[], 'What are those?', 'Those are her pencils.'),
      (61, 'dialogue', 'simple questions', 'Are these your books?', 'Yes, they are.', 2, array['demonstratives','mini_dialogue','these']::text[], 'Are these your books?', 'Yes, they are.'),
      (62, 'dialogue', 'simple questions', 'Are those your toys?', 'No, they aren''t.', 2, array['demonstratives','mini_dialogue','those']::text[], 'Are those your toys?', 'No, they aren''t.')
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

  with seed_grammar(title, title_ru, pattern_key, pattern, explanation_ru, example_en, example_ru, affirmative_examples, negative_examples, question_examples, short_positive_answers, short_negative_answers, common_mistakes, exercise_templates) as (
    values (
      'This, that, these, those',
      'This / that / these / those - это, тот, эти, те',
      'demonstratives_this_that_these_those',
      'this/that + is; these/those + are',
      'Эти слова помогают показать предметы. This и these говорят о предметах рядом. That и those говорят о предметах далеко. This и that - для одного предмета. These и those - для нескольких предметов.',
      'These are my pencils.',
      'Это мои карандаши.',
      '["This is my book. - Это моя книга.", "That is my bag. - Вон та сумка моя.", "These are my pencils. - Это мои карандаши.", "Those are my books. - Вон те книги мои.", "These are apples. - Это яблоки.", "Those are toys. - Вон те игрушки."]'::jsonb,
      '["These are not my books.", "Those are not my pencils."]'::jsonb,
      '["What is this? - Что это?", "What is that? - Что это там?", "What are these? - Что это?", "What are those? - Что это там?", "Are these your books? - Это твои книги?", "Are those your pencils? - Вон те карандаши твои?", "Whose books are these? - Чьи это книги?", "Whose pencils are those? - Чьи это карандаши?"]'::jsonb,
      '["Yes, they are.", "Yes, these are my books.", "Yes, those are my pencils."]'::jsonb,
      '["No, they aren''t.", "No, these aren''t my books.", "No, those aren''t my pencils."]'::jsonb,
      '["Нельзя говорить \"these is\". Правильно: \"these are\".", "Нельзя говорить \"those is\". Правильно: \"those are\".", "These/those используются для нескольких предметов.", "This/that используются для одного предмета."]'::jsonb,
      '[{"type":"question_form","statement":"These are my books.","correctAnswer":"Are these your books?"},{"type":"question_form","statement":"Those are toys.","correctAnswer":"What are those?"},{"type":"short_answer","question":"Are these your books?","correctAnswer":"Yes, they are."},{"type":"fill_the_gap","prompt":"These ___ my books.","correctAnswer":"are"}]'::jsonb
    )
  ),
  updated as (
    update public.grammar_patterns gp
    set
      title = sg.title,
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
    where gp.family_id = v_family and gp.course_id = v_course and gp.pattern_key = sg.pattern_key
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
      where gp.family_id = v_family and gp.course_id = v_course and gp.pattern_key = sg.pattern_key
    )
    returning id
  )
  select count(*) into v_inserted_grammar from inserted;

  with seed_texts(title_en, title_ru, text_en, text_ru, topic, level, difficulty, tags, vocabulary_words, grammar_focus, comprehension_questions) as (
    values
      (
        'My school things',
        'Мои школьные вещи',
        'This is my bag. These are my books. These are my pencils. That is my ruler. Those are my crayons.',
        'Это моя сумка. Это мои книги. Это мои карандаши. Вон та линейка моя. Вон те мелки мои.',
        'classroom objects',
        'pre_a1',
        1,
        '["demonstratives", "school"]'::jsonb,
        '[{"english":"bag","russian":"сумка"},{"english":"books","russian":"книги"},{"english":"pencils","russian":"карандаши"},{"english":"crayons","russian":"мелки"}]'::jsonb,
        '["this", "that", "these", "those"]'::jsonb,
        '[{"type":"choose_answer","question":"What are these?","correctAnswer":"books","options":["books","dogs","shoes"],"explanationRu":"These показывает несколько предметов рядом."},{"type":"choose_answer","question":"What are those?","correctAnswer":"crayons","options":["crayons","apples","cats"],"explanationRu":"Those показывает несколько предметов далеко."},{"type":"true_false","question":"This is a bag.","correctAnswer":"True","options":["True","False"],"explanationRu":"В тексте сказано: This is my bag."}]'::jsonb
      ),
      (
        'In the classroom',
        'В классе',
        'This is my desk. These are my pens. That is the board. Those are the windows. I like my classroom.',
        'Это моя парта. Это мои ручки. Вон там доска. Вон там окна. Мне нравится мой класс.',
        'school',
        'pre_a1',
        1,
        '["demonstratives", "classroom"]'::jsonb,
        '[{"english":"desk","russian":"парта"},{"english":"pens","russian":"ручки"},{"english":"board","russian":"доска"},{"english":"windows","russian":"окна"}]'::jsonb,
        '["this", "that", "these", "those", "like"]'::jsonb,
        '[{"type":"choose_answer","question":"What are these?","correctAnswer":"pens","options":["pens","books","toys"],"explanationRu":"These are my pens: несколько ручек рядом."},{"type":"true_false","question":"That is the board.","correctAnswer":"True","options":["True","False"],"explanationRu":"That используется для одного предмета далеко."},{"type":"match_word_translation","question":"windows","correctAnswer":"окна","options":["окна","двери","книги"],"explanationRu":"Those are the windows: windows - окна."}]'::jsonb
      )
  )
  insert into public.topics (family_id, course_id, title)
  select distinct v_family, v_course, topic
  from seed_texts
  where not exists (
    select 1 from public.topics t where t.family_id = v_family and t.course_id = v_course and t.title = seed_texts.topic
  );

  with seed_texts(title_en, title_ru, text_en, text_ru, topic, level, difficulty, tags, vocabulary_words, grammar_focus, comprehension_questions) as (
    values
      (
        'My school things',
        'Мои школьные вещи',
        'This is my bag. These are my books. These are my pencils. That is my ruler. Those are my crayons.',
        'Это моя сумка. Это мои книги. Это мои карандаши. Вон та линейка моя. Вон те мелки мои.',
        'classroom objects',
        'pre_a1',
        1,
        '["demonstratives", "school"]'::jsonb,
        '[{"english":"bag","russian":"сумка"},{"english":"books","russian":"книги"},{"english":"pencils","russian":"карандаши"},{"english":"crayons","russian":"мелки"}]'::jsonb,
        '["this", "that", "these", "those"]'::jsonb,
        '[{"type":"choose_answer","question":"What are these?","correctAnswer":"books","options":["books","dogs","shoes"],"explanationRu":"These показывает несколько предметов рядом."},{"type":"choose_answer","question":"What are those?","correctAnswer":"crayons","options":["crayons","apples","cats"],"explanationRu":"Those показывает несколько предметов далеко."},{"type":"true_false","question":"This is a bag.","correctAnswer":"True","options":["True","False"],"explanationRu":"В тексте сказано: This is my bag."}]'::jsonb
      ),
      (
        'In the classroom',
        'В классе',
        'This is my desk. These are my pens. That is the board. Those are the windows. I like my classroom.',
        'Это моя парта. Это мои ручки. Вон там доска. Вон там окна. Мне нравится мой класс.',
        'school',
        'pre_a1',
        1,
        '["demonstratives", "classroom"]'::jsonb,
        '[{"english":"desk","russian":"парта"},{"english":"pens","russian":"ручки"},{"english":"board","russian":"доска"},{"english":"windows","russian":"окна"}]'::jsonb,
        '["this", "that", "these", "those", "like"]'::jsonb,
        '[{"type":"choose_answer","question":"What are these?","correctAnswer":"pens","options":["pens","books","toys"],"explanationRu":"These are my pens: несколько ручек рядом."},{"type":"true_false","question":"That is the board.","correctAnswer":"True","options":["True","False"],"explanationRu":"That используется для одного предмета далеко."},{"type":"match_word_translation","question":"windows","correctAnswer":"окна","options":["окна","двери","книги"],"explanationRu":"Those are the windows: windows - окна."}]'::jsonb
      )
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

  select count(*) into v_total_cards from public.cards where family_id = v_family and course_id = v_course and source_id = v_source;
  select count(*) into v_total_grammar from public.grammar_patterns where family_id = v_family and course_id = v_course and pattern_key = 'demonstratives_this_that_these_those';
  select count(*) into v_total_texts from public.learning_texts where family_id = v_family and course_id = v_course and source_id = v_source;

  return jsonb_build_object(
    'inserted_cards', v_inserted_cards,
    'existing_cards', greatest(v_total_cards - v_inserted_cards, 0),
    'total_cards', v_total_cards,
    'inserted_grammar_patterns', v_inserted_grammar,
    'total_grammar_patterns', v_total_grammar,
    'inserted_texts', v_inserted_texts,
    'existing_texts', greatest(v_total_texts - v_inserted_texts, 0),
    'total_texts', v_total_texts,
    'course_title', 'Grammar: Demonstratives'
  );
end;
$$;
