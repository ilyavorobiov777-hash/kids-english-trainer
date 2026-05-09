# Project Status

Last development pass: 2026-05-09.

## Implemented

- Next.js App Router, TypeScript, Tailwind CSS, PWA manifest/service worker/icons.
- Supabase Auth/Postgres foundation with RLS and `family_id` separation.
- Parent flows: login/signup, children, courses, cards CRUD, CSV import, seed import, dashboard, progress.
- Child flows: profile select, dashboard, mixed daily practice.
- CSV import with client-side parsing, preview, row validation, error highlighting, and summary.
- Sample CSV: `public/samples/cards-import-sample.csv`.
- Practice exercise types:
  - `choose_translation`
  - `russian_to_english`
  - `listen_and_choose`
  - `build_sentence`
  - `fill_the_gap`
  - `question_form`
  - `short_answer`
  - `articles`
  - `mini_dialogue`
- Question form trainer examples for `have got`, `can`, `like`, and `would like`.
- Articles trainer with `a / an / the / no article` options and Russian explanations.
- Daily practice builder using due cards, weak cards, new cards, phrases, and grammar exercises.
- Practice attempts save `card_id` when applicable and `grammar_pattern_id` when applicable.
- Review schedule updates with simple intervals and FSRS-ready fields.
- Parent statistics for total sessions, attempts, accuracy, accuracy by exercise type, weak cards, weak grammar, articles/question accuracy, last practice date, and due cards.

## Commands Verified In This Environment

The Codex desktop app has a bundled `node.exe` earlier in PATH that returns `Access is denied`. Commands pass when normal Node.js is put first in PATH:

```powershell
$env:PATH='C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' run typecheck
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Results:

- `npm run typecheck` passed.
- `npm run build` passed.
- React hook dependency warnings from the previous pass were cleaned up where safe.
- `npm run deploy:check` is available for production readiness checks.
- Supabase CLI is installed as a project dev dependency and verified with `npx supabase --version` -> `2.98.2`.

## Commands To Run Locally

On a normal Windows terminal with Node.js installed:

```powershell
cd D:\Projects\kids-english-trainer
npm install
copy .env.example .env.local
npm run typecheck
npm run build
npm run dev
```

Fill `.env.local` before starting the app:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Supabase Readiness

- `.env.local` is ignored by git and not tracked.
- `.env.example` contains only public frontend env variables.
- No service role key is used in frontend code.
- Use `npx supabase link --project-ref your-project-ref` and `npm run db:push` after `npm install`.
- Migration order:
  1. `supabase/migrations/20260509130000_initial_schema.sql`
  2. `supabase/migrations/20260509160000_learning_mechanics.sql`
- Seed path: `supabase/seed.sql`.
- New migration extends `practice_attempts`, `grammar_patterns`, and `review_schedule` without dropping existing data.

## Minimal Smoke Test Checklist

- [ ] Login page opens.
- [ ] Parent can sign up.
- [ ] Parent can create a child profile.
- [ ] Parent can add a card.
- [ ] Parent can import `public/samples/cards-import-sample.csv`.
- [ ] Child can select profile.
- [ ] Child can open daily practice.
- [ ] Listen and Listen slowly speak English.
- [ ] Child can complete translation, sentence, question, and articles exercises.
- [ ] Attempts are saved in `practice_attempts`.
- [ ] Review rows are updated in `review_schedule`.
- [ ] Parent dashboard/progress shows stats by exercise type.

## Audit Finding

`npm audit --audit-level=moderate` reports 5 vulnerabilities in the current dependency tree:

- `next` high severity advisories.
- `glob` high severity advisory via `eslint-config-next`.
- `postcss` moderate advisory under Next dependency tree.

The suggested automatic remediation is `npm audit fix --force`, which would upgrade to Next 16 and is a breaking dependency jump. This was intentionally not run. Safe plan: perform a dedicated framework-upgrade branch later, run full typecheck/build/manual smoke tests, then merge.

## Known Risks

- Child mode still uses the authenticated parent session plus selected child id in `localStorage`. A real child PIN/session model remains a next-stage security improvement.
- Seed RPC can still create duplicate demo data if clicked repeatedly.
- Grammar exercises are MVP template-based; a dedicated grammar authoring UI is still needed.
- Review scheduling is intentionally simple and FSRS-ready, not a full FSRS implementation.

## Next Stage

1. Create a Vercel project from the GitHub repository.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
3. Deploy and add the Vercel URL to Supabase Auth redirect URLs.
4. Run `PRODUCTION_SMOKE_TEST.md` on Windows, Android tablet, and iPhone.
5. Add E2E tests for import, practice attempts, and parent stats.
6. Add a real child PIN/session model.
