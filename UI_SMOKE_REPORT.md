# UI Smoke Report

Date: 2026-05-09

## Checked

- `.env.local` is ignored by `.gitignore` and is not tracked by Git.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run content:report` passed and still reports 467 starter cards.
- Production Next server was started locally on `http://localhost:3000`.
- HTTP smoke checks returned 200 for:
  - `/login`
  - `/parent/dashboard`
  - `/parent/import`
  - `/parent/cards`
  - `/parent/progress`
  - `/child/select`
  - `/child/practice`
  - `/grammar`

## Scenarios Reviewed

- Parent import page and Starter 350 button logic.
- Starter 350 idempotent UX copy and current pack count display.
- Daily practice generation logic for due cards, weak cards, new cards, phrases, grammar, articles, short answers, mini dialogues, and listening.
- Exercise option generation guards:
  - correct answer is included;
  - duplicate answer options are removed;
  - choice exercises require at least 2 options;
  - build sentence requires at least 2 words;
  - articles use fixed options: `a`, `an`, `the`, `no article`.
- Child practice UI states:
  - progress display;
  - Listen and Listen slowly;
  - build sentence reset;
  - wrong-answer correction;
  - articles explanation;
  - final summary.
- Parent statistics rendering and empty states.

## Bugs Found

- Several Russian UI strings in practice/statistics code were corrupted by encoding artifacts.
- Daily practice selection was too random and could over-focus on arbitrary cards instead of review/weak/new balance.
- Answer options did not have a strong fallback path when the content pool was small.
- Build sentence allowed checking before all words were selected.
- Starter 350 button did not show pack status or a clear idempotency message.

## Fixed

- Restored readable Russian UI strings in child practice and parent statistics.
- Reworked daily practice builder to target a 10-15 task session with a methodical mix:
  - due review cards;
  - weak cards;
  - new or less-practiced cards;
  - phrase/sentence tasks;
  - question form;
  - short answer;
  - articles;
  - mini dialogue;
  - listen and choose.
- Added validation and de-duplication for generated exercises.
- Added safe fallback distractors for English and Russian answer options.
- Improved Starter 350 button UX with loading state, current count, inserted/existing/total result, and safe-repeat copy.
- Added parent statistics streak card and clearer empty states.

## Still To Check Manually

- Full parent login in the browser with the real Supabase session.
- Clicking `Добавить Starter 350` twice and confirming the second run shows `added 0`.
- Visual layout on iPhone width, Android tablet width, and Windows laptop width.
- Browser SpeechSynthesis voice availability in Chrome, Yandex Browser, Safari, and Edge.
- A full child practice run by clicking through all exercise types.
