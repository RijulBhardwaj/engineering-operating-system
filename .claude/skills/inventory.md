# Skills / MCP / Tool Inventory

Audited 2026-10-31 from an active Claude Code session on this account. Re-audit when a new skill/connector is installed or quarterly, whichever first -- this file goes stale otherwise.

## Installed, in active use

| Name | Type | Purpose | Status |
|---|---|---|---|
| graphify | Skill | Codebase -> knowledge graph, architecture/dependency queries | Installed, project graph exists for 12_Dimension_Harness |
| ecc (ECC marketplace) | Plugin bundle | ~400 skills/agents/commands: reviewers per language, build-resolvers, TDD workflows, orchestration (/orch-*), ADR authoring (architecture-decision-records skill), git-workflow, security-review, etc. | Installed, enabled |
| agent-skills | Plugin | Addy Osmani's 25 lifecycle skills + 4 agent personas (spec-driven dev, TDD, frontend-ui-engineering, API design, review, security, CI/CD, ADRs, observability) | Installed 2026-10-31 |
| floorplan | Plugin | Plain-English codebase architecture map + security health check + blueprint-from-spec | Installed 2026-10-31 |
| ponytail | Plugin | Forces minimal-diff, YAGNI-first solutions | Disabled 2026-10-31, replaced by chisle (not uninstalled) |
| caveman | Plugin | Terse communication style + cavecrew agents (investigator/builder/reviewer) | Disabled 2026-10-31, replaced by chisle (not uninstalled) |
| GitHub (gh CLI) | Tool | Repo/PR/issue/branch/Actions operations | Available, authenticated as RijulBhardwaj |
| Claude Docs (mcp 1a59c906...) | Connector | Living docs on claude.ai | Available |
| Claude Browser (built-in) | Tool | Web research, page reading, dev server preview | Available |
| Claude in Chrome | Tool | User's real Chrome, logged-in sessions | Available, requires per-use permission |
| Computer use | Tool | Desktop automation | Available, tiered permissions per app |
| Artifact / ArtifactData / ArtifactComments | Tool | Publish pages, shared DB, comment threads | Available |
| Workflow | Tool | Multi-agent orchestration scripts | Available, opt-in only (user must say "use a workflow") |

## Discovered, not installed / not relevant to this system

- Serena (symbol-aware code nav) -- mentioned in user's global CLAUDE.md tool-priority rules but no corresponding MCP tool found connected this session. Treat as "use if connected," do not assume present.
- Context7 (docs retrieval) -- same status: referenced in instructions, not found connected. Use web search as fallback for current API docs until/unless connected.
- chrome-devtools plugin -- configured but failed to connect this session (cached retry). Not usable until reconnected.

## Full registry

The user-supplied candidate list (Graphify alternatives, design skills, token optimizers, LLM-serving infra, etc.) was researched and classified into registry/skills.yaml and registry/tools.yaml on 2026-10-31 -- most were evaluated and deliberately NOT installed (overlap with existing plugins, no active project to apply them to, or needing a source read before trust). See those files for the per-item reasoning rather than re-deciding here.

## Rule

Use a tool because the task needs it, not because this table lists it. See `.claude/rules/token-efficiency.md`.
