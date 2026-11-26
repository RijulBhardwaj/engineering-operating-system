# Software factory (this project only)

This folder is this project's own factory. It shares no files, tokens, logs or ports with any other project.
Config: `factory.json`. Runtime state (gitignored): `.factory/`. Audit key: `<git common dir>/factory-audit-<name>.key` (local, never committed).

## Roles (orchestrator = the main Claude session, Opus 5.5)
| Stage | Who | Model | Can edit? |
|---|---|---|---|
| Plan: spec with AC-1..n in `docs/factory/specs/` | `planner` agent | opus | specs only |
| Build: test-first, in a worktree (`isolation: "worktree"`) | `builder` agent | sonnet | yes, feature branch only |
| Mechanical gates | hooks + `audit.mjs` | none | no |
| Adversarial review of the diff | `review.mjs` (headless) or `reviewer` agent | opus | no |
| Blind runtime QA in a live browser | `blind-qa` agent | sonnet | no source access (guard blocks its source reads and listings) |
| Search / log triage | `scout` agent | haiku | no |
The orchestrator only decides, briefs and spot-checks. It never grades work it wrote itself.

## Definition of done (all mechanical unless marked)
1. When the branch adds or changes a spec, every AC id in it appears in a test title (`spec-trace`). A branch with no spec passes this step, so writing the spec first is a planner rule, not a gate.
2. Lint, typecheck, tests pass (`audit.mjs` steps from `factory.json`).
3. No weakened tests: assertion and case counts never drop, no new skip/only (`test-tamper`).
4. Diff under the size limit, no new duplication or complexity warnings, no secrets (gitleaks), no new SAST findings (semgrep vs base), no unknown or new-and-young dependencies, no new known vulnerabilities (osv-scanner vs base).
5. Independent review has no high-severity finding (`review`). The record is HMAC-signed; one made with `review.mjs --record` from a reviewer agent is marked `attested` in the report.
6. App boots in the sandbox on this project's ports and smoke checks pass, then the port is freed (`sandbox`).
7. Interactive browser verification rule (agent stage, not provable by a hook): no UI fix, frontend feature or full-stack change is complete until the app is booted locally, opened in a live browser and traversed click by click, checking visual layout, interactive state, console cleanliness and network integrity. The `blind-qa` agent does this and its JSON result goes in the release report.
8. `audit.mjs` writes a signed token for the exact HEAD. Push, PR, merge and deploy are blocked without it.

## Commands
```
node .claude/factory/audit.mjs            # full audit of HEAD (needs a clean tree)
node .claude/factory/audit.mjs --no-review
node .claude/factory/verify.mjs           # is HEAD shippable?
node .claude/factory/sandbox.mjs up|smoke|down|status
node .claude/factory/review.mjs           # headless adversarial review of base..HEAD
node .claude/factory/selftest.mjs         # prove every guardrail still works
node .claude/factory/install.mjs          # (re)install key, pre-push hook, gitignore lines
```

## What is enforced where
- `hook.mjs guard` (PreToolUse, every tool): blocks destructive git/shell commands, writes outside this project, edits to factory/settings/agents/.git, edits and commits on the default branch, push/PR/merge/deploy without a valid token, hooksPath/--no-verify/alias tricks, non-GET `gh api`, credential commands, unknown or under-30-day-old packages, risky MCP tools, remote subagents.
- `hook.mjs post` (PostToolUse): per-file syntax/lint check, slop patterns on added lines (empty catch, ts-ignore, eslint-disable, skipped/focused tests, tautological asserts), gitleaks on the file. Errors go straight back to the model.
- `hook.mjs stop` (Stop and SubagentStop): runs the fast check on changed code, flags source changes without test changes, and flags "done/verified" claims with no test run after the last edit.
- `.git/hooks/pre-push`: re-verifies the token for every pushed ref, re-runs gitleaks on the pushed range, blocks force pushes and remote branch deletes. This catches pushes from any tool, not only Claude.
- Role limits (in `guard`, keyed on the subagent `agent_type`): `reviewer`, `scout` and `blind-qa` cannot edit files or run writing shell commands; `blind-qa` cannot read source, diffs or listings; `planner` writes only under `docs/` or `specs/`.
- Waived work: a token whose audit used a waiver can be pushed to a feature branch, but `gh pr merge`, releases, deploys and pushes to the default branch are blocked. Only the owner merges waived work.
- `hook.mjs postshell` (PostToolUse, every shell command): restores changed kit files from HEAD, reinstalls a removed pre-push hook, and compares git state with the previous command: a remote ref that moved to one of our branch tips without a valid token (a push that skipped every gate) or a new commit touching the kit raises an alarm back to the model.
- A hook that runs past its watchdog (guard 50s, post 170s) blocks instead of timing out open.
- No CI workflow runs the factory yet. A GitHub check would be the one gate a local process cannot fake; adding it and making it required in branch protection is an owner step.

## Waivers (logged in the token and the report)
Commit trailers: `TEST-REMOVAL-APPROVED: <why>`, `LARGE-DIFF-APPROVED: <why>`, `FACTORY-CHANGE-APPROVED: <why>`. Only use them when the user approved.

## Known limits
- Every local check runs as the same Windows user as Claude, so a determined process could forge a token or edit files by indirect means. The HMAC token catches stale, edited and accidental tokens, not a deliberate attack. Real enforcement for `main` needs GitHub branch protection with the CI check required, which only the repo owner can turn on.
- Shell analysis is pattern based, and script files a command runs are scanned inline (two levels), but obfuscated or generated code can still slip past `guard`; pre-push re-checks every pushed ref independently.
- Waiver trailers and `--record` reviews are written by the agent itself. They are logged, and waived work cannot be merged by an agent, but they are not proof that a person approved.
- Role limits are pattern based (a probe script in the temp dir can still write); they stop accidents and casual drift, not a determined agent.
- Role limits depend on Claude Code putting `agent_type` in the hook input inside subagents; where it is absent the limits do not apply.
- Mutation testing is not part of the audit yet (no mutation tool is installed in the projects).
