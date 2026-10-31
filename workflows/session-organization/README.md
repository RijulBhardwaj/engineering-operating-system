# Session Organization

Two kinds of session, never mixed in one.

## 1. Harness session

Working directory: this repo (`engineering-operating-system`). Purpose: maintain the harness itself -- update rules, registry, agents, policies, bootstrap. Start one when:
- Adding/reviewing a skill or tool in `registry/`.
- Changing a rule in `.claude/rules/`.
- Running the daily discovery check (`scripts/discovery/registry-refresh-check.sh`) or a doctor check (`bootstrap/doctor.sh`).
- Anything in this repo's own `PART 22` phase list (bootstrap, CI, policy).

A harness session never writes application code for a project -- that's cross-contamination the isolation convention (`projects/README.md`) exists to prevent.

## 2. Project session

Working directory: the project's own repo (separate from this one). How it gets the harness's rules: the global `~/.claude/CLAUDE.md` link installed by `bootstrap/install.sh` -- every session, in any directory, reads the harness's `CLAUDE.md` routing layer automatically. You don't "prompt the harness" as a separate step; starting a session *in a project directory* already has the harness's rules loaded.

To start work on a project:
1. `cd` into (or create) that project's own directory -- never inside `engineering-operating-system/`.
2. Open a session there. Say what you want built.
3. I follow the session-start checklist in the harness `CLAUDE.md`: check `projects/project-registry.yaml` for this project's entry, read the project's own `CLAUDE.md` if one exists, check `observability/progress/` for the last checkpoint.
4. If the project isn't registered yet, I register it (Phase: project-initialization) before writing code.

## Which session to use, concretely

| You want to... | Session |
|---|---|
| "Add X skill to the registry" | Harness session, this repo |
| "Build me a todo app" | New project session, new directory, never this repo |
| "Fix a bug in [project]" | That project's own session/directory |
| "Change how ADRs are formatted for every project" | Harness session (edit `templates/architecture-decision-record/`) |
| "This project needs its own ADR" | Project session (its own `docs/architecture/decisions/`) |

## Parallel/independent work

For independent pieces of a build (e.g. backend + frontend scaffolding that don't touch the same files yet), use the platform's own session-start or Agent/Workflow tools from within the project session -- see `.claude/rules/agent-coordination.md` for file-ownership rules. Don't start a second *harness* session to parallelize a *project's* work; the harness session is for harness maintenance only.

## Shared vs. isolated state across sessions

- **Shared** (same everywhere, by design): `.claude/rules/`, `.claude/agents/`, `templates/`, `policies/`, `registry/*.yaml` -- all read via the global `CLAUDE.md` link, regardless of which project directory a session runs in.
- **Isolated** (never shared, by design): each project's own code, secrets, `.env`, ADRs, test results, and -- critically -- its auto-memory. Claude Code's built-in auto-memory is keyed per working directory (`~/.claude/projects/<sanitized-path>/memory/`), so a harness session and a project session already get separate memory stores with zero extra configuration. This *is* the platform's native shared/isolated split -- see `knowledge/README-memory-decision.md` for why no third-party shared-memory MCP was added on top of it.
