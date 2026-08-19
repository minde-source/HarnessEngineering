# Harness Checklists

## New Feature Checklist

- Identify route/page/module ownership.
- Find existing type contract.
- Add or update shared request/response types.
- Implement frontend state, loading, empty, error, and success states.
- Implement server-side authorization.
- Add local/demo store behavior when the project has one.
- Add production store behavior.
- Convert technical errors to friendly UI messages.
- Run CI-equivalent commands.
- Commit only intended files.

## Database Change Checklist

- Create a numbered migration.
- Use additive changes where possible.
- Add indexes for lookup/list pages.
- Enable RLS for new tables.
- Add policies matching project role model.
- Add audit/snapshot table for destructive flows.
- Mention migration must be applied on Supabase production.

## Delete Tool Checklist

- Show records before delete.
- Require explicit selection.
- Add server-side eligibility checks.
- Block protected records.
- Archive snapshot.
- Record actor/email/reason/time.
- Refresh UI after delete.
- Use user-friendly labels: "Xem lai ho so da xoa" instead of "audit".

## CI Checklist

Run commands in the same spirit as `.github/workflows/ci.yml`:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd audit --omit=dev --audit-level=high
```

If a command fails:

- Read the first concrete error.
- Fix the cause, not the symptom.
- Rerun the failed command and any related command.
- If CI is red but tests pass, check `npm audit` and workflow annotations.

## Commit/Push Checklist

- `git status --short`
- `git diff --stat`
- `git diff -- <files>` for risky files.
- `git add <explicit files>`
- `git commit -m "<behavioral message>"`
- `git push origin main` or current branch.
- Final message includes commit hash and verification.

## New Project Bootstrap Checklist

For a new project based on this harness:

- Copy `tools/harness-engineering` into the repo.
- Copy relevant shared patterns: API contract folder, route-utils style auth helpers, local/prod store wrapper if useful, migration discipline, and CI workflow.
- Create `CONTEXT.md` early and keep it updated.
- Add `.env.example`.
- Add CI before feature work grows.
- Decide what Vercel deploys and what still needs manual Supabase/app deploy.
