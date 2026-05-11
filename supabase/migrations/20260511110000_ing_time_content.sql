create or replace function public.seed_ing_time_content()
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
  {"type":"word","topic":"actions","english":"running","russian":"бег / бежит","tags":["present_continuous_ing","ing","actions"],"example_en":"I am running.","example_ru":"Я бегу."},
  {"type":"word","topic":"actions","english":"jumping","russian":"прыжки / прыгает","tags":["present_continuous_ing","ing","actions"],"example_en":"They are jumping.","example_ru":"Они прыгают."},
  {"type":"word","topic":"actions","english":"sleeping","russian":"спит","tags":["present_continuous_ing","ing","actions"],"example_en":"She is sleeping.","example_ru":"Она спит."},
  {"type":"word","topic":"actions","english":"eating","russian":"ест","tags":["present_continuous_ing","ing","actions"],"example_en":"I am eating breakfast.","example_ru":"Я завтракаю."},
  {"type":"word","topic":"actions","english":"drinking","russian":"пьет","tags":["present_continuous_ing","ing","actions"],"example_en":"He is drinking water.","example_ru":"Он пьет воду."},
  {"type":"word","topic":"actions","english":"reading","russian":"читает","tags":["present_continuous_ing","ing","actions"],"example_en":"I am reading a book.","example_ru":"Я читаю книгу."},
  {"type":"word","topic":"actions","english":"writing","russian":"пишет","tags":["present_continuous_ing","ing","actions"],"example_en":"She is writing.","example_ru":"Она пишет."},
  {"type":"word","topic":"actions","english":"drawing","russian":"рисует","tags":["present_continuous_ing","ing","actions"],"example_en":"You are drawing a picture.","example_ru":"Ты рисуешь картинку."},
  {"type":"word","topic":"actions","english":"singing","russian":"поет","tags":["present_continuous_ing","ing","actions"],"example_en":"He is singing.","example_ru":"Он поет."},
  {"type":"word","topic":"actions","english":"dancing","russian":"танцует","tags":["present_continuous_ing","ing","actions"],"example_en":"They are dancing.","example_ru":"Они танцуют."},
  {"type":"word","topic":"actions","english":"playing","russian":"играет","tags":["present_continuous_ing","ing","actions"],"example_en":"He is playing football.","example_ru":"Он играет в футбол."},
  {"type":"word","topic":"actions","english":"swimming","russian":"плавает","tags":["present_continuous_ing","ing","actions"],"example_en":"They are swimming.","example_ru":"Они плавают."},
  {"type":"word","topic":"actions","english":"walking","russian":"идет пешком","tags":["present_continuous_ing","ing","actions"],"example_en":"We are walking.","example_ru":"Мы идем пешком."},
  {"type":"word","topic":"actions","english":"going","russian":"идет","tags":["present_continuous_ing","ing","actions"],"example_en":"We are going to school.","example_ru":"Мы идем в школу."},
  {"type":"word","topic":"actions","english":"sitting","russian":"сидит","tags":["present_continuous_ing","ing","actions"],"example_en":"She is sitting.","example_ru":"Она сидит."},
  {"type":"word","topic":"actions","english":"standing","russian":"стоит","tags":["present_continuous_ing","ing","actions"],"example_en":"He is standing.","example_ru":"Он стоит."},
  {"type":"word","topic":"actions","english":"listening","russian":"слушает","tags":["present_continuous_ing","ing","actions"],"example_en":"I am listening.","example_ru":"Я слушаю."},
  {"type":"word","topic":"actions","english":"looking","russian":"смотрит","tags":["present_continuous_ing","ing","actions"],"example_en":"She is looking at the board.","example_ru":"Она смотрит на доску."},
  {"type":"word","topic":"actions","english":"opening","russian":"открывает","tags":["present_continuous_ing","ing","actions"],"example_en":"He is opening the door.","example_ru":"Он открывает дверь."},
  {"type":"word","topic":"actions","english":"closing","russian":"закрывает","tags":["present_continuous_ing","ing","actions"],"example_en":"She is closing the book.","example_ru":"Она закрывает книгу."},

  {"type":"sentence","topic":"actions","english":"I am running.","russian":"Я бегу.","tags":["present_continuous_ing","I am"],"example_en":"I am running.","example_ru":"Я бегу."},
  {"type":"sentence","topic":"school","english":"I am reading a book.","russian":"Я читаю книгу.","tags":["present_continuous_ing","I am"],"example_en":"I am reading a book.","example_ru":"Я читаю книгу."},
  {"type":"sentence","topic":"actions","english":"She is sleeping.","russian":"Она спит.","tags":["present_continuous_ing","she is"],"example_en":"She is sleeping.","example_ru":"Она спит."},
  {"type":"sentence","topic":"hobbies","english":"He is playing football.","russian":"Он играет в футбол.","tags":["present_continuous_ing","he is"],"example_en":"He is playing football.","example_ru":"Он играет в футбол."},
  {"type":"sentence","topic":"actions","english":"They are jumping.","russian":"Они прыгают.","tags":["present_continuous_ing","they are"],"example_en":"They are jumping.","example_ru":"Они прыгают."},
  {"type":"sentence","topic":"school routine","english":"We are going to school.","russian":"Мы идем в школу.","tags":["present_continuous_ing","we are"],"example_en":"We are going to school.","example_ru":"Мы идем в школу."},
  {"type":"sentence","topic":"animals","english":"The cat is sleeping.","russian":"Кошка спит.","tags":["present_continuous_ing","is"],"example_en":"The cat is sleeping.","example_ru":"Кошка спит."},
  {"type":"sentence","topic":"animals","english":"The dog is running.","russian":"Собака бежит.","tags":["present_continuous_ing","is"],"example_en":"The dog is running.","example_ru":"Собака бежит."},
  {"type":"sentence","topic":"hobbies","english":"You are drawing a picture.","russian":"Ты рисуешь картинку.","tags":["present_continuous_ing","you are"],"example_en":"You are drawing a picture.","example_ru":"Ты рисуешь картинку."},
  {"type":"sentence","topic":"hobbies","english":"The children are playing.","russian":"Дети играют.","tags":["present_continuous_ing","are"],"example_en":"The children are playing.","example_ru":"Дети играют."},

  {"type":"phrase","topic":"simple questions","english":"What are you doing?","russian":"Что ты делаешь?","tags":["present_continuous_ing","question_form"],"example_en":"What are you doing?","example_ru":"Что ты делаешь?"},
  {"type":"phrase","topic":"simple questions","english":"Are you running?","russian":"Ты бежишь?","tags":["present_continuous_ing","question_form","short_answer"],"example_en":"Are you running?","example_ru":"Ты бежишь?"},
  {"type":"phrase","topic":"simple questions","english":"Are you reading?","russian":"Ты читаешь?","tags":["present_continuous_ing","question_form","short_answer"],"example_en":"Are you reading?","example_ru":"Ты читаешь?"},
  {"type":"phrase","topic":"simple questions","english":"Is she sleeping?","russian":"Она спит?","tags":["present_continuous_ing","question_form","short_answer"],"example_en":"Is she sleeping?","example_ru":"Она спит?"},
  {"type":"phrase","topic":"simple questions","english":"Is he playing?","russian":"Он играет?","tags":["present_continuous_ing","question_form","short_answer"],"example_en":"Is he playing?","example_ru":"Он играет?"},
  {"type":"phrase","topic":"simple questions","english":"Are they jumping?","russian":"Они прыгают?","tags":["present_continuous_ing","question_form","short_answer"],"example_en":"Are they jumping?","example_ru":"Они прыгают?"},
  {"type":"phrase","topic":"simple questions","english":"Are they playing football?","russian":"Они играют в футбол?","tags":["present_continuous_ing","question_form","short_answer"],"example_en":"Are they playing football?","example_ru":"Они играют в футбол?"},
  {"type":"phrase","topic":"simple questions","english":"Is the cat sleeping?","russian":"Кошка спит?","tags":["present_continuous_ing","question_form","short_answer"],"example_en":"Is the cat sleeping?","example_ru":"Кошка спит?"},
  {"type":"phrase","topic":"simple questions","english":"Is the dog running?","russian":"Собака бежит?","tags":["present_continuous_ing","question_form","short_answer"],"example_en":"Is the dog running?","example_ru":"Собака бежит?"},

  {"type":"grammar_pattern","topic":"simple questions","english":"Are you running? Yes, I am.","russian":"Ты бежишь? Да.","tags":["present_continuous_ing","short_answer"],"example_en":"Are you running?","example_ru":"Yes, I am."},
  {"type":"grammar_pattern","topic":"simple questions","english":"Are you running? No, I am not.","russian":"Ты бежишь? Нет.","tags":["present_continuous_ing","short_answer"],"example_en":"Are you running?","example_ru":"No, I am not."},
  {"type":"grammar_pattern","topic":"simple questions","english":"Is she sleeping? Yes, she is.","russian":"Она спит? Да.","tags":["present_continuous_ing","short_answer"],"example_en":"Is she sleeping?","example_ru":"Yes, she is."},
  {"type":"grammar_pattern","topic":"simple questions","english":"Is she sleeping? No, she isn't.","russian":"Она спит? Нет.","tags":["present_continuous_ing","short_answer"],"example_en":"Is she sleeping?","example_ru":"No, she isn't."},
  {"type":"grammar_pattern","topic":"simple questions","english":"Is he playing? Yes, he is.","russian":"Он играет? Да.","tags":["present_continuous_ing","short_answer"],"example_en":"Is he playing?","example_ru":"Yes, he is."},
  {"type":"grammar_pattern","topic":"simple questions","english":"Is he playing? No, he isn't.","russian":"Он играет? Нет.","tags":["present_continuous_ing","short_answer"],"example_en":"Is he playing?","example_ru":"No, he isn't."},
  {"type":"grammar_pattern","topic":"simple questions","english":"Are they jumping? Yes, they are.","russian":"Они прыгают? Да.","tags":["present_continuous_ing","short_answer"],"example_en":"Are they jumping?","example_ru":"Yes, they are."},
  {"type":"grammar_pattern","topic":"simple questions","english":"Are they jumping? No, they aren't.","russian":"Они прыгают? Нет.","tags":["present_continuous_ing","short_answer"],"example_en":"Are they jumping?","example_ru":"No, they aren't."},

  {"type":"grammar_pattern","topic":"grammar","english":"I ___ running. Correct: am","russian":"Пропуск: I am running.","tags":["present_continuous_ing","fill_the_gap","am"],"example_en":"I ___ running.","example_ru":"am"},
  {"type":"grammar_pattern","topic":"grammar","english":"She ___ sleeping. Correct: is","russian":"Пропуск: She is sleeping.","tags":["present_continuous_ing","fill_the_gap","is"],"example_en":"She ___ sleeping.","example_ru":"is"},
  {"type":"grammar_pattern","topic":"grammar","english":"He ___ playing. Correct: is","russian":"Пропуск: He is playing.","tags":["present_continuous_ing","fill_the_gap","is"],"example_en":"He ___ playing.","example_ru":"is"},
  {"type":"grammar_pattern","topic":"grammar","english":"They ___ jumping. Correct: are","russian":"Пропуск: They are jumping.","tags":["present_continuous_ing","fill_the_gap","are"],"example_en":"They ___ jumping.","example_ru":"are"},
  {"type":"grammar_pattern","topic":"grammar","english":"We ___ going to school. Correct: are","russian":"Пропуск: We are going to school.","tags":["present_continuous_ing","fill_the_gap","are"],"example_en":"We ___ going to school.","example_ru":"are"},
  {"type":"grammar_pattern","topic":"grammar","english":"What ___ you doing? Correct: are","russian":"Пропуск: What are you doing?","tags":["present_continuous_ing","fill_the_gap","are"],"example_en":"What ___ you doing?","example_ru":"are"},
  {"type":"grammar_pattern","topic":"grammar","english":"___ she sleeping? Correct: Is","russian":"Пропуск: Is she sleeping?","tags":["present_continuous_ing","fill_the_gap","is"],"example_en":"___ she sleeping?","example_ru":"Is"},
  {"type":"grammar_pattern","topic":"grammar","english":"___ they playing? Correct: Are","russian":"Пропуск: Are they playing?","tags":["present_continuous_ing","fill_the_gap","are"],"example_en":"___ they playing?","example_ru":"Are"},

  {"type":"word","topic":"days of the week","english":"Monday","russian":"понедельник","tags":["days_time_expressions","days"]},
  {"type":"word","topic":"days of the week","english":"Tuesday","russian":"вторник","tags":["days_time_expressions","days"]},
  {"type":"word","topic":"days of the week","english":"Wednesday","russian":"среда","tags":["days_time_expressions","days"]},
  {"type":"word","topic":"days of the week","english":"Thursday","russian":"четверг","tags":["days_time_expressions","days"]},
  {"type":"word","topic":"days of the week","english":"Friday","russian":"пятница","tags":["days_time_expressions","days"]},
  {"type":"word","topic":"days of the week","english":"Saturday","russian":"суббота","tags":["days_time_expressions","days"]},
  {"type":"word","topic":"days of the week","english":"Sunday","russian":"воскресенье","tags":["days_time_expressions","days"]},
  {"type":"word","topic":"days of the week","english":"weekend","russian":"выходные","tags":["days_time_expressions","time"]},
  {"type":"word","topic":"days of the week","english":"today","russian":"сегодня","tags":["days_time_expressions","time"]},
  {"type":"word","topic":"days of the week","english":"tomorrow","russian":"завтра","tags":["days_time_expressions","time"]},
  {"type":"word","topic":"days of the week","english":"yesterday","russian":"вчера","tags":["days_time_expressions","time"]},
  {"type":"word","topic":"time and daily routine","english":"morning","russian":"утро","tags":["days_time_expressions","time"]},
  {"type":"word","topic":"time and daily routine","english":"afternoon","russian":"день / после обеда","tags":["days_time_expressions","time"]},
  {"type":"word","topic":"time and daily routine","english":"evening","russian":"вечер","tags":["days_time_expressions","time"]},
  {"type":"word","topic":"time and daily routine","english":"night","russian":"ночь","tags":["days_time_expressions","time"]},
  {"type":"word","topic":"days of the week","english":"week","russian":"неделя","tags":["days_time_expressions","time"]},
  {"type":"phrase","topic":"days of the week","english":"next week","russian":"следующая неделя","tags":["days_time_expressions","next"]},
  {"type":"phrase","topic":"days of the week","english":"last weekend","russian":"прошлые выходные","tags":["days_time_expressions","last"]},
  {"type":"phrase","topic":"time and daily routine","english":"this morning","russian":"этим утром","tags":["days_time_expressions","this"]},
  {"type":"phrase","topic":"time and daily routine","english":"this evening","russian":"этим вечером","tags":["days_time_expressions","this"]},

  {"type":"phrase","topic":"days of the week","english":"on Monday","russian":"в понедельник","tags":["days_time_expressions","on"]},
  {"type":"phrase","topic":"days of the week","english":"on Tuesday","russian":"во вторник","tags":["days_time_expressions","on"]},
  {"type":"phrase","topic":"days of the week","english":"on Sunday","russian":"в воскресенье","tags":["days_time_expressions","on"]},
  {"type":"phrase","topic":"days of the week","english":"at the weekend","russian":"на выходных","tags":["days_time_expressions","at"]},
  {"type":"phrase","topic":"time and daily routine","english":"in the morning","russian":"утром","tags":["days_time_expressions","in"]},
  {"type":"phrase","topic":"time and daily routine","english":"in the afternoon","russian":"днем / после обеда","tags":["days_time_expressions","in"]},
  {"type":"phrase","topic":"time and daily routine","english":"in the evening","russian":"вечером","tags":["days_time_expressions","in"]},
  {"type":"phrase","topic":"time and daily routine","english":"at night","russian":"ночью","tags":["days_time_expressions","at"]},
  {"type":"phrase","topic":"time and daily routine","english":"at seven o'clock","russian":"в семь часов","tags":["days_time_expressions","at"]},
  {"type":"phrase","topic":"days of the week","english":"next weekend","russian":"на следующих выходных","tags":["days_time_expressions","next"]},

  {"type":"sentence","topic":"school routine","english":"I go to school on Monday.","russian":"Я хожу в школу в понедельник.","tags":["days_time_expressions","on"],"example_en":"I go to school on Monday.","example_ru":"Я хожу в школу в понедельник."},
  {"type":"sentence","topic":"hobbies","english":"I play football on Sunday.","russian":"Я играю в футбол в воскресенье.","tags":["days_time_expressions","on"],"example_en":"I play football on Sunday.","example_ru":"Я играю в футбол в воскресенье."},
  {"type":"sentence","topic":"time and daily routine","english":"I read in the evening.","russian":"Я читаю вечером.","tags":["days_time_expressions","in"],"example_en":"I read in the evening.","example_ru":"Я читаю вечером."},
  {"type":"sentence","topic":"time and daily routine","english":"I sleep at night.","russian":"Я сплю ночью.","tags":["days_time_expressions","at"],"example_en":"I sleep at night.","example_ru":"Я сплю ночью."},
  {"type":"sentence","topic":"time and daily routine","english":"I have breakfast in the morning.","russian":"Я завтракаю утром.","tags":["days_time_expressions","in"],"example_en":"I have breakfast in the morning.","example_ru":"Я завтракаю утром."},
  {"type":"sentence","topic":"school routine","english":"I do my homework in the afternoon.","russian":"Я делаю домашку днем.","tags":["days_time_expressions","in"],"example_en":"I do my homework in the afternoon.","example_ru":"Я делаю домашку днем."},
  {"type":"sentence","topic":"time and daily routine","english":"I get up at seven o'clock.","russian":"Я встаю в семь часов.","tags":["days_time_expressions","at"],"example_en":"I get up at seven o'clock.","example_ru":"Я встаю в семь часов."},
  {"type":"sentence","topic":"family","english":"I visited my grandma last weekend.","russian":"Я навещал бабушку на прошлых выходных.","tags":["days_time_expressions","last"],"example_en":"I visited my grandma last weekend.","example_ru":"Я навещал бабушку на прошлых выходных."},
  {"type":"sentence","topic":"hobbies","english":"I will play next weekend.","russian":"Я буду играть на следующих выходных.","tags":["days_time_expressions","next"],"example_en":"I will play next weekend.","example_ru":"Я буду играть на следующих выходных."},
  {"type":"sentence","topic":"school","english":"I have English on Wednesday.","russian":"У меня английский в среду.","tags":["days_time_expressions","on"],"example_en":"I have English on Wednesday.","example_ru":"У меня английский в среду."},
  {"type":"sentence","topic":"actions","english":"I am running in the morning.","russian":"Я бегаю утром.","tags":["days_time_expressions","present_continuous_ing","in"],"example_en":"I am running in the morning.","example_ru":"Я бегаю утром."},
  {"type":"sentence","topic":"school routine","english":"We are going to school on Monday.","russian":"Мы идем в школу в понедельник.","tags":["days_time_expressions","present_continuous_ing","on"],"example_en":"We are going to school on Monday.","example_ru":"Мы идем в школу в понедельник."},

  {"type":"phrase","topic":"simple questions","english":"What day is it today?","russian":"Какой сегодня день?","tags":["days_time_expressions","question_form"],"example_en":"What day is it today?","example_ru":"Какой сегодня день?"},
  {"type":"phrase","topic":"simple questions","english":"What do you do on Sunday?","russian":"Что ты делаешь в воскресенье?","tags":["days_time_expressions","question_form"],"example_en":"What do you do on Sunday?","example_ru":"Что ты делаешь в воскресенье?"},
  {"type":"phrase","topic":"simple questions","english":"What do you do in the morning?","russian":"Что ты делаешь утром?","tags":["days_time_expressions","question_form"],"example_en":"What do you do in the morning?","example_ru":"Что ты делаешь утром?"},
  {"type":"phrase","topic":"simple questions","english":"What do you do in the evening?","russian":"Что ты делаешь вечером?","tags":["days_time_expressions","question_form"],"example_en":"What do you do in the evening?","example_ru":"Что ты делаешь вечером?"},
  {"type":"phrase","topic":"simple questions","english":"What time do you get up?","russian":"Во сколько ты встаешь?","tags":["days_time_expressions","question_form"],"example_en":"What time do you get up?","example_ru":"Во сколько ты встаешь?"},
  {"type":"phrase","topic":"simple questions","english":"What did you do last weekend?","russian":"Что ты делал на прошлых выходных?","tags":["days_time_expressions","question_form"],"example_en":"What did you do last weekend?","example_ru":"Что ты делал на прошлых выходных?"},
  {"type":"phrase","topic":"simple questions","english":"What will you do next weekend?","russian":"Что ты будешь делать на следующих выходных?","tags":["days_time_expressions","question_form"],"example_en":"What will you do next weekend?","example_ru":"Что ты будешь делать на следующих выходных?"},

  {"type":"grammar_pattern","topic":"grammar","english":"I go to school ___ Monday. Correct: on","russian":"Пропуск: on Monday.","tags":["days_time_expressions","fill_the_gap","on"],"example_en":"I go to school ___ Monday.","example_ru":"on"},
  {"type":"grammar_pattern","topic":"grammar","english":"I read ___ the evening. Correct: in","russian":"Пропуск: in the evening.","tags":["days_time_expressions","fill_the_gap","in"],"example_en":"I read ___ the evening.","example_ru":"in"},
  {"type":"grammar_pattern","topic":"grammar","english":"I sleep ___ night. Correct: at","russian":"Пропуск: at night.","tags":["days_time_expressions","fill_the_gap","at"],"example_en":"I sleep ___ night.","example_ru":"at"},
  {"type":"grammar_pattern","topic":"grammar","english":"I get up ___ seven o'clock. Correct: at","russian":"Пропуск: at seven o'clock.","tags":["days_time_expressions","fill_the_gap","at"],"example_en":"I get up ___ seven o'clock.","example_ru":"at"},
  {"type":"grammar_pattern","topic":"grammar","english":"I played football ___ weekend. Correct: last","russian":"Пропуск: last weekend.","tags":["days_time_expressions","fill_the_gap","last"],"example_en":"I played football ___ weekend.","example_ru":"last"},
  {"type":"grammar_pattern","topic":"grammar","english":"I will play ___ weekend. Correct: next","russian":"Пропуск: next weekend.","tags":["days_time_expressions","fill_the_gap","next"],"example_en":"I will play ___ weekend.","example_ru":"next"},
  {"type":"grammar_pattern","topic":"grammar","english":"I have breakfast ___ the morning. Correct: in","russian":"Пропуск: in the morning.","tags":["days_time_expressions","fill_the_gap","in"],"example_en":"I have breakfast ___ the morning.","example_ru":"in"},
  {"type":"grammar_pattern","topic":"grammar","english":"I do homework ___ the afternoon. Correct: in","russian":"Пропуск: in the afternoon.","tags":["days_time_expressions","fill_the_gap","in"],"example_en":"I do homework ___ the afternoon.","example_ru":"in"},
  {"type":"grammar_pattern","topic":"grammar","english":"I have English ___ Wednesday. Correct: on","russian":"Пропуск: on Wednesday.","tags":["days_time_expressions","fill_the_gap","on"],"example_en":"I have English ___ Wednesday.","example_ru":"on"}
]
$json$::jsonb;
  v_patterns jsonb := $json$
