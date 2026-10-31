# AI SDLC and Architecture Governance (mandatory gate for non-trivial work)

Trivial change (typo, one-line fix, mechanical rename) skips this. Everything else -- new feature, new service, meaningful refactor -- goes through it. This takes precedence over any workflow that starts implementation before the gate clears.

## Lifecycle

Idea, requirements, specification, architecture alternatives (research and compare), architecture selection, ADR, implementation plan, task decomposition, development, continuous testing, independent review, security/perf validation, release, deploy, monitor, feedback.

## Spec-driven

Before implementation, produce (scaled to project size -- a weekend project does not need all twelve docs, but skipping all of them for a real project is the failure mode this rule exists to stop):
PRD, functional spec, non-functional spec, acceptance criteria, technical spec, architecture spec, API contract, data model, security requirements, test strategy, deployment requirements.

Specs are version-controlled and are the source of truth. Spec changes before implementation changes. Implementation must not silently diverge from an approved spec -- if it needs to, update the spec first.

Templates: templates/PRD/, templates/technical-specification/.

## Architecture-first

Do not take the first idea that fits. List real alternatives (modular monolith, microservices, event-driven, serverless, layered, hexagonal, CQRS, etc, only the ones actually relevant). Score against: functional fit, scalability, performance, reliability, security, maintainability, complexity, dev speed, ops overhead, cost, lock-in. Default to the simplest architecture that satisfies the actual requirement and realistic growth, not the one that sounds most "production-grade."

For material uncertainty: do a spike/prototype, record the result. Do not treat a theoretically attractive architecture as validated without evidence.

## ADRs

Every significant architecture/technology decision gets an ADR in that project's docs/architecture/decisions/. Template: templates/architecture-decision-record/adr-template.md. Fields: ID, title, date, status (Proposed/Accepted/Rejected/Superseded/Deprecated), context, problem, requirements, alternatives considered, evaluation criteria, decision, rationale, trade-offs, risks, consequences, validation evidence, related specs/ADRs.

Accepted ADRs are authoritative. Code review checks compliance. A decision that contradicts an accepted ADR gets flagged, not silently implemented -- if the ADR is wrong now, supersede it explicitly (new ADR, link as superseding, get sign-off) rather than drifting around it in code.

## Traceability

Business requirement, PRD, spec, architecture, ADR, task, code, test, PR, release. Enough to answer "why does this code exist and how was it validated" by following links, not by asking the author.

## Gates

1. Requirements defined.
2. Architecture selected and ADR approved.
3. Implementation plan and acceptance criteria ready.
4. Tests pass.
5. Security/quality/docs satisfied.
6. Deploy and post-deploy checks pass.

Automate what can be automated (CI); human sign-off on consequential/irreversible decisions.
