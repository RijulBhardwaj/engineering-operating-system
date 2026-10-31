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

See [`.claude/skills/inventory.md`](.claude/skills/inventory.md) for what's actually discovered-and-verified on this account, as of the last audit. Use what's relevant; don't call a tool because it exists. Install authorization: see [`policies/skill-installation-policy.md`](policies/skill-installation-policy.md) -- installing what an active project actually needs doesn't require asking first; a newly-discovered candidate with no active project need does.

## Harness and registries

Reusable development/quality-engineering modules live in [`harness/`](harness/README.md) -- read its status table before assuming a module is a working engine; several are policy pointers to tools that already exist (platform Agent/Workflow tools, Graphify) rather than new software. Skill/tool/MCP/agent/methodology/model-tier decisions are in [`registry/`](registry/) -- check `last_reviewed` and `decision` fields before trusting an entry as current.

## Starting a new project

Follow [`workflows/project-initialization/README.md`](workflows/project-initialization/README.md). Spec and architecture decisions (ADR) come before implementation for anything non-trivial — see `architecture.md`. Trivial fixes/typos don't need the full gate. Each project is isolated per [`projects/README.md`](projects/README.md)'s convention -- its own repo, branches, ADRs, secrets; only standards/templates/registries are shared from here.
