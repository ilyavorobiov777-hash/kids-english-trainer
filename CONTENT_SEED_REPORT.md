# Content Seed Report

Generated from `scripts/learning-content-data.mjs`.

## Totals

- total cards: 467
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
