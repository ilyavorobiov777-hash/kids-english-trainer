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

Manual checks still required after updating Supabase Auth redirect URLs in `SUPABASE_REDIRECT_TODO.md`.

## Checklist

1. [ ] Open production URL.
2. [ ] `/login` opens.
3. [ ] Parent signup/login works.
4. [ ] `/parent/import` opens.
5. [ ] `Добавить Starter 350` works.
6. [ ] Re-running Starter 350 does not create duplicates.
7. [ ] `Добавить Starter Texts` works.
8. [ ] Re-running Starter Texts does not create duplicates.
9. [ ] `/parent/cards` shows cards.
10. [ ] `/parent/texts` shows texts.
11. [ ] Create child profile.
12. [ ] `/child/select` shows the child.
13. [ ] `/child/practice` starts a short session.
14. [ ] `Listen` works.
15. [ ] `Listen slowly` works.
16. [ ] Articles exercise works.
17. [ ] Mini dialogue exercise works.
18. [ ] Complete the daily session.
19. [ ] `/child/words/new` works.
20. [ ] `/child/words/review` works.
21. [ ] `/child/words/mistakes` works.
22. [ ] `/child/words/topics` works.
23. [ ] `/child/texts` opens.
24. [ ] A text opens.
25. [ ] Translation is hidden by default.
26. [ ] `Показать перевод` works.
27. [ ] Text comprehension questions work.
28. [ ] `Повторить слова из текста` works.
29. [ ] `/parent/dashboard` shows updated statistics.
30. [ ] `/parent/progress` shows recent mistakes and text statistics.
31. [ ] Android tablet works.
32. [ ] iPhone Safari works.
33. [ ] Windows Yandex Browser works.

## Critical Failures

Stop and fix if:

- login redirects to localhost in production;
- parent sees another family's data;
- Starter 350 duplicates cards;
- Starter Texts duplicates texts;
- child practice starts with an empty exercise;
- exercise options do not contain the correct answer;
- practice attempts are not saved;
- text attempts are not saved with `text_id`;
- parent statistics do not update after practice;
- service role key appears in browser-visible code, logs, or env.
