# Production Engineering Harness

The reusable development/quality-engineering layer this repo's CLAUDE.md routes to for actual project work, distinct from Layer 1 (the global engineering OS: rules, agents, bootstrap, knowledge -- already in `.claude/`, `knowledge/`, `bootstrap/`).

Each module below has a README stating what's real, what's policy-only, and what's explicitly not built. "The folder exists" is not the same as "the capability works" -- see `registry/methodologies.yaml` for the per-methodology honesty check this repo holds itself to.

| Module | Status |
|---|---|
| [core](core/) | Policy -- this file + the registries ARE the core; no separate orchestration binary |
| [orchestration](orchestration/) | Platform tools reused (Agent, Workflow); no custom engine |
| [sdlc](sdlc/) | Implemented -- `.claude/rules/architecture.md` is the actual gate |
| [specifications](specifications/) | Implemented -- `templates/PRD`, `templates/technical-specification` |
| [architecture](architecture/) | Implemented -- architecture-first selection process in `.claude/rules/architecture.md` |
| [adr](adr/) | Implemented -- `templates/architecture-decision-record`, `docs/architecture/decisions/` |
| [skills](skills/) | Implemented -- `registry/skills.yaml` + `.claude/skills/inventory.md` |
| [agents](agents/) | Implemented -- `.claude/agents/*.md` + `registry/agents.yaml` |
| [code_intelligence](code_intelligence/) | Partially implemented -- Graphify already in use; no new tool built |
| [project_manager](project_manager/) | Implemented -- `projects/project-registry.yaml` + isolation convention |
| [execution](execution/) | Policy -- delegates to platform's Bash/Agent/Workflow tools |
| [process_monitor](process_monitor/) | Real but lightweight -- on-demand script, not a background daemon |
| [testing](testing/) | Implemented -- `.claude/rules/testing.md`, CI `validate.yml` |
| [security](security/) | Implemented -- `.claude/rules/security.md`, CI `security.yml` (gitleaks) |
| [github](github/) | Implemented -- branch protection, PR templates, CI, this repo's own practice |
| [deployment](deployment/) | Policy only -- no application has been deployed from this harness yet |
| [observability](observability/) | Implemented -- `observability/` directory, manually-written entries |
| [recovery](recovery/) | Policy -- see process_monitor; no automated recovery daemon |
| [improvement](improvement/) | Implemented as a manual review procedure -- `scripts/discovery/`, not a cron job |

## Mods (Claude Code's own interface/behavior)

The platform ships a `plugin-authoring` skill for building mods -- status lines, panes, slash commands, hooks on tool calls. Not used speculatively here: no mod was built this pass because nothing concrete needs one yet (a statusline showing project/branch would be nice-to-have, not a demonstrated gap, and it's exactly the kind of interactive/visual change that shouldn't ship unverified -- see observability/decisions log). Build one the first time a real friction point calls for it, test it live, then ship it.

## Why no custom orchestration/process-monitoring engine

A from-scratch multi-agent orchestrator, model router, and background process-recovery daemon were part of the original request. Building and genuinely testing that software is a multi-week engineering project in its own right, and most of what it would do already exists: the platform's Agent tool dispatches subagents, the Workflow tool runs multi-stage pipelines with phases and parallelism, and `/model`/`/effort` already select model and reasoning tier per session. Rebuilding those as new code in this repo would be duplicate, unmaintained infrastructure competing with infrastructure that already works -- the exact anti-pattern `.claude/rules/engineering-principles.md` warns against.

What's built instead: the decision tables and policy documents (registries, module READMEs) that tell a session or agent *when* to reach for which existing tool, plus one genuinely new, scoped, testable script (`scripts/health/process-check.sh`) for the one piece that had no existing equivalent -- a manual health check on long-running shell jobs.
