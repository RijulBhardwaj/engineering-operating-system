# Git Workflow

Branches: feature/<name>, fix/<name>, infra/<name>, docs/<name>, security/<name>, chore/<name>, hotfix/<name>. No direct commits to main.

Commits: Conventional Commits (feat, fix, docs, test, refactor, perf, build, ci, chore, security). Atomic, descriptive. No commits made solely to show activity.

PR flow: branch, implement, lint/format/typecheck, tests, security scan, review diff for secrets/generated files, push, PR, CI green, review, merge. Never force-push over a protected branch. Never disable a CI check to force a merge -- fix the underlying issue.

**Hard gate, not just an ordering suggestion (adopted 2026-11-24 per explicit user instruction):** for any change beyond a trivial fix/typo/docs-only edit, do not open the PR until `ai-code-qa-gate.md`'s static analysis + security scan (layer 1) and the relevant tests (layer 2/3) have actually been run locally and pass. "CI will catch it" is not a substitute -- CI runs on the open PR, after the fact; this gate is about not opening the PR in the first place with known-failing checks. A trivial docs/config-only change (this harness's own existing architecture.md exception) skips this, same as it skips the rest of the QA gate.

**`git checkout -b <name>` gotcha:** if a stale `origin/<name>` ref already exists (an old branch of the same name, deleted locally but still known from a prior fetch), git's DWIM behavior can silently check that ref out instead of branching fresh from current `main` -- "already exists" is not the only failure mode. A commit made this way lands wherever that stale ref pointed, which can be `main` itself if the name collision happens to resolve there. Before `checkout -b` with a branch name you've used before in this repo, check `git branch -vv` / `git ls-remote --heads origin <name>` for a collision, or just pick a name with a timestamp/suffix when reusing a pattern (`fitness-vault-backfill-20261124` style). If you do land a commit somewhere unintended: don't force-push to fix it -- move the commit to a correctly named branch, reset the wrong ref back to its upstream, verify the diff is exactly what you intended, then push and PR normally.

Full detail and exceptions: policies/branch-protection.md, policies/commit-policy.md.

## Worktrees

Use a git worktree instead of `git checkout` when two pieces of work must exist on disk at once -- parallel independent branches, or any task needing the main workspace left untouched while another branch is built/tested. A single sequential feature branch doesn't need one.

- Directory: `.worktrees/<branch>` at the project root, preferred over `worktrees/` (hidden, less noisy `ls`). If a project already uses `worktrees/`, keep that convention instead of introducing a second one.
- Before first use in a project: confirm `.worktrees/` (or whichever is in use) is in `.gitignore` -- add and commit that line immediately if missing. Worktree contents getting tracked pollutes `git status` for everyone.
- Branch naming inside a worktree follows the same convention as branches.md above (`feat/`, `fix/`, etc. -- default to `feat/` if the task gave no prefix).
- Node.js projects: symlink `node_modules` from the main worktree by default (saves a full reinstall) -- `ln -s $(cd ../.. && pwd)/node_modules node_modules`. Fresh-install only when the task actually needs different dependency versions (schema/package changes, testing an upgrade, debugging `node_modules` itself).
- `.env`/`.env.local`/local secrets are never copied automatically by `git worktree add` -- if the project uses env files, create a `.worktreeinclude` at the project root listing them (`.env`, `.env.local`, `.env.development`, `**/.claude/settings.local.json`) and copy explicitly, or the worktree will fail with a missing-credential error that looks unrelated.
- Schema/migration work in a worktree: prefer an isolated DB branch (Neon `neonctl branches create`, PlanetScale `pscale branch create`, or a separate Postgres schema) over a shared DB -- a shared DB under concurrent migrations in two worktrees is a real conflict risk, not a hypothetical one. A bug fix with no schema change doesn't need this.
- Source: vendored from `harness/skills/git-worktree/SKILL.md` (https://github.com/FlorianBruniaux/claude-code-ultimate-guide, CC-BY-SA-4.0) -- that file also documents companion `/git-worktree-status` / `/git-worktree-remove` / `/git-worktree-clean` commands from its own repo that were not vendored here (this harness doesn't have matching slash commands); do the equivalent with `git worktree list` / `git worktree remove` directly.
