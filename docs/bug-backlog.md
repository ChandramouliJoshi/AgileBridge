# AgileBridge bug and improvement backlog

Created: 2026-10-05

This is the first diagnostic pass. No application code was changed. Work should be done in small, independently verifiable batches.

## Priority 0 — security and data integrity

### SEC-001: Rotate exposed AI credentials

- Evidence: `.env` contains a Gemini API key; Firebase configuration and seeded users are also committed in source.
- Risk: credentials and test passwords can be copied from the repository or shipped to the browser.
- Fix: revoke/rotate the exposed Gemini key, move secrets to the deployment secret manager, confirm only server-side code reads the AI key, and remove real-looking secrets from committed files/history where appropriate.
- Verify: search the repository for key/password patterns and confirm the client bundle does not contain the AI key.

### DATA-001: Replace localStorage/mock persistence for production data

- Evidence: auth, tasks, projects, and sprints use localStorage or in-memory seed data. New task and project forms log data and show success but do not persist it to a backend.
- Impact: data is device-specific, easy to tamper with, and can disappear; “created” records may not actually exist.
- Fix: choose one source of truth (Firebase/Firestore is already present), add authenticated reads/writes and security rules, then remove mock persistence from production paths.
- Verify: create/update/delete from two browser sessions and confirm the same data is returned after reload.

## Priority 1 — build blockers

### BUILD-001: Make TypeScript pass

Current `npm run typecheck` failures include:

- Next 15 route props mismatch in `src/app/tasks/[id]/page.tsx` (`params` must match the async `PageProps` contract).
- Wrong relative imports for `card`, `select`, and `checkbox` in task/project dialogs.
- Signup/auth passes `password` through a type that explicitly omits it.
- Missing `TaskTypeLabel` export.
- `undefined` task passed where `null` is expected.
- Numeric/string arithmetic mismatch in task details.
- `priority` and date-picker props do not match their declared types.
- Missing `@types/react-dom`.
- Store comment typing is unsafe (`Task['comments'][0]`) and new comments do not satisfy `Comment`.

Fix these in small groups, starting with missing imports and shared type definitions. Do not loosen the compiler settings to hide them.

### BUILD-002: Add a real lint configuration

- Evidence: `npm run lint` opens Next’s interactive ESLint setup prompt instead of running checks.
- Fix: add a committed ESLint config and a non-interactive lint script; resolve the first batch of warnings/errors.
- Verify: `npm run lint` exits non-zero only for real lint findings and never prompts.

### BUILD-003: Remove development logging from shared UI

- Evidence: `src/components/ui/input.tsx` logs every server-side input render; the browser also showed repeated `[SSR] Input render props` messages.
- Impact: noisy logs and possible leakage of field metadata in production.
- Fix: remove the logging or guard it behind an explicit development-only diagnostic flag.

## Priority 2 — broken user flows

### FLOW-001: Login does not complete reliably

- Evidence: submitting the seeded admin credentials on `/login` remained on the login page during the smoke check.
- Likely causes to inspect first: auth initialization race (`users` starts empty), localStorage state, and error/toast visibility.
- Fix: make auth initialization explicit, disable submit until ready, surface errors accessibly, and add a login smoke test.

### FLOW-002: Implement task creation end-to-end

- Evidence: `src/app/new-task-dialog.tsx` says “In real app, call server action” and only logs the submitted object.
- Fix: use the shared task store/backend mutation, preserve project/sprint/assignee relationships, and show failure states.

### FLOW-003: Implement project creation end-to-end

- Evidence: `src/components/new-project-dialog.tsx` logs the form result and closes the dialog; it does not add a project.
- Fix: persist the project, members, and selected columns, then refresh the project list.

### FLOW-004: Implement password reset

- Evidence: reset page is explicitly a placeholder; forgot-password reports that a link was sent without sending one.
- Fix: connect Firebase Auth password reset or a secure backend flow, with token expiry and success/failure states.

### FLOW-005: Enforce real authorization

- Evidence: role/user data and auth state are client-side localStorage values; admin actions are therefore user-editable.
- Fix: enforce permissions in backend rules/server actions, then keep client checks only for presentation.

## Priority 3 — correctness and UX

### UX-001: Fix date/task detail correctness

- Resolve the task detail type errors and verify dates, comments, dependency, time logging, and delete behavior.

### UX-002: Remove dead footer links and misleading claims

- Privacy Policy and Terms links currently point to `#`; landing-page metrics are hard-coded.
- Either implement the destinations/data source or label them as placeholders before release.

### PERF-001: Fix the above-the-fold image warning

- Browser warning: the Unsplash image is detected as LCP without `priority`.
- Fix: use `priority` for the intended hero image, optimize dimensions/formats, and verify with a production build.

## Daily execution plan

1. Day 1: rotate/remove exposed credentials and confirm the client bundle is clean.
2. Day 2: fix shared import/type errors; rerun typecheck.
3. Day 3: fix auth typing and login initialization; add a login smoke check.
4. Day 4: fix task detail/store typing and persistence.
5. Day 5: wire task creation and verify reload behavior.
6. Day 6: wire project creation and verify list refresh.
7. Day 7: implement password reset and backend authorization.
8. Day 8: lint/config cleanup, logging cleanup, image optimization, and a full smoke pass.

## Verification commands

```text
npm run typecheck
npm run build
npm run lint
```

The current production build completes, but it explicitly skips type validation and linting, so that is not a clean-release signal yet.
