# Manual QA Guide

## 1. Run Locally

Open PowerShell:

```powershell
Set-Location D:\Projects\kids-english-trainer
npm.cmd install
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```

If `npm` is blocked by PowerShell execution policy, use `npm.cmd`.

## 2. Sign In As Parent

1. Open `/login`.
2. Sign in with an existing parent account or create a new one.
3. After login, open `/parent/dashboard`.

Critical errors:

- login loop;
- blank page;
- Supabase key or project URL error;
- parent can see another family data.

## 3. Create A Child

1. Open `/parent/children`.
2. Create a child profile.
3. Open `/child/select`.
4. Confirm the child appears in the list.

Critical errors:

- child profile is not saved;
- child profile from another family appears;
- selecting child does not persist.

## 4. Add Starter 350

1. Open `/parent/import`.
2. Find `Стартовые наборы`.
3. Check the displayed Starter 350 count.
4. Click `Добавить Starter 350`.
5. Wait for the success message.

Expected:

- loading state appears;
- result shows inserted count, existing count, total count;
- no service role key is requested in the browser.

## 5. Check No Duplicates

1. Click `Добавить Starter 350` again.
2. Expected inserted cards: `0`.
3. Total cards should stay the same.
4. Open `/parent/cards` and filter by type/topic to confirm cards are still usable.

Critical errors:

- total card count doubles;
- duplicate identical cards appear after the second click;
- repeated seed run shows a scary error.

## 6. Pass Child Practice

1. Open `/parent/dashboard`.
2. Click `Перейти к занятию ребенка`, or use the top menu item `Детский режим`.
3. Confirm `/child/select` opens without typing a direct URL.
4. You can also open `/parent/children` and click `Начать занятие` near a child profile.
5. Open `/child/select`.
6. Select the child profile.
7. Open `/child/practice`.
8. Complete the short session.

Check these exercise types when they appear:

- choose translation;
- Russian to English;
- listen and choose;
- build sentence;
- fill the gap;
- question form;
- short answer;
- articles;
- mini dialogue.

Expected:

- one task appears at a time;
- progress is visible, for example `3 / 12`;
- answer buttons are large;
- Listen speaks English where available;
- Listen slowly speaks slower;
- wrong answer shows the correct answer;
- articles show a short Russian explanation;
- final summary shows completed tasks, correct answers, and stars.
- if mistakes were made, final summary shows exercise type, prompt, child answer, correct answer, and Russian explanation;
- `Повторить ошибки` starts a short retry session from current-session mistakes;
- `Повторить это задание` repeats one missed task.

## 6A. Grammar: this / that / these / those

Add the demonstratives pack:

1. Apply the latest migrations.
2. Open `/parent/import`.
3. Click `Добавить grammar: this/that/these/those`.
4. Click it again and confirm inserted cards/texts are `0` or the UI says the pack already exists.

Check grammar UI:

1. Open `/grammar`.
2. Confirm the block `This / that / these / those` is visible.
3. Confirm the table shows `near + singular = this`, `far + singular = that`, `near + plural = these`, `far + plural = those`.
4. Click `Потренировать`.
5. Confirm `/child/practice?grammar_key=demonstratives_this_that_these_those` opens a focused practice.

Check expected exercise content:

- `These are my books.` -> `Are these your books?`
- `Those are your pencils.` -> `Are those your pencils?`
- `These are apples.` -> `What are these?`
- `Those are toys.` -> `What are those?`
- `Are these your books?` -> `Yes, they are.` / `No, they aren't.`
- Fill gaps use `these/those + are`, never `these/those + is`.

## 6B. Grammar: -ing And Time

Add the grammar pack:

1. Apply the latest migrations.
2. Open `/parent/import`.
3. Click `Добавить grammar pack: -ing + time`.
4. Click it again and confirm inserted cards/texts are `0` or the UI says the pack already exists.

Check grammar UI:

1. Open `/grammar`.
2. Confirm every grammar pattern card has a `Потренировать` button.
3. Find `-ing: что кто-то делает сейчас`.
4. Click `Потренировать`.
5. Check exercises with `I am`, `She is`, `He is`, `They are`.
6. Find `Дни недели и время: on, in, at, last, next`.
7. Click `Потренировать`.
8. Check exercises with `on Sunday`, `in the morning`, `at night`, `at seven o'clock`, `last weekend`, `next weekend`.

