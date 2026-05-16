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
11. [ ] `Добавить grammar pack: -ing + time` works.
12. [ ] Re-running -ing + time does not create duplicates.
13. [ ] `/grammar` shows `This / that / these / those`.
14. [ ] `/grammar` shows `-ing: что кто-то делает сейчас`.
15. [ ] `/grammar` shows `Дни недели и время: on, in, at, last, next`.
16. [ ] Every grammar pattern card has `Потренировать`.
17. [ ] `/child/practice?grammar_key=demonstratives_this_that_these_those` starts focused grammar practice.
18. [ ] `/child/practice?grammar_key=present_continuous_ing` starts focused -ing practice.
19. [ ] `/child/practice?grammar_key=days_time_expressions` starts focused time practice.
20. [ ] Demonstratives practice uses `these/those + are`, not `these/those + is`.
21. [ ] -ing practice checks `I am`, `She is`, `They are`.
22. [ ] Time practice checks `on Sunday`, `in the morning`, `at night`, `at seven o'clock`, `last weekend`.
23. [ ] `/parent/cards` shows cards.
24. [ ] `/parent/texts` shows texts.
25. [ ] Create child profile.
26. [ ] `/child/select` shows the child.
27. [ ] `/child/practice` starts a short session.
28. [ ] `Listen` works.
29. [ ] `Listen slowly` works.
30. [ ] Articles exercise works.
31. [ ] Mini dialogue exercise works.
32. [ ] Complete the daily session.
33. [ ] `/child/words/new` works.
34. [ ] `/child/words/review` works.
35. [ ] `/child/words/mistakes` works.
36. [ ] `/child/words/topics` works.
37. [ ] `/child/texts` opens.
38. [ ] A text opens.
39. [ ] Translation is hidden by default.
40. [ ] `Показать перевод` works.
41. [ ] Text comprehension questions work.
42. [ ] `Повторить слова из текста` works.
43. [ ] `/parent/dashboard` shows updated statistics.
44. [ ] `/parent/progress` shows recent mistakes and text statistics.
45. [ ] Android tablet works.
46. [ ] iPhone Safari works.
47. [ ] Windows Yandex Browser works.

## Pronouns Production Checks

- [ ] `/parent/import` button `Добавить grammar: pronouns` works.
- [ ] Re-running pronouns pack does not create duplicates.
- [ ] `/grammar` shows `Личные местоимения: I, you, he, she, it, we, they`.
- [ ] `/grammar` shows `Притяжательные слова: my, your, his, her, our, their`.
- [ ] `/child/practice?grammar_key=personal_pronouns` starts focused practice.
- [ ] `/child/practice?grammar_key=possessive_adjectives` starts focused practice.
- [ ] Pronouns practice checks `I am`, `He is`, `She is`, `We are`, `They are`.
- [ ] Possessive practice checks `my book`, `your pencil`, `his dog`, `her bag`, `our classroom`, `their toys`.
- [ ] Possessive fill gaps include context, for example `Anna has a bag. This is ___ bag.` -> `her`.
- [ ] Wrong answers do not auto-advance; they show the explanation and wait for `Продолжить`.
- [ ] Focused grammar practice does not mix unrelated grammar topics.
- [ ] `/child/texts` includes `My family` and `Our classroom` after adding the pack.

## Curated Topic Blocks And Feedback Translation

- [ ] Wrong answers show `Перевод`, and known grammar tasks do not show `Перевод недоступен`.
- [ ] Correct answers show brief positive feedback and auto-advance after about 1 second.
- [ ] Wrong answers still wait for the `Продолжить` button and do not auto-advance.
- [ ] `/grammar` does not show duplicate `Personal pronouns` or duplicate `Possessive words`.
- [ ] `/child/words/topics` shows `Вопросительные слова`.
- [ ] `/child/words/topics` shows `Местоимения`.
- [ ] `/child/words/topics` shows `Дни недели и время`.
- [ ] `/child/words/topics` shows `This / that / these / those`.
- [ ] `/child/words/topics` shows `-ing actions`.
- [ ] Each curated block opens a non-empty `/child/words/topic/...` training flow.
- [ ] Re-opening the same topic block gives a fresh word/card order.
- [ ] Answer options are shuffled and always include the correct answer.

## Critical Failures

Stop and fix if:

- login redirects to localhost in production;
- parent sees another family's data;
- Starter 350 duplicates cards;
- Starter Texts duplicates texts;
- Demonstratives seed duplicates cards/texts;
- -ing + time seed duplicates cards/texts;
- pronouns seed duplicates cards/texts;
- wrong answer auto-advances before the child can read the explanation;
- known grammar wrong-answer feedback shows `Перевод недоступен`;
- demonstratives practice offers `these is` or `those is` as a correct answer;
- -ing practice accepts `I running`, `She are sleeping`, or `They is playing` as correct;
- time practice accepts `in Sunday`, `in night`, or `on seven o'clock` as correct;
- pronouns practice accepts `I book`, `he are`, `she are`, or `they is` as correct;
- possessive practice shows bare ambiguous prompts such as `These are ___ toys.` without context;
- child practice starts with an empty exercise;
- exercise options do not contain the correct answer;
- practice attempts are not saved;
- text attempts are not saved with `text_id`;
- parent statistics do not update after practice;
- service role key appears in browser-visible code, logs, or env.
