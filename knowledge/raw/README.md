# Raw Inbox

Dump anything here: articles, clipped pages, PDFs, transcripts, screenshots -- unprocessed source material. Immutable once added; a session reads from it but never edits it. This is the source of truth an `ingest` operation (see `.claude/rules/knowledge-wiki-ops.md`) reads from and turns into `wiki/` pages.

Not committed by default -- add a per-file exception if a specific raw source is worth keeping in git history; most raw dumps are transient once ingested into `wiki/`.
