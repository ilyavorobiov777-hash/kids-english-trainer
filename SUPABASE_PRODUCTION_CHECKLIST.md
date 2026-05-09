# Supabase Production Checklist

Use this before and after Vercel deployment.

## API Keys

- [ ] Supabase project URL is checked in `Project Settings` -> `API`.
- [ ] `anon public` key is checked in `Project Settings` -> `API`.
- [ ] Vercel has `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] Vercel has `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Supabase `service_role` key is not used in frontend code.
- [ ] Supabase `service_role` key is not added to Vercel frontend env.

## Database And RLS

- [ ] RLS is enabled on application tables.
- [ ] `family_id` policies isolate family data.
- [ ] Parent users see only their own family data.
- [ ] Child profile selection does not require child email.
- [ ] Current migrations are applied:
  - `20260509130000_initial_schema.sql`
  - `20260509160000_learning_mechanics.sql`
  - `20260509170000_backfill_grammar_pattern_examples.sql`
  - `20260509190000_child_management.sql`
  - `20260509210000_learning_texts.sql`
- [ ] `learning_texts` table exists.
- [ ] `practice_attempts.text_id` exists.
- [ ] `practice_attempts.question` exists.
- [ ] `practice_attempts.exercise_payload` exists.

## RPC / Seeds

- [ ] `seed_demo_content()` exists if demo content is still needed.
- [ ] `seed_starter_learning_content()` exists.
- [ ] `seed_starter_texts()` exists.
- [ ] `Добавить Starter 350` works from `/parent/import`.
- [ ] Re-running Starter 350 does not create duplicates.
- [ ] `Добавить Starter Texts` works from `/parent/import`.
- [ ] Re-running Starter Texts does not create duplicates.

## Auth Settings

- [ ] Email/password provider is enabled.
- [ ] Email confirmation setting is intentional and understood.
- [ ] Parent signup works.
- [ ] Parent login works.
- [ ] Password reset, if used, points to production URL.
- [ ] `Site URL` is set to the Vercel production URL after deploy.

## Redirect URLs

Include local development:

```text
http://localhost:3000/**
```

Include production:

```text
https://your-production-domain/**
```

Optional preview pattern if you test auth on Vercel preview URLs:

```text
https://*.vercel.app/**
```

Use a narrower preview pattern if needed.

## MVP Notes

- [ ] Storage is not required for the current MVP.
- [ ] No destructive database reset was run against production data.
- [ ] Starter content and Starter Texts are idempotent.
- [ ] Child progress reset is scoped by `family_id` and `child_id`.
