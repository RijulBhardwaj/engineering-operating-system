---
type: index
tags: [moc]
---

# Harness Knowledge Vault

Entry point. Start here, follow links -- don't grep the folder tree.

Three layers, per the llm-wiki pattern (`.claude/rules/knowledge-wiki-ops.md`):

- **[[raw/README|raw/]]** -- your inbox, dump anything here, immutable once added.
- **[[wiki/_master-index|wiki/]]** -- the LLM's domain, auto-maintained. Start at `wiki/_master-index.md`.
- **[[output/README|output/]]** -- query results and generated deliverables (reports, slide decks).

## Convention

New note -> `Ctrl+T` (Templates plugin, folder set to `_templates/`), pick `note` or `project`. Every note gets:
- frontmatter (`type`, `project`, `tags`, `date`) -- makes notes queryable, not just greppable
- at least one `[[wikilink]]` out, so Obsidian's graph view actually reflects real relationships instead of a flat folder dump

See [[README-obsidian-vault]] for the full convention and what still needs a one-time manual step.
