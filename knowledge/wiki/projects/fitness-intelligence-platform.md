---
type: project
status: active
tags: [fitness, nutrition, rag, cloudflare-workers, supabase]
started: 2026-10-31
---

# Fitness Intelligence Platform

AI fitness/nutrition/yoga chatbot: Cloudflare Worker + Supabase Postgres/pgvector RAG + Workers AI inference, embeddable multi-tenant widget. Deterministic calc engine (BMR/TDEE/macros) backs the chat, not model guesswork. Repo: `C:\Coding Projects\fitness-intelligence-platform` (GitHub `RijulBhardwaj/fitness-intelligence-platform`).

## Decisions
- Infra: Cloudflare Workers + Workers AI, no separate server -- `docs/architecture/decisions/ADR-0001-cloudflare-serverless-infra.md`
- Database: Supabase Postgres + pgvector (supersedes an earlier Neon choice that was never actually provisioned) -- `ADR-0008-supabase-postgres-pgvector.md`
- Auth: custom RS256 JWT, Workers-issued, Supabase Third-Party Auth trusts it -- `ADR-0009`
- Embedding model: `@cf/baai/bge-small-en-v1.5` (384-dim, measured faster+smaller than the Qwen embedding alternative) -- `ADR-0010`
- **Production inference model: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`** -- `ADR-0012-llama-3.3-70b-production-model.md`. Supersedes `ADR-0004`/`MODEL_SELECTION_ADR`'s `qwen3-30b-a3b-fp8`, which Cloudflare silently deprecated (removed from the Workers AI catalogue 2026-11-20), killing production chat entirely with no error surfaced to the team -- a new automated RLS-isolation integration test caught it live, not a user report. Three reasoning-model replacement candidates were tried and rejected first (all reproduced the old model's hidden-reasoning-token-starvation failure on compound/structured requests, hanging 60-90s+ with zero output); the fix was switching model *class* (plain instruct, no hidden reasoning phase) rather than tuning token budgets further.

## Lessons
- A model being silently removed from a cloud provider's catalogue is a real, no-warning production-outage vector -- worth a cheap live health-check/smoke-test on the actual inference path, not just on deploy success.
- "Thinking"/reasoning models can burn an entire token budget on hidden reasoning before emitting any visible content, especially on compound/structured prompts (workout plans, multi-constraint requests) -- this recurred across 4 different models tried in this project, not a one-off quirk of a single model.
- Where things stand and what is unverified: `docs/SESSION_STATE.md`, `docs/TASK_REGISTER.md` in the repo (TASK_REGISTER is the current source of truth; SESSION_STATE is a short live-state pointer rewritten each time it goes stale).

## Graphify
- [[../graphify-exports/fitness-intelligence-platform]] (code graph; `graph.html`/`graph.json` in the repo's `graphify-out/`)

## Status
active
