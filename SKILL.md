---
name: harness-engineering
description: Reusable engineering harness for low-friction project builds, especially Next.js/Vercel/Supabase projects. Use when Codex needs to start, audit, extend, stabilize, document, commit, or deploy a project with shared rules, CI checks, migration discipline, production safety, and concise user communication.
---

# Harness Engineering

Use this skill to move a project from request to shipped code with less repeated instruction. It packages the working style from the HCC project into reusable rules, knowledge, and checklists.

## Operating Loop

1. Read project context first: `README.md`, `CONTEXT.md`, `.github/workflows/*`, `package.json`, migrations, and the touched route/module.
2. Locate code with CodeGraph if available; if CodeGraph fails, use `rg`.
3. Preserve user work. Check `git status --short` before edits and do not stage unrelated untracked files.
4. Implement the smallest durable change. Prefer existing patterns over new abstractions.
5. Hide technical errors from end users. Log or return machine details server-side, but display practical Vietnamese messages in UI.
6. Verify with the repo's CI-equivalent commands.
7. Commit only intended files with a clear message.
8. Push to the current branch when the user has authorized deployment through Git/Vercel.
9. Report what changed, what was verified, and any production migration/configuration still required.

## Required References

Read only the reference needed for the task:

- `references/rules.md`: non-negotiable engineering rules and safety checks.
- `references/knowledge.md`: reusable patterns from HCC: Next.js, Supabase, Vercel, health workflow, audit, export, scanner.
- `references/checklists.md`: checklists for new features, database changes, CI, deployment, and handoff.

## Standard Validation

For this family of projects, prefer this order:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd audit --omit=dev --audit-level=high
```

If a script is absent, say so and run the nearest safe equivalent. Do not treat `npm audit fix --force` as routine.

You can run the bundled helper:

```powershell
powershell.exe -ExecutionPolicy Bypass -File tools/harness-engineering/scripts/harness-check.ps1
```

## Database Discipline

- Every production schema change needs a migration file.
- Vercel deploys code, not Supabase migrations. Always state when a migration must be applied separately.
- For destructive actions, require role restriction, confirmation/OTP where appropriate, audit table/snapshot when data is sensitive, and a reversible operational path where feasible.
- Do not expose database errors such as schema cache, constraint names, stack traces, keys, SQL, or table names to low-tech users.

## User Communication

Keep updates short while working. In final messages, use concise Vietnamese:

- Da lam gi.
- Da kiem tra gi.
- Commit hash da push.
- Luu y van hanh neu co.

Avoid long theory unless the user explicitly asks to learn.
