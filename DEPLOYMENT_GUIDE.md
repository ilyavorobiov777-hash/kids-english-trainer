# Deployment Guide

This guide prepares `kids-english-trainer` for Vercel production deployment.

Official references:

- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel Next.js deployments: https://vercel.com/docs/concepts/next.js/overview
- Supabase Auth redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls

## 1. Create A Vercel Project

1. Open https://vercel.com.
2. Sign in or create an account.
3. Click `Add New...` -> `Project`.
4. Choose `Import Git Repository`.
5. Connect GitHub if Vercel asks for access.

## 2. Connect GitHub Repository

Choose:

```text
ilyavorobiov777-hash/kids-english-trainer
```

Vercel should detect:

- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: default Next.js output

Do not upload `.env.local` to Vercel. Add env variables through the Vercel dashboard.

## 3. Add Vercel Environment Variables

In Vercel:

1. Open the project.
2. Go to `Settings` -> `Environment Variables`.
3. Add these variables for `Production`:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Use the same values locally stored in `.env.local`, but paste them manually into Vercel.

## 4. Where To Get Supabase Values

Open Supabase:

1. Open https://supabase.com/dashboard.
2. Open project `kids-english-trainer`.
3. Go to `Project Settings` -> `API`.
4. Copy:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. What Not To Add

Never add these to frontend env variables:

- Supabase `service_role` key
- database password
- JWT secret
- `.env.local` file contents as a file upload
- any private token not prefixed with `NEXT_PUBLIC_`

This app is a browser app. It must use only the public Supabase URL and anon key on the frontend.

## 6. Run First Deploy

After env variables are added:

1. Click `Deploy` in Vercel.
2. Wait until the build finishes.
3. Open the generated production URL.

If Vercel CLI is not logged in locally, do not force CLI deploy. Use the Vercel dashboard first.

## 7. Check Production URL

Open:

```text
https://your-vercel-project.vercel.app
```

Check:

- `/login`
- `/parent/import`
- `/child/select`
- `/child/practice`
- `/grammar`

## 8. Check Login

1. Open `/login`.
2. Sign up as a parent or sign in with an existing parent account.
3. If email confirmation is enabled in Supabase, confirm the email.
4. Open `/parent/dashboard`.

If login redirects to localhost or the wrong domain, update Supabase Auth URL settings.

## 9. Supabase Auth Redirect Setup

After Vercel gives you the production URL:

1. Open Supabase dashboard.
2. Go to `Authentication` -> `URL Configuration`.
3. Set `Site URL` to the production URL, for example:

```text
https://kids-english-trainer.vercel.app
```

4. Add allowed redirect URLs:

```text
https://kids-english-trainer.vercel.app/**
http://localhost:3000/**
```

For Vercel preview deployments, add a preview wildcard only if you plan to test auth on preview URLs.

## 10. Check Child Practice

1. Open `/parent/children`.
2. Create a child profile if needed.
3. Open `/parent/import`.
4. Click `Добавить Starter 350`.
5. Open `/child/select`.
6. Select the child.
7. Open `/child/practice`.
8. Complete the short session.
9. Open `/parent/progress` and confirm attempts and accuracy changed.

## 11. Check SpeechSynthesis On Tablet

Speech is handled by the browser through the Browser SpeechSynthesis API.

Check on each device:

- `Listen` speaks the English prompt.
- `Listen slowly` uses a slower rate.
- If no voice is available, the app shows a fallback message instead of crashing.

Some mobile browsers only allow speech after a user tap. That is expected.

## 12. Add To Home Screen

After Vercel deployment, the app is available over HTTPS and can be installed as a PWA.

Use:

- Android Chrome/Yandex Browser: browser menu -> `Install app` or `Add to Home screen`.
- iPhone Safari: Share button -> `Add to Home Screen`.
- Windows Chrome/Edge/Yandex Browser: install icon in address bar or browser menu -> app install.

## 13. If PWA Does Not Install

Check:

- production URL uses HTTPS;
- `app/manifest.ts` serves `/manifest.webmanifest`;
- `public/sw.js` exists;
- icons exist in `public/icons`;
- browser has not blocked service workers;
- you are not opening `http://localhost` from another device.

Localhost works only on the same computer while the dev server is running. A tablet/iPhone should use the Vercel production URL.

## 14. If Supabase Auth Redirect Fails

Symptoms:

- login works locally but not on Vercel;
- email confirmation opens localhost;
- password reset redirects to the wrong URL.

Fix:

1. Copy the exact Vercel production URL.
2. Add it to Supabase `Authentication` -> `URL Configuration`.
3. Set `Site URL` to production.
4. Add `https://your-domain/**` to Redirect URLs.
5. Keep `http://localhost:3000/**` for local testing.
6. Redeploy or retry login.

## 15. Pre-Deploy Commands

Run locally before deploy:

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run content:report
npm.cmd run deploy:check
```

`deploy:check` validates env variables and PWA assets, then runs `npm run build`.
