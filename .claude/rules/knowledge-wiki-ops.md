# Knowledge Wiki Operations

`knowledge/` is a persistent, compounding wiki, not a RAG dump -- pattern adopted 2026-11-24 per explicit user instruction ("verify everything we do in claude is in the Obsidian Vault and graphify is used wherever needed... save tokens and increase... efficiency... and the need to re-run entire context chunks"). Source pattern: user-supplied `llm-wiki.md`. Applies to every project this harness touches, from now on.

## The rule

**Every substantial piece of work gets filed, not left in chat history.** A fix, a decision, a lesson, a project milestone, a tool install, an architecture choice -- if it would help a future session avoid re-deriving the same thing, it goes into the wiki before the session ends. This is not optional bookkeeping; it is what makes `knowledge/` worth more than the raw conversation log it replaces.

## Three operations

**Ingest.** New information (a decision, a lesson, a finished feature, a new tool, a fixed bug worth generalizing) becomes or updates a wiki page:
1. Write/update the page (`_templates/note.md` or `project.md`, frontmatter + at least one `[[wikilink]]` -- see `README-obsidian-vault.md`).
2. Update `index.md` with the new/changed page's one-liner.
3. Append a `log.md` entry (`## [YYYY-MM-DD] ingest | <subject>`).
A single change might touch several pages (the lesson itself, the project's home note, the taxonomy). Touch all of them in the same pass -- a half-updated wiki is worse than an un-updated one, since it looks current and isn't.

**Query.** Before answering a question about past work, this project, or this user's preferences from memory or a fresh re-read: check `index.md` first, then drill into the specific page(s) it points to. Don't re-grep the whole `knowledge/` tree or re-read raw session transcripts when an existing wiki page already has the answer -- that's the token-cost this pattern exists to eliminate. If the answer required real synthesis (a comparison, an analysis), file it back as a page (ingest) rather than letting it evaporate into chat history.

**Lint.** On request, or when a project reaches a milestone: check for orphan pages (no inbound link), stale claims a newer source/decision has superseded, contradictions between pages, and concepts mentioned repeatedly but lacking their own page. Fix on sight; don't just report.

## Graphify-first for codebase questions

Before manually reading files to answer "how does X work" / "what calls Y" / "trace the data flow": check whether `graphify-out/graph.json` exists for that project. If it does, `graphify query "<question>"` first -- it's already-built structure, cheaper than re-deriving it from a fresh file read, and the project's `knowledge/graphify-exports/<project>.md` may already answer it without even running a query. If no graph exists yet and the codebase is non-trivial, building one is worth the one-time cost before a multi-file investigation, not after. See the `graphify` skill for the full command set.

Once a graph exists, copy its `GRAPH_REPORT.md` into `knowledge/graphify-exports/<project-name>.md` (manual step, see `README-obsidian-vault.md`) and link it from that project's home note -- this is itself an ingest.

## Token-efficiency rationale

This exists to cut three costs: (1) re-deriving the same fact/decision across sessions because it was never filed, (2) re-reading raw files to answer a structural question Graphify already has indexed, (3) re-grepping an un-indexed folder when `index.md` would have pointed straight at the answer. All three are "re-run entire context chunks" costs -- the thing this rule is meant to eliminate, per the user's instruction.
