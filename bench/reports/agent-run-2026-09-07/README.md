# Agent run 2026-09-07 (automated)

Ran `bench/agent/run-all.mjs` with the opencode agent over all 5 problems.

Result: **5 / 5 resolved** (see `summary.json`).

Each `<id>.patch` is the agent's fix. Re-grade any with:
`node bench/lib/eval.mjs <id> bench/reports/agent-run-2026-09-07/<id>.patch`
