# Harness Rules

## Worktree Safety

- Always run `git status --short` before staging or committing.
- Do not stage unrelated untracked files.
- Never revert user changes unless the user explicitly asks.
- Stage files explicitly, not with broad `git add .`, unless the change set is intentionally all yours and reviewed.

## Implementation Rules

- Read existing code before editing.
- Reuse current patterns: App Router routes, shared API contracts, local store plus Supabase store, friendly frontend messages.
- Keep feature changes narrow. Do not combine unrelated cleanup with user-facing requests.
- For frontend admin tools, use simple labels and familiar controls. Avoid technical words such as audit, schema cache, constraint, stack trace.
- For high-risk operations such as delete/export, keep role checks on server side, not only UI side.

## Error Handling Rules

- Convert technical backend errors to practical messages:
  - Missing table/schema cache -> "Chức năng này chưa sẵn sàng. Vui lòng báo quản trị viên cập nhật dữ liệu hệ thống."
  - OTP invalid -> "Mã OTP chưa đúng hoặc đã hết hạn."
  - Rate limited -> "Thao tác đang bị giới hạn tạm thời. Vui lòng thử lại sau."
- Keep raw errors out of low-tech UI.
- Return structured `{ errors: string[] }` from APIs.

## Database Rules

- Additive migrations are preferred.
- For new tables: add indexes, RLS, and policies in the same migration.
- For destructive workflows: archive a snapshot or audit record before deletion.
- Do not assume migrations are applied by Vercel.
- If production lacks a migration, say that plainly after deploy.

## CI Rules

- CI is the source of truth. Mirror `.github/workflows/ci.yml` locally.
- Keep runtime audit gate clean: `npm audit --omit=dev --audit-level=high`.
- Do not use `npm audit fix --force` without explicit approval.
- Fix hook/lint warnings if GitHub annotates them and the fix is low-risk.

## Commit And Push Rules

- Commit messages should name the behavior change.
- After push, report the short hash.
- If `gh` CLI is unavailable, say local CI-equivalent checks passed but GitHub Actions was not inspected directly.
