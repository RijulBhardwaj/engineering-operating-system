---
type: index
tags: [log]
---

# Wiki Log

Append-only. Chronological record of ingests, queries, and lint passes against this vault. Each entry starts with `## [YYYY-MM-DD] <op> | <subject>` so it stays `grep`-able: `grep "^## \[" log.md | tail -5` for the last 5 entries.

Ops: `ingest` (new source/page added or existing page meaningfully updated), `query` (a question answered from the wiki, worth recording if the answer itself got filed as a page), `lint` (health-check pass -- contradictions, orphans, stale claims, missing cross-refs).

## [2026-11-24] ingest | llm-wiki pattern adopted

Source: user-supplied `llm-wiki.md` (pattern doc, no attribution needed -- it's explicitly meant to be handed to an agent). Added `index.md` (this vault didn't have a content-oriented catalog before -- `00-Home.md` served as MOC but wasn't a flat catalog) and this `log.md`. New rule [[../. claude/rules/knowledge-wiki-ops|knowledge-wiki-ops.md]] codifies ingest/query/lint operations and mandates: every substantial session's work gets filed here, Graphify is checked/used before manually re-deriving codebase structure (token efficiency), and `index.md` is read before drilling into pages.

## [2026-11-24] ingest | AI Code QA Gate tools

ruff, mypy, bandit, mutmut, pip-audit, pylint, eslint, pyright, stryker installed globally. New rule `.claude/rules/ai-code-qa-gate.md`. mutmut doesn't run natively on Windows -- needs WSL (user installing WSL as of this entry, not yet confirmed done).

## [2026-11-24] ingest | Obscura scrape tool

Installed Obscura (Rust headless browser) at `tools/obscura/` for JS-rendered page fetch/scrape. Registered in `registry/tools.yaml`. Plain build only, not the stealth/anti-detect variant.

## [2026-11-24] ingest | SessionStart hook -- harness force-load

Added `.claude/hooks/session-start.js` + a `SessionStart` hook in `~/.claude/settings.json` so this harness's `CLAUDE.md` loads into every session automatically, not just when a model chooses to read the pointer. Verified firing on session resume.
