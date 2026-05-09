# kids-english-trainer

Browser PWA for helping a primary-school child learn English with a Russian-first interface. The MVP covers the core loop: a parent signs in, creates a child profile, adds cards, the child selects a profile and completes a simple practice session, and the parent sees progress stats from saved attempts.

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
```

`typecheck` runs `tsc --noEmit`.

## Supabase Setup

1. Create a Supabase project.
2. In `Project Settings -> API`, copy the Project URL and anon public key to `.env.local`.
3. In `Authentication -> Providers -> Email`, enable email/password auth.
4. For local MVP testing, you may temporarily disable required email confirmation. If confirmation is enabled, confirm the parent email after signup.

Apply the migration:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

Or manually run this file in the Supabase SQL Editor:

```text
supabase/migrations/20260509130000_initial_schema.sql
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

RLS is enabled on application tables. Data is separated by `family_id`. Parent-managed tables require the authenticated user's profile to have role `parent`.

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

## Main User Flow

1. Open `/login`.
2. Sign up as a parent with email/password.
3. Open `/parent/children` and create a child profile.
4. Open `/parent/import` and add seed data, or add cards manually on `/parent/cards`.
5. Open `/child/select` and choose the child profile.
6. Open `/child/practice`.
7. Use `Listen` or `Listen slowly`.
8. Choose the Russian translation.
9. Open `/parent/dashboard` or `/parent/progress` to see saved stats.

## Pages

- `/login` - parent login and signup
- `/parent/dashboard` - parent stats
- `/parent/children` - child profile creation
- `/parent/courses` - basic course creation
- `/parent/cards` - card list, add, edit, archive, filters
- `/parent/import` - seed data import
- `/parent/progress` - detailed progress and weak cards
- `/child/select` - child profile selection without email
- `/child/dashboard` - simple child home screen
- `/child/practice` - Choose translation practice
- `/grammar` - grammar patterns

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
- [ ] Child can select profile.
- [ ] Child can open practice.
- [ ] Listen button speaks.
- [ ] Child can choose translation.
- [ ] Attempt is saved in `practice_attempts`.
- [ ] Parent dashboard shows stats.

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

## Deploy To Vercel

1. Create a Vercel project from the GitHub repository.
2. Add env variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Make sure Supabase migrations are applied.
4. Deploy.

## Next Stage

Do not add larger features until the local install/build smoke test passes on a normal Node.js LTS environment.

Good next items after stabilization:

- Real child PIN/session instead of child mode inside parent auth session.
- CSV/Excel import.
- More exercise types.
- Stronger spaced repetition logic.
- Storage buckets for images/audio.
- E2E tests.
