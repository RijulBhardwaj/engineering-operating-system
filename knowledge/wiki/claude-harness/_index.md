---
type: index
tags: [claude-harness, rules]
---

# Claude Harness Rules

This harness's own `.claude/rules/*.md` are the binding engineering rules for every session -- indexed here so the vault is the single place to look for "what does Claude follow," not a second, disconnected source. These are links, not copies: the files live in `.claude/rules/`, this page is the catalog.

- [`.claude/rules/engineering-principles.md`](../../../.claude/rules/engineering-principles.md) -- security-by-default, fail-safe defaults, anti-patterns to resist
- [`.claude/rules/architecture.md`](../../../.claude/rules/architecture.md) -- AI SDLC + spec-driven + ADR gate (mandatory for non-trivial work)
- [`.claude/rules/system-design-patterns.md`](../../../.claude/rules/system-design-patterns.md) -- rate limiting, CAP, idempotency, sagas, leader election checklist
- [`.claude/rules/coding-standards.md`](../../../.claude/rules/coding-standards.md) -- smallest correct change, Karpathy guidelines
- [`.claude/rules/testing.md`](../../../.claude/rules/testing.md) -- testing standard, points to ai-code-qa-gate.md for the concrete pipeline
- [`.claude/rules/ai-code-qa-gate.md`](../../../.claude/rules/ai-code-qa-gate.md) -- five-layer QA pipeline + tool stack, triggered by any audit/QA/test request
- [`.claude/rules/security.md`](../../../.claude/rules/security.md) -- secrets, OWASP baseline, AI-specific tool-permission scoping
- [`.claude/rules/git-workflow.md`](../../../.claude/rules/git-workflow.md) -- branches, commits, PR flow, worktrees
- [`.claude/rules/token-efficiency.md`](../../../.claude/rules/token-efficiency.md) -- don't call tools speculatively, targeted reads, checkpoint instead of re-deriving
- [`.claude/rules/agent-coordination.md`](../../../.claude/rules/agent-coordination.md) -- minimum sufficient agent set, no self-approval
- [`.claude/rules/knowledge-wiki-ops.md`](../../../.claude/rules/knowledge-wiki-ops.md) -- this vault's own operating rules (ingest/query/lint, Graphify-first)

## Why this page exists

"All Claude uses Obsidian as a second brain" (user instruction, 2026-11-24) means the harness's own rules are discoverable from inside the vault, not just from `CLAUDE.md`'s routing table. A session doing a `query` op here (see knowledge-wiki-ops.md) should be able to land on this page and find the actual rule file instead of re-deriving "what are this harness's rules" from scratch.
