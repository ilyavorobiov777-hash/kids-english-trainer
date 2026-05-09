# Supabase Redirect TODO

Automatic update status: not completed automatically.

Reason: Supabase CLI `2.98.2` is installed and the local workspace is linked to project `etuvgikfrlndeayczbrm`, but the CLI does not expose a direct safe command for Auth URL Configuration. `SUPABASE_ACCESS_TOKEN` is not present in the local environment, so I did not call the Supabase Management API. I also did not use `supabase config push` for this because this repo does not have a complete Supabase config file and pushing a partial auth config could change unrelated auth settings.

Project ref:

```text
etuvgikfrlndeayczbrm
```

Production URL:

```text
https://kids-english-trainer.vercel.app
```

## Manual Dashboard Steps

1. Open Supabase dashboard:

```text
https://supabase.com/dashboard/project/etuvgikfrlndeayczbrm
```

2. Go to `Authentication` -> `URL Configuration`.
3. Set `Site URL` to:

```text
https://kids-english-trainer.vercel.app
```

4. Set Redirect URLs to include all of these:

```text
http://localhost:3000/**
https://kids-english-trainer.vercel.app/**
https://*.vercel.app/**
```

5. Save changes.
6. Open production login:

```text
https://kids-english-trainer.vercel.app/login
```

7. Test parent signup/login on production.
8. Confirm that after login/signup the browser stays on:

```text
https://kids-english-trainer.vercel.app
```

and does not redirect to localhost.

## Optional API Retry Later

Use this only if you want Codex to retry the update through the Supabase Management API.

1. Create a Supabase access token in Supabase dashboard: `Account` -> `Access Tokens`.
2. Set it locally. Do not paste it into chat.

PowerShell, current shell only:

```powershell
$env:SUPABASE_ACCESS_TOKEN="your-token-here"
```

cmd, current window only:

```cmd
set SUPABASE_ACCESS_TOKEN=your-token-here
```

3. Return to Codex and ask to retry automatic Supabase Auth redirect update.

## Safety Notes

- Do not add a Supabase service role key to Vercel.
- Do not add a service role key to frontend code.
- Do not upload or commit `.env.local`.
- Keep `http://localhost:3000/**` for local development.
- Keep `https://*.vercel.app/**` only if you want Vercel preview auth testing.
