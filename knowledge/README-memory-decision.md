# Shared Memory: Decision

User asked to implement "shared memory" across sessions. Researched the third-party options (Nucleus, claude-memory, claude-memory-mcp, Mono Memory MCP) before deciding.

## Decision: use the platform's native auto-memory + global CLAUDE.md link. No third-party memory MCP installed.

**Why:**
- Claude Code already has two native memory mechanisms: `CLAUDE.md` files (read at session start) and auto-memory (`~/.claude/projects/<sanitized-cwd>/memory/`, also read at session start, written to during the session).
- Auto-memory is keyed per working directory -- this already gives exactly the split this harness's own isolation convention requires: harness-repo memory separate from each project's memory, with zero added infrastructure.
- Global standards/rules "sharing" is already solved by `bootstrap/install.sh` linking the harness's `CLAUDE.md` into `~/.claude/CLAUDE.md` -- every session everywhere reads the same rules, regardless of directory.
- The third-party options (Nucleus, Mono Memory, etc.) solve a different problem: a genuinely shared, cross-project *mutable* memory store. That's the opposite of what `projects/README.md`'s isolation convention wants -- "two projects never... share mutable execution state." Adding one would actively work against an existing, deliberate policy.
- They're also community MCP servers with unverified maintenance/security status (own admission in the sources checked) -- installing one means a new always-on process with filesystem/network access, for a capability the platform already provides in the form this harness actually needs.

**What "shared" means here, concretely:**
- Shared, read-only, same everywhere: `.claude/rules/`, `.claude/agents/`, `templates/`, `policies/`, `registry/*.yaml` (via the global CLAUDE.md link).
- Isolated, per-project, never shared: project code, secrets, ADRs, and auto-memory.
- Harness-repo memory (this repo's own checkpoints, decisions, lessons) lives in `observability/` and `knowledge/` -- committed to this repo, so it IS shared in the sense that every session that reads this repo's CLAUDE.md sees it. That's git-based sharing, not a live memory server, and it's sufficient for how this harness is actually used (one person, sequential sessions, not real-time multi-agent collaboration needing a shared mutable store).

**Revisit if:** multiple people start using this harness simultaneously, or a real need emerges for one session to see another's *live, uncommitted* state in real time. Neither is true as of 2026-10-31.
