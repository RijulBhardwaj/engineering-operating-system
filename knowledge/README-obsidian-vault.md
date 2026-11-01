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

## Second-brain convention

Start at [[00-Home]] -- it's the vault's MOC (map of content), linking every category and every project note. The point isn't "notes exist," it's that they're linked: a flat folder of unconnected Markdown files is what `knowledge/` already was before Obsidian. What Obsidian adds is only useful if notes actually reference each other.

**Every new note:**
1. Created from a template in `_templates/` (`note.md` for a lesson/solution/troubleshooting entry, `project.md` for a project's home note) -- `Ctrl+T` in Obsidian, or copy by hand if the Templates plugin isn't enabled yet (one-time manual step below).
2. Carries frontmatter: `type` (`lesson` / `project` / `index`), `project`, `tags`, `date`. This is what makes the vault queryable later (Obsidian search/Dataview-style filtering by `type:`), not just full-text-greppable.
3. Has at least one `[[wikilink]]` to an existing note -- the taxonomy category it generalizes into, the project it came from, or a related lesson. An unlinked note is an orphan in the graph view and defeats the point.

**Per-project home notes** live in `projects/<project-name>.md` (template: `project.md`), one per project this harness actively tracks. It links out to that project's lessons, decisions, and its `graphify-exports/<project-name>.md` entry once one exists -- the single place to land on to see everything the harness knows about a project. Still following `projects/README.md`'s isolation rule: this is a links-and-summaries hub, not a copy of project-specific code, secrets, or full session detail.

**One-time manual step:** the Templates plugin ships with Obsidian core but isn't enabled by default in a fresh vault. Settings -> Core plugins -> enable "Templates" -> set "Template folder location" to `_templates`. Not scripted here -- it's a local Obsidian preference (lives in `knowledge/.obsidian/`, gitignored, per-machine), not something a file in this repo should set for you.