Expected:

- `I ___ running` -> `am`.
- `She ___ sleeping` -> `is`.
- `They ___ jumping` -> `are`.
- `What ___ you doing?` -> `are`.
- `I go to school ___ Monday` -> `on`.
- `I read ___ the evening` -> `in`.
- `I sleep ___ night` -> `at`.
- `I played football ___ weekend` -> `last`.

Check texts:

1. Open `/child/texts`.
2. Find `My morning`, `In the park`, and `Last weekend` after adding the pack.
3. Open each text and answer comprehension questions.
4. Confirm attempts save and `/parent/progress` shows text attempts.

## 6C. Grammar: Personal Pronouns And Possessive Words

Add the pronouns pack:

1. Apply the latest migrations.
2. Open `/parent/import`.
3. Click `Добавить grammar: pronouns`.
4. Click it again and confirm inserted cards/texts are `0` or the UI says the pack already exists.

Check grammar UI:

1. Open `/grammar`.
2. Find `Личные местоимения: I, you, he, she, it, we, they`.
3. Click `Потренировать`.
4. Check focused practice with `I am`, `He is`, `She is`, `We are`, `They are`.
5. Find `Притяжательные слова: my, your, his, her, our, their`.
6. Click `Потренировать`.
7. Check `my book`, `your pencil`, `his dog`, `her bag`, `our classroom`, `their toys`.

Expected:

- `___ am eight` -> `I`.
- `___ is my brother` -> `He`.
- `___ is my sister` -> `She`.
- `___ are pupils` -> `We`.
- `This is ___ book` -> `my`.
- `This is ___ pencil` -> `your`.
- `These are ___ toys` -> `their`.
- `Are they pupils?` -> `Yes, they are.` / `No, they aren't.`
- `Whose book is this?` -> `It is my book.`

Check texts:

1. Open `/child/texts`.
2. Find `My family` and `Our classroom` after adding the pack.
3. Open each text and answer comprehension questions.
4. Confirm attempts save and `/parent/progress` shows text attempts.

## 6D. Check How The Child Learns Words

1. Open `/child/dashboard`.
2. Confirm there are large buttons:
   - `Занятие дня`
   - `Учить новые слова`
   - `Повторить слова`
   - `Повторить ошибки`
   - `Слова по темам`
   - `Местоимения`
3. Click `Учить новые слова`.
4. Confirm the child sees 5-7 words, not the full card list.
5. For a word, check the cycle:
   - presentation with English/Russian;
   - Listen;
   - Listen slowly;
   - `Понятно`;
   - English -> Russian;
   - Russian -> English;
   - listening choice;
   - quick recall.
6. Finish the mode.
7. Confirm the summary shows learned words, correct answers, mistakes, and `Повторить эти слова`.
8. Open `/child/words/review`.
9. If no due words exist, confirm the empty state suggests learning new words.
10. Open `/child/words/mistakes`.
11. If no mistakes exist, confirm it says `Ошибок пока нет. Отличная работа!`.
12. Open `/child/words/topics`.
13. Pick a topic and confirm it starts a short topic session.

## 6E. Check Pronouns Trainer

1. Open `/child/dashboard`.
2. Click `Местоимения`.
3. Confirm `/child/pronouns` opens.
4. Start each mode:
   - `Быстрый микс`
   - `Английский -> русский`
   - `Русский -> английский`
   - `Пары I -> my`
5. Confirm the child types answers manually, not by choosing buttons.
6. Give a correct answer and confirm the next item appears immediately.
7. Give a wrong answer and confirm the page shows:
   - `Твой ответ`
   - `Правильно`
   - `Перевод`
   - `Почему`
   - `Продолжить`
8. Click `Продолжить` and confirm the next item appears.
9. Finish the session and confirm the summary shows total tasks, correct answers, mistakes, stars, and `Повторить ошибки` when there were mistakes.
10. Click `Повторить ошибки` and confirm only missed pronoun tasks are repeated in a shuffled order.

