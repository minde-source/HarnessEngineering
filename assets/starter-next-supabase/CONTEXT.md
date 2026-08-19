# Project Context

- Stack: Next.js App Router, TypeScript, Supabase, Vitest.
- Local mode is for quick development; Supabase mode is for production.
- Server routes own authorization. The browser never receives the service-role key.
- Destructive deletion is atomic, audited, and refuses protected records or deletion of every record.
- Vercel deployment does not run Supabase migrations automatically.
