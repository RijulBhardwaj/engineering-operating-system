# Graph Report - fitness-intelligence-platform  (2026-11-03)

## Corpus Check
- Corpus is ~39,791 words - fits in a single context window. You may not need a graph.

## Summary
- 334 nodes · 509 edges · 20 communities (19 shown, 1 thin omitted)
- Extraction: 89% EXTRACTED · 10% INFERRED · 1% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- API Surface & Endpoints
- Calc Engine & JWT Auth
- Benchmark Harness
- RAG Vector Search Migrations
- Safety Gate & Evaluation
- npm Package Config
- RLS & Session Issuance
- TypeScript Config
- Frontend Design & Widget Session
- Qwen3 Model Compatibility
- Embeddable Widget JS
- Initial DB Schema
- Neon/pgvector Decision
- Local Demo Server
- Infra Research (Neon/Supabase)
- Inference Provider Decision
- Nutrition Corpus Licensing
- Zero-Cost Quota Policy
- Usage Tracking Tables
- FastAPI vs Workers Decision

## God Nodes (most connected - your core abstractions)
1. `fetch()` - 18 edges
2. `compilerOptions` - 13 edges
3. `Query orchestration DAG` - 12 edges
4. `init()` - 11 edges
5. `Supabase Postgres schema` - 11 edges
6. `ADR-0002: Neon PostgreSQL + pgvector` - 11 edges
7. `ADR-0004: Qwen3 model compatibility` - 10 edges
8. `ADR-0007: Zero-cost policy, quota tracking and exhaustion behaviour` - 10 edges
9. `FitnessLLM PRD` - 9 edges
10. `ADR-0003: Cloudflare Workers AI inference provider` - 9 edges

## Surprising Connections (you probably didn't know these)
- `WorkersAIBgeEmbeddingProvider` --implements--> `@cf/baai/bge-small-en-v1.5`  [EXTRACTED]
  src/adapters/embeddings/provider.ts → docs/architecture/decisions/ADR-0010-embedding-model-choice.md
- `isUnsafeExtremeRequest()` --semantically_similar_to--> `safety_unsupported category`  [INFERRED] [semantically similar]
  tests/user_journeys/evaluation/evaluation_results.md → docs/benchmark/EVALUATION_DATASET.md
- `WorkersAIProvider` --implements--> `InferenceProvider interface`  [EXTRACTED]
  src/adapters/inference/provider.ts → docs/architecture/decisions/ADR-0003-workers-ai-inference-provider.md
- `SelfHostedQwenProvider` --implements--> `InferenceProvider interface`  [EXTRACTED]
  src/adapters/inference/provider.ts → docs/architecture/decisions/ADR-0003-workers-ai-inference-provider.md
- `Custom RS256 JWT auth` --conceptually_related_to--> `No credentials in frontend`  [INFERRED]
  README.md → docs/SECURITY.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Query orchestration pipeline** — docs_dag_check_red_flags, docs_dag_classify_query, docs_dag_custom_async_executor, docs_dag_present_node [INFERRED 0.75]
- **Determinism tuple** — docs_prd_determinism_requirement, docs_dag_determinism_contract, docs_database_calc_results_cache, docs_database_provenance_columns [INFERRED 0.85]
- **Tenant isolation controls** — docs_database_tenant_isolation_rule, docs_database_rls_disabled_gap, docs_multi_tenant_architecture_fail_closed_allowlist, docs_security_widget_origin_validation [INFERRED 0.75]
- **Tenant isolation enforcement stack** — docs_architecture_decisions_adr_0002_neon_postgres_pgvector_tenant_id_isolation, docs_architecture_decisions_adr_0008_supabase_postgres_pgvector_rls_disabled_risk, docs_architecture_decisions_adr_0009_custom_jwt_auth_rls_custom_rs256_jwt_issuance, db_migrations_0002_rls_policies [INFERRED 0.75]
- **Benchmark-driven model selection chain** — docs_architecture_decisions_adr_0004_qwen3_model_compatibility_qwen3_30b_a3b_fp8, docs_architecture_decisions_adr_0004_qwen3_model_compatibility_qwen3_4b_instruct, docs_benchmark_model_benchmark, docs_benchmark_model_selection_adr, docs_architecture_decisions_adr_0004_qwen3_model_compatibility_mandatory_reasoning_overhead [INFERRED 0.85]
- **Zero-cost governance mechanism** — docs_architecture_decisions_adr_0007_zero_cost_quota_failure_policy_zero_cost_policy, docs_architecture_decisions_adr_0007_zero_cost_quota_failure_policy_no_automatic_paid_fallback, docs_architecture_decisions_adr_0007_zero_cost_quota_failure_policy_inference_usage_table, docs_architecture_decisions_adr_0006_no_redis_phase2_postgres_backed_counters, docs_architecture_decisions_adr_0003_workers_ai_inference_provider_cloudflare_workers_ai [INFERRED 0.75]