[
  {
    "title":"-ing / Present Continuous",
    "title_ru":"-ing: что кто-то делает сейчас",
    "pattern_key":"present_continuous_ing",
    "pattern":"am/is/are + verb-ing",
    "explanation_ru":"Окончание -ing показывает действие, которое происходит сейчас. В английском часто говорят: I am running, She is sleeping, They are playing. Нужно не забывать am / is / are. Детское правило: I am + ing; He / She / It is + ing; You / We / They are + ing.",
    "example_en":"I am running.",
    "example_ru":"Я бегу.",
    "affirmative_examples":["I am running. - Я бегу.","I am reading. - Я читаю.","She is sleeping. - Она спит.","He is playing. - Он играет.","The dog is running. - Собака бежит.","They are jumping. - Они прыгают.","We are going to school. - Мы идем в школу.","You are drawing. - Ты рисуешь."],
    "negative_examples":["I am not sleeping.","She is not running.","He is not reading.","They are not playing."],
    "question_examples":["What are you doing? - Что ты делаешь?","Are you running? - Ты бежишь?","Is she sleeping? - Она спит?","Is he playing? - Он играет?","Are they jumping? - Они прыгают?","Are we going to school? - Мы идем в школу?"],
    "short_positive_answers":["Yes, I am.","Yes, she is.","Yes, he is.","Yes, they are."],
    "short_negative_answers":["No, I am not.","No, she isn't.","No, he isn't.","No, they aren't."],
    "common_mistakes":["Нельзя говорить \"I running\". Правильно: \"I am running\".","Нельзя говорить \"She are sleeping\". Правильно: \"She is sleeping\".","Нельзя говорить \"They is playing\". Правильно: \"They are playing\".","В вопросе порядок меняется: \"Are you running?\", \"Is she sleeping?\""],
    "exercise_templates":[{"type":"fill_the_gap","prompt":"I ___ running.","correctAnswer":"am"},{"type":"question_form","statement":"She is sleeping.","correctAnswer":"Is she sleeping?"},{"type":"short_answer","question":"Are they jumping?","correctAnswer":"Yes, they are."}]
  },
  {
    "title":"Days and time expressions",
    "title_ru":"Дни недели и время: on, in, at, last, next",
    "pattern_key":"days_time_expressions",
    "pattern":"on + day; in + morning/afternoon/evening; at night/time; last/next/this without preposition",
    "explanation_ru":"В английском с днями недели часто используют on: on Monday, on Sunday. С частями дня часто используют in: in the morning, in the afternoon, in the evening. Но говорят at night. Со временем на часах используют at: at seven o'clock. С last, next, this обычно предлог не нужен: last weekend, next week, this morning.",
    "example_en":"I go to school on Monday.",
    "example_ru":"Я хожу в школу в понедельник.",
    "affirmative_examples":["I go to school on Monday. - Я хожу в школу в понедельник.","I play football on Sunday. - Я играю в футбол в воскресенье.","I have breakfast in the morning. - Я завтракаю утром.","I do my homework in the afternoon. - Я делаю домашку днем.","I read a book in the evening. - Я читаю книгу вечером.","I sleep at night. - Я сплю ночью.","I get up at seven o'clock. - Я встаю в семь часов.","I visited my grandma last weekend. - Я навещал бабушку на прошлых выходных.","I will play next weekend. - Я буду играть на следующих выходных.","I am reading this morning. - Я читаю этим утром."],
    "negative_examples":["Do not say in Sunday.","Do not say in night.","Do not say on seven o'clock."],
    "question_examples":["What day is it today? - Какой сегодня день?","What do you do on Sunday? - Что ты делаешь в воскресенье?","When do you go to school? - Когда ты ходишь в школу?","What do you do in the morning? - Что ты делаешь утром?","What do you do in the evening? - Что ты делаешь вечером?","What time do you get up? - Во сколько ты встаешь?","What did you do last weekend? - Что ты делал на прошлых выходных?"],
    "short_positive_answers":["On Monday.","In the morning.","At seven o'clock.","Last weekend."],
    "short_negative_answers":["Not on Sunday.","Not at night."],
    "common_mistakes":["Правильно: on Sunday, не in Sunday.","Правильно: in the morning, но at night.","Правильно: at seven o'clock.","Правильно: last weekend без предлога.","Правильно: next week без предлога."],
    "exercise_templates":[{"type":"fill_the_gap","prompt":"I go to school ___ Monday.","correctAnswer":"on"},{"type":"fill_the_gap","prompt":"I read ___ the evening.","correctAnswer":"in"},{"type":"fill_the_gap","prompt":"I sleep ___ night.","correctAnswer":"at"}]
  }
]
$json$::jsonb;
  v_texts jsonb := $json$
