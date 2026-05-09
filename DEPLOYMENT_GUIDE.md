# Deployment Guide

This guide deploys `kids-english-trainer` to Vercel so the app works from an Android tablet, iPhone, and Windows laptop even when the local computer is turned off.

## Current Production Status

Production deploy was completed with Vercel CLI.

Production URL:

```text
https://kids-english-trainer.vercel.app
```

Remaining manual actions:

1. Open `SUPABASE_REDIRECT_TODO.md`.
2. Add the production URL to Supabase Auth `Site URL`.
3. Add the local, production, and Vercel preview redirect URLs to Supabase Auth Redirect URLs.
4. Test parent signup/login on production.
5. In Vercel dashboard, connect the GitHub repository to the existing Vercel project if you want automatic deploys from `main`.

Note: CLI deploy works. During `vercel link`, Vercel could not automatically connect the GitHub repository to the project, so Preview branch env variables were not configured.

Supabase Auth redirect update status: not completed automatically. Supabase CLI can see the linked project `etuvgikfrlndeayczbrm`, but there is no direct safe CLI command for Auth URL Configuration. `SUPABASE_ACCESS_TOKEN` is not present locally, so the Management API was not used. See `SUPABASE_REDIRECT_TODO.md` for exact manual steps and the optional local-token retry path.

The production app now uses a Vercel API proxy. Browser code should call only `/api/...` on the app domain; Vercel route handlers call Supabase server-side.

## 1. Before Deploy

Run locally from `D:\Projects\kids-english-trainer`:

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run content:report
npm.cmd run deploy:check
```

Do not run `npm audit fix --force` as part of deployment prep.

## 2. Create Vercel Project

1. Open `https://vercel.com`.
2. Sign in with GitHub.
3. Click `Add New...` -> `Project`.
4. Choose the GitHub repository:

```text
ilyavorobiov777-hash/kids-english-trainer
```

5. Vercel should detect `Next.js`.
6. Keep the default build settings:
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: default

If Vercel CLI is not authorized locally, do not force CLI deploy. Use the Vercel dashboard.

## 3. Add Environment Variables

In Vercel project settings, add:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
```

Where to get them:

1. Open Supabase dashboard.
2. Open the `kids-english-trainer` project.
3. Go to `Project Settings` -> `API`.
4. Copy:
   - `Project URL` -> `SUPABASE_URL`
   - `anon public` key -> `SUPABASE_ANON_KEY`
   - production app URL -> `NEXT_PUBLIC_APP_URL`

Do not add:

- Supabase `service_role` key
- database password
- JWT secret
- `.env.local`
- private tokens not meant for browser use

The frontend must use only the public Supabase URL and anon key.

Legacy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may still exist from the older browser-direct version, but client code no longer uses them. Remove them after proxy smoke testing is complete.

## 4. Run First Deploy

1. Click `Deploy`.
2. Wait for the Vercel build to finish.
3. Copy the production URL, for example:

```text
https://kids-english-trainer.vercel.app
```

4. Open the URL and check `/login`.

## 5. Configure Supabase Auth Redirects

Production URL:

```text
https://kids-english-trainer.vercel.app
```

After Vercel gives you the production URL:

1. Open Supabase dashboard.
2. Open project `etuvgikfrlndeayczbrm`.
3. Go to `Authentication` -> `URL Configuration`.
4. Set `Site URL` to:

```text
https://kids-english-trainer.vercel.app
```

5. Add Redirect URLs:

```text
http://localhost:3000/**
https://kids-english-trainer.vercel.app/**
https://*.vercel.app/**
```

6. Save changes.

Keep `http://localhost:3000/**` for local development. Use a narrower preview pattern if your Supabase project is shared or sensitive.

## 6. Production Checks

After redirects are configured, verify:

1. `/login` opens.
2. Parent signup/login works.
3. `/parent/import` opens.
4. `Добавить Starter 350` works and does not duplicate on repeat.
5. `Добавить Starter Texts` works and does not duplicate on repeat.
6. `/parent/cards` shows cards.
7. `/parent/texts` shows texts.
8. Child profile can be created without child email.
9. `/child/practice` works.
10. `/child/words/new`, `/child/words/review`, `/child/words/mistakes`, `/child/words/topics` work.
11. `/child/texts` opens, text translation is hidden by default, questions save attempts.
12. `/parent/dashboard` and `/parent/progress` show updated statistics.

Use the full checklist in `PRODUCTION_SMOKE_TEST.md`.

## 7. PWA And Devices

The Vercel URL uses HTTPS, so browsers can install the app as a PWA.

Check:

- Android tablet: Chrome or Yandex Browser, browser menu -> install/add to home screen.
- iPhone: Safari -> Share -> Add to Home Screen.
- Windows: Chrome, Edge, or Yandex Browser install icon/menu.

If PWA does not install:

- confirm the URL starts with `https://`;
- confirm `/manifest.webmanifest` loads;
- confirm `public/sw.js` exists;
- confirm icons exist in `public/icons`;
- refresh after the first full load.

SpeechSynthesis can sound different on Windows, Android and iPhone. Mobile browsers may require a tap before speech starts.

## 8. Known Non-Blocking Warnings

Current production build does not report blocking ESLint warnings. If future `react-hooks/exhaustive-deps` warnings appear in practice, word learning, text reader or stats components, fix only when the behavior is clear. Do not make risky hook dependency changes right before deploy.

## 9. If Auth Fails On Production

Symptoms:

- login works locally but not on Vercel;
- email confirmation opens localhost;
- user returns to the wrong domain.

Fix:

1. Copy the exact Vercel production URL.
2. Add it to Supabase `Authentication` -> `URL Configuration`.
3. Set `Site URL` to production.
4. Add `https://kids-english-trainer.vercel.app/**` to Redirect URLs.
5. Keep `http://localhost:3000/**` for local development.
6. Keep `https://*.vercel.app/**` if you want Vercel preview auth testing.
7. Try login/signup again.