## Communities (20 total, 1 thin omitted)

### Community 0 - "API Surface & Endpoints"
Cohesion: 0.05
Nodes (37): capacity_exhausted error code, Chat messages SSE endpoint, REST API surface, Saved plans endpoints, Architecture alternatives, Cloudflare Worker entrypoint, ADR-0001 Cloudflare serverless infrastructure, Cloudflare Workers platform (+29 more)

### Community 1 - "Calc Engine & JWT Auth"
Cohesion: 0.08
Nodes (34): RFC-7515, JWKS endpoint (/.well-known/jwks.json), ACTIVITY_MULTIPLIER, CALC_ENGINE_VERSION, calcBmrTdeeMacros(), CalcProfile, CalcResult, needsCalc() (+26 more)

### Community 2 - "Benchmark Harness"
Cohesion: 0.10
Nodes (19): CaseResult, EvalCase, EvalCategory, needsHumanReview(), renderPrompt(), runBenchmark(), runCase(), SAMPLE_EVAL_CASES (+11 more)

### Community 3 - "RAG Vector Search Migrations"
Cohesion: 0.11
Nodes (13): rag_documents, rag_documents_embedding_idx, rag_documents_embedding_idx, match_rag_documents(), ADR-0010, ADR-0010: Embedding model choice for RAG, @cf/baai/bge-small-en-v1.5, @cf/qwen/qwen3-embedding-0.6b (+5 more)

### Community 4 - "Safety Gate & Evaluation"
Cohesion: 0.12
Nodes (18): constraint_satisfaction category, safety_unsupported category, constraint_satisfaction truncation failure, isUnsafeExtremeRequest(), Live evaluation results (22 responses), Multi-turn conversation memory bug (fixed), Response quality rubric, Response quality axes (+10 more)

### Community 5 - "npm Package Config"
Cohesion: 0.12
Nodes (19): allowScripts, esbuild@0.17.19, workerd@1.20250718.0, devDependencies, @cloudflare/workers-types@^5.20261102.1, @types/node@^26.6.6, typescript@^5.6.3, wrangler@^4.156.2 (+11 more)

