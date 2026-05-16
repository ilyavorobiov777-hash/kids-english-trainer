# kids-english-trainer

Browser PWA for helping a primary-school child learn English with a Russian-first interface. The MVP covers the core loop: a parent signs in, creates a child profile, adds/imports cards, the child selects a profile and completes a short daily practice session, and the parent sees progress stats from saved attempts.

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Supabase Auth
- Supabase Postgres + RLS
- PWA manifest + service worker
- Browser SpeechSynthesis API

## Windows Quick Start

Use Node.js LTS installed from the official Node.js website. Do not rely on the Codex-bundled `node.exe`; it does not include npm in PATH on this machine.

```powershell
node -v
npm -v
cd D:\Projects\kids-english-trainer
npm install
copy .env.example .env.local
npm run dev
```

If `npm` is not recognized after installing Node.js, close PowerShell and open a new window. This project expects `C:\Program Files\nodejs` in PATH. If PowerShell blocks `npm.ps1`, either run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` once, or run the same commands through `npm.cmd`, for example `npm.cmd install` and `npm.cmd run dev`.

Then open `http://localhost:3000`.

Edit `.env.local` before running the app:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Never put a Supabase `service_role` key in frontend env files.

## Scripts

Recommended package manager: `npm`.

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run deploy:check
npm run db:push
```

`typecheck` runs `tsc --noEmit`.
`deploy:check` verifies required public env variables and PWA assets, then runs a production build.
Supabase CLI is installed as a project dev dependency, so you can also run it with `npx supabase --version`.

## Supabase Setup

1. Create a Supabase project.
2. In `Project Settings -> API`, copy the Project URL and anon public key to `.env.local`.
3. In `Authentication -> Providers -> Email`, enable email/password auth.
4. For local MVP testing, you may temporarily disable required email confirmation. If confirmation is enabled, confirm the parent email after signup.

Apply all migrations:

```bash
npx supabase link --project-ref your-project-ref
npm run db:push
```

Or manually run these files in the Supabase SQL Editor in order:

```text
supabase/migrations/20260509130000_initial_schema.sql
supabase/migrations/20260509160000_learning_mechanics.sql
```

The migration creates:

- `families`
- `profiles`
- `children`
- `courses`
- `sources`
- `units`
- `lessons`
- `topics`
- `decks`
- `cards`
- `grammar_patterns`
- `dialogues`
- `practice_sessions`
- `practice_attempts`
- `review_schedule`
- `rewards`

RLS is enabled on application tables. Data is separated by `family_id`. Parent-managed tables require the authenticated user's profile to have role `parent`. The frontend uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; never expose a service role key in the browser.

## Seed Data

After applying the migration, run this file once in Supabase SQL Editor:

```text
supabase/seed.sql
```

Then sign in to the app as a parent, open `/parent/import`, and click the seed button. It calls:

```sql
select public.seed_demo_content();
```

Seed content includes 30 words, 10 phrases, and 5 grammar patterns, including `have got`, `can`, `like`, `would like`, and `articles a / an / the`.

## Starter 350 Content Pack

The larger starter base is generated from:

```text
scripts/learning-content-data.mjs
```

Generate the SQL seed and report:

```powershell
npm run content:report
```

This writes:

```text
supabase/seed_350_learning_content.sql
CONTENT_SEED_REPORT.md
```

Apply the function to Supabase:

```powershell
npx supabase db query --linked -f supabase/seed_350_learning_content.sql
```

Then sign in as a parent and either click **Add Starter 350** on `/parent/import`, or run:

```sql
select public.seed_starter_learning_content();
```

The pack currently contains 467 cards plus 20 grammar pattern rows:

- 300 words and classroom/routine lexical units
- 74 phrases
- 45 simple sentences
- 20 grammar pattern cards
- 20 mini dialogue cards
- 8 mini stories

Topics include greetings, family, school, classroom objects, classroom language, colours, numbers, toys, animals, food and drinks, body, clothes, house and rooms, weather, days of the week, actions, hobbies, feelings, places, simple questions, school routine, time and daily routine, and polite requests.

The seed is idempotent. It uses a stable course/source pair (`Starter 350 Pre-A1` / `Starter 350 generated seed`) and checks existing cards by `family_id + course_id + source_id + english + type`. Re-running it updates grammar templates and does not duplicate cards.

Check counts:

```powershell
npm run content:report
```

## Main User Flow

1. Open `/login`.
2. Sign up as a parent with email/password.
3. Open `/parent/children` and create a child profile.
4. Open `/parent/import` and add seed data, import CSV, or add cards manually on `/parent/cards`.
5. Click `Детский режим` in the top menu or `Перейти к занятию ребенка` on the parent dashboard.
6. Choose the child profile on `/child/select`.
7. Open `/child/practice`.
8. Use `Listen` or `Listen slowly`.
9. Complete the mixed daily practice.
10. Open `/parent/dashboard` or `/parent/progress` to see saved stats.

## Pages

- `/login` - parent login and signup
- `/parent/dashboard` - parent stats
- `/parent/children` - child profile creation, archive/restore, reset child statistics, start practice
- `/parent/courses` - basic course creation
- `/parent/cards` - card list, add, edit, archive, filters
- `/parent/texts` - reading/listening text CRUD
- `/parent/import` - CSV preview import and seed data import
- `/parent/progress` - detailed progress, weak cards, weak grammar, due cards
- `/child/select` - child profile selection without email
- `/child/dashboard` - simple child home screen
- `/child/practice` - mixed daily practice
- `/child/texts` - child reading/listening text list
- `/child/texts/[textId]` - one text, hidden translation, questions, text vocabulary review
- `/grammar` - grammar patterns

## CSV Import

Open `/parent/import`, choose a `.csv` file, review the preview table, fix highlighted rows, then confirm import. The importer supports:

```text
english,russian,type,topic,course,source,unit,lesson,example_en,example_ru,difficulty,tags,status
```

Required data:

- `english`
- `russian`
- `type` defaults to `word` when empty
- `status` defaults to `active` when empty
- `difficulty` defaults to `1` when empty

`tags` are comma-separated. If `topic`, `course`, `source`, `unit`, or `lesson` do not exist yet, the app creates them for the current family. Sample file:

```text
public/samples/cards-import-sample.csv
```

## Exercise Types

The child practice flow can build a short mixed session from cards, review schedule, previous mistakes, and grammar patterns:

- `choose_translation` - English to Russian multiple choice
- `russian_to_english` - Russian to English multiple choice
- `listen_and_choose` - listen to English, choose Russian translation
- `build_sentence` - tap words in order
- `fill_the_gap` - choose a missing word
- `question_form` - choose the correct question form
- `short_answer` - choose a short answer
- `articles` - choose `a`, `an`, `the`, or `no article`
- `mini_dialogue` - choose the next reply

## Daily Practice

`/child/practice` does not show the child every card. It builds a short session from:

- due cards from `review_schedule`
- weak cards with previous mistakes
- a few new active cards
- phrase/sentence cards when available
- one question form exercise
- one short answer exercise
- one articles exercise
- one mini-dialogue when data is available

If the family has little content, the builder uses what exists and still opens without crashing.

After a session, the child sees a summary with completed tasks, correct answers, mistakes, stars, and a detailed mistake review. Mistakes include the exercise type, prompt, child answer, correct answer, and a short Russian explanation. The child can repeat all mistakes or repeat a single missed task.

## How The Child Learns Words

The child should not learn from the parent card list. `/parent/cards` is only for managing content.

Child vocabulary learning is available from `/child/dashboard` and `/child/words`:

- `Занятие дня` opens the mixed daily practice.
- `Учить новые слова` opens `/child/words/new` and teaches 5-7 new or least-practiced words.
- `Повторить слова` opens `/child/words/review` and uses due cards from `review_schedule`.
- `Повторить ошибки` opens `/child/words/mistakes` and trains recent incorrect word attempts.
- `Слова по темам` opens `/child/words/topics`, where each topic starts a short topic session.

The new words mode uses a short learning cycle:

1. Presentation: English, Russian, Listen, Listen slowly, example sentence.
2. Recognition: English -> Russian.
3. Reverse recognition: Russian -> English.
4. Listening: hear English -> choose Russian.
5. Quick recall: Russian -> English.

Word-learning attempts are saved to `practice_attempts`, sessions are saved to `practice_sessions`, and card review timing is updated in `review_schedule`.

## Reading And Listening Texts

The child also has a separate text block for Pre-A1 reading and listening:

- `/child/texts` lists active short texts.
- `/child/texts/[textId]` opens one text.
- English text is shown first.
- Russian translation is hidden until the child clicks `Показать перевод`.
- `Слушать` and `Слушать медленно` use the browser SpeechSynthesis API.
- `Ответить на вопросы` saves text comprehension attempts to `practice_attempts` with `text_id`.
- `Повторить слова из текста` reviews 3-5 key words from `vocabulary_words`; if a matching card exists, the card is linked and review timing can update.

Parent text management is available at `/parent/texts`. The parent can create, edit, archive and restore reading texts with:

- `title_en`
- `title_ru`
- `text_en`
- `text_ru`
- topic
- level
- difficulty
- `vocabulary_words`
- `grammar_focus`
- `comprehension_questions`
- status

Starter Texts are original short texts written for this project. They are not copied from Academy Stars, Vereshchagina, Barashkova, PDFs, or textbooks. They use simple Starter 350 vocabulary and patterns such as `to be`, `have got`, `can`, `like`, `would like`, `a/an/the`, `there is/there are`, and simple questions.

Generate and apply the starter text seed:

```powershell
npm run content:report
npx supabase db query --linked -f supabase/seed_starter_texts.sql
```

Then open `/parent/import` and click `Добавить Starter Texts`. The seed is idempotent: it uses the stable course/source pair `Starter Texts Pre-A1` / `Starter texts generated seed` and checks existing texts by `family_id + source_id + title_en`.

## Grammar: this / that / these / those

The app includes a separate idempotent grammar extension for demonstratives:

- `this` - one thing near: `This is my book.`
- `that` - one thing far: `That is my bag.`
- `these` - several things near: `These are my pencils.`
- `those` - several things far: `Those are my books.`

Important rule: `this/that` use `is`; `these/those` use `are`.

Apply the migration, then add the content from `/parent/import` with `Добавить grammar: this/that/these/those`, or run:

```sql
select public.seed_demonstratives_content();
```

The extension adds:

- 1 grammar pattern row: `demonstratives_this_that_these_those`
- 62 cards for sentences, question forms, short answers, fill gaps and mini-dialogues
- 2 original starter texts with `these/those`

Check `/grammar` for the child-friendly explanation and the `Потренировать` button. It opens `/child/practice?grammar_key=demonstratives_this_that_these_those` and builds a short focused grammar practice.

## Grammar: -ing / Present Continuous

The `-ing / Present Continuous` pack teaches actions happening now:

- `I am running.`
- `She is sleeping.`
- `He is playing football.`
- `They are jumping.`
- `What are you doing?`
- `Are they jumping?`

Rule: `I am + ing`, `he/she/it is + ing`, `you/we/they are + ing`. The practice focuses on not dropping `am/is/are`.

## Grammar: Days And Time Expressions

The `Days and time expressions` pack teaches:

- `on + day`: `on Monday`, `on Sunday`
- `in + part of day`: `in the morning`, `in the afternoon`, `in the evening`
- `at night`
- `at + clock time`: `at seven o'clock`
- no preposition with `last / next / this`: `last weekend`, `next week`, `this morning`

