---
type: index
tags: [moc, catalog]
---

# Master Index

LLM's table of contents for `wiki/`. Topic folders below, each with its own `_index.md`. Read this first on any query; drill into a topic's `_index.md`, then its pages, only after finding the right one here -- don't grep the tree fresh each time. This file + `[[../00-Home]]` are the vault's two entry points, per the llm-wiki pattern (`.claude/rules/knowledge-wiki-ops.md`).

Update this file on every ingest that adds or renames a topic folder. Update a topic's own `_index.md` for a new page inside it.

## Topics

- [[profile/_index|profile/]] -- verified facts about the user
- [[technical-stack/_index|technical-stack/]] -- category taxonomy lessons generalize into
- [[lessons-learned/_index|lessons-learned/]] -- generalized lessons from past work
- [[reusable-solutions/_index|reusable-solutions/]] -- patterns/code worth reusing across projects
- [[troubleshooting/_index|troubleshooting/]] -- diagnosed problems and their fixes
- [[projects/_index|projects/]] -- per-project home notes
- [[graphify-exports/_index|graphify-exports/]] -- per-project Graphify codebase graph reports
- [[claude-harness/_index|claude-harness/]] -- this harness's own `.claude/rules/*.md`, indexed for in-vault discovery

## Meta / vault operation (outside wiki/)

- [[../raw/README|raw/]] -- inbox for unprocessed sources
- [[../output/README|output/]] -- generated deliverables (reports, slide decks)
- [[../README-obsidian-vault|README-obsidian-vault.md]] -- vault conventions, template usage, Graphify export convention
- [[../README-memory-decision|README-memory-decision.md]] -- why this knowledge base lives in-repo vs. elsewhere
- [[../log|log.md]] -- chronological record of ingests/queries/lint passes