### Community 6 - "RLS & Session Issuance"
Cohesion: 0.13
Nodes (13): issue_widget_session(), demo/index.html, ADR-0008: Supabase Postgres + pgvector, RLS disabled on all 11 tables (critical risk), Hard pre-launch RLS policy blocker, ADR-0009: Custom JWT auth via Supabase Third-Party Auth, Custom RS256 JWT issuance (Workers), Widget-session issuance SECURITY DEFINER function (+5 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.13
Nodes (14): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, noEmit, noUncheckedIndexedAccess (+6 more)

### Community 8 - "Frontend Design & Widget Session"
Cohesion: 0.22
Nodes (9): FitnessLLM landing page, Widget session endpoint, Design tokens, Frontend design decisions, Orb animation, Widget origin validation, Widget conceptual embed flow, Widget integration surfaces (+1 more)

### Community 9 - "Qwen3 Model Compatibility"
Cohesion: 0.21
Nodes (11): ADR-0004: Qwen3 model compatibility, enable_thinking toggle, Mandatory reasoning overhead, @cf/qwen/qwen3-30b-a3b-fp8, Qwen3-4B-Instruct, Evaluation dataset (model selection benchmark), Evaluation case structure, knowledge_snapshot_version (+3 more)

### Community 10 - "Embeddable Widget JS"
Cohesion: 0.35
Nodes (11): el(), ensureInterFont(), init(), addMessage(), ensureSession(), renderAssistantText(), renderCategoryTag(), renderStatCard() (+3 more)

### Community 11 - "Initial DB Schema"
Cohesion: 0.44
Nodes (10): calc_results, conversations, feedback, inference_usage, messages, saved_plans, tenants, user_profiles (+2 more)

### Community 12 - "Neon/pgvector Decision"
Cohesion: 0.22
Nodes (7): ADR-0002: Neon PostgreSQL + pgvector, pgvector extension, rag_documents table, ADR-0006: No separate Redis in Phase 2, Cloudflare KV, Redis (not adopted in Phase 2), Upstash Redis

### Community 13 - "Local Demo Server"
Cohesion: 0.25
Nodes (3): __dirname, root, types

### Community 14 - "Infra Research (Neon/Supabase)"
Cohesion: 0.29
Nodes (8): Neon PostgreSQL, Pause after 7 days inactivity, Supabase Postgres (free tier), Phase 1 research: datasets, models, infra, Free Exercise DB, Unsloth (QLoRA fine-tuning), wger exercise DB/API, Yoga pose datasets

### Community 15 - "Inference Provider Decision"
Cohesion: 0.25
Nodes (7): ADR-0003: Cloudflare Workers AI inference provider, Cloudflare Workers AI, Hugging Face Spaces ZeroGPU, Self-hosted inference, ADR-0005: TypeScript request-time runtime vs Python server, Cloudflare Python Workers, TypeScript + Hono on Cloudflare Workers

### Community 16 - "Nutrition Corpus Licensing"
Cohesion: 0.25
Nodes (8): Clarifying questions before Phase 2, Health-adjacent data retention (open question), INDB (Indian Nutrient Databank), Open Food Facts, USDA Dietary Guidelines for Americans, USDA FoodData Central (primary nutrition source), IFCT 2017 (NIN), WHO guidelines (CC BY-NC-SA)

### Community 17 - "Zero-Cost Quota Policy"
Cohesion: 0.33
Nodes (3): ADR-0007: Zero-cost policy, quota tracking and exhaustion behaviour, Capacity-exhausted response, docs/OPERATIONS.md

### Community 18 - "Usage Tracking Tables"
Cohesion: 0.67
Nodes (3): Postgres-backed rate-limit counters, App-level usage tracking, inference_usage table

## Ambiguous Edges - Review These
- `Query orchestration DAG` → `Response completeness pipeline`  [AMBIGUOUS]
  docs/RESPONSE_QUALITY.md · relation: conceptually_related_to
- `RLS disabled gap` → `Session state live status`  [AMBIGUOUS]
  docs/SESSION_STATE.md · relation: conceptually_related_to
- `Three-tier rate limiting` → `Session state live status`  [AMBIGUOUS]
  docs/SESSION_STATE.md · relation: conceptually_related_to
- `Hugging Face Spaces ZeroGPU` → `Qwen3-4B-Instruct`  [AMBIGUOUS]
  docs/architecture/decisions/ADR-0003-workers-ai-inference-provider.md · relation: conceptually_related_to
- `ADR-0004: Qwen3 model compatibility` → `ADR: Model selection (Qwen3-4B vs Qwen3-30B-A3B-FP8)`  [AMBIGUOUS]
  docs/benchmark/MODEL_SELECTION_ADR.md · relation: references

## Knowledge Gaps
- **47 isolated node(s):** `ADR-0010`, `ADR-0004`, `ADR-0005`, `ADR-0009`, `RFC-7515` (+42 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 110 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ADR-0004: Qwen3 model compatibility` connect `Qwen3 Model Compatibility` to `Benchmark Harness`, `RAG Vector Search Migrations`, `Neon/pgvector Decision`, `Inference Provider Decision`, `Nutrition Corpus Licensing`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `fetch()` (e.g. with `.embed()` and `.embedBatch()`) actually correct?**
  _`fetch()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0010`, `ADR-0004`, `ADR-0005` to the rest of the system?**
  _47 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Surface & Endpoints` be split into smaller, more focused modules?**
  _Cohesion score 0.05222734254992319 - nodes in this community are weakly interconnected._
- **Why does `ADR-0002: Neon PostgreSQL + pgvector` connect `Neon/pgvector Decision` to `RAG Vector Search Migrations`, `RLS & Session Issuance`, `Qwen3 Model Compatibility`, `Initial DB Schema`, `Infra Research (Neon/Supabase)`, `Zero-Cost Quota Policy`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Query orchestration DAG` and `Response completeness pipeline`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `RLS disabled gap` and `Session state live status`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._