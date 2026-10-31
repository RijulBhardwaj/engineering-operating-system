# Git Workflow

Branches: feature/<name>, fix/<name>, infra/<name>, docs/<name>, security/<name>, chore/<name>, hotfix/<name>. No direct commits to main.

Commits: Conventional Commits (feat, fix, docs, test, refactor, perf, build, ci, chore, security). Atomic, descriptive. No commits made solely to show activity.

PR flow: branch, implement, lint/format/typecheck, tests, security scan, review diff for secrets/generated files, push, PR, CI green, review, merge. Never force-push over a protected branch. Never disable a CI check to force a merge -- fix the underlying issue.

Full detail and exceptions: policies/branch-protection.md, policies/commit-policy.md.
