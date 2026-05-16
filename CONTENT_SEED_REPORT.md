# Content Seed Report

Generated from `scripts/learning-content-data.mjs`.

## Totals

- total cards: 467
- total cards with demonstratives extension: 529
- total cards with demonstratives + ing/time extensions: 638
- total cards with all grammar extensions: 723
- total words: 300
- total phrases: 74
- total sentences: 45
- total grammar pattern cards: 20
- total grammar patterns table rows: 20
- total dialogues: 20
- total mini stories: 8
- total learning texts: 15
- total text comprehension questions: 45

## Count By Type

- dialogue: 20
- grammar_pattern: 20
- mini_story: 8
- phrase: 74
- sentence: 45
- word: 300

## Count By Topic

- actions: 33
- animals: 30
- body: 16
- classroom language: 20
- classroom objects: 29
- clothes: 18
- colours: 14
- days of the week: 12
- family: 19
- feelings: 14
- food and drinks: 34
- grammar: 22
- greetings: 17
- hobbies: 17
- house and rooms: 20
- numbers: 20
- places: 12
- polite requests: 23
- school: 22
- school routine: 4
- simple questions: 27
- time and daily routine: 11
- toys: 13
- weather: 20

## Grammar Patterns Covered

- to be (to be)
- this is / that is (this-that)
- have got (have-got)
- can (can)
- like (like)
- would like (would-like)
- there is / there are (there-is-there-are)
- what / where / who / how many (wh-questions)
- articles a / an / the (articles)
- plural nouns (plural-nouns)
- possessives (possessives)
- prepositions (prepositions)
- present simple routine (present-simple-routine)
- classroom commands (classroom-commands)
- imperatives with please (polite-imperatives)
- adjective + noun (adjective-noun)
- short answers (short-answers)
- some with drinks (some-drinks)
- days with on (days-with-on)
- be + feeling (be-feeling)

## Exercise Types Supported

- choose_translation
- russian_to_english
- listen_and_choose
- build_sentence
- fill_the_gap
- question_form
- short_answer
- articles
- mini_dialogue

## Demonstratives Extension

- RPC: `public.seed_demonstratives_content()`
- seed helper: `supabase/seed_demonstratives_content.sql`
- migration: `supabase/migrations/20260511100000_demonstratives_content.sql`
- grammar pattern: This, that, these, those (demonstratives_this_that_these_those)
- extension cards: 62
- extension texts: 2
- focus: this / that / these / those, especially these/those + are

### Demonstratives Cards By Type

- dialogue: 4
- grammar_pattern: 38
- phrase: 6
- sentence: 14

### Demonstratives Cards By Topic

- animals: 2
- classroom objects: 7
- clothes: 1
- food and drinks: 2
- grammar: 28
- school: 1
- simple questions: 20
- toys: 1

### Demonstratives Texts

- My school things / Мои школьные вещи: classroom objects, difficulty 1, questions 3
- In the classroom / В классе: school, difficulty 1, questions 3

### Demonstratives Examples Covered

- This is my book.
- That is my bag.
- These are my pencils.
- Those are my books.
- What are these?
- What are those?
- Are these your books?
- Are those your pencils?

## -ing And Time Extension

- RPC: `public.seed_ing_time_content()`
- seed helper: `supabase/seed_ing_time_content.sql`
- migration: `supabase/migrations/20260511110000_ing_time_content.sql`
- grammar patterns: -ing / Present Continuous (present_continuous_ing), Days and time expressions (days_time_expressions)
- extension cards: 109
- extension texts: 3
- extension text comprehension questions: 9
- focus: -ing / Present Continuous, days of the week, in/on/at, last/next/this time expressions

### -ing And Time Cards By Type

- grammar_pattern: 17
- phrase: 34
- sentence: 22
- word: 36

### -ing And Time Cards By Topic

- actions: 24
- animals: 2
- days of the week: 21
- family: 1
- grammar: 9
- hobbies: 5
- school: 2
- school routine: 4
- simple questions: 24
- time and daily routine: 17

### -ing And Time Texts

- My morning / Мое утро: time and daily routine, difficulty 2, questions 3, grammar focus present_continuous_ing, in the morning, on Monday, at eight o'clock
- In the park / В парке: places, difficulty 2, questions 3, grammar focus present_continuous_ing, on Sunday
- Last weekend / Прошлые выходные: days of the week, difficulty 2, questions 3, grammar focus last weekend, in the evening, next weekend, would like

## Pronouns Extension

- RPC: `public.seed_pronouns_content()`
- seed helper: `supabase/seed_pronouns_content.sql`
- migration: `supabase/migrations/20260516103000_pronouns_content.sql`
- grammar patterns: Personal pronouns (personal_pronouns), Possessive words: my, your, his, her, our, their (possessive_adjectives)
- extension cards: 85
- extension texts: 2
- extension text comprehension questions: 6
- focus: personal pronouns I/you/he/she/it/we/they and possessive adjectives my/your/his/her/its/our/their

### Pronouns Cards By Type

- grammar_pattern: 29
- phrase: 24
- sentence: 18
- word: 14

### Pronouns Cards By Topic

- pronouns: 63
- simple questions: 22

### Pronouns Texts

- My family / Моя семья: family, difficulty 1, questions 3, grammar focus personal_pronouns, possessive_adjectives, to be
- Our classroom / Наш класс: classroom objects, difficulty 1, questions 3, grammar focus possessive_adjectives, demonstratives_this_that_these_those

## Starter Texts

- total texts: 15
- total comprehension questions: 45

### Texts By Topic

- animals: 2
- classroom: 1
- clothes: 1
- family: 1
- food and drinks: 1
- house: 1
- park: 1
- polite requests: 1
- school: 1
- school routine: 1
- time and daily routine: 1
- toys: 1
- weather: 1
- weekend: 1

### Texts By Difficulty

- difficulty 1: 9
- difficulty 2: 6

### Text Grammar Focus Coverage

- actions: 1
- adjectives: 1
- articles a/an/the: 1
- articles a/the: 3
- articles the: 2
- can: 6
- classroom commands: 2
- colours: 1
- have got: 7
- like: 6
- polite requests: 1
- prepositions: 1
- present simple routine: 3
- there are: 3
- there is: 3
- this is: 3
- to be: 3
- would like: 2

## Idempotency

`public.seed_starter_learning_content()` inserts into a stable course/source pair and checks existing rows by `family_id + course_id + source_id + english + type` before inserting cards. Grammar patterns are updated by `family_id + course_id + title` and inserted only when missing.

`public.seed_starter_texts()` inserts into a stable course/source pair and checks existing rows by `family_id + source_id + title_en` before inserting texts.

`public.seed_demonstratives_content()` inserts into a stable course/source pair and checks existing rows by `family_id + course_id + source_id + english + type` for cards and by `family_id + source_id + title_en` for texts. Re-running it adds zero duplicates and updates the grammar pattern row by `pattern_key`.

`public.seed_ing_time_content()` inserts into a stable course/source pair and checks existing rows by `family_id + course_id + source_id + english + type` for cards and by `family_id + source_id + title_en` for texts. Re-running it adds zero duplicates and updates the two grammar pattern rows by `pattern_key`.

`public.seed_pronouns_content()` inserts into a stable course/source pair and checks existing rows by `family_id + course_id + source_id + english + type` for cards and by `family_id + source_id + title_en` for texts. Re-running it adds zero duplicates and updates the two grammar pattern rows by `pattern_key`.
