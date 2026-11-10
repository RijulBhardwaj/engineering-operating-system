# Skills / MCP / Tool Inventory

Audited 2026-10-31 from an active Claude Code session on this account. Re-audit when a new skill/connector is installed or quarterly, whichever first -- this file goes stale otherwise.

## Installed, in active use

| Name | Type | Purpose | Status |
|---|---|---|---|
| graphify | Skill | Codebase -> knowledge graph, architecture/dependency queries | Installed, project graph exists for 12_Dimension_Harness |
| rag-architect | Skill (vendored) | RAG system design: chunking, vector-store selection, hybrid search/reranking, retrieval evaluation (precision@k/recall@k/MRR/NDCG) | Installed 2026-11-03 at harness/skills/rag-architect/. Python-oriented code examples -- use for architecture/methodology guidance, not copy-paste for the TS/pgvector stack projects here actually use. Known bug in its own hybrid-search example: mislabeled as RRF, is actually unnormalized weighted score sum -- see registry/skills.yaml decision field |
| egm (Elephant-Goldfish Model) | Plugin | Google's design/review loop: "Elephant" drafts a spec with context (brainstorm -> draft), "Goldfish" fresh-context reviewers critique it before you implement | Installed 2026-11-10 via plugin marketplace (`egm@egm`), per explicit user instruction. Overlaps this harness's own architecture.md gate -- use as the drafting/review mechanism feeding that gate's PRD/spec/ADR steps, not a replacement for them |
| everything-claude-code-mobile | Plugin | Android/iOS/Kotlin Multiplatform skills, agents, commands, hooks, MCP tools | Installed 2026-11-03 via plugin marketplace (separate repo/marketplace from the main `ecc` bundle, despite the similar name). No active mobile project yet -- installed per explicit user instruction, not evaluated project-need |
| git-worktree | Skill (vendored + folded into rules) | Isolated git worktree creation: directory convention, gitignore check, node_modules symlink, .env/.worktreeinclude gotcha, DB-branch suggestion for schema work | Installed 2026-11-03. Vendored at harness/skills/git-worktree/SKILL.md; actual guidance folded into .claude/rules/git-workflow.md's "Worktrees" section so every session reads it |
| unslop | Skill (vendored) | De-AI-slops a UI screen: audit against common AI-tells, 5-line design direction, 9 ordered fix passes (spacing/color/icons/copy/type/layout/details/visuals/motion). React/Tailwind/HTML/CSS. | Installed 2026-11-03 at harness/skills/unslop/. CC-BY-4.0, keep @heydamir credit. Optional Playwright/ffmpeg scripts for live-URL screenshot + redesign video, not required for the core workflow |
| agent-desktop | CLI tool (global npm) + Skill (vendored) | Drives native desktop apps via OS accessibility tree (56 commands: observe/act-on-ref/verify loop). Headless-by-default, fail-closed, no API key for core CLI. Complements, doesn't replace, computer-use (ref/tree-based here vs screenshot/coordinate there). | Installed 2026-11-04 globally (`agent-desktop@1.1.0`, verified via `agent-desktop status`) and at harness/skills/agent-desktop/ + ~/.claude/skills/agent-desktop/. Apache-2.0. jev-desktop sub-skill is optional/alpha, sends screen descriptions to a remote TypeSafe endpoint under a user-supplied key -- not enabled by default |
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
