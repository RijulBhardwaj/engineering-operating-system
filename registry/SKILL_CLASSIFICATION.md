# Skill Classification — Engineering Domain Taxonomy

Mandatory classification framework for every skill, agent, tool, plugin and capability in this harness. Replaces any earlier FE/BE/BFF-only split. Every registry entry carries a `primary_domain` (one code) and `secondary_domains` (zero or more) from the list below — see `schemas/registry-entry.schema.json`.

A domain code is a short tag, not a restatement of the description. Pick the code whose bullet list best matches the resource's main responsibility; add secondary codes for real overlap, not for completeness. This list is a starting framework — add a code only when an existing one genuinely doesn't fit, document its boundary here, and keep old classifications working.

## 1. Product, Requirements & Discovery
- `PROD` Product Engineering & Management — strategy, roadmaps, prioritization, analytics
- `BA` Business Analysis — requirements, stakeholder/gap analysis, business rules
- `UXR` User Research — interviews, personas, journey mapping
- `UX` User Experience Engineering — IA, interaction design, navigation, accessibility
- `UI` User Interface Engineering — visual design, layout, typography, color, components
- `DESIGN` Design Systems & Creative Engineering — tokens, component systems, brand, motion principles, governance

## 2. Frontend Engineering
- `FE` Frontend Engineering — React/Next/Vue/Angular/Svelte, TS/JS, component architecture, state, frontend perf, PWA
- `WEB` Web Platform Engineering — browser internals, DOM, Workers, WASM, compatibility, web security
- `MOBILE` Mobile Engineering — Android/iOS, React Native, Flutter, Kotlin, Swift
- `DESKTOP` Desktop Application Engineering — Electron, Tauri, Qt, native/cross-platform desktop
- `3D` 3D & Immersive Frontend — Three.js, WebGL/WebGPU, R3F, spatial interfaces
- `MOTION` Motion & Interaction Engineering — CSS/Framer Motion/GSAP/SVG/canvas animation, transitions

## 3. Backend Engineering
- `BE` Backend Engineering — business logic, service implementation, background jobs, backend validation
- `API` API Engineering — REST/GraphQL/gRPC, OpenAPI, contracts, webhooks, gateways
- `BFF` Backend for Frontend — API aggregation, response composition, client-specific endpoints
- `MICRO` Microservices Engineering — decomposition, discovery, distributed transactions, event-driven
- `MONO` Monolith & Modular Monolith — module boundaries, internal APIs
- `REALTIME` Real-Time Application Engineering — WebSockets, SSE, pub/sub, live collaboration
- `INTEGRATION` Systems Integration — third-party APIs, connectors, middleware, data sync

## 4. Core Software Engineering
- `CORE` Core Software Engineering — fundamentals, abstractions, modularity, encapsulation
- `ARCH` Software Architecture — patterns, DDD, clean/hexagonal architecture, ADRs
- `OOP` Object-Oriented Engineering — SOLID, patterns, composition, DI
- `FP` Functional Programming — purity, immutability, composition, functional error handling
- `DSA` Data Structures & Algorithms — complexity, trees, graphs, hashing, sorting/searching
- `COMPILER` Compiler & Language Engineering — lexing, parsing, ASTs, interpreters, static analysis
- `CODEINTEL` Code Intelligence — semantic navigation, dependency graphs, symbol indexing, impact analysis
- `REFACTOR` Refactoring & Code Quality — tech debt, code smells, legacy modernization

## 5. Systems & Low-Level Engineering
- `SYS` Systems Engineering — resource/process management, runtime behavior, reliability
- `OS` Operating Systems — kernels, processes, threads, scheduling, filesystems, syscalls
- `NETWORK` Networking — TCP/IP, DNS, HTTP, TLS, routing, load balancing, proxies
- `CONCURRENCY` Concurrency & Parallelism — threads, async, locks, races, deadlocks
- `DISTRIBUTED` Distributed Systems — coordination, consistency, replication, consensus, partition tolerance
- `RUNTIME` Runtime Engineering — JVM/V8/Python runtime, GC, memory, execution engines
- `LOWLEVEL` Low-Level & Embedded — C/C++/Rust, firmware, microcontrollers, memory safety
- `GPU` GPU & Accelerator Engineering — CUDA, GPU memory/scheduling/kernels, tensor accel

