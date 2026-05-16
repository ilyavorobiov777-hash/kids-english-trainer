create or replace function public.seed_pronouns_content()
returns jsonb
language plpgsql
security invoker
as $function$
declare
  v_family uuid := public.current_family_id();
  v_course uuid;
  v_source uuid;
  v_unit uuid;
  v_lesson uuid;
  v_deck uuid;
  v_topic uuid;
  v_item jsonb;
  v_row_count int := 0;
  v_inserted_cards int := 0;
  v_total_cards int := 0;
  v_inserted_grammar int := 0;
  v_total_grammar int := 0;
  v_inserted_texts int := 0;
  v_total_texts int := 0;
  v_cards jsonb := $json$
[
  {"type":"word","topic":"pronouns","english":"I","russian":"я","tags":["personal_pronouns","pronouns"],"example_en":"I am eight.","example_ru":"Мне восемь."},
  {"type":"word","topic":"pronouns","english":"you","russian":"ты / вы","tags":["personal_pronouns","pronouns"],"example_en":"You are my friend.","example_ru":"Ты мой друг."},
  {"type":"word","topic":"pronouns","english":"he","russian":"он","tags":["personal_pronouns","pronouns"],"example_en":"He is my brother.","example_ru":"Он мой брат."},
  {"type":"word","topic":"pronouns","english":"she","russian":"она","tags":["personal_pronouns","pronouns"],"example_en":"She is my sister.","example_ru":"Она моя сестра."},
  {"type":"word","topic":"pronouns","english":"it","russian":"оно / это","tags":["personal_pronouns","pronouns"],"example_en":"It is a cat.","example_ru":"Это кошка."},
  {"type":"word","topic":"pronouns","english":"we","russian":"мы","tags":["personal_pronouns","pronouns"],"example_en":"We are pupils.","example_ru":"Мы ученики."},
  {"type":"word","topic":"pronouns","english":"they","russian":"они","tags":["personal_pronouns","pronouns"],"example_en":"They are happy.","example_ru":"Они счастливы."},
  {"type":"word","topic":"pronouns","english":"my","russian":"мой / моя / мое / мои","tags":["possessive_adjectives","pronouns"],"example_en":"my book","example_ru":"моя книга"},
  {"type":"word","topic":"pronouns","english":"your","russian":"твой / ваш","tags":["possessive_adjectives","pronouns"],"example_en":"your pencil","example_ru":"твой карандаш"},
  {"type":"word","topic":"pronouns","english":"his","russian":"его","tags":["possessive_adjectives","pronouns"],"example_en":"his dog","example_ru":"его собака"},
  {"type":"word","topic":"pronouns","english":"her","russian":"ее","tags":["possessive_adjectives","pronouns"],"example_en":"her bag","example_ru":"ее сумка"},
  {"type":"word","topic":"pronouns","english":"its","russian":"его / ее для животного или предмета","tags":["possessive_adjectives","pronouns"],"example_en":"its tail","example_ru":"его хвост"},
  {"type":"word","topic":"pronouns","english":"our","russian":"наш","tags":["possessive_adjectives","pronouns"],"example_en":"our classroom","example_ru":"наш класс"},
  {"type":"word","topic":"pronouns","english":"their","russian":"их","tags":["possessive_adjectives","pronouns"],"example_en":"their toys","example_ru":"их игрушки"},

  {"type":"phrase","topic":"pronouns","english":"my book","russian":"моя книга","tags":["possessive_adjectives","pronouns"],"example_en":"This is my book.","example_ru":"Это моя книга."},
  {"type":"phrase","topic":"pronouns","english":"your pencil","russian":"твой карандаш","tags":["possessive_adjectives","pronouns"],"example_en":"This is your pencil.","example_ru":"Это твой карандаш."},
  {"type":"phrase","topic":"pronouns","english":"his dog","russian":"его собака","tags":["possessive_adjectives","pronouns"],"example_en":"This is his dog.","example_ru":"Это его собака."},
  {"type":"phrase","topic":"pronouns","english":"her bag","russian":"ее сумка","tags":["possessive_adjectives","pronouns"],"example_en":"This is her bag.","example_ru":"Это ее сумка."},
  {"type":"phrase","topic":"pronouns","english":"our classroom","russian":"наш класс","tags":["possessive_adjectives","pronouns"],"example_en":"This is our classroom.","example_ru":"Это наш класс."},
  {"type":"phrase","topic":"pronouns","english":"their toys","russian":"их игрушки","tags":["possessive_adjectives","pronouns"],"example_en":"These are their toys.","example_ru":"Это их игрушки."},
  {"type":"phrase","topic":"family","english":"my sister","russian":"моя сестра","tags":["possessive_adjectives","family"],"example_en":"She is my sister.","example_ru":"Она моя сестра."},
  {"type":"phrase","topic":"family","english":"his brother","russian":"его брат","tags":["possessive_adjectives","family"],"example_en":"He is his brother.","example_ru":"Он его брат."},
  {"type":"phrase","topic":"clothes","english":"her dress","russian":"ее платье","tags":["possessive_adjectives","clothes"],"example_en":"Her dress is red.","example_ru":"Ее платье красное."},
  {"type":"phrase","topic":"school","english":"their books","russian":"их книги","tags":["possessive_adjectives","school"],"example_en":"Their books are on the table.","example_ru":"Их книги на столе."},
  {"type":"phrase","topic":"school","english":"our school","russian":"наша школа","tags":["possessive_adjectives","school"],"example_en":"Our school is big.","example_ru":"Наша школа большая."},
  {"type":"phrase","topic":"family","english":"your friend","russian":"твой друг","tags":["possessive_adjectives","family"],"example_en":"You are my friend.","example_ru":"Ты мой друг."},

  {"type":"sentence","topic":"pronouns","english":"I am eight.","russian":"Мне восемь.","tags":["personal_pronouns","to be"],"example_en":"I am eight.","example_ru":"Мне восемь."},
  {"type":"sentence","topic":"pronouns","english":"You are my friend.","russian":"Ты мой друг.","tags":["personal_pronouns","possessive_adjectives"],"example_en":"You are my friend.","example_ru":"Ты мой друг."},
  {"type":"sentence","topic":"family","english":"He is my brother.","russian":"Он мой брат.","tags":["personal_pronouns","family"],"example_en":"He is my brother.","example_ru":"Он мой брат."},
  {"type":"sentence","topic":"family","english":"She is my sister.","russian":"Она моя сестра.","tags":["personal_pronouns","family"],"example_en":"She is my sister.","example_ru":"Она моя сестра."},
  {"type":"sentence","topic":"animals","english":"It is a cat.","russian":"Это кошка.","tags":["personal_pronouns","animals"],"example_en":"It is a cat.","example_ru":"Это кошка."},
  {"type":"sentence","topic":"school","english":"We are pupils.","russian":"Мы ученики.","tags":["personal_pronouns","school"],"example_en":"We are pupils.","example_ru":"Мы ученики."},
  {"type":"sentence","topic":"feelings","english":"They are happy.","russian":"Они счастливы.","tags":["personal_pronouns","feelings"],"example_en":"They are happy.","example_ru":"Они счастливы."},
  {"type":"sentence","topic":"school","english":"This is my book.","russian":"Это моя книга.","tags":["possessive_adjectives","demonstratives"],"example_en":"This is my book.","example_ru":"Это моя книга."},
  {"type":"sentence","topic":"school","english":"This is your pencil.","russian":"Это твой карандаш.","tags":["possessive_adjectives","demonstratives"],"example_en":"This is your pencil.","example_ru":"Это твой карандаш."},
  {"type":"sentence","topic":"animals","english":"This is his dog.","russian":"Это его собака.","tags":["possessive_adjectives","animals"],"example_en":"This is his dog.","example_ru":"Это его собака."},
  {"type":"sentence","topic":"school","english":"This is her bag.","russian":"Это ее сумка.","tags":["possessive_adjectives","school"],"example_en":"This is her bag.","example_ru":"Это ее сумка."},
  {"type":"sentence","topic":"school","english":"This is our classroom.","russian":"Это наш класс.","tags":["possessive_adjectives","school"],"example_en":"This is our classroom.","example_ru":"Это наш класс."},
  {"type":"sentence","topic":"toys","english":"These are their toys.","russian":"Это их игрушки.","tags":["possessive_adjectives","demonstratives"],"example_en":"These are their toys.","example_ru":"Это их игрушки."},
  {"type":"sentence","topic":"animals","english":"My cat is black.","russian":"Моя кошка черная.","tags":["possessive_adjectives","animals"],"example_en":"My cat is black.","example_ru":"Моя кошка черная."},
  {"type":"sentence","topic":"clothes","english":"Her dress is red.","russian":"Ее платье красное.","tags":["possessive_adjectives","clothes"],"example_en":"Her dress is red.","example_ru":"Ее платье красное."},
  {"type":"sentence","topic":"clothes","english":"His shoes are blue.","russian":"Его туфли синие.","tags":["possessive_adjectives","clothes"],"example_en":"His shoes are blue.","example_ru":"Его туфли синие."},
  {"type":"sentence","topic":"school","english":"Their books are on the table.","russian":"Их книги на столе.","tags":["possessive_adjectives","prepositions"],"example_en":"Their books are on the table.","example_ru":"Их книги на столе."},
  {"type":"sentence","topic":"school","english":"Our school is big.","russian":"Наша школа большая.","tags":["possessive_adjectives","school"],"example_en":"Our school is big.","example_ru":"Наша школа большая."},

  {"type":"phrase","topic":"simple questions","english":"Are you happy?","russian":"Ты счастлив?","tags":["personal_pronouns","question_form","short_answer"],"example_en":"Are you happy?","example_ru":"Ты счастлив?"},
  {"type":"phrase","topic":"simple questions","english":"Is he your brother?","russian":"Он твой брат?","tags":["personal_pronouns","possessive_adjectives","question_form","short_answer"],"example_en":"Is he your brother?","example_ru":"Он твой брат?"},
  {"type":"phrase","topic":"simple questions","english":"Is she your sister?","russian":"Она твоя сестра?","tags":["personal_pronouns","possessive_adjectives","question_form","short_answer"],"example_en":"Is she your sister?","example_ru":"Она твоя сестра?"},
  {"type":"phrase","topic":"simple questions","english":"Is it a dog?","russian":"Это собака?","tags":["personal_pronouns","question_form","short_answer"],"example_en":"Is it a dog?","example_ru":"Это собака?"},
  {"type":"phrase","topic":"simple questions","english":"Are they pupils?","russian":"Они ученики?","tags":["personal_pronouns","question_form","short_answer"],"example_en":"Are they pupils?","example_ru":"Они ученики?"},
  {"type":"phrase","topic":"simple questions","english":"Is this your book?","russian":"Это твоя книга?","tags":["possessive_adjectives","question_form","short_answer"],"example_en":"Is this your book?","example_ru":"Это твоя книга?"},
  {"type":"phrase","topic":"simple questions","english":"Is this his pencil?","russian":"Это его карандаш?","tags":["possessive_adjectives","question_form","short_answer"],"example_en":"Is this his pencil?","example_ru":"Это его карандаш?"},
  {"type":"phrase","topic":"simple questions","english":"Is this her bag?","russian":"Это ее сумка?","tags":["possessive_adjectives","question_form","short_answer"],"example_en":"Is this her bag?","example_ru":"Это ее сумка?"},
  {"type":"phrase","topic":"simple questions","english":"Are these your toys?","russian":"Это твои игрушки?","tags":["possessive_adjectives","demonstratives","question_form","short_answer"],"example_en":"Are these your toys?","example_ru":"Это твои игрушки?"},
  {"type":"phrase","topic":"simple questions","english":"Are those their books?","russian":"Вон те их книги?","tags":["possessive_adjectives","demonstratives","question_form","short_answer"],"example_en":"Are those their books?","example_ru":"Вон те их книги?"},
  {"type":"phrase","topic":"simple questions","english":"Whose book is this?","russian":"Чья это книга?","tags":["possessive_adjectives","question_form","short_answer"],"example_en":"Whose book is this?","example_ru":"Чья это книга?"},
  {"type":"phrase","topic":"simple questions","english":"Whose pencils are these?","russian":"Чьи это карандаши?","tags":["possessive_adjectives","demonstratives","question_form","short_answer"],"example_en":"Whose pencils are these?","example_ru":"Чьи это карандаши?"},

  {"type":"grammar_pattern","topic":"simple questions","english":"Yes, I am.","russian":"Да.","tags":["personal_pronouns","short_answer"],"example_en":"Are you happy?","example_ru":"Yes, I am."},
  {"type":"grammar_pattern","topic":"simple questions","english":"No, I am not.","russian":"Нет.","tags":["personal_pronouns","short_answer"],"example_en":"Are you happy?","example_ru":"No, I am not."},
  {"type":"grammar_pattern","topic":"simple questions","english":"Yes, he is.","russian":"Да.","tags":["personal_pronouns","short_answer"],"example_en":"Is he your brother?","example_ru":"Yes, he is."},
  {"type":"grammar_pattern","topic":"simple questions","english":"No, he isn't.","russian":"Нет.","tags":["personal_pronouns","short_answer"],"example_en":"Is he your brother?","example_ru":"No, he isn't."},
  {"type":"grammar_pattern","topic":"simple questions","english":"Yes, she is.","russian":"Да.","tags":["personal_pronouns","short_answer"],"example_en":"Is she your sister?","example_ru":"Yes, she is."},
  {"type":"grammar_pattern","topic":"simple questions","english":"No, she isn't.","russian":"Нет.","tags":["personal_pronouns","short_answer"],"example_en":"Is she your sister?","example_ru":"No, she isn't."},
  {"type":"grammar_pattern","topic":"simple questions","english":"Yes, it is.","russian":"Да.","tags":["personal_pronouns","short_answer"],"example_en":"Is it a dog?","example_ru":"Yes, it is."},
  {"type":"grammar_pattern","topic":"simple questions","english":"No, it isn't.","russian":"Нет.","tags":["personal_pronouns","short_answer"],"example_en":"Is it a dog?","example_ru":"No, it isn't."},
  {"type":"grammar_pattern","topic":"simple questions","english":"Yes, they are.","russian":"Да.","tags":["personal_pronouns","short_answer"],"example_en":"Are they pupils?","example_ru":"Yes, they are."},
  {"type":"grammar_pattern","topic":"simple questions","english":"No, they aren't.","russian":"Нет.","tags":["personal_pronouns","short_answer"],"example_en":"Are they pupils?","example_ru":"No, they aren't."},

  {"type":"grammar_pattern","topic":"pronouns","english":"___ am eight. Correct: I","russian":"Пропуск: I am eight.","tags":["personal_pronouns","fill_the_gap"],"example_en":"___ am eight.","example_ru":"I"},
  {"type":"grammar_pattern","topic":"pronouns","english":"___ is my brother. Correct: He","russian":"Пропуск: He is my brother.","tags":["personal_pronouns","fill_the_gap"],"example_en":"___ is my brother.","example_ru":"He"},
  {"type":"grammar_pattern","topic":"pronouns","english":"___ is my sister. Correct: She","russian":"Пропуск: She is my sister.","tags":["personal_pronouns","fill_the_gap"],"example_en":"___ is my sister.","example_ru":"She"},
  {"type":"grammar_pattern","topic":"pronouns","english":"___ are pupils. Correct: We","russian":"Пропуск: We are pupils.","tags":["personal_pronouns","fill_the_gap"],"example_en":"___ are pupils.","example_ru":"We"},
  {"type":"grammar_pattern","topic":"pronouns","english":"___ are happy. Correct: They","russian":"Пропуск: They are happy.","tags":["personal_pronouns","fill_the_gap"],"example_en":"___ are happy.","example_ru":"They"},
  {"type":"grammar_pattern","topic":"pronouns","english":"This is ___ book. Correct: my","russian":"Пропуск: This is my book.","tags":["possessive_adjectives","fill_the_gap"],"example_en":"This is ___ book.","example_ru":"my"},
  {"type":"grammar_pattern","topic":"pronouns","english":"This is ___ pencil. Correct: your","russian":"Пропуск: This is your pencil.","tags":["possessive_adjectives","fill_the_gap"],"example_en":"This is ___ pencil.","example_ru":"your"},
  {"type":"grammar_pattern","topic":"pronouns","english":"This is ___ dog. Correct: his","russian":"Пропуск: This is his dog.","tags":["possessive_adjectives","fill_the_gap"],"example_en":"This is ___ dog.","example_ru":"his"},
  {"type":"grammar_pattern","topic":"pronouns","english":"This is ___ bag. Correct: her","russian":"Пропуск: This is her bag.","tags":["possessive_adjectives","fill_the_gap"],"example_en":"This is ___ bag.","example_ru":"her"},
  {"type":"grammar_pattern","topic":"pronouns","english":"These are ___ toys. Correct: their","russian":"Пропуск: These are their toys.","tags":["possessive_adjectives","fill_the_gap"],"example_en":"These are ___ toys.","example_ru":"their"},
  {"type":"grammar_pattern","topic":"pronouns","english":"This is ___ classroom. Correct: our","russian":"Пропуск: This is our classroom.","tags":["possessive_adjectives","fill_the_gap"],"example_en":"This is ___ classroom.","example_ru":"our"},

  {"type":"grammar_pattern","topic":"pronouns","english":"I / am / eight","russian":"Собери: I am eight.","tags":["personal_pronouns","build_sentence"],"example_en":"I am eight.","example_ru":"Мне восемь."},
  {"type":"grammar_pattern","topic":"pronouns","english":"He / is / my / brother","russian":"Собери: He is my brother.","tags":["personal_pronouns","build_sentence"],"example_en":"He is my brother.","example_ru":"Он мой брат."},
  {"type":"grammar_pattern","topic":"pronouns","english":"She / is / my / sister","russian":"Собери: She is my sister.","tags":["personal_pronouns","build_sentence"],"example_en":"She is my sister.","example_ru":"Она моя сестра."},
  {"type":"grammar_pattern","topic":"pronouns","english":"This / is / my / book","russian":"Собери: This is my book.","tags":["possessive_adjectives","build_sentence"],"example_en":"This is my book.","example_ru":"Это моя книга."},
  {"type":"grammar_pattern","topic":"pronouns","english":"These / are / their / toys","russian":"Собери: These are their toys.","tags":["possessive_adjectives","build_sentence"],"example_en":"These are their toys.","example_ru":"Это их игрушки."},
  {"type":"grammar_pattern","topic":"pronouns","english":"Is / this / your / pencil","russian":"Собери: Is this your pencil?","tags":["possessive_adjectives","build_sentence"],"example_en":"Is this your pencil?","example_ru":"Это твой карандаш?"},
  {"type":"grammar_pattern","topic":"pronouns","english":"Are / these / your / books","russian":"Собери: Are these your books?","tags":["possessive_adjectives","build_sentence"],"example_en":"Are these your books?","example_ru":"Это твои книги?"},
  {"type":"grammar_pattern","topic":"pronouns","english":"Whose / book / is / this","russian":"Собери: Whose book is this?","tags":["possessive_adjectives","build_sentence"],"example_en":"Whose book is this?","example_ru":"Чья это книга?"}
]
$json$::jsonb;
  v_patterns jsonb := $json$
