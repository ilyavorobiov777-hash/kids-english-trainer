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

## 6A. Check How The Child Learns Words

1. Open `/child/dashboard`.
2. Confirm there are large buttons:
   - `Занятие дня`
   - `Учить новые слова`
   - `Повторить слова`
   - `Повторить ошибки`
   - `Слова по темам`
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

Critical errors:

- child sees all 467 cards as the learning screen;
- word-learning attempts are not saved;
- `review_schedule` is not updated after word exercises;
- topic mode shows empty/broken exercises when the topic has cards.

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
