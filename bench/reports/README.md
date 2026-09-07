# Agent run report — 2026-09-07

Ran a coding agent (fresh context per problem) against the 5 seeded bugs. Each problem
was presented ONLY via `bench/problems/<id>/problem.md`; the FAIL_TO_PASS tests and
`reference.patch` were hidden from the agent. The agent edited source and produced a
candidate patch (kept here), which was graded with `node bench/lib/eval.mjs <id> <patch>`.

Result: **5 / 5 resolved**.

| id | agent-fixed file | graded |
|---|---|---|
| wc-001 | backend/src/service/UserService.ts | resolved |
| wc-002 | backend/src/service/UserService.ts | resolved |
| wc-003 | backend/src/service/UserService.ts | resolved |
| wc-004 | frontend/src/api/users.ts | resolved |
| wc-005 | frontend/src/hooks/useApi.ts | resolved |

Reproduce: `node bench/lib/eval.mjs wc-001 bench/reports/wc-001.patch` (etc.).