[
  {
    "title_en":"My morning",
    "title_ru":"Мое утро",
    "topic":"time and daily routine",
    "text_en":"It is Monday morning. I am eating breakfast. My sister is reading a book. We are going to school at eight o'clock. I like Monday.",
    "text_ru":"Сейчас утро понедельника. Я завтракаю. Моя сестра читает книгу. Мы идем в школу в восемь часов. Мне нравится понедельник.",
    "level":"pre_a1",
    "difficulty":2,
    "tags":["present_continuous_ing","days_time_expressions"],
    "vocabulary_words":[{"english":"morning","russian":"утро"},{"english":"eating","russian":"ест"},{"english":"reading","russian":"читает"},{"english":"school","russian":"школа"}],
    "grammar_focus":["present_continuous_ing","in the morning","on Monday","at eight o'clock"],
    "comprehension_questions":[{"type":"choose_answer","question":"What day is it?","correctAnswer":"Monday","options":["Monday","Sunday","Friday"],"explanationRu":"В тексте сказано: It is Monday morning."},{"type":"true_false","question":"My sister is reading a book.","correctAnswer":"True","options":["True","False"],"explanationRu":"В тексте есть предложение: My sister is reading a book."},{"type":"match_word_translation","question":"eating","correctAnswer":"ест","options":["ест","спит","прыгает"],"explanationRu":"Eating значит ест."}]
  },
  {
    "title_en":"In the park",
    "title_ru":"В парке",
    "topic":"places",
    "text_en":"It is Sunday. The sun is shining. Children are running and jumping. A dog is playing with a ball. We are happy in the park.",
    "text_ru":"Сегодня воскресенье. Солнце светит. Дети бегают и прыгают. Собака играет с мячом. Мы счастливы в парке.",
    "level":"pre_a1",
    "difficulty":2,
    "tags":["present_continuous_ing","days_time_expressions","park"],
    "vocabulary_words":[{"english":"Sunday","russian":"воскресенье"},{"english":"running","russian":"бегает"},{"english":"jumping","russian":"прыгает"},{"english":"playing","russian":"играет"}],
    "grammar_focus":["present_continuous_ing","on Sunday"],
    "comprehension_questions":[{"type":"choose_answer","question":"What day is it?","correctAnswer":"Sunday","options":["Sunday","Monday","Wednesday"],"explanationRu":"В тексте сказано: It is Sunday."},{"type":"choose_answer","question":"What are children doing?","correctAnswer":"running and jumping","options":["running and jumping","sleeping","reading"],"explanationRu":"Children are running and jumping."},{"type":"true_false","question":"A dog is playing with a ball.","correctAnswer":"True","options":["True","False"],"explanationRu":"В тексте есть: A dog is playing with a ball."}]
  },
  {
    "title_en":"Last weekend",
    "title_ru":"Прошлые выходные",
    "topic":"days of the week",
    "text_en":"Last weekend I visited my grandma. We played games. In the evening I watched TV. Next weekend I would like to go to the park.",
    "text_ru":"На прошлых выходных я навещал бабушку. Мы играли в игры. Вечером я смотрел телевизор. На следующих выходных я хотел бы пойти в парк.",
    "level":"pre_a1",
    "difficulty":2,
    "tags":["days_time_expressions","would like"],
    "vocabulary_words":[{"english":"last weekend","russian":"прошлые выходные"},{"english":"grandma","russian":"бабушка"},{"english":"evening","russian":"вечер"},{"english":"next weekend","russian":"следующие выходные"}],
    "grammar_focus":["last weekend","in the evening","next weekend","would like"],
    "comprehension_questions":[{"type":"choose_answer","question":"Who did the child visit?","correctAnswer":"grandma","options":["grandma","teacher","friend"],"explanationRu":"В тексте сказано: I visited my grandma."},{"type":"true_false","question":"In the evening I watched TV.","correctAnswer":"True","options":["True","False"],"explanationRu":"В тексте есть это предложение."},{"type":"choose_answer","question":"Where would the child like to go next weekend?","correctAnswer":"to the park","options":["to the park","to school","to the shop"],"explanationRu":"Next weekend I would like to go to the park."}]
  }
]
$json$::jsonb;
begin
  if v_family is null then
    raise exception 'Sign in as a parent before running select public.seed_ing_time_content();';
  end if;

  if public.current_user_role() <> 'parent' then
    raise exception 'Only parent accounts can add -ing and time content.';
  end if;

  insert into public.courses (family_id, title, description)
  select v_family, 'Grammar: -ing and time', 'Idempotent -ing / Present Continuous and days/time expressions extension'
  where not exists (
    select 1 from public.courses where family_id = v_family and title = 'Grammar: -ing and time'
  );
  select id into v_course from public.courses where family_id = v_family and title = 'Grammar: -ing and time' limit 1;

  insert into public.sources (family_id, course_id, title, kind)
  select v_family, v_course, 'Ing and time generated seed', 'seed'
  where not exists (
    select 1 from public.sources where family_id = v_family and course_id = v_course and title = 'Ing and time generated seed'
  );
  select id into v_source from public.sources where family_id = v_family and course_id = v_course and title = 'Ing and time generated seed' limit 1;

  insert into public.units (family_id, course_id, title, position)
  select v_family, v_course, '-ing and time', 1
  where not exists (
    select 1 from public.units where family_id = v_family and course_id = v_course and title = '-ing and time'
  );
  select id into v_unit from public.units where family_id = v_family and course_id = v_course and title = '-ing and time' limit 1;

  insert into public.lessons (family_id, course_id, unit_id, title, position)
  select v_family, v_course, v_unit, 'Actions now and time expressions', 1
  where not exists (
    select 1 from public.lessons where family_id = v_family and course_id = v_course and title = 'Actions now and time expressions'
  );
  select id into v_lesson from public.lessons where family_id = v_family and course_id = v_course and title = 'Actions now and time expressions' limit 1;

  insert into public.decks (family_id, course_id, title)
  select v_family, v_course, 'Ing and time practice deck'
  where not exists (
    select 1 from public.decks where family_id = v_family and course_id = v_course and title = 'Ing and time practice deck'
  );
  select id into v_deck from public.decks where family_id = v_family and course_id = v_course and title = 'Ing and time practice deck' limit 1;

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
      coalesce((v_item ->> 'difficulty')::int, 2),
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
  select count(*) into v_total_grammar from public.grammar_patterns where family_id = v_family and course_id = v_course and pattern_key in ('present_continuous_ing', 'days_time_expressions');
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
    'course_title', 'Grammar: -ing and time'
  );
end;
$function$;
