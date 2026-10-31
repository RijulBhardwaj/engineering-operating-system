# Engineering Operating System

Rijul Bhardwaj's personal, GitHub-backed engineering infrastructure. This repository is the canonical source of truth for engineering standards, agent definitions, workflows, and knowledge that apply across every project and every machine. Local Claude installations bootstrap and sync *against* this repo — they do not hold their own copy of the truth.

## What this is

- **Not** a single CLAUDE.md file.
- **Not** project-specific.
- A layered configuration + knowledge + workflow system: global rules, reusable agent personas, ADR-driven architecture process, CI quality gates, and a project registry, all version-controlled.

## Layout

| Path | Purpose |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Routing layer — thin, links to everything else. Read this first. |
| [`.claude/`](.claude/) | Rules, agent personas, skills inventory, hooks config. |
| [`bootstrap/`](bootstrap/) | Cross-platform install/sync/doctor scripts. |
| [`engineering/`](engineering/) | Architecture standards, design patterns, per-domain practices. |
| [`knowledge/`](knowledge/) | Engineering profile, taxonomy, lessons learned, reusable solutions. |
| [`workflows/`](workflows/) | AI SDLC stage docs: spec-driven dev, autonomous loops, review, deployment. |
| [`templates/`](templates/) | PRD, tech-spec, ADR, test-plan, postmortem templates. |
| [`policies/`](policies/) | Security, branch-protection, commit, testing, dependency policy. |
| [`observability/`](observability/) | Progress checkpoints, decision log, error log, validation records. |
| [`projects/`](projects/) | Project registry — one entry per active project. |
| [`schemas/`](schemas/) | JSON schemas for project/agent/audit-event/config records. |

## Quick start (new machine)

```bash
git clone https://github.com/RijulBhardwaj/engineering-operating-system.git
cd engineering-operating-system
bash bootstrap/install.sh      # Linux/macOS
# or
pwsh bootstrap/install.ps1     # Windows
bash bootstrap/doctor.sh       # verify
```

## Starting a new project

See [`workflows/project-initialization/README.md`](workflows/project-initialization/README.md). Short version: discovery → PRD → architecture alternatives → ADR → implementation plan → branch → build → test → review → PR → merge. Do not skip the specification stage for anything non-trivial.

## Status

Bootstrapped 2026-10-31. See [`FINAL_IMPLEMENTATION_REPORT.md`](FINAL_IMPLEMENTATION_REPORT.md) for what's implemented, what's stubbed, and what's intentionally not built yet.