Critical errors:

- child sees all 467 cards as the learning screen;
- word-learning attempts are not saved;
- `review_schedule` is not updated after word exercises;
- topic mode shows empty/broken exercises when the topic has cards.
- pronouns trainer does not save attempts;
- correct pronouns answer waits or freezes instead of advancing immediately;
- wrong pronouns answer advances without explanation;

Critical errors:

- empty exercise screen;
- no correct answer among options;
- fewer than two options for a choice task;
- broken audio button crashes the page;
- practice attempt is not saved.

## 7. Check Parent Statistics

1. After practice, open `/parent/dashboard`.
2. Open `/parent/progress`.

Expected:

- total sessions increased;
- total attempts increased;
- accuracy is calculated;
- accuracy by exercise type appears;
- weak cards/grammar appear after mistakes;
- due cards today appears when review is due;
- empty states are readable when there is no data.

Critical errors:

- stats stay unchanged after a finished session;
- dashboard crashes when there are no attempts;
- parent sees another family's attempts.

## 7A. Practice Feedback And Focused Grammar QA

Wrong answer flow:

1. Open `/child/practice` or any focused grammar practice.
2. Intentionally choose a wrong answer.
3. Confirm the app stays on the same exercise.
4. Confirm it shows:
   - `Почти! Давай разберем.`
   - the child's answer;
   - the correct answer;
   - Russian translation of the correct answer, or the softer fallback `Перевод пока не добавлен.`;
   - a short explanation;
   - the `Продолжить` button.
5. Click `Продолжить`.
6. Confirm the next exercise opens, or the summary opens if it was the last exercise.

Correct answer transition:

1. Open `/child/practice`, a focused grammar practice, or a word topic session.
2. Choose a correct answer.
3. Confirm the next exercise opens immediately, without a blocking feedback screen.
4. Confirm there is no 5-10 second delay after a correct answer.
5. Confirm no `Продолжить` button is required for a correct answer.
6. On the last exercise, confirm the summary opens immediately after a correct answer.

Focused grammar practice:

1. Open `/grammar`.
2. Click `Потренировать` on `Personal pronouns`.
3. Confirm `/child/practice?grammar_key=personal_pronouns` uses only personal pronouns: `I am`, `He is`, `She is`, `We are`, `They are`.
4. Click `Потренировать` on `Possessive words`.
5. Confirm `/child/practice?grammar_key=possessive_adjectives` uses only possessive words: `my`, `your`, `his`, `her`, `our`, `their`.
6. Repeat for demonstratives, -ing, days/time, articles, would like, have got, can, like, and there is / there are.

Possessive fill gaps must include context:

- `Anna has a bag. This is ___ bag.` Correct: `her`.
- `Tom has a dog. This is ___ dog.` Correct: `his`.
- `They have toys. These are ___ toys.` Correct: `their`.

Yes/no short answers must also include context:

- `She isn't sleeping. Is she sleeping?` Correct: `No, she isn't.`
- `They are pupils. Are they pupils?` Correct: `Yes, they are.`
- `I can swim. Can you swim?` Correct: `Yes, I can.`

Critical errors:

- wrong answer auto-advances before the explanation can be read;
- focused grammar practice mixes another grammar topic;
- a possessive fill gap appears without context, for example bare `These are ___ toys.`;
- a short-answer yes/no question appears without context, for example bare `Is she sleeping?`;
- several answer options are grammatically correct but the app accepts only one.

Curated topic blocks:

1. Open `/child/words/topics`.
2. Confirm these cards are visible in `Быстрые учебные блоки`:
   - `Вопросительные слова`
   - `Местоимения`
   - `Дни недели и время`
   - `This / that / these / those`
   - `-ing actions`
3. Open each block with `Учить`.
4. Confirm the topic training starts and is not empty.

Topic shuffle check:

1. Return to `/child/words/topics`.
2. Open the same quick block or database topic again.
3. Confirm the word/card order is not fixed between runs.
4. Confirm answer options are shuffled and still include the correct answer.

Grammar duplicate check:

1. Open `/grammar`.
2. Confirm `Personal pronouns` appears once.
3. Confirm `Possessive words` appears once.

## 8. Pages To Check

