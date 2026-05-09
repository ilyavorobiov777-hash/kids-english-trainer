# Production Smoke Test

Run this after the first Vercel deployment and after any important production change.

Production URL:

```text
https://your-vercel-production-url
```

## Core Pages

- [ ] Open production URL.
- [ ] `/login` opens.
- [ ] `/parent/dashboard` opens after login.
- [ ] `/parent/import` opens.
- [ ] `/parent/cards` opens.
- [ ] `/parent/progress` opens.
- [ ] `/child/select` opens.
- [ ] `/child/practice` opens after child selection.
- [ ] `/grammar` opens.

## Parent Auth

- [ ] Parent signup works.
- [ ] Parent login works.
- [ ] If email confirmation is enabled, confirmation link returns to production URL.
- [ ] Parent logout/login does not lose family data.

## Starter 350

- [ ] Open `/parent/import`.
- [ ] Current Starter 350 count is visible.
- [ ] Click `Добавить Starter 350`.
- [ ] Success message appears.
- [ ] Message shows inserted count, existing count, total count.
- [ ] Click `Добавить Starter 350` again.
- [ ] Second run does not create duplicates.
- [ ] `/parent/cards` shows cards.
- [ ] Type filter works.
- [ ] Topic filter works.
- [ ] Status filter works if available.

## Child Flow

- [ ] Create a child profile on `/parent/children`.
- [ ] Open `/child/select`.
- [ ] Child profile is visible.
- [ ] Select the child.
- [ ] `/child/dashboard` opens.
- [ ] Open `/child/practice`.
- [ ] Short daily practice starts.
- [ ] Practice does not show all 467 cards.
- [ ] Progress indicator is visible.
- [ ] Answer buttons are large enough on mobile.
- [ ] `Listen` works.
- [ ] `Listen slowly` works.
- [ ] Build sentence reset works.
- [ ] Wrong answer shows correct answer.
- [ ] Articles exercise shows Russian explanation.
- [ ] Complete the session.
- [ ] Summary shows completed tasks, correct answers, and stars.

## Statistics

- [ ] Open `/parent/dashboard`.
- [ ] Total sessions updated.
- [ ] Total attempts updated.
- [ ] Accuracy updated.
- [ ] Last practice date updated.
- [ ] Open `/parent/progress`.
- [ ] Accuracy by exercise type is visible.
- [ ] Weak cards appear after mistakes.
- [ ] Weak grammar appears after grammar mistakes.
- [ ] Due cards today appears when relevant.

## Devices / Browsers

- [ ] Android tablet Chrome.
- [ ] Android tablet Yandex Browser.
- [ ] iPhone Safari.
- [ ] Windows Chrome.
- [ ] Windows Edge.
- [ ] Windows Yandex Browser.

## PWA

- [ ] Manifest loads.
- [ ] Service worker registers.
- [ ] App can be added to home screen on Android.
- [ ] App can be added to home screen on iPhone Safari.
- [ ] App can be installed on Windows Chrome/Edge/Yandex Browser.

## Critical Failures

Stop and fix if any of these happen:

- [ ] Login redirects to localhost in production.
- [ ] Parent sees another family's data.
- [ ] Starter 350 duplicates cards on repeated run.
- [ ] Child practice starts with an empty exercise.
- [ ] Exercise options do not contain the correct answer.
- [ ] Practice attempts are not saved.
- [ ] Parent statistics do not update after practice.
- [ ] Service role key appears anywhere in browser-visible code or logs.
