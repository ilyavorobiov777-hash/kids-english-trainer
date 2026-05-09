# Security Proxy Notes

The production app now uses a Vercel API proxy/BFF for Supabase access.

## How Auth Works

- Browser submits email/password to `/api/auth/login` or `/api/auth/signup`.
- Vercel route handler calls Supabase Auth server-side with `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- Access and refresh tokens are stored in httpOnly cookies:
  - `sb-access-token`
  - `sb-refresh-token`
- Cookies use:
  - `httpOnly: true`
  - `secure: true` in production
  - `sameSite: lax`
  - `path: /`
- Tokens are not returned in API response bodies.

## How Data Access Works

- Browser calls relative app URLs such as `/api/db/cards`, `/api/rpc/seed_starter_learning_content`, and `/api/auth/me`.
- Vercel route handlers read the httpOnly session cookies.
- Server-side Supabase client uses the user access token as `Authorization: Bearer ...`.
- Supabase RLS remains active because requests still run as the authenticated user.
- The frontend does not need direct access to `*.supabase.co`.

## Current Limitations

- The generic `/api/db/[table]` route is intentionally limited to known application tables.
- RPC proxy is allow-listed to seed RPCs only.
- This implementation does not use a service role key.
- Child mode still runs inside the parent-authenticated browser session; a stronger child PIN/session model remains future work.

## Next Checks

- Verify browser Network tab on tablet/phone without VPN: no requests to `*.supabase.co`.
- Verify login, Starter 350, Starter Texts, practice attempts, word modes, texts, and stats through production.
- After stable production testing, remove legacy `NEXT_PUBLIC_SUPABASE_*` variables from Vercel and local env.