Apply the latest migration, then add both packs from `/parent/import` with `Добавить grammar pack: -ing + time`, or run:

```sql
select public.seed_ing_time_content();
```

The pack adds 2 grammar pattern rows, 109 cards, and 3 original short texts:

- `My morning`
- `In the park`
- `Last weekend`

Every grammar pattern card on `/grammar` now has a `Потренировать` button. It opens focused practice by `grammar_key` and uses the existing child practice summary, saved attempts, review schedule, and mistake review.

Targeted grammar practice is strict: if a child clicks `Practice` / `Потренировать` for one grammar topic, the session uses only cards/templates for that `grammar_key`. Daily practice can still mix topics, but focused grammar practice must not pull unrelated review cards or random weak cards.

## Grammar: Personal Pronouns

The `Personal pronouns` pack teaches:

- `I` - я: `I am eight.`
- `you` - ты / вы: `You are my friend.`
- `he` - он: `He is my brother.`
- `she` - она: `She is my sister.`
- `it` - оно / это: `It is a cat.`
- `we` - мы: `We are pupils.`
- `they` - они: `They are happy.`

Rule: `I am`, `he/she/it is`, `you/we/they are`. The focused practice checks question forms such as `Are you happy?`, `Is he your brother?`, `Is she your sister?`, `Are they pupils?`, and short answers like `Yes, he is` / `No, they aren't`.

