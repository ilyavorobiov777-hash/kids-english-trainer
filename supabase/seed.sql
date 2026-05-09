create or replace function public.seed_demo_content()
returns void
language plpgsql
security invoker
as $$
declare
  v_family uuid := public.current_family_id();
  v_course uuid;
  v_source uuid;
  v_unit uuid;
  v_lesson uuid;
  v_topic_words uuid;
  v_topic_phrases uuid;
  v_topic_grammar uuid;
  v_deck uuid;
begin
  if v_family is null then
    raise exception 'Sign in as a parent before running select public.seed_demo_content();';
  end if;

  insert into public.courses (family_id, title, description)
  values (v_family, 'Starter English', 'Минимальный демо-курс для MVP')
  returning id into v_course;

  insert into public.sources (family_id, course_id, title, kind)
  values (v_family, v_course, 'MVP seed', 'seed')
  returning id into v_source;

  insert into public.units (family_id, course_id, title, position)
  values (v_family, v_course, 'Unit 1: First words', 1)
  returning id into v_unit;

  insert into public.lessons (family_id, course_id, unit_id, title, position)
  values (v_family, v_course, v_unit, 'Lesson 1', 1)
  returning id into v_lesson;

  insert into public.topics (family_id, course_id, title)
  values (v_family, v_course, 'Слова')
  returning id into v_topic_words;

  insert into public.topics (family_id, course_id, title)
  values (v_family, v_course, 'Фразы')
  returning id into v_topic_phrases;

  insert into public.topics (family_id, course_id, title)
  values (v_family, v_course, 'Грамматика')
  returning id into v_topic_grammar;

  insert into public.decks (family_id, course_id, topic_id, title)
  values (v_family, v_course, v_topic_words, 'Starter deck')
  returning id into v_deck;

  insert into public.cards (family_id, course_id, source_id, unit_id, lesson_id, deck_id, topic_id, english, russian, type, difficulty, tags, example_en, example_ru, status)
  values
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'dog', 'собака', 'word', 1, '{animals}', 'I have got a dog.', 'У меня есть собака.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'cat', 'кошка', 'word', 1, '{animals}', 'The cat is little.', 'Кошка маленькая.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'pencil', 'карандаш', 'word', 1, '{school}', 'Have you got a pencil?', 'У тебя есть карандаш?', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'book', 'книга', 'word', 1, '{school}', 'This is a book.', 'Это книга.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'school', 'школа', 'word', 1, '{school}', 'I go to school.', 'Я хожу в школу.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'teacher', 'учитель', 'word', 2, '{school}', 'My teacher is kind.', 'Мой учитель добрый.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'friend', 'друг', 'word', 1, '{people}', 'He is my friend.', 'Он мой друг.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'mother', 'мама', 'word', 1, '{family}', 'My mother is happy.', 'Моя мама счастлива.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'father', 'папа', 'word', 1, '{family}', 'My father can run.', 'Мой папа умеет бегать.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'apple', 'яблоко', 'word', 1, '{food}', 'Would you like an apple?', 'Хочешь яблоко?', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'banana', 'банан', 'word', 1, '{food}', 'Do you like bananas?', 'Ты любишь бананы?', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'juice', 'сок', 'word', 1, '{food}', 'I would like some juice.', 'Я бы хотел немного сока.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'milk', 'молоко', 'word', 1, '{food}', 'Milk is white.', 'Молоко белое.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'water', 'вода', 'word', 1, '{food}', 'I drink water.', 'Я пью воду.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'red', 'красный', 'word', 1, '{colors}', 'The apple is red.', 'Яблоко красное.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'blue', 'синий', 'word', 1, '{colors}', 'The sky is blue.', 'Небо синее.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'green', 'зеленый', 'word', 1, '{colors}', 'The frog is green.', 'Лягушка зеленая.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'yellow', 'желтый', 'word', 1, '{colors}', 'The sun is yellow.', 'Солнце желтое.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'big', 'большой', 'word', 1, '{adjectives}', 'A big dog.', 'Большая собака.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'small', 'маленький', 'word', 1, '{adjectives}', 'A small cat.', 'Маленькая кошка.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'run', 'бегать', 'word', 1, '{actions}', 'I can run.', 'Я умею бегать.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'jump', 'прыгать', 'word', 1, '{actions}', 'Can you jump?', 'Ты умеешь прыгать?', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'swim', 'плавать', 'word', 1, '{actions}', 'I can swim.', 'Я умею плавать.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'read', 'читать', 'word', 1, '{actions}', 'I can read.', 'Я умею читать.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'write', 'писать', 'word', 1, '{actions}', 'I can write.', 'Я умею писать.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'happy', 'счастливый', 'word', 1, '{feelings}', 'I am happy.', 'Я счастлив.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'sad', 'грустный', 'word', 1, '{feelings}', 'She is sad.', 'Она грустная.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'house', 'дом', 'word', 1, '{home}', 'This is my house.', 'Это мой дом.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'room', 'комната', 'word', 1, '{home}', 'My room is small.', 'Моя комната маленькая.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_words, 'toy', 'игрушка', 'word', 1, '{home}', 'This is my toy.', 'Это моя игрушка.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_phrases, 'I have got a dog.', 'У меня есть собака.', 'phrase', 2, '{have got}', null, null, 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_phrases, 'Have you got a pencil?', 'У тебя есть карандаш?', 'phrase', 2, '{have got,school}', null, null, 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_phrases, 'I can swim.', 'Я умею плавать.', 'phrase', 2, '{can,actions}', null, null, 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_phrases, 'Can you jump?', 'Ты умеешь прыгать?', 'phrase', 2, '{can,actions}', null, null, 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_phrases, 'I like apples.', 'Я люблю яблоки.', 'phrase', 2, '{like,food}', null, null, 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_phrases, 'Do you like bananas?', 'Ты любишь бананы?', 'phrase', 2, '{like,food}', null, null, 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_phrases, 'I would like some juice.', 'Я бы хотел немного сока.', 'phrase', 3, '{would like,food}', null, null, 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_phrases, 'Would you like an apple?', 'Хочешь яблоко?', 'phrase', 3, '{would like,articles}', null, null, 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_phrases, 'Yes, please.', 'Да, пожалуйста.', 'phrase', 1, '{polite}', null, null, 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_phrases, 'No, thank you.', 'Нет, спасибо.', 'phrase', 1, '{polite}', null, null, 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_grammar, 'have got', 'иметь, у меня есть', 'grammar_pattern', 2, '{grammar}', 'I have got a dog.', 'У меня есть собака.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_grammar, 'can', 'уметь, мочь', 'grammar_pattern', 2, '{grammar}', 'I can swim.', 'Я умею плавать.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_grammar, 'like', 'любить, нравиться', 'grammar_pattern', 2, '{grammar}', 'I like apples.', 'Я люблю яблоки.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_grammar, 'would like', 'хотел бы', 'grammar_pattern', 3, '{grammar}', 'I would like some juice.', 'Я бы хотел немного сока.', 'active'),
    (v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic_grammar, 'articles a / an / the', 'артикли a / an / the', 'grammar_pattern', 3, '{grammar,articles}', 'Would you like an apple?', 'Хочешь яблоко?', 'active');

  insert into public.grammar_patterns (family_id, course_id, title, pattern, explanation_ru, example_en, example_ru)
  values
    (v_family, v_course, 'have got', 'I/you/we/they have got; he/she has got', 'Говорим, что у кого-то что-то есть.', 'I have got a dog.', 'У меня есть собака.'),
    (v_family, v_course, 'can', 'can + verb', 'Говорим, что кто-то умеет или может что-то делать.', 'I can swim.', 'Я умею плавать.'),
    (v_family, v_course, 'like', 'like + plural noun / -ing', 'Говорим, что нам что-то нравится.', 'I like apples.', 'Я люблю яблоки.'),
    (v_family, v_course, 'would like', 'would like + noun', 'Вежливо просим или говорим, что хотели бы.', 'I would like some juice.', 'Я бы хотел немного сока.'),
    (v_family, v_course, 'articles a / an / the', 'a dog, an apple, the sun', 'A/an для одного предмета, the для знакомого или единственного.', 'Would you like an apple?', 'Хочешь яблоко?');
end;
$$;
