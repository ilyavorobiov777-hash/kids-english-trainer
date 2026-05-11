# Production Smoke Test

Run this after Vercel deployment and after important production changes.

Production URL:

```text
https://kids-english-trainer.vercel.app
```

## Automated Smoke Already Checked

- [x] Production deploy completed with Vercel CLI.
- [x] `/login` returns HTTP 200.
- [x] `/parent/import` returns HTTP 200 before login and renders the app shell.
- [x] `/child/texts` returns HTTP 200 before login and renders the app shell.
- [x] `/grammar` returns HTTP 200.
- [x] `/manifest.webmanifest` returns HTTP 200.
- [x] `/` returns HTTP 307 redirect, which is acceptable for the app root.
- [x] Supabase CLI can see linked project `etuvgikfrlndeayczbrm`.
- [x] Vercel API proxy routes are part of the production build.

## Auth Redirect Status

Supabase Auth URL Configuration still needs the manual dashboard update from `SUPABASE_REDIRECT_TODO.md`.

Required values:

```text
Site URL: https://kids-english-trainer.vercel.app

Redirect URLs:
http://localhost:3000/**
https://kids-english-trainer.vercel.app/**
https://*.vercel.app/**
```

Automatic update was not performed because `SUPABASE_ACCESS_TOKEN` is not present locally and Supabase CLI does not provide a direct safe command for this setting.

Manual checks still required after updating Supabase Auth redirect URLs in `SUPABASE_REDIRECT_TODO.md`.

For the new proxy architecture, also run [PROXY_SMOKE_TEST.md](PROXY_SMOKE_TEST.md). Mobile devices should no longer need direct access to `*.supabase.co`.

## Checklist

1. [ ] Open production URL.
2. [ ] `/login` opens.
3. [ ] Parent signup/login works.
4. [ ] `/parent/import` opens.
5. [ ] `Добавить Starter 350` works.
6. [ ] Re-running Starter 350 does not create duplicates.
7. [ ] `Добавить Starter Texts` works.
8. [ ] Re-running Starter Texts does not create duplicates.
9. [ ] `Добавить grammar: this/that/these/those` works.
10. [ ] Re-running demonstratives does not create duplicates.
11. [ ] `/grammar` shows `This / that / these / those`.
12. [ ] `/child/practice?grammar_key=demonstratives_this_that_these_those` starts a focused grammar practice.
13. [ ] Demonstratives practice uses `these/those + are`, not `these/those + is`.
14. [ ] `/parent/cards` shows cards.
15. [ ] `/parent/texts` shows texts.
16. [ ] Create child profile.
17. [ ] `/child/select` shows the child.
18. [ ] `/child/practice` starts a short session.
19. [ ] `Listen` works.
20. [ ] `Listen slowly` works.
21. [ ] Articles exercise works.
22. [ ] Mini dialogue exercise works.
23. [ ] Complete the daily session.
24. [ ] `/child/words/new` works.
25. [ ] `/child/words/review` works.
26. [ ] `/child/words/mistakes` works.
27. [ ] `/child/words/topics` works.
28. [ ] `/child/texts` opens.
29. [ ] A text opens.
30. [ ] Translation is hidden by default.
31. [ ] `Показать перевод` works.
32. [ ] Text comprehension questions work.
33. [ ] `Повторить слова из текста` works.
34. [ ] `/parent/dashboard` shows updated statistics.
35. [ ] `/parent/progress` shows recent mistakes and text statistics.
36. [ ] Android tablet works.
37. [ ] iPhone Safari works.
38. [ ] Windows Yandex Browser works.

## Critical Failures

Stop and fix if:

- login redirects to localhost in production;
- parent sees another family's data;
- Starter 350 duplicates cards;
- Starter Texts duplicates texts;
- Demonstratives seed duplicates cards/texts;
- demonstratives practice offers `these is` or `those is` as a correct answer;
- child practice starts with an empty exercise;
- exercise options do not contain the correct answer;
- practice attempts are not saved;
- text attempts are not saved with `text_id`;
- parent statistics do not update after practice;
- service role key appears in browser-visible code, logs, or env.