## Grammar: Possessive Words

The `Possessive words` pack teaches `my`, `your`, `his`, `her`, `its`, `our`, and `their`.

Examples:

- `This is my book.`
- `This is your pencil.`
- `This is his dog.`
- `This is her bag.`
- `This is our classroom.`
- `These are their toys.`
- `Whose book is this?`

Apply the latest migration, then add the pack from `/parent/import` with `Добавить grammar: pronouns`, or run:

```sql
select public.seed_pronouns_content();
```

The pack adds 2 grammar pattern rows, pronoun/possessive cards, fill gaps, question forms, short answers, build-sentence cards, and 2 original short texts: `My family` and `Our classroom`.

Possessive fill gaps use context so the correct answer is unambiguous:

- `Anna has a bag. This is ___ bag.` -> `her`
- `Tom has a dog. This is ___ dog.` -> `his`
- `They have toys. These are ___ toys.` -> `their`

Avoid bare prompts like `These are ___ toys.` when several possessive words are grammatically possible. `npm run content:check` guards these known ambiguous patterns.

Focused practice URLs:

- `/child/practice?grammar_key=personal_pronouns`
- `/child/practice?grammar_key=possessive_adjectives`

## Child Management

Parents can manage child profiles on `/parent/children`:

- `Начать занятие` selects the child and opens `/child/practice`.
- `Архивировать` hides the child from `/child/select` without deleting learning history.
- `Восстановить` returns an archived child to active selection.
- `Обнулить статистику` deletes only that child's progress data: `practice_attempts`, `practice_sessions`, `review_schedule`, and `rewards`.

