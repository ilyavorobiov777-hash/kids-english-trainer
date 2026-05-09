# Run Locally On Windows

1. Install Node.js LTS from the official Node.js website.

2. Open PowerShell or cmd.

3. Check Node.js and npm:

```powershell
node -v
npm -v
```

4. Go to the project folder:

```powershell
cd D:\Projects\kids-english-trainer
```

5. Install dependencies:

```powershell
npm install
```

If PowerShell says `npm.ps1 cannot be loaded because running scripts is disabled`, use:

```powershell
npm.cmd install
```

If `npm` is not recognized, close PowerShell and open a new window after installing Node.js. The expected PATH entry is:

```text
C:\Program Files\nodejs
```

6. Create `.env.local` from the example:

```powershell
copy .env.example .env.local
```

If `copy` does not work in your shell, create `.env.local` manually and paste:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

7. Replace the placeholder Supabase URL and anon key with values from your Supabase project.

8. Start the dev server:

```powershell
npm run dev
```

PowerShell fallback:

```powershell
npm.cmd run dev
```

Supabase CLI is installed as a project dev dependency. After `npm install`, use:

```powershell
npx supabase --version
npx supabase link --project-ref your-project-ref
npm run db:push
```

Do not use `npm install -g supabase`; Supabase does not support global npm installation for the CLI.

9. Open:

```text
http://localhost:3000
```

10. Run checks before adding new features:

```powershell
npm run typecheck
npm run build
```

PowerShell fallback:

```powershell
npm.cmd run typecheck
npm.cmd run build
```
