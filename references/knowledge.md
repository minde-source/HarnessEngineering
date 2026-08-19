# Harness Knowledge

## Project Shape

Common stack:

- Next.js App Router.
- TypeScript.
- Supabase Auth/Postgres/RLS with service-role server routes.
- Vercel deploy from GitHub.
- Vitest, ESLint, Next build, npm audit CI gate.

Common folders:

- `app/`: pages and API routes.
- `components/`: shared UI.
- `lib/`: backend stores, API helpers, domain logic.
- `packages/shared/`: request/response contracts and schemas.
- `supabase/migrations/`: database schema changes.
- `.github/workflows/ci.yml`: CI commands.

## Dual Store Pattern

Use local/demo store plus Supabase production store where the project needs an offline/demo mode:

- Backend selects local or Supabase.
- Local store supports demo behavior.
- Supabase store supports production behavior.

When adding a feature, update both stores or deliberately document why local mode does not support it.

## Shared Contract Pattern

Put request/response types in `packages/shared/src/*-api-contract.ts`.

Benefits:

- API route and frontend agree.
- TypeScript catches missing fields.
- Future projects can copy route patterns more safely.

## Sensitive Data Pattern

For identity and health data:

- Store and compare hashes where possible.
- Show only last 4 digits in UI.
- Never log full QR payload, full ID number, health history text, signed URLs, or request bodies.
- For export/delete, use role restriction plus OTP when needed.

## Deletion Pattern

Safe deletion flow:

1. Show candidates before deletion.
2. Let user tick exact records.
3. Server validates again: requester role/email, record eligibility, protected downstream file/job, and required remaining records.
4. Archive deleted snapshot to an audit table.
5. Null or detach audit FKs if needed.
6. Delete source record.
7. Refresh table and show friendly result.

## Export Pattern

For Excel exports:

- Filter by date/month/neighborhood when possible.
- Split large exports by day or part.
- Include hour-minute in filenames when repeated downloads are expected.
- Show errors at top of page to avoid repeated clicking.

## Scanner Pattern

For QR/USB scanner:

- Support camera, bridge message, paste, and keyboard-wedge scanner paths.
- Hardware scanner should fill the same fields as camera scanner when QR contains them.
- Validate required fields before submit so database constraints do not surface in UI.

## Deployment Reality

- Git push triggers Vercel code deploy.
- Supabase migrations are separate unless a project has automation for them.
- Edge Functions are separate from Vercel and need explicit deploy.