Reset does not delete cards, courses, Starter 350, or other children. It requires typing `RESET`.

## Question Forms Trainer

The `question_form` exercise stores `exercise_type = question_form` in `practice_attempts`. MVP examples include:

- `I have got a dog.` -> `Have you got a dog?`
- `I can swim.` -> `Can you swim?`
- `I like apples.` -> `Do you like apples?`
- `I would like some juice.` -> `Would you like some juice?`

## Articles Trainer

The `articles` exercise uses sentence gaps and saves attempts with `exercise_type = articles`. MVP examples include:

- `I have got ___ apple.` -> `an`
- `I have got ___ cat.` -> `a`
- `I have got a cat. ___ cat is black.` -> `the`
- `___ sun is yellow.` -> `the`
- `Open ___ door.` -> `the`

After an incorrect answer, the child sees a short Russian explanation.

## Short Answer Trainer

The `short_answer` exercise stores `exercise_type = short_answer` in `practice_attempts`. MVP examples include:

- `Have you got a dog?` -> `Yes, I have.` / `No, I haven't.`
- `Can you swim?` -> `Yes, I can.` / `No, I can't.`
- `Do you like apples?` -> `Yes, I do.` / `No, I don't.`
- `Would you like an apple?` -> `Yes, please.` / `No, thank you.`

## Mini Dialogue Trainer

The `mini_dialogue` exercise shows the first line, allows listening to it with SpeechSynthesis, and asks the child to choose the best reply. MVP examples include:

- `Would you like some juice?` -> `Yes, please.`
- `Have you got a pencil?` -> `No, I haven't.`
- `Do you like bananas?` -> `Yes, I do.`

## Card Types

Supported card types:

- `word`
- `phrase`
- `sentence`
- `grammar_pattern`
- `dialogue`
- `mini_story`

Cards include `family_id`, `course_id`, `source_id`, `unit_id`, `lesson_id`, `deck_id`, `topic_id`, `english`, `russian`, `type`, `difficulty`, `tags`, examples, optional media URLs, `status`, `created_by`, and timestamps.

## PWA

Implemented:

- `app/manifest.ts`
- `public/sw.js`
- placeholder icons in `public/icons`
- responsive layout for phone, laptop, and tablet

Service workers require `localhost` or HTTPS.

## Minimal Smoke Test Checklist

