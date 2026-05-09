# Project Status

Last stabilization pass: 2026-05-09.

## Implemented

- Next.js App Router project structure.
- TypeScript config with `@/*` path alias.
- Tailwind CSS config and global styles.
- PWA manifest route, service worker, and placeholder icons.
- Supabase browser client using only public URL and anon key.
- Supabase migration with tables, indexes, timestamps, enums, triggers, and RLS.
- Parent login/signup page.
- Parent pages for dashboard, children, courses, cards, import, and progress.
- Child pages for profile selection, dashboard, and Choose translation practice.
- Grammar page.
- Card CRUD basics: list, add, edit, archive, type filter, topic filter.
- Practice flow: SpeechSynthesis listen, slow listen, rate slider, translation options, saved attempts, session updates, review schedule upsert.
- Seed RPC for 30 words, 10 phrases, and 5 grammar patterns.
- Windows local run guide.

## Commands To Run Locally

Recommended package manager: `npm`. The project has no existing lockfile yet, and npm is the simplest default for Windows and Vercel.

Run these on a normal Windows terminal with Node.js LTS installed:

```powershell
cd D:\Projects\kids-english-trainer
npm install
copy .env.example .env.local
npm run typecheck
npm run build
npm run dev
```

If PowerShell blocks `npm.ps1`, use `npm.cmd install`, `npm.cmd run typecheck`, `npm.cmd run build`, and `npm.cmd run dev`.

Fill `.env.local` before starting the app:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Expected Checks

- `npm install` completes and creates `package-lock.json`.
- `npm run typecheck` passes.
- `npm run build` passes.
- `npm run dev` starts Next.js.
- `/login` opens.
- Parent signup works.
- Parent can create a child profile.
- Parent can add or seed cards.
- Child can select profile.
- Child can open practice.
- `Listen` speaks English text through the browser.
- A translation answer creates a `practice_attempts` row.
- Parent dashboard reads stats from saved attempts.

## Current Environment Findings

- `node.exe` is present in PATH from the Codex desktop app, but executing `node --version` returns `Access is denied`.
- `npm`, `pnpm`, and `yarn` are not available in PATH.
- A separate bundled Node executable exists and can print a version, but it does not provide npm. This is not a suitable substitute for normal project setup.
- Because npm is unavailable, dependency installation, TypeScript, lint, build, and dev server checks could not be executed in this environment.
- `.git` has been initialized in `D:\Projects\kids-english-trainer`.
- Local branch: `main`.
- Remote: `origin` -> `https://github.com/ilyavorobiov777-hash/kids-english-trainer.git`.
- Initial local commit exists: `514d78e Initial MVP foundation`.
- Push was not completed because local GitHub credentials are not available to command-line Git. HTTPS push waits for Git Credential Manager authentication; SSH key `id_ed25519` is present locally but GitHub rejects it with `Permission denied (publickey)`.

## Supabase Readiness

- `.env.example` contains only:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- No service role key is used in frontend code.
- Migration path: `supabase/migrations/20260509130000_initial_schema.sql`.
- Seed path: `supabase/seed.sql`.
- The app relies on Supabase RLS plus `family_id` to separate data.

## Known Risks

- Child mode currently runs inside the authenticated parent browser session and stores selected child in `localStorage`. The UI prevents child editing, but database-level distinction between parent and child is not complete until a real child PIN/session model is implemented.
- `cards` has a parent manage policy that lets parents view archived cards. This is intentional for management, but child-facing queries should continue filtering `status = active`.
- The seed function can be run multiple times and will add duplicate demo content. Use it once per family for MVP testing.
- Service worker behavior should be tested after a real browser launch because build/dev checks could not be run here.

## Do Next

1. Install Node.js LTS on Windows.
2. Run `npm install`.
3. Run `npm run typecheck`.
4. Run `npm run build`.
5. Apply Supabase migration and seed SQL.
6. Complete the smoke test checklist.
7. Authenticate command-line GitHub access, then run `git push -u origin main`.

## Not Included In This Stabilization Step

- 350 cards.
- Excel import.
- OCR.
- AI generation.
- Pronunciation checking.
- New exercise types.
