# Proxy Smoke Test

Production URL:

```text
https://kids-english-trainer.vercel.app
```

Run this on tablet/phone without VPN after deployment.

1. Open production URL.
2. Open `/login`.
3. In browser DevTools Network, confirm browser requests go to `kids-english-trainer.vercel.app`.
4. Confirm there are no browser requests to `*.supabase.co`.
5. Open `/diagnostics` and run diagnostics.
6. Confirm `Vercel API Auth health` is OK.
7. Sign up or login parent.
8. Create child profile.
9. Add Starter 350.
10. Add Starter Texts.
11. Open `/parent/cards`.
12. Open `/child/select`.
13. Start child practice.
14. Complete lesson.
15. Open `/child/words/new`.
16. Open `/child/words/review`.
17. Open `/child/words/mistakes`.
18. Open `/child/words/topics`.
19. Open `/child/texts`.
20. Open a text.
21. Show translation.
22. Complete text questions.
23. Check `/parent/dashboard`.
24. Check `/parent/progress`.
25. Logout.
26. Login again.
27. Re-test on Android tablet, iPhone Safari, and Windows Yandex Browser without VPN.

Critical failures:

- Browser directly requests `*.supabase.co`.
- `/api/auth/health` fails from production.
- Login does not set a session.
- API returns another family's data.
- Practice attempts are not saved.
- Statistics do not update.
