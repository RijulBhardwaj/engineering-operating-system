# CLAUDE.md — Engineering Operating System (routing layer)

This file routes. Detailed rules live in linked files — read those, not a restatement here. Keep this file short; if it grows past a routing table, something belongs in `.claude/rules/` instead.

## Precedence (highest wins on conflict)

1. Explicit user instruction in the current session.
2. This repo's `policies/` (security, branch protection, testing, commit).
3. `.claude/rules/*.md` (engineering principles, standards, workflow).
4. Project-level `CLAUDE.md` in the project repo itself.
5. Task-specific / agent-specific instructions.

A project's own CLAUDE.md may add constraints. It may not silently override a security or branch-protection policy from here — if it tries to, flag the conflict instead of picking one silently.

## Session start checklist

1. Identify active repo + branch (`git status`, `git branch --show-current`).
2. Check [`projects/project-registry.yaml`](projects/project-registry.yaml) for this project's entry (status, last checkpoint, outstanding tasks).
3. Read the project's own CLAUDE.md if present.
4. Check [`observability/progress/`](observability/progress/) for the latest checkpoint on this project.
5. Resume from last verified state. Don't re-derive what the checkpoint already answers.

Don't load the whole knowledge base every session — pull only what the task needs.

## Rules (detailed)

- [`.claude/rules/engineering-principles.md`](.claude/rules/engineering-principles.md)
- [`.claude/rules/architecture.md`](.claude/rules/architecture.md) — AI SDLC + spec-driven + ADR gate (mandatory for non-trivial work)
- [`.claude/rules/coding-standards.md`](.claude/rules/coding-standards.md)
- [`.claude/rules/testing.md`](.claude/rules/testing.md)
- [`.claude/rules/security.md`](.claude/rules/security.md)
- [`.claude/rules/git-workflow.md`](.claude/rules/git-workflow.md)
- [`.claude/rules/token-efficiency.md`](.claude/rules/token-efficiency.md)
- [`.claude/rules/agent-coordination.md`](.claude/rules/agent-coordination.md)

## Agents

Personas in [`.claude/agents/`](.claude/agents/). Invoke the minimum set the task needs — see `agent-coordination.md`. Don't spin up a specialist for a one-line fix.

## Skills / MCP / tools

See [`.claude/skills/inventory.md`](.claude/skills/inventory.md) for what's actually discovered-and-verified on this account, as of the last audit. Use what's relevant; don't call a tool because it exists.

## Starting a new project

Follow [`workflows/project-initialization/README.md`](workflows/project-initialization/README.md). Spec and architecture decisions (ADR) come before implementation for anything non-trivial — see `architecture.md`. Trivial fixes/typos don't need the full gate.