[
  {
    "title":"Personal pronouns",
    "title_ru":"Личные местоимения: I, you, he, she, it, we, they",
    "pattern_key":"personal_pronouns",
    "pattern":"I am; you/we/they are; he/she/it is",
    "explanation_ru":"Личные местоимения заменяют имена людей, животных или предметы. I - я, you - ты/вы, he - он, she - она, it - оно/это для животного или предмета, we - мы, they - они.",
    "example_en":"I am eight.",
    "example_ru":"Мне восемь.",
    "affirmative_examples":["I am eight. - Мне восемь.","You are my friend. - Ты мой друг.","He is my brother. - Он мой брат.","She is my sister. - Она моя сестра.","It is a cat. - Это кошка.","We are pupils. - Мы ученики.","They are happy. - Они счастливы."],
    "negative_examples":["I am not sad.","He is not my brother.","They are not sad."],
    "question_examples":["Am I right? - Я прав?","Are you happy? - Ты счастлив?","Is he your brother? - Он твой брат?","Is she your sister? - Она твоя сестра?","Is it a dog? - Это собака?","Are we friends? - Мы друзья?","Are they pupils? - Они ученики?"],
    "short_positive_answers":["Yes, I am.","Yes, you are.","Yes, he is.","Yes, she is.","Yes, it is.","Yes, we are.","Yes, they are."],
    "short_negative_answers":["No, I am not.","No, you aren't.","No, he isn't.","No, she isn't.","No, it isn't.","No, we aren't.","No, they aren't."],
    "common_mistakes":["I всегда пишется с большой буквы.","He - мальчик/мужчина, she - девочка/женщина.","It - предмет или животное, если мы не называем мальчик/девочка.","They - несколько людей, животных или предметов.","После I используется am: I am.","После he/she/it используется is: he is, she is, it is.","После you/we/they используется are: you are, we are, they are."],
    "exercise_templates":[{"type":"fill_the_gap","prompt":"___ am eight.","correctAnswer":"I"},{"type":"question_form","statement":"He is my brother.","correctAnswer":"Is he your brother?"},{"type":"short_answer","question":"Are they pupils?","correctAnswer":"Yes, they are."}]
  },
  {
    "title":"Possessive words: my, your, his, her, our, their",
    "title_ru":"Притяжательные слова: my, your, his, her, our, their",
    "pattern_key":"possessive_adjectives",
    "pattern":"I -> my; you -> your; he -> his; she -> her; it -> its; we -> our; they -> their",
    "explanation_ru":"Эти слова показывают, кому принадлежит предмет. My - мой, your - твой/ваш, his - его, her - ее, its - его/ее для животного или предмета, our - наш, their - их. После них обычно идет предмет: my book, your pencil, his dog, her bag.",
    "example_en":"This is my book.",
    "example_ru":"Это моя книга.",
    "affirmative_examples":["This is my book. - Это моя книга.","This is your pencil. - Это твой карандаш.","This is his dog. - Это его собака.","This is her bag. - Это ее сумка.","This is our classroom. - Это наш класс.","These are their toys. - Это их игрушки.","My cat is black. - Моя кошка черная.","Her dress is red. - Ее платье красное.","His shoes are blue. - Его туфли синие."],
    "negative_examples":["This is not my book.","These are not their toys."],
    "question_examples":["Is this your book? - Это твоя книга?","Is this his pencil? - Это его карандаш?","Is this her bag? - Это ее сумка?","Are these your toys? - Это твои игрушки?","Are those their books? - Вон те их книги?","Whose book is this? - Чья это книга?","Whose pencils are these? - Чьи это карандаши?"],
    "short_positive_answers":["Yes, it is.","Yes, they are.","It is my book.","They are her pencils.","These are our toys.","Those are their bags."],
    "short_negative_answers":["No, it isn't.","No, they aren't.","It is not my book.","They are not her pencils."],
    "common_mistakes":["После my/your/his/her/our/their нужен предмет: my book, her bag.","Нельзя говорить I book. Правильно: my book.","His - его, her - ее.","Their - их, для нескольких людей.","Your может значить твой или ваш.","Our - наш.","Its - его/ее для животного или предмета, но для 2 класса не перегружаем."],
    "exercise_templates":[{"type":"fill_the_gap","prompt":"This is ___ book.","correctAnswer":"my"},{"type":"question_form","statement":"This is your book.","correctAnswer":"Is this your book?"},{"type":"short_answer","question":"Whose book is this?","correctAnswer":"It is my book."}]
  }
]
$json$::jsonb;
  v_texts jsonb := $json$
