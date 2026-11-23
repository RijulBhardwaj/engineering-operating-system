# Knowledge Wiki Operations

`knowledge/` is a persistent, compounding wiki, not a RAG dump -- pattern adopted 2026-11-24 per explicit user instruction ("verify everything we do in claude is in the Obsidian Vault and graphify is used wherever needed... save tokens and increase... efficiency... and the need to re-run entire context chunks"; restructured same day into `raw/wiki/output` per a user-shown reference diagram, "put .claude into it... so all claude uses obsidian as a second brain"). Source pattern: user-supplied `llm-wiki.md`. Applies to every project this harness touches, from now on.

## Structure

- `knowledge/raw/` -- inbox, immutable sources.
- `knowledge/wiki/` -- LLM-maintained topic folders, each with `_index.md`; `wiki/_master-index.md` is the top-level table of contents. Includes `wiki/claude-harness/_index.md`, which indexes this harness's own `.claude/rules/*.md` -- the rules are discoverable from inside the vault too, not only from `CLAUDE.md`.
- `knowledge/output/` -- generated deliverables for a specific query (reports, slide decks).

## The rule

**Every substantial piece of work gets filed, not left in chat history.** A fix, a decision, a lesson, a project milestone, a tool install, an architecture choice -- if it would help a future session avoid re-deriving the same thing, it goes into the wiki before the session ends. This is not optional bookkeeping; it is what makes `knowledge/` worth more than the raw conversation log it replaces.

## Three operations

**Ingest.** New information (a decision, a lesson, a finished feature, a new tool, a fixed bug worth generalizing) becomes or updates a wiki page:
1. Source material lands in `raw/` first if it's an external document/transcript worth keeping as-is; skip this step for information that originates in-session (a decision, a fix).
2. Write/update the page under `wiki/<topic>/` (`_templates/note.md` or `project.md`, frontmatter + at least one `[[wikilink]]` -- see `README-obsidian-vault.md`).
3. Update that topic's `_index.md`, and `wiki/_master-index.md` if a topic folder was added or renamed.
4. Append a `log.md` entry (`## [YYYY-MM-DD] ingest | <subject>`).
A single change might touch several pages (the lesson itself, the project's home note, the taxonomy). Touch all of them in the same pass -- a half-updated wiki is worse than an un-updated one, since it looks current and isn't.

**Query.** Before answering a question about past work, this project, or this user's preferences from memory or a fresh re-read: check `wiki/_master-index.md` first, then the relevant topic's `_index.md`, then the specific page. Don't re-grep the whole `knowledge/` tree or re-read raw session transcripts when an existing wiki page already has the answer -- that's the token-cost this pattern exists to eliminate. If the answer required real synthesis (a comparison, an analysis), file it into `output/` (or into `wiki/` if it's generally reusable) rather than letting it evaporate into chat history.

**Lint.** On request, or when a project reaches a milestone: check for orphan pages (no inbound link), stale claims a newer source/decision has superseded, contradictions between pages, and concepts mentioned repeatedly but lacking their own page. Fix on sight; don't just report.

## Graphify-first for codebase questions

Before manually reading files to answer "how does X work" / "what calls Y" / "trace the data flow": check whether `graphify-out/graph.json` exists for that project. If it does, `graphify query "<question>"` first -- it's already-built structure, cheaper than re-deriving it from a fresh file read, and the project's `knowledge/wiki/graphify-exports/<project>.md` may already answer it without even running a query. If no graph exists yet and the codebase is non-trivial, building one is worth the one-time cost before a multi-file investigation, not after. See the `graphify` skill for the full command set.

Once a graph exists, copy its `GRAPH_REPORT.md` into `knowledge/wiki/graphify-exports/<project-name>.md` (manual step, see `README-obsidian-vault.md`) and link it from that project's home note -- this is itself an ingest.

## Token-efficiency rationale

This exists to cut three costs: (1) re-deriving the same fact/decision across sessions because it was never filed, (2) re-reading raw files to answer a structural question Graphify already has indexed, (3) re-grepping an un-indexed folder when `index.md` would have pointed straight at the answer. All three are "re-run entire context chunks" costs -- the thing this rule is meant to eliminate, per the user's instruction.
