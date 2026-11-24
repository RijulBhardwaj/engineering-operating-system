# System Design Patterns (apply when relevant, not by default)

Checklist to consider during architecture selection (architecture.md) and implementation. Apply only what the project's actual scale/risk profile needs -- see anti-patterns in engineering-principles.md. Each entry: what it is, when it earns its place, what's pure code vs what needs external infra the user provisions.

1. **Rate limiting** -- throttle requests per key (user/IP/tenant). Pure code for single-instance (token bucket/sliding window in-process). Multi-instance needs a shared counter store (Redis, or a platform-native limiter e.g. Cloudflare rate limiting).
2. **Consistent hashing** -- stable key-to-node mapping that minimizes remapping on scale-out. Pure algorithm, no external dep. Relevant for sharding, cache distribution, load balancing across nodes.
3. **CAP theorem** -- design input, not a library. Forces an explicit choice (consistency vs availability under partition) when picking a DB/replication topology. Record the choice in the ADR, don't leave it implicit.
4. **Database indexes** -- pure schema/migration work. Index FKs and columns used in WHERE/JOIN/ORDER BY; verify with EXPLAIN on real query patterns, don't index speculatively.
5. **Idempotency** -- idempotency keys on mutating endpoints so retries don't double-apply. Pure code pattern; dedup store (Redis/DB table with TTL) needed once keys must survive across instances/restarts.
6. **Circuit breakers** -- stop hammering a failing downstream dependency. Pure code (library, e.g. opossum/polly/resilience4j equivalent per language) -- no external infra.
7. **WebSockets** -- built into the runtime/framework, pure code for a single instance. Scaling connections across multiple server instances needs a shared pub/sub backend to fan out messages.
8. **Pub/sub** -- decouple producers/consumers via a message broker. Needs external infra: Redis Streams/Pub-Sub, Kafka, NATS, or a cloud queue (SQS/SNS, Cloudflare Queues). Not pure code -- user provisions the broker.
9. **Sagas** -- coordinate a multi-step distributed transaction with compensating actions on failure. Orchestration logic is pure code; durable step/state persistence (DB table or workflow engine) is needed once sagas must survive a process restart.
10. **Leader election** -- exactly one node acts as leader for a task. Needs a coordination primitive: a DB row lock/advisory lock (cheapest, if already on Postgres), or a dedicated coordinator (etcd, Zookeeper, Redis lock) at larger scale. Not pure code -- needs a backing store even if it's the existing DB.

## Slow-app diagnosis checklist (adopted 2026-11-24)

Source: Instagram @thesidcodes reel, via explicit user instruction. A fixed triage list for "why is this app slow" -- same six causes recur regardless of stack. Check in order; don't guess which applies before measuring (profiler/query log/network tab).

1. **Too many queries** (N+1, a round trip per item) -- batch, join, or cache. Overlaps item 4 above (DB indexes) only at the edge; this is about query *count*, not query plan.
2. **One slow query** (DB reads every row) -- add an index on the scanned column, fetch fewer columns, or paginate. This is item 4 above applied to a single offending query, not a new pattern.
3. **Huge responses** (more bytes than the screen needs) -- compress, trim unused fields from the payload, or stream instead of buffering the whole response.
4. **Slow work done inside the request** (user waits on work they never see) -- move it to a scheduled job, a queue, or a background worker. Same pure-code-vs-infra split as sagas/pub-sub above: in-process scheduling is pure code, a durable queue surviving a restart needs a broker or DB-backed queue table.
5. **Users far from the server** (every request crosses the world) -- edge caching, a CDN, or a second region. Infra, not code -- user provisions it.
6. **Slow page** (client-side) -- lazy-load, ship less JavaScript, shrink images.

Use this as the first pass on any reported "slow" complaint before reaching for a specific pattern above -- it routes to which of items 1-10 actually applies instead of guessing.

## What needs the user to provision something

Pure code, nothing to install: consistent hashing, CAP-theorem decision, DB indexes, circuit breakers, single-instance idempotency, single-instance WebSockets.

Needs external infra the user sets up (flag this explicitly when the design calls for it, don't silently assume it exists): distributed rate limiting (Redis or platform limiter), pub/sub (message broker), multi-instance WebSocket fan-out (same broker as pub/sub), durable sagas (DB table is usually enough -- don't reach for a workflow engine unless the saga count/complexity justifies it), leader election (DB advisory lock first; dedicated coordinator only at real scale).
