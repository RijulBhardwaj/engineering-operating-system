# Obsidian Vault

`knowledge/` (this folder) is an Obsidian vault. Open it directly in Obsidian -- "Open folder as vault" -> pick `knowledge/`. No separate vault folder was created; the existing Markdown knowledge base (`engineering-notes/`, `lessons-learned/`, `profile/`, `reusable-solutions/`, `technical-stack/`, `troubleshooting/`) is the vault as-is.

## Why here, not a new folder

This repo already treats `knowledge/` as committed, shared Markdown (see `README-memory-decision.md`). Obsidian just adds a graph view and backlinks on top of files that already exist -- no new content model, no duplicate source of truth.

## Graphify integration

`graphify-exports/` holds one Markdown file per project this harness has run Graphify against: `<project-name>.md`, copied from that project's `graphify-out/GRAPH_REPORT.md` after a graph is built. `graph.json` / `graph.html` stay in the project's own `graphify-out/` (not Markdown, not duplicated here) -- link to them from the copied report instead of inlining.

This is a manual copy step, not an automated sync -- no file watcher or hook was added. Run it after building/refreshing a project's Graphify graph:

```bash
cp "<project-path>/graphify-out/GRAPH_REPORT.md" "knowledge/graphify-exports/<project-name>.md"
```

**Why manual:** Graphify runs per-project, on demand, not on every commit -- a hook watching for `graphify-out/` changes would fire on stale or half-built graphs. Revisit if exports start getting forgotten in practice.

## Convention for future projects

When starting a new project through this harness, link or summarize its Graphify output here the same way once a graph exists for it. Don't pre-create empty per-project files -- add one only when that project actually has a graph to show.
