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

1. Open `/child/select`.
2. Select the child profile.
3. Open `/child/practice`.
4. Complete the short session.

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
