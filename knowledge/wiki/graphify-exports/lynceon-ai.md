# Graph Report - lynceon-ai  (2026-11-11)

## Corpus Check
- 91 files · ~100,638 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 6, .example 2, .css 1)

## Summary
- 668 nodes · 1704 edges · 31 communities (27 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- lib: tenancy.ts
- tools: meta.ts
- tests: test_extract.py
- web: web/package.json
- tools: extract.py
- pages: Landing.tsx
- components: Layout.tsx
- lib: lib.test.ts
- pages: Admin.tsx
- scripts: e2e.mjs
- components: ui.tsx
- api: contract.ts
- web: compilerOptions
- root: main.py
- api: core.test.ts
- pages: Workspace.tsx
- lib: sign.ts
- lynceon_worker: main()
- tests: test_runner.py
- tools: c2pa_validate.py
- lynceon_worker: runner.py
- lib: sample.ts
- root: package.json
- lib: summary.ts
- components: LayerStack.tsx
- tests: Handler
- lib: webhooks.ts
- tests: api()
- api: deno.json
- src: vite-env.d.ts
- worker: lynceon-worker

## God Nodes (most connected - your core abstractions)
1. `q()` - 27 edges
2. `tenancyRoutes` - 26 edges
3. `scanRoutes` - 22 edges
4. `issueReport()` - 19 edges
5. `opsRoutes` - 19 edges
6. `api` - 19 edges
7. `HttpError` - 17 edges
8. `createScan()` - 17 edges
9. `useLoad()` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `AppContext` --references--> `Role`  [EXTRACTED]
  web/src/components/Layout.tsx → supabase/functions/api/contract.ts
- `AppContext` --references--> `Project`  [EXTRACTED]
  web/src/components/Layout.tsx → supabase/functions/api/contract.ts
- `AppContext` --references--> `Membership`  [EXTRACTED]
  web/src/components/Layout.tsx → supabase/functions/api/contract.ts
- `AppContext` --references--> `Me`  [EXTRACTED]
  web/src/components/Layout.tsx → supabase/functions/api/contract.ts
- `Integrity()` --calls--> `verifyEnvelope()`  [EXTRACTED]
  web/src/components/ReportView.tsx → web/src/lib/verify.ts

## Import Cycles
- None detected.

## Communities (31 total, 4 thin omitted)

### Community 0 - "lib: tenancy.ts"
Cohesion: 0.07
Nodes (94): RFC-2606, ref_npm_hono_4_6_14, ref_npm_hono_4_6_14_cors, ref_npm_supabase_supabase_js_2_47_10, ListResponse, app, Principal, requireInternal() (+86 more)

### Community 1 - "tools: meta.ts"
Cohesion: 0.09
Nodes (51): be16(), be32(), boxes(), clean(), enc(), find(), inflate(), jpegSegments() (+43 more)

### Community 2 - "tests: test_extract.py"
Cohesion: 0.08
Nodes (36): importlib_util, parametrize, pypdf, pytest, Worker tool registry: tool id -> implementing module, import requirements,…, assert_clean(), A finding must carry the contract fields and no banned certainty wording., created() (+28 more)

### Community 3 - "web: web/package.json"
Cohesion: 0.05
Nodes (36): react-dom, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript, vite (+28 more)

### Community 4 - "tools: extract.py"
Cohesion: 0.11
Nodes (28): defusedxml, Exception, pathlib, re, Abstain, _Budget, checked_zip(), detect_format() (+20 more)

### Community 5 - "pages: Landing.tsx"
Cohesion: 0.11
Nodes (27): ref_react_dom_client, react-router, KeysResponse, ToolsResponse, Integrity(), INTEGRITY_LIMIT, SUMMARY, VerifyChecks() (+19 more)

### Community 6 - "components: Layout.tsx"
Cohesion: 0.12
Nodes (22): react, @supabase/supabase-js, DemoResponse, Me, Membership, Project, Role, AppContext (+14 more)

### Community 7 - "lib: lib.test.ts"
Cohesion: 0.13
Nodes (21): ref_node_path, ApiError, PublicKey, ReportEnvelope, Api, ApiError, ApiOptions, createApi() (+13 more)

### Community 8 - "pages: Admin.tsx"
Cohesion: 0.15
Nodes (22): Appeal, AuditEvent, AuditVerify, Decision, Member, Org, WebhookDelivery, useLoad() (+14 more)

### Community 9 - "scripts: e2e.mjs"
Cohesion: 0.12
Nodes (19): ref_node_fs, ref_node_fs_promises, ref_node_url, A1111, actions, call(), chunk(), demoUser() (+11 more)

### Community 10 - "components: ui.tsx"
Cohesion: 0.13
Nodes (19): Outcome, ScanStatus, ToolStatus, CopyButton(), Empty(), IconName, OutcomeTag(), PATHS (+11 more)

### Community 11 - "api: contract.ts"
Cohesion: 0.12
Nodes (18): RFC-3339, ApiKey, ApiKeyCreated, Artifact, ArtifactState, Disposition, Health, Job (+10 more)

### Community 12 - "web: compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+10 more)

### Community 13 - "root: main.py"
Cohesion: 0.16
Nodes (14): datetime, hashlib, http_server, httpx, json, signal, tempfile, threading (+6 more)

### Community 14 - "api: core.test.ts"
Cohesion: 0.18
Nodes (14): ADR-0002, FindingResult, Modality, ToolDef, outcome(), PNG, decideOutcome(), OutcomeInput (+6 more)

### Community 15 - "pages: Workspace.tsx"
Cohesion: 0.24
Nodes (16): MAX_UPLOAD_BYTES, ScanDetail, ScanSummary, UploadResponse, useApp(), ReportView(), can(), fmtBytes() (+8 more)

### Community 16 - "lib: sign.ts"
Cohesion: 0.21
Nodes (14): RFC-7638, signingKey(), canonicalize(), RFC-8785, b64url(), generateSigningKey(), importPrivateKey(), PublicJwk (+6 more)

### Community 17 - "lynceon_worker: main()"
Cohesion: 0.18
Nodes (15): Client, Event, download(), handle(), load_dotenv(), log(), main(), now() (+7 more)

### Community 18 - "tests: test_runner.py"
Cohesion: 0.18
Nodes (14): os, shutil, _failed(), Path, Run argv to completion. Returns the exit code, or None if it was killed at the…, Run one registered tool on a file in a subprocess and return its finding…, run_limited(), run_tool() (+6 more)

### Community 19 - "tools: c2pa_validate.py"
Cohesion: 0.21
Nodes (11): map_manifest(), Path, provenance.c2pa_validate: validate the active C2PA manifest against the pinned…, Return the manifest store JSON, or None when no embedded manifest is found., Collect every digitalSourceType value (IPTC term, last URL segment) under node., Pure mapping from c2pa Reader JSON (manifest store) to a finding., read_store(), run() (+3 more)

### Community 20 - "lynceon_worker: runner.py"
Cohesion: 0.21
Nodes (10): importlib, subprocess, sys, Subprocess entry point: python -m lynceon_worker.child <tool_id> <path> <mime>…, join_job(), _kernel32(), Run a tool in a separate process with a wall-clock timeout and a memory cap., Called first thing in the tool process: put this process into the job the… (+2 more)

### Community 21 - "lib: sample.ts"
Cohesion: 0.15
Nodes (10): OUTCOME_POLICY, PIPELINE_VERSION, REPORT_SCHEMA, base, c2paAbsent, c2paNotRun, c2paPresent, GLOBAL (+2 more)

### Community 22 - "root: package.json"
Cohesion: 0.17
Nodes (11): description, devDependencies, deno, name, private, scripts, check:api, e2e (+3 more)

### Community 23 - "lib: summary.ts"
Cohesion: 0.20
Nodes (9): EvidenceClass, Finding, Report, CLASS_LABEL, INDICATORS, NO_CREATOR, NO_INDICATOR, OUTCOME_TEXT (+1 more)

### Community 24 - "components: LayerStack.tsx"
Cohesion: 0.43
Nodes (6): FACES, HEX, LayerStack(), reducedMotion(), Step, useTilt()

### Community 26 - "lib: webhooks.ts"
Cohesion: 0.53
Nodes (5): WebhookEvent, hmacHex(), attemptDelivery(), signatureHeader(), webhookUrlError()

### Community 27 - "tests: api()"
Cohesion: 0.40
Nodes (4): fixture, ThreadingHTTPServer, api(), FakeApi

## Knowledge Gaps
- **151 isolated node(s):** `name`, `private`, `description`, `test:api`, `check:api` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 230 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `components: Layout.tsx` to `web: web/package.json`, `pages: Landing.tsx`, `pages: Admin.tsx`, `components: ui.tsx`, `pages: Workspace.tsx`, `components: LayerStack.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `react-router` connect `pages: Landing.tsx` to `pages: Admin.tsx`, `web: web/package.json`, `components: Layout.tsx`, `pages: Workspace.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `tenancyRoutes` (e.g. with `toHook()` and `toKey()`) actually correct?**
  _`tenancyRoutes` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `description` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `lib: tenancy.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07147802007615092 - nodes in this community are weakly interconnected._
- **Should `tools: meta.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08959899749373433 - nodes in this community are weakly interconnected._
- **Should `tests: test_extract.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08484848484848485 - nodes in this community are weakly interconnected._