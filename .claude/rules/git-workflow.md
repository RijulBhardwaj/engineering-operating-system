# Git Workflow

Branches: feature/<name>, fix/<name>, infra/<name>, docs/<name>, security/<name>, chore/<name>, hotfix/<name>. No direct commits to main.

Commits: Conventional Commits (feat, fix, docs, test, refactor, perf, build, ci, chore, security). Atomic, descriptive. No commits made solely to show activity.

PR flow: branch, implement, lint/format/typecheck, tests, security scan, review diff for secrets/generated files, push, PR, CI green, review, merge. Never force-push over a protected branch. Never disable a CI check to force a merge -- fix the underlying issue.

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