## 6. Database & Data Management
- `DB` Database Engineering — relational DBs, design, transactions, query opt, indexing, migrations
- `NOSQL` NoSQL Engineering — MongoDB, DynamoDB, Cassandra, document/KV/wide-column
- `VECTOR` Vector Database Engineering — pgvector, Qdrant, Milvus, Weaviate, similarity search
- `DATA` Data Engineering — ETL/ELT, pipelines, modeling, quality, governance
- `WAREHOUSE` Data Warehousing & Analytics — warehouses/lakes/lakehouses, OLAP, BI
- `STREAM` Streaming Data Engineering — Kafka, Flink, Spark Streaming, real-time pipelines
- `BIGDATA` Big Data Engineering — Hadoop, Spark, distributed storage/partitioning
- `DATAOPS` Data Operations — pipeline monitoring, lineage, dataset versioning

## 7. Artificial Intelligence & Machine Learning
- `AI` Artificial Intelligence — AI systems, intelligent automation, reasoning/knowledge systems
- `ML` Machine Learning — supervised/unsupervised, feature engineering, model eval/opt
- `DL` Deep Learning — neural nets, transformers, CNN/RNN, training optimization
- `LLM` Large Language Models — architecture, prompt engineering, context, function calling, structured gen
- `SLM` Small Language Models — model selection, quantization, on-device inference, efficient fine-tuning
- `RAG` Retrieval-Augmented Generation — retrieval pipelines, chunking, embeddings, reranking, grounding
- `AGENT` AI Agent Engineering — autonomous agents, tool calling, planning, agent memory/eval/safety
- `ORCH` AI & Workflow Orchestration — LangGraph, DAGs, workflow engines, state/checkpointing
- `MLOPS` ML Operations — deployment, registries, monitoring, versioning, experiment tracking
- `FINETUNE` Model Fine-Tuning — LoRA/QLoRA/PEFT, dataset prep, instruction tuning
- `INFERENCE` AI Inference Engineering — vLLM/Ollama/llama.cpp/TensorRT-LLM, batching, KV cache, quantization
- `CV` Computer Vision — image processing, detection, segmentation, OCR, classification
- `MULTIMODAL` Multimodal AI — image/text/audio/video models, multimodal retrieval
- `EVAL` AI Evaluation & Safety — benchmarking, hallucination testing, groundedness, red teaming

## 8. Quality, Testing & Reliability
- `QA` Quality Assurance — quality processes, acceptance/functional testing
- `TEST` Software Testing — unit, integration, contract, regression testing
- `E2E` End-to-End Testing — complete user journeys, browser automation, workflow validation
- `AUTOMATION` Test Automation — Playwright/Cypress/Selenium/Pytest/Jest/Vitest, automated test gen
- `PERF` Performance Engineering — benchmarking, profiling, latency/throughput, CPU/GPU optimization
- `LOAD` Load & Stress Testing — concurrency/stress/spike/soak testing, capacity planning
- `SRE` Site Reliability Engineering — availability, SLOs/SLIs, error budgets, incident management
- `CHAOS` Chaos Engineering — fault injection, failure simulation, recovery validation
- `OBS` Observability Engineering — logging, metrics, tracing, dashboards, alerts, RCA

## 9. Security, Privacy & Governance
- `SEC` Application Security — secure coding, OWASP, threat modeling, vulnerability management
- `AUTH` Identity & Access Engineering — authn/authz, OAuth2/OIDC, SSO, RBAC/ABAC
- `CRYPT` Cryptography Engineering — encryption, hashing, signatures, key mgmt, TLS
- `APPSEC` Application Security Testing — SAST/DAST/SCA, dependency scanning, pentesting
- `PRIVACY` Data Privacy Engineering — minimization, consent, retention, anonymization, DPIAs
- `COMPLIANCE` Compliance & Governance — regulatory requirements, audit trails, policy enforcement
- `SUPPLY` Software Supply Chain Security — provenance, SBOM, package integrity, signing

