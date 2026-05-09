# Supabase Production Checklist

Use this before and after Vercel deployment.

## Project API

- [ ] Open Supabase dashboard.
- [ ] Open the `kids-english-trainer` project.
- [ ] Check `Project Settings` -> `API`.
- [ ] Copy `Project URL`.
- [ ] Copy `anon public` key.
- [ ] Confirm these values are added to Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Do not add the `service_role` key to Vercel frontend env.

## Database

- [ ] RLS is enabled on application tables.
- [ ] Migrations are applied:
  - `supabase/migrations/20260509130000_initial_schema.sql`
  - `supabase/migrations/20260509160000_learning_mechanics.sql`
- [ ] Tables exist:
  - `families`
  - `profiles`
  - `children`
  - `courses`
  - `sources`
  - `units`
  - `lessons`
  - `topics`
  - `decks`
  - `cards`
  - `grammar_patterns`
  - `dialogues`
  - `practice_sessions`
  - `practice_attempts`
  - `review_schedule`
  - `rewards`
- [ ] `family_id` policies isolate family data.
- [ ] Parent users see only their family data.
- [ ] Child profile selection does not require child email/password.

## RPC / Seed

- [ ] `seed_starter_learning_content()` exists.
- [ ] `seed_starter_learning_content()` can be called by an authenticated parent.
- [ ] Re-running `seed_starter_learning_content()` does not create duplicates.
- [ ] `seed_demo_content()` exists if demo seed is still needed.
- [ ] Starter 350 content count is stable after repeated runs.

## Auth Settings

- [ ] Email/password provider is enabled.
- [ ] Decide whether email confirmation is required.
- [ ] If email confirmation is enabled, test the confirmation email.
- [ ] If email confirmation is disabled for MVP testing, document that choice.
- [ ] Parent signup works.
- [ ] Parent login works.
- [ ] Password reset URL points to production after deploy.

## Redirect URLs

After Vercel deploy:

- [ ] Copy the production Vercel URL.
- [ ] Open `Authentication` -> `URL Configuration`.
- [ ] Set `Site URL` to the production URL.
- [ ] Add redirect URL:

```text
https://your-production-domain/**
```

- [ ] Keep local redirect URL for development:

```text
http://localhost:3000/**
```

- [ ] If using Vercel preview deployments for auth testing, add an explicit preview wildcard.

## Production Flow

- [ ] Parent can sign up.
- [ ] Parent can log in.
- [ ] Parent can create child profile.
- [ ] Parent can add Starter 350.
- [ ] Parent can add/edit/archive cards.
- [ ] Child can select profile without email.
- [ ] Child can complete practice.
- [ ] `practice_sessions` rows are created.
- [ ] `practice_attempts` rows are created.
- [ ] `review_schedule` rows are updated.
- [ ] Parent dashboard/progress shows only current family data.

## Security Checks

- [ ] `.env.local` is not committed.
- [ ] Browser bundle uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] No service role key appears in frontend code, Git history, Vercel frontend env, or browser logs.
- [ ] RLS policies remain enabled after migrations.
- [ ] No destructive SQL reset was run against production data.
