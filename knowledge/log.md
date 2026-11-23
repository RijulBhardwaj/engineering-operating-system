---
type: index
tags: [log]
---

# Wiki Log

Append-only. Chronological record of ingests, queries, and lint passes against this vault. Each entry starts with `## [YYYY-MM-DD] <op> | <subject>` so it stays `grep`-able: `grep "^## \[" log.md | tail -5` for the last 5 entries.

Ops: `ingest` (new source/page added or existing page meaningfully updated), `query` (a question answered from the wiki, worth recording if the answer itself got filed as a page), `lint` (health-check pass -- contradictions, orphans, stale claims, missing cross-refs).

## [2026-11-24] ingest | llm-wiki pattern adopted

Source: user-supplied `llm-wiki.md` (pattern doc, no attribution needed -- it's explicitly meant to be handed to an agent). Added `index.md` (this vault didn't have a content-oriented catalog before -- `00-Home.md` served as MOC but wasn't a flat catalog) and this `log.md`. New rule [[../. claude/rules/knowledge-wiki-ops|knowledge-wiki-ops.md]] codifies ingest/query/lint operations and mandates: every substantial session's work gets filed here, Graphify is checked/used before manually re-deriving codebase structure (token efficiency), and `index.md` is read before drilling into pages.

## [2026-11-24] ingest | vault restructured into raw/wiki/output

Source: user-shown reference screenshot (reel by chase.h.ai) of a `vault/{raw,wiki,output}` layout with `wiki/_master-index.md` and per-topic `_index.md` files. Moved every existing folder (`profile/`, `technical-stack/`, `lessons-learned/`, `reusable-solutions/`, `troubleshooting/`, `projects/`, `graphify-exports/`) under `wiki/`, renamed each category's `README.md`/`taxonomy.md` to `_index.md`, renamed `index.md` to `wiki/_master-index.md`. Added `raw/` (inbox) and `output/` (generated deliverables) as new top-level folders, and `wiki/claude-harness/_index.md` -- an in-vault catalog of this harness's own `.claude/rules/*.md`, per the user's instruction to "put .claude into it... so all claude uses obsidian as a second brain." All cross-references (`00-Home.md`, `README-obsidian-vault.md`, `knowledge-wiki-ops.md`) updated to the new paths. Done with `git mv` to preserve history.

## [2026-11-24] ingest | AI Code QA Gate tools

ruff, mypy, bandit, mutmut, pip-audit, pylint, eslint, pyright, stryker installed globally. New rule `.claude/rules/ai-code-qa-gate.md`. mutmut doesn't run natively on Windows -- needs WSL (user installing WSL as of this entry, not yet confirmed done).

## [2026-11-24] ingest | Obscura scrape tool

Installed Obscura (Rust headless browser) at `tools/obscura/` for JS-rendered page fetch/scrape. Registered in `registry/tools.yaml`. Plain build only, not the stealth/anti-detect variant.

## [2026-11-24] ingest | SessionStart hook -- harness force-load

Added `.claude/hooks/session-start.js` + a `SessionStart` hook in `~/.claude/settings.json` so this harness's `CLAUDE.md` loads into every session automatically, not just when a model chooses to read the pointer. Verified firing on session resume.

## [2026-11-24] ingest | PreCompact hook -- mechanical half of knowledge-wiki-ops.md

Added `.claude/hooks/pre-compact-wiki-reminder.js` + a `PreCompact` hook in `~/.claude/settings.json`. Fires automatically before every compaction in every project, reminding the session to file substantial work into the vault before context is lost. Deliberately not a hard Stop-hook block -- `Stop` fires at the end of every turn, not just task completion, so blocking there would interrupt normal multi-step work constantly.

## [2026-11-24] ingest | git-workflow.md: checkout -b stale-ref gotcha

Fitness Intelligence Platform session hit a real failure mode backfilling its own vault page (PR #31): `git checkout -b <name>` silently checked out a stale same-named `origin/<name>` ref instead of branching from current `main`, landing the first commit on local `main`. Caught before any push; fixed by moving the commit to a correctly-named branch and resetting `main`. Documented in `.claude/rules/git-workflow.md` so future sessions check for the collision before reusing a branch name.

## [2026-11-24] ingest | fitness-intelligence-platform vault page backfilled

Created `knowledge/wiki/projects/fitness-intelligence-platform.md` (first vault page for this project). Summarizes the stack, key ADRs, and the live production outage found+fixed this session (Cloudflare silently deprecated the deployed Workers AI model, killing chat; caught by a new automated RLS-isolation test, fixed by switching to a non-reasoning instruct model after three reasoning-model replacements all reproduced the same hidden-token-starvation failure). Also linked from `graphify-exports/fitness-intelligence-platform.md` (export already existed). Found `knowledge/wiki/projects/_index.md` had no actual per-project link list despite the convention doc implying one (neither this page nor `lynceon-ai.md` was linked from anywhere) -- added a `## Projects` list there with both.
