export const starterTexts = [
  {
    title_en: "My family",
    title_ru: "Моя семья",
    topic: "family",
    level: "pre_a1",
    difficulty: 1,
    text_en: "This is my family. I have got a mum, a dad and a sister. My mum is kind. My dad can run. I like my family.",
    text_ru: "Это моя семья. У меня есть мама, папа и сестра. Моя мама добрая. Мой папа умеет бегать. Я люблю свою семью.",
    vocabulary_words: [
      { english: "family", russian: "семья" },
      { english: "mum", russian: "мама" },
      { english: "dad", russian: "папа" },
      { english: "sister", russian: "сестра" }
    ],
    grammar_focus: ["this is", "have got", "can", "like"],
    comprehension_questions: [
      { type: "choose_answer", question: "Who is in the family?", correctAnswer: "a mum, a dad and a sister", options: ["a mum, a dad and a sister", "two cats", "a teacher"] },
      { type: "true_false", question: "My mum is kind.", correctAnswer: "True", options: ["True", "False"] },
      { type: "match_word_translation", question: "family", correctAnswer: "семья", options: ["семья", "школа", "яблоко"] }
    ]
  },
  {
    title_en: "My school bag",
    title_ru: "Мой школьный портфель",
    topic: "school",
    level: "pre_a1",
    difficulty: 1,
    text_en: "I have got a school bag. It is blue. There is a book in my bag. There are two pencils. I like my bag.",
    text_ru: "У меня есть школьный портфель. Он синий. В моем портфеле есть книга. Там два карандаша. Мне нравится мой портфель.",
    vocabulary_words: [
      { english: "school bag", russian: "школьный портфель" },
      { english: "blue", russian: "синий" },
      { english: "book", russian: "книга" },
      { english: "pencil", russian: "карандаш" }
    ],
    grammar_focus: ["have got", "there is", "there are", "like"],
    comprehension_questions: [
      { type: "choose_answer", question: "What colour is the bag?", correctAnswer: "blue", options: ["blue", "red", "green"] },
      { type: "true_false", question: "There are two pencils.", correctAnswer: "True", options: ["True", "False"] },
      { type: "build_sentence_from_text", question: "Put the words in order.", prompt: "There is a book in my bag.", correctAnswer: "There is a book in my bag", options: ["There", "is", "a", "book", "in", "my", "bag"] }
    ]
  },
  {
    title_en: "My cat",
    title_ru: "Моя кошка",
    topic: "animals",
    level: "pre_a1",
    difficulty: 1,
    text_en: "I have got a cat. The cat is black. The cat is funny. It likes milk. I like my cat.",
    text_ru: "У меня есть кошка. Кошка черная. Кошка смешная. Она любит молоко. Я люблю свою кошку.",
    vocabulary_words: [
      { english: "cat", russian: "кошка" },
      { english: "black", russian: "черный" },
      { english: "funny", russian: "смешной" },
      { english: "milk", russian: "молоко" }
    ],
    grammar_focus: ["have got", "articles a/the", "like"],
    comprehension_questions: [
      { type: "choose_answer", question: "What has the child got?", correctAnswer: "a cat", options: ["a cat", "a dog", "a fish"] },
      { type: "choose_answer", question: "What colour is the cat?", correctAnswer: "black", options: ["black", "red", "white"] },
      { type: "choose_answer", question: "What does the cat like?", correctAnswer: "milk", options: ["milk", "tea", "juice"] }
    ]
  },
  {
    title_en: "My dog",
    title_ru: "Моя собака",
    topic: "animals",
    level: "pre_a1",
    difficulty: 1,
    text_en: "I have got a dog. My dog is big. It can run and jump. It has got a ball. My dog is happy.",
    text_ru: "У меня есть собака. Моя собака большая. Она умеет бегать и прыгать. У нее есть мяч. Моя собака счастливая.",
    vocabulary_words: [
      { english: "dog", russian: "собака" },
      { english: "big", russian: "большой" },
      { english: "run", russian: "бегать" },
      { english: "jump", russian: "прыгать" }
    ],
    grammar_focus: ["have got", "can", "adjectives"],
    comprehension_questions: [
      { type: "true_false", question: "The dog is big.", correctAnswer: "True", options: ["True", "False"] },
      { type: "choose_answer", question: "What can the dog do?", correctAnswer: "run and jump", options: ["run and jump", "read and write", "drink tea"] },
      { type: "match_word_translation", question: "happy", correctAnswer: "счастливый", options: ["счастливый", "грустный", "холодный"] }
    ]
  },
  {
    title_en: "My room",
    title_ru: "Моя комната",
    topic: "house",
    level: "pre_a1",
    difficulty: 1,
    text_en: "This is my room. There is a bed in my room. There is a table next to the bed. My lamp is yellow. I like my room.",
    text_ru: "Это моя комната. В моей комнате есть кровать. Рядом с кроватью есть стол. Моя лампа желтая. Мне нравится моя комната.",
    vocabulary_words: [
      { english: "room", russian: "комната" },
      { english: "bed", russian: "кровать" },
      { english: "table", russian: "стол" },
      { english: "lamp", russian: "лампа" }
    ],
    grammar_focus: ["this is", "there is", "prepositions", "like"],
    comprehension_questions: [
      { type: "choose_answer", question: "What is in the room?", correctAnswer: "a bed", options: ["a bed", "a cat", "a sandwich"] },
      { type: "true_false", question: "The lamp is yellow.", correctAnswer: "True", options: ["True", "False"] },
      { type: "build_sentence_from_text", question: "Put the words in order.", prompt: "This is my room.", correctAnswer: "This is my room", options: ["This", "is", "my", "room"] }
    ]
  },
  {
    title_en: "At school",
    title_ru: "В школе",
    topic: "school routine",
    level: "pre_a1",
    difficulty: 2,
    text_en: "I go to school on Monday. I have an English lesson. My teacher says, Listen and repeat. I open my book. I can read.",
    text_ru: "Я иду в школу в понедельник. У меня урок английского. Учитель говорит: слушай и повторяй. Я открываю книгу. Я умею читать.",
    vocabulary_words: [
      { english: "school", russian: "школа" },
      { english: "lesson", russian: "урок" },
      { english: "teacher", russian: "учитель" },
      { english: "read", russian: "читать" }
    ],
    grammar_focus: ["present simple routine", "classroom commands", "can"],
    comprehension_questions: [
      { type: "choose_answer", question: "What lesson has the child got?", correctAnswer: "an English lesson", options: ["an English lesson", "a music lesson", "a tennis lesson"] },
      { type: "true_false", question: "The teacher says, Listen and repeat.", correctAnswer: "True", options: ["True", "False"] },
      { type: "match_word_translation", question: "teacher", correctAnswer: "учитель", options: ["учитель", "портфель", "парк"] }
    ]
  },
  {
    title_en: "My lunch",
    title_ru: "Мой обед",
    topic: "food and drinks",
    level: "pre_a1",
    difficulty: 1,
    text_en: "I have got a sandwich. I have got an apple. The apple is red. I would like some juice. My lunch is good.",
    text_ru: "У меня есть бутерброд. У меня есть яблоко. Яблоко красное. Я бы хотел немного сока. Мой обед хороший.",
    vocabulary_words: [
      { english: "sandwich", russian: "бутерброд" },
      { english: "apple", russian: "яблоко" },
      { english: "juice", russian: "сок" },
      { english: "lunch", russian: "обед" }
    ],
    grammar_focus: ["have got", "articles a/an/the", "would like"],
    comprehension_questions: [
      { type: "choose_answer", question: "What colour is the apple?", correctAnswer: "red", options: ["red", "blue", "black"] },
      { type: "true_false", question: "The child would like some juice.", correctAnswer: "True", options: ["True", "False"] },
      { type: "vocabulary_review_from_text", question: "apple", correctAnswer: "яблоко", options: ["яблоко", "молоко", "карандаш"] }
    ]
  },
  {
    title_en: "My day",
    title_ru: "Мой день",
    topic: "time and daily routine",
    level: "pre_a1",
    difficulty: 2,
    text_en: "I get up in the morning. I go to school. I read and write. In the evening I do my homework. Then I sleep.",
    text_ru: "Я встаю утром. Я иду в школу. Я читаю и пишу. Вечером я делаю домашнее задание. Потом я сплю.",
    vocabulary_words: [
      { english: "morning", russian: "утро" },
      { english: "go to school", russian: "ходить в школу" },
      { english: "homework", russian: "домашнее задание" },
      { english: "sleep", russian: "спать" }
    ],
    grammar_focus: ["present simple routine", "actions"],
    comprehension_questions: [
      { type: "true_false", question: "The child goes to school.", correctAnswer: "True", options: ["True", "False"] },
      { type: "choose_answer", question: "What does the child do in the evening?", correctAnswer: "homework", options: ["homework", "basketball", "tea"] },
      { type: "build_sentence_from_text", question: "Put the words in order.", prompt: "I go to school.", correctAnswer: "I go to school", options: ["I", "go", "to", "school"] }
    ]
  },
  {
    title_en: "The weather",
    title_ru: "Погода",
    topic: "weather",
    level: "pre_a1",
    difficulty: 1,
    text_en: "It is sunny today. The sun is yellow. It is warm. I can play in the park. I am happy.",
    text_ru: "Сегодня солнечно. Солнце желтое. Тепло. Я могу играть в парке. Я счастлив.",
    vocabulary_words: [
      { english: "sunny", russian: "солнечный" },
      { english: "sun", russian: "солнце" },
      { english: "warm", russian: "теплый" },
      { english: "park", russian: "парк" }
    ],
    grammar_focus: ["to be", "articles the", "can"],
    comprehension_questions: [
      { type: "choose_answer", question: "What is the weather like?", correctAnswer: "sunny", options: ["sunny", "rainy", "snowy"] },
      { type: "true_false", question: "The child can play in the park.", correctAnswer: "True", options: ["True", "False"] },
      { type: "match_word_translation", question: "warm", correctAnswer: "теплый", options: ["теплый", "холодный", "серый"] }
    ]
  },
  {
    title_en: "In the park",
    title_ru: "В парке",
    topic: "park",
    level: "pre_a1",
    difficulty: 2,
    text_en: "I am in the park. There are two trees. I can see a bird. My friend can ride a bike. We like the park.",
    text_ru: "Я в парке. Там два дерева. Я вижу птицу. Мой друг умеет кататься на велосипеде. Нам нравится парк.",
    vocabulary_words: [
      { english: "park", russian: "парк" },
      { english: "tree", russian: "дерево" },
      { english: "bird", russian: "птица" },
      { english: "ride a bike", russian: "кататься на велосипеде" }
    ],
    grammar_focus: ["there are", "can", "articles a/the", "like"],
    comprehension_questions: [
      { type: "choose_answer", question: "How many trees are there?", correctAnswer: "two", options: ["two", "one", "ten"] },
      { type: "true_false", question: "The friend can ride a bike.", correctAnswer: "True", options: ["True", "False"] },
      { type: "match_word_translation", question: "bird", correctAnswer: "птица", options: ["птица", "рыба", "кровать"] }
    ]
  },
  {
    title_en: "Would you like some juice?",
    title_ru: "Хотите сока?",
    topic: "polite requests",
    level: "pre_a1",
    difficulty: 2,
    text_en: "Mum says, Would you like some juice? I say, Yes, please. The juice is orange. My sister says, No, thank you. She would like some water.",
    text_ru: "Мама говорит: хочешь немного сока? Я говорю: да, пожалуйста. Сок оранжевый. Моя сестра говорит: нет, спасибо. Она хотела бы немного воды.",
    vocabulary_words: [
      { english: "juice", russian: "сок" },
      { english: "Yes, please.", russian: "Да, пожалуйста." },
      { english: "No, thank you.", russian: "Нет, спасибо." },
      { english: "water", russian: "вода" }
    ],
    grammar_focus: ["would like", "polite requests", "articles the"],
    comprehension_questions: [
      { type: "choose_answer", question: "What does the child say?", correctAnswer: "Yes, please.", options: ["Yes, please.", "No, thank you.", "I can swim."] },
      { type: "true_false", question: "The sister would like some water.", correctAnswer: "True", options: ["True", "False"] },
      { type: "vocabulary_review_from_text", question: "No, thank you.", correctAnswer: "Нет, спасибо.", options: ["Нет, спасибо.", "Да, пожалуйста.", "Доброе утро."] }
    ]
  },
  {
    title_en: "My toys",
    title_ru: "Мои игрушки",
    topic: "toys",
    level: "pre_a1",
    difficulty: 1,
    text_en: "I have got many toys. I have got a ball and a car. The ball is red. The car is small. I can play with my toys.",
    text_ru: "У меня много игрушек. У меня есть мяч и машинка. Мяч красный. Машинка маленькая. Я могу играть со своими игрушками.",
    vocabulary_words: [
      { english: "toy", russian: "игрушка" },
      { english: "ball", russian: "мяч" },
      { english: "car", russian: "машинка" },
      { english: "small", russian: "маленький" }
    ],
    grammar_focus: ["have got", "articles a/the", "can"],
    comprehension_questions: [
      { type: "choose_answer", question: "What toys has the child got?", correctAnswer: "a ball and a car", options: ["a ball and a car", "a cat and a dog", "a book and a pen"] },
      { type: "true_false", question: "The car is small.", correctAnswer: "True", options: ["True", "False"] },
      { type: "match_word_translation", question: "small", correctAnswer: "маленький", options: ["маленький", "большой", "веселый"] }
    ]
  },
  {
    title_en: "My clothes",
    title_ru: "Моя одежда",
    topic: "clothes",
    level: "pre_a1",
    difficulty: 2,
    text_en: "I have got a T-shirt. It is green. I have got blue trousers. My shoes are black. I put on my jacket.",
    text_ru: "У меня есть футболка. Она зеленая. У меня есть синие брюки. Мои ботинки черные. Я надеваю куртку.",
    vocabulary_words: [
      { english: "T-shirt", russian: "футболка" },
      { english: "trousers", russian: "брюки" },
      { english: "shoes", russian: "ботинки" },
      { english: "jacket", russian: "куртка" }
    ],
    grammar_focus: ["have got", "to be", "colours"],
    comprehension_questions: [
      { type: "choose_answer", question: "What colour is the T-shirt?", correctAnswer: "green", options: ["green", "yellow", "pink"] },
      { type: "true_false", question: "The shoes are black.", correctAnswer: "True", options: ["True", "False"] },
      { type: "vocabulary_review_from_text", question: "trousers", correctAnswer: "брюки", options: ["брюки", "сок", "окно"] }
    ]
  },
  {
    title_en: "My weekend",
    title_ru: "Мои выходные",
    topic: "weekend",
    level: "pre_a1",
    difficulty: 2,
    text_en: "It is Saturday. I am at home. I read a book and draw a picture. Then I play football in the park. I like my weekend.",
    text_ru: "Сегодня суббота. Я дома. Я читаю книгу и рисую картинку. Потом я играю в футбол в парке. Мне нравятся мои выходные.",
    vocabulary_words: [
      { english: "Saturday", russian: "суббота" },
      { english: "home", russian: "дом" },
      { english: "draw a picture", russian: "рисовать картинку" },
      { english: "play football", russian: "играть в футбол" }
    ],
    grammar_focus: ["to be", "present simple routine", "like"],
    comprehension_questions: [
      { type: "choose_answer", question: "What day is it?", correctAnswer: "Saturday", options: ["Saturday", "Monday", "Friday"] },
      { type: "true_false", question: "The child plays football in the park.", correctAnswer: "True", options: ["True", "False"] },
      { type: "build_sentence_from_text", question: "Put the words in order.", prompt: "I read a book.", correctAnswer: "I read a book", options: ["I", "read", "a", "book"] }
    ]
  },
  {
    title_en: "My classroom",
    title_ru: "Мой класс",
    topic: "classroom",
    level: "pre_a1",
    difficulty: 1,
    text_en: "This is my classroom. There is a board on the wall. There are desks and chairs. The teacher is in the classroom. Open the book, please.",
    text_ru: "Это мой класс. На стене есть доска. Там есть парты и стулья. Учитель в классе. Открой книгу, пожалуйста.",
    vocabulary_words: [
      { english: "classroom", russian: "класс" },
      { english: "board", russian: "доска" },
      { english: "desk", russian: "парта" },
      { english: "chair", russian: "стул" }
    ],
    grammar_focus: ["this is", "there is", "there are", "classroom commands"],
    comprehension_questions: [
      { type: "choose_answer", question: "Where is the board?", correctAnswer: "on the wall", options: ["on the wall", "under the chair", "in the bag"] },
      { type: "true_false", question: "The teacher is in the classroom.", correctAnswer: "True", options: ["True", "False"] },
      { type: "match_word_translation", question: "board", correctAnswer: "доска", options: ["доска", "дверь", "суп"] }
    ]
  }
];
