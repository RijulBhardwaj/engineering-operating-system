# Project Registry

One entry per active project in `project-registry.yaml`. A project inherits global standards from this repo and keeps its own credentials/logs/datasets separate -- never mixed in here.

Known existing repos on this account were inventoried 2026-10-31 (see `FINAL_IMPLEMENTATION_REPORT.md`); most are finished course/portfolio work and are not actively registered here. `12_Dimension_Harness` is the one active project this account is currently working in and is registered below as the first real entry.

## Isolation convention

Each project is its own repository with its own:

- Git history, branches, PRs.
- docs/architecture/decisions/ (its own ADRs, never mixed with this repo's or another project's).
- Specs (PRD.md, technical spec, test plan -- using templates/ from here, but the filled-in content lives in the project).
- Dependencies, environment config, .env.example, secrets (never in this repo, never shared across projects).
- observability/ (progress, decisions, errors -- project-local, not written back here).
- Test results, logs, and any project-local knowledge graph (e.g. a Graphify index) -- never shared or merged across projects.

What a project inherits from this repo (read-only, referenced, not copied): .claude/rules/, .claude/agents/, templates/, policies/, registry/*.yaml. A project's own CLAUDE.md may add constraints but may not weaken a security/branch-protection policy from here without flagging the conflict.

Two projects never: share a secret, share a database, share mutable execution state, or have an agent edit one project's files while reasoning about another's context in the same turn.
