# Supabase Redirect TODO

Production deploy is live:

```text
https://kids-english-trainer.vercel.app
```

Update Supabase Auth settings manually:

1. Open Supabase dashboard.
2. Open project `kids-english-trainer`.
3. Go to `Authentication` -> `URL Configuration`.
4. Set `Site URL` to:

```text
https://kids-english-trainer.vercel.app
```

5. Add these Redirect URLs:

```text
http://localhost:3000/**
https://kids-english-trainer.vercel.app/**
```

6. If you connect the Vercel project to GitHub and plan to test preview deployments, also add:

```text
https://*.vercel.app/**
```

7. Save changes.
8. Open production:

```text
https://kids-english-trainer.vercel.app/login
```

9. Test parent signup/login on production.

Notes:

- Do not add a service role key anywhere in frontend or Vercel public env.
- `.env.local` stays local and must not be uploaded or committed.
- Preview environment variables were not added because the Vercel project is not connected to the GitHub repository yet. Production deploy through CLI works.
