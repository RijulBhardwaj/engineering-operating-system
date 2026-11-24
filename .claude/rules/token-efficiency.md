# Token and Context Efficiency

Do not call tools speculatively. Do not re-run a search that already answered the question. Targeted file reads over whole-repo reads. Do not reload documentation already fetched this session. Summarize completed work into a checkpoint (observability/progress/) instead of re-deriving it from conversation history next session. Load only the skills/agents a task actually needs.

## Tokenomics tracking (adopted 2026-11-24)

Per explicit user instruction ("must absolutely keep track of the tokenomics and optimise everywhere without affecting accuracy completion or correctness"): track cost, never trade it against correctness.

- Route every delegable step to the cheapest tier that can do it without quality loss: Haiku for search/read/summarize/mechanical edits, Sonnet for implementation/debugging, Opus/Fable only for architecture-level judgment or where a cheaper tier already failed. Same tiering as `USAGE_LIMIT_POLICY`.
- On a multi-agent task, use the `ecc:cost-report` / `ecc:token-card` skills (already in this account's skill set) to surface actual spend, not a guess, before declaring a large task done.
- Optimization never means: skipping a gate, shortening a test, dropping an edge case, or reporting partial work as complete to save tokens. Cost is cut by routing and parallelizing (agent-coordination.md), never by cutting corners.