[
  {
    "title_en":"My family",
    "title_ru":"Моя семья",
    "topic":"family",
    "text_en":"I am Anna. This is my mum. This is my dad. He is kind. She is funny. We are happy.",
    "text_ru":"Я Аня. Это моя мама. Это мой папа. Он добрый. Она веселая. Мы счастливы.",
    "level":"pre_a1",
    "difficulty":1,
    "tags":["personal_pronouns","possessive_adjectives","family"],
    "vocabulary_words":[{"english":"I","russian":"я"},{"english":"my","russian":"мой / моя"},{"english":"he","russian":"он"},{"english":"she","russian":"она"},{"english":"we","russian":"мы"}],
    "grammar_focus":["personal_pronouns","possessive_adjectives","to be"],
    "comprehension_questions":[{"type":"choose_answer","question":"Who is Anna?","correctAnswer":"a girl","options":["a girl","a dog","a teacher"],"explanationRu":"В тексте Anna говорит о своей семье."},{"type":"choose_answer","question":"Who is kind?","correctAnswer":"dad","options":["dad","mum","cat"],"explanationRu":"He is kind. Здесь he говорит о dad."},{"type":"choose_answer","question":"Are they happy?","correctAnswer":"Yes, they are.","options":["Yes, they are.","No, they aren't.","Yes, he is."],"explanationRu":"We are happy значит мы счастливы."}]
  },
  {
    "title_en":"Our classroom",
    "title_ru":"Наш класс",
    "topic":"classroom objects",
    "text_en":"This is our classroom. These are our desks. This is my book. That is her bag. Their pencils are on the table.",
    "text_ru":"Это наш класс. Это наши парты. Это моя книга. Вон та ее сумка. Их карандаши на столе.",
    "level":"pre_a1",
    "difficulty":1,
    "tags":["possessive_adjectives","personal_pronouns","classroom"],
    "vocabulary_words":[{"english":"our","russian":"наш"},{"english":"my","russian":"мой / моя"},{"english":"her","russian":"ее"},{"english":"their","russian":"их"},{"english":"classroom","russian":"класс"}],
    "grammar_focus":["possessive_adjectives","demonstratives_this_that_these_those"],
    "comprehension_questions":[{"type":"choose_answer","question":"What is this?","correctAnswer":"our classroom","options":["our classroom","our kitchen","our park"],"explanationRu":"Первое предложение: This is our classroom."},{"type":"choose_answer","question":"Whose book is this?","correctAnswer":"my book","options":["my book","his dog","her bag"],"explanationRu":"В тексте есть: This is my book."},{"type":"choose_answer","question":"Where are their pencils?","correctAnswer":"on the table","options":["on the table","under the chair","in the bag"],"explanationRu":"Their pencils are on the table."}]
  }
]
$json$::jsonb;
begin
  if v_family is null then
    raise exception 'Sign in as a parent before running select public.seed_pronouns_content();';
  end if;

  if public.current_user_role() <> 'parent' then
    raise exception 'Only parent accounts can add pronouns content.';
  end if;

  insert into public.courses (family_id, title, description)
  select v_family, 'Grammar: Pronouns', 'Idempotent personal pronouns and possessive adjectives extension'
  where not exists (
    select 1 from public.courses where family_id = v_family and title = 'Grammar: Pronouns'
  );
  select id into v_course from public.courses where family_id = v_family and title = 'Grammar: Pronouns' limit 1;

  insert into public.sources (family_id, course_id, title, kind)
  select v_family, v_course, 'Pronouns generated seed', 'seed'
  where not exists (
    select 1 from public.sources where family_id = v_family and course_id = v_course and title = 'Pronouns generated seed'
  );
  select id into v_source from public.sources where family_id = v_family and course_id = v_course and title = 'Pronouns generated seed' limit 1;

  insert into public.units (family_id, course_id, title, position)
  select v_family, v_course, 'Pronouns', 1
  where not exists (
    select 1 from public.units where family_id = v_family and course_id = v_course and title = 'Pronouns'
  );
  select id into v_unit from public.units where family_id = v_family and course_id = v_course and title = 'Pronouns' limit 1;

  insert into public.lessons (family_id, course_id, unit_id, title, position)
  select v_family, v_course, v_unit, 'Personal and possessive pronouns', 1
  where not exists (
    select 1 from public.lessons where family_id = v_family and course_id = v_course and title = 'Personal and possessive pronouns'
  );
  select id into v_lesson from public.lessons where family_id = v_family and course_id = v_course and title = 'Personal and possessive pronouns' limit 1;

  insert into public.decks (family_id, course_id, title)
  select v_family, v_course, 'Pronouns practice deck'
  where not exists (
    select 1 from public.decks where family_id = v_family and course_id = v_course and title = 'Pronouns practice deck'
  );
  select id into v_deck from public.decks where family_id = v_family and course_id = v_course and title = 'Pronouns practice deck' limit 1;

  for v_item in select value from jsonb_array_elements(v_cards)
  loop
    insert into public.topics (family_id, course_id, title)
    select v_family, v_course, v_item ->> 'topic'
    where not exists (
      select 1 from public.topics where family_id = v_family and course_id = v_course and title = v_item ->> 'topic'
    );
    select id into v_topic from public.topics where family_id = v_family and course_id = v_course and title = v_item ->> 'topic' limit 1;

    insert into public.cards (
      family_id, course_id, source_id, unit_id, lesson_id, deck_id, topic_id,
      english, russian, type, difficulty, tags, example_en, example_ru, status
    )
    select
      v_family, v_course, v_source, v_unit, v_lesson, v_deck, v_topic,
      v_item ->> 'english',
      v_item ->> 'russian',
      (v_item ->> 'type')::public.card_type,
      coalesce((v_item ->> 'difficulty')::int, 2),
      array(select jsonb_array_elements_text(coalesce(v_item -> 'tags', '[]'::jsonb))),
      nullif(v_item ->> 'example_en', ''),
      nullif(v_item ->> 'example_ru', ''),
      'active'::public.card_status
    where not exists (
      select 1
      from public.cards existing
      where existing.family_id = v_family
        and existing.course_id = v_course
        and existing.source_id = v_source
        and lower(existing.english) = lower(v_item ->> 'english')
        and existing.type = (v_item ->> 'type')::public.card_type
    );
    get diagnostics v_row_count = row_count;
    v_inserted_cards := v_inserted_cards + v_row_count;
  end loop;

  for v_item in select value from jsonb_array_elements(v_patterns)
  loop
    update public.grammar_patterns gp
    set
      title = v_item ->> 'title',
      title_ru = v_item ->> 'title_ru',
      pattern_key = v_item ->> 'pattern_key',
      pattern = v_item ->> 'pattern',
      explanation_ru = v_item ->> 'explanation_ru',
      example_en = v_item ->> 'example_en',
      example_ru = v_item ->> 'example_ru',
      affirmative_examples = v_item -> 'affirmative_examples',
      negative_examples = v_item -> 'negative_examples',
      question_examples = v_item -> 'question_examples',
      short_positive_answers = v_item -> 'short_positive_answers',
      short_negative_answers = v_item -> 'short_negative_answers',
      common_mistakes = v_item -> 'common_mistakes',
      exercise_templates = v_item -> 'exercise_templates'
    where gp.family_id = v_family and gp.course_id = v_course and gp.pattern_key = v_item ->> 'pattern_key';
    get diagnostics v_row_count = row_count;

    if v_row_count = 0 then
      insert into public.grammar_patterns (
        family_id, course_id, title, title_ru, pattern_key, pattern, explanation_ru, example_en, example_ru,
        affirmative_examples, negative_examples, question_examples, short_positive_answers, short_negative_answers, common_mistakes, exercise_templates
      )
      values (
        v_family,
        v_course,
        v_item ->> 'title',
        v_item ->> 'title_ru',
        v_item ->> 'pattern_key',
        v_item ->> 'pattern',
        v_item ->> 'explanation_ru',
        v_item ->> 'example_en',
        v_item ->> 'example_ru',
        v_item -> 'affirmative_examples',
        v_item -> 'negative_examples',
        v_item -> 'question_examples',
        v_item -> 'short_positive_answers',
        v_item -> 'short_negative_answers',
        v_item -> 'common_mistakes',
        v_item -> 'exercise_templates'
      );
      v_inserted_grammar := v_inserted_grammar + 1;
    end if;
  end loop;

  for v_item in select value from jsonb_array_elements(v_texts)
  loop
    insert into public.topics (family_id, course_id, title)
    select v_family, v_course, v_item ->> 'topic'
    where not exists (
      select 1 from public.topics where family_id = v_family and course_id = v_course and title = v_item ->> 'topic'
    );
    select id into v_topic from public.topics where family_id = v_family and course_id = v_course and title = v_item ->> 'topic' limit 1;

    insert into public.learning_texts (
      family_id, course_id, source_id, topic_id, title_en, title_ru, text_en, text_ru,
      level, difficulty, tags, vocabulary_words, grammar_focus, comprehension_questions, status, created_by
    )
    select
      v_family,
      v_course,
      v_source,
      v_topic,
      v_item ->> 'title_en',
      v_item ->> 'title_ru',
      v_item ->> 'text_en',
      v_item ->> 'text_ru',
      coalesce(v_item ->> 'level', 'pre_a1'),
      coalesce((v_item ->> 'difficulty')::int, 1),
      coalesce(v_item -> 'tags', '[]'::jsonb),
      coalesce(v_item -> 'vocabulary_words', '[]'::jsonb),
      coalesce(v_item -> 'grammar_focus', '[]'::jsonb),
      coalesce(v_item -> 'comprehension_questions', '[]'::jsonb),
      'active',
      auth.uid()
    where not exists (
      select 1
      from public.learning_texts existing
      where existing.family_id = v_family
        and existing.source_id = v_source
        and lower(existing.title_en) = lower(v_item ->> 'title_en')
    );
    get diagnostics v_row_count = row_count;
    v_inserted_texts := v_inserted_texts + v_row_count;
  end loop;

  select count(*) into v_total_cards from public.cards where family_id = v_family and course_id = v_course and source_id = v_source;
  select count(*) into v_total_grammar from public.grammar_patterns where family_id = v_family and course_id = v_course and pattern_key in ('personal_pronouns', 'possessive_adjectives');
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
    'course_title', 'Grammar: Pronouns'
  );
end;
$function$;