- [ ] Login page opens.
- [ ] Parent can sign up.
- [ ] Parent can create a child profile.
- [ ] Parent can add a card.
- [ ] Parent can import `public/samples/cards-import-sample.csv` with preview.
- [ ] Child can select profile.
- [ ] Child can open practice.
- [ ] Listen button speaks.
- [ ] Child can choose translation, build a sentence, and answer grammar exercises.
- [ ] Wrong answers show the explanation and wait for `Продолжить`.
- [ ] Attempt is saved in `practice_attempts`.
- [ ] `review_schedule` is updated after card exercises.
- [ ] Parent dashboard shows stats by exercise type.

## Manual Child Flow Check

1. Create/sign in as parent.
2. Create a child profile.
3. Run seed data or import the sample CSV.
4. Select the child at `/child/select`.
5. Open `/child/practice`.
6. Complete the session and check the summary.
7. Open `/parent/progress` and verify total attempts, accuracy by type, weak cards, weak grammar, and due cards.

## Audit Note

`npm audit --audit-level=moderate` currently reports 5 vulnerabilities from the Next.js 14 dependency tree. The suggested automatic fix is `npm audit fix --force`, which would install Next 16 and can break the app. Do not run the forced fix as a stabilization step. Safe plan: upgrade Next/React intentionally in a separate branch, run `npm install`, `npm run typecheck`, `npm run build`, and manually smoke-test auth/practice/import.

## How To Connect This Folder To GitHub

The current folder may not contain `.git`. If you want to publish this local folder to the GitHub repository, run these commands from `D:\Projects\kids-english-trainer`:

```bash
git init
git remote add origin https://github.com/ilyavorobiov777-hash/kids-english-trainer.git
git branch -M main
git add .
git commit -m "Initial MVP foundation"
git push -u origin main
```

If Git says the remote already exists, inspect it first with:

```bash
git remote -v
git status
```

## Deployment

Production deploy is prepared for Vercel so the app can work from a tablet, iPhone, or Windows laptop while the local computer is off.

Current production URL:

```text
https://kids-english-trainer.vercel.app
```

Before testing auth on production, complete [SUPABASE_REDIRECT_TODO.md](SUPABASE_REDIRECT_TODO.md).

Production now uses a Vercel API proxy/BFF:

- browser calls only `https://kids-english-trainer.vercel.app/api/...`;
- Vercel server routes call Supabase server-side;
- mobile devices do not need direct access to `*.supabase.co`;
- Supabase RLS still applies through the user access token stored in httpOnly cookies.

Detailed guides:

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- [SUPABASE_PRODUCTION_CHECKLIST.md](SUPABASE_PRODUCTION_CHECKLIST.md)
- [PRODUCTION_SMOKE_TEST.md](PRODUCTION_SMOKE_TEST.md)
- [PROXY_SMOKE_TEST.md](PROXY_SMOKE_TEST.md)
- [SECURITY_PROXY_NOTES.md](SECURITY_PROXY_NOTES.md)
- [PWA_INSTALL_GUIDE.md](PWA_INSTALL_GUIDE.md)
- [SUPABASE_REDIRECT_TODO.md](SUPABASE_REDIRECT_TODO.md)

Short path:

1. Run checks locally:

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run content:report
npm.cmd run content:check
npm.cmd run deploy:check
```

2. Create a Vercel project from GitHub repository:

```text
ilyavorobiov777-hash/kids-english-trainer
```

3. Add Vercel environment variables:

   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`

4. Deploy from Vercel.
5. Copy the Vercel production URL.
6. In Supabase `Authentication -> URL Configuration`, set `Site URL` to:

```text
https://kids-english-trainer.vercel.app
```

7. Add these Redirect URLs:

```text
http://localhost:3000/**
https://kids-english-trainer.vercel.app/**
https://*.vercel.app/**
```

8. Run the production smoke test from [PRODUCTION_SMOKE_TEST.md](PRODUCTION_SMOKE_TEST.md).
9. Install the PWA on Android/iPhone/Windows using [PWA_INSTALL_GUIDE.md](PWA_INSTALL_GUIDE.md).

Do not add a Supabase `service_role` key to Vercel frontend environment variables. Do not upload `.env.local` to Vercel. Create your own parent user in production; do not publish test email/password pairs.

## Next Stage

Good next items:

- Real child PIN/session instead of child mode inside parent auth session.
- E2E tests for import and practice flow.
- Dedicated authoring UI for grammar pattern exercises.
- Stronger spaced repetition logic.
- Storage buckets for images/audio.