## 10. DevOps, Cloud & Infrastructure
- `DEVOPS` DevOps Engineering — CI/CD, build pipelines, deployment automation, release workflows
- `CLOUD` Cloud Engineering — AWS/Azure/GCP architecture, networking, storage, compute
- `SERVERLESS` Serverless Engineering — Cloudflare Workers, Lambda, event-driven compute, scale-to-zero
- `CONTAINER` Container Engineering — Docker/Podman, images, networking, registries, container security
- `K8S` Kubernetes & Container Orchestration — Helm, operators, scheduling, service meshes
- `IAC` Infrastructure as Code — Terraform/OpenTofu/Pulumi/Ansible, provisioning
- `PLATFORM` Platform Engineering — internal dev platforms, self-service infra, golden paths
- `RELEASE` Release Engineering — versioning, canary/blue-green, rollbacks
- `FINOPS` Cloud Financial Operations — cost optimization, usage monitoring, budget enforcement

## 11. Developer Experience & Productivity
- `DX` Developer Experience — workflows, IDE tooling, local dev, CLI usability
- `CLI` Command-Line Engineering — CLI apps, shell scripting, Bash/PowerShell, terminal automation
- `GIT` Version Control Engineering — Git/GitHub/GitLab, branching, PRs, merge strategy
- `AUTODEV` Autonomous Software Development — self-directed coding, iterative execution, recovery loops
- `CONTEXT` Context & Knowledge Engineering — context mgmt, code indexing, token opt, session continuity
- `TOOLING` Engineering Tool Development — dev utilities, build tools, codegen, linters/formatters

## 12. Documentation, Knowledge & Communication
- `DOCS` Technical Documentation — README, API docs, architecture docs, setup/ops docs
- `SPEC` Specification Engineering — PRDs, technical specs, acceptance criteria, spec-driven dev
- `ADR` Architecture Decision Records — decisions, alternatives, evidence, trade-offs
- `KNOWLEDGE` Knowledge Management — knowledge bases, technical memory, wikis, knowledge graphs
- `TECHWRITE` Technical Writing — manuals, reports, design documents, proposals

## 13. Specialist Industry & Domain Engineering
- `HEALTH` Health & Wellness Technology — fitness/nutrition systems, health-data integration
- `FINTECH` Financial Technology — payments, banking, ledgers, financial compliance
- `INSURANCE` Insurance Technology — policy/claims/underwriting systems
- `ECOMMERCE` Commerce Engineering — catalogues, orders, inventory, checkout, fulfilment
- `GEO` Geospatial Engineering — maps, GIS, location services, spatial queries
- `IOT` Internet of Things — device comms, sensor data, edge computing, IoT security
- `BLOCKCHAIN` Blockchain Engineering — smart contracts, distributed ledgers, Web3
- `GAME` Game Engineering — game engines, gameplay systems, physics, rendering

## Cross-domain rules
- A resource may have one or more secondary domains; primary = its main responsibility.
- Don't force a resource into an inaccurate category because no exact one exists — add a code, document its boundary here, keep old classifications valid.
- Example: React Three Fiber skill → primary `3D`, secondary `FE, UI, MOTION, UX`. FastAPI backend skill → primary `BE`, secondary `API, CORE, DB, SEC`. Graphify → primary `CODEINTEL`, secondary `CORE, DX, ARCH`.

## How this drives behavior
Before a substantial task, infer the relevant domain(s) from the task itself (not from the user spelling out "FE" or "BE") and check `registry/skills.yaml` / `tools.yaml` / `agents.yaml` for entries whose `primary_domain` or `secondary_domains` match, per `CLAUDE.md`'s "Skills / MCP / tools" section. Don't invoke a skill just because its domain tag matches — confirm it fits the actual task first.
