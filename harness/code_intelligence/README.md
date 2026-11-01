# Code Intelligence

Partially implemented. Graphify is already installed and in use on this account for codebase-graph queries. No second code-intelligence tool was added -- Floorplan and Context Mode were evaluated and deliberately not installed (see registry/skills.yaml, registry/tools.yaml) absent a concrete gap Graphify doesn't already cover.

Obsidian (installed 2026-11-01, see `registry/tools.yaml`) is the viewer layered on top: this repo's `knowledge/` is the vault, and `knowledge/graphify-exports/` holds a copied `GRAPH_REPORT.md` per project once Graphify has built a graph for it. See [`knowledge/README-obsidian-vault.md`](../../knowledge/README-obsidian-vault.md) for the convention. This doesn't change what Graphify does -- it's a read-only Markdown viewer on top of Graphify's existing output, not a new graph engine.
