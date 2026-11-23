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

## What needs the user to provision something

Pure code, nothing to install: consistent hashing, CAP-theorem decision, DB indexes, circuit breakers, single-instance idempotency, single-instance WebSockets.

Needs external infra the user sets up (flag this explicitly when the design calls for it, don't silently assume it exists): distributed rate limiting (Redis or platform limiter), pub/sub (message broker), multi-instance WebSocket fan-out (same broker as pub/sub), durable sagas (DB table is usually enough -- don't reach for a workflow engine unless the saga count/complexity justifies it), leader election (DB advisory lock first; dedicated coordinator only at real scale).