- `/login`
- `/parent/dashboard`
- `/parent/children`
- `/parent/courses`
- `/parent/cards`
- `/parent/import`
- `/parent/progress`
- `/child/select`
- `/child/dashboard`
- `/child/practice`
- `/grammar`

## 9. Critical QA Failures

- Build or typecheck fails.
- `.env.local` is tracked by Git.
- Supabase service role key is used in frontend code.
- Starter 350 creates duplicates.
- Child can edit parent cards/settings.
- Practice session starts but attempts are not saved.
- Review schedule is not updated after card attempts.
- Child practice shows empty or impossible exercises.

## 10. Statistics During Development

During development, parent statistics can include older Codex/API test sessions and attempts. This is normal if the same parent/child profile was used for several smoke tests.

The dashboard now counts completed sessions only when:

- `finished_at` is not empty;
- `total_attempts > 0`.

Empty sessions and unfinished sessions do not count as completed lessons and do not affect the lesson streak.

`Всего попыток` means all saved answers for the family. `Заданий в последнем занятии` means only the latest completed session.

## 11. How To Check With A Clean Child

Use this when you want a clean statistics check without old test attempts:

1. Open `/parent/children`.
2. Create a new child profile, for example `QA Child`.
3. Open `/parent/import`.
4. Make sure Starter 350 is available. Re-running it is safe and should not create duplicates.
5. Open `/child/select`.
6. Select the new child.
7. Open `/child/practice`.
8. Complete exactly one full session.
9. Open `/parent/dashboard`.
10. Check that `Завершенных занятий` increased by 1 for this new child's attempts in the family data.
11. Check that `Последнее завершенное занятие` shows the same number of tasks as the completed practice summary.
12. Open `/parent/progress`.
13. Check `Последние ошибки` if you intentionally made mistakes.

## 12. Child Profile Management

Archive a child:

1. Open `/parent/children`.
2. Click `Архивировать` near a child.
3. Open `/child/select`.
4. Confirm the archived child is not shown.
5. Confirm the child appears in `Архивные профили` on `/parent/children`.

Restore a child:

1. Open `/parent/children`.
2. Find `Архивные профили`.
3. Click `Восстановить`.
4. Open `/child/select`.
5. Confirm the child is available again.

Reset child statistics:

1. Open `/parent/children`.
2. Click `Обнулить статистику` near one child.
3. Read the confirmation text.
4. Type `RESET`.
5. Confirm reset.
6. Open `/parent/dashboard` and `/parent/progress`.
7. Confirm progress data for that child no longer affects attempts, sessions, streak, weak cards, or recent mistakes.

Reset must not delete cards, courses, Starter 350, or another child's data.

## 13. Reading And Listening Texts QA

Add starter texts:

1. Run `npm run content:report`.
2. Apply `supabase/seed_starter_texts.sql` in Supabase SQL Editor or with Supabase CLI.
3. Open `/parent/import`.
4. Click `Добавить Starter Texts`.
5. Click it again and confirm inserted count is 0 or the UI says the pack already exists without creating duplicates.

Check child reading:

1. Open `/child/select` and choose a child.
2. Open `/child/dashboard`.
3. Click `Тексты`.
4. Confirm `/child/texts` shows text cards with English/Russian titles, topic, difficulty and word count.
5. Open one text.
6. Confirm English text is visible and Russian translation is hidden.
7. Click `Слушать` and `Слушать медленно`.
8. Click `Показать перевод`, then `Скрыть перевод`.
9. Click `Ответить на вопросы`.
10. Answer all questions and confirm summary shows total, correct answers, mistakes and correct answers.
11. Click `Повторить слова из текста` and answer vocabulary tasks.
12. Open `/parent/progress` and check text attempts/text accuracy appear.

Check parent text management:

1. Open `/parent/texts`.
2. Create a short test text with 2-3 questions.
3. Edit the title or text.
4. Archive it and confirm it disappears from `/child/texts`.
5. Restore it and confirm it appears again.

Critical failures:

- Translation is visible before clicking `Показать перевод`.
- Text questions do not save to `practice_attempts`.
- A different family can see the text.
- Archiving a text deletes attempts or cards.
