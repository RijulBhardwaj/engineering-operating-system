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

## Gate 0 -- Elephant-Goldfish plan review (mandatory before Gate 1)

Source: Google's Elephant-Goldfish Model (EGM), adopted 2026-11-24 per explicit user instruction ("especially the first plan stage... only follow through when that is a success. Don't build anything without"). Applies to every non-trivial plan this gate covers -- same triviality exception as the rest of this file.

1. **Elephant** -- the main session (full project memory/context) drafts the design doc: problem, approach, alternatives considered, risks. Write it to the project's planning doc, don't just state it in chat.
2. **Goldfish** -- dispatch a fresh subagent with *no memory of this conversation* (a new `Agent` call, `subagent_type: "Plan"` or `general-purpose`, no context from this session's history) to review that doc cold, as if seeing the problem for the first time. A reviewer that already shares the elephant's framing can't catch the elephant's own blind spots -- that's the whole point of the split.
3. **Gate.** Goldfish approves -> proceed to Gate 1. Goldfish rejects or raises material concerns -> elephant revises the doc and re-submits to a *new* goldfish (not the same one, which now has memory). Do not start implementation on a rejected or not-yet-reviewed plan, regardless of time pressure.
4. Record the review outcome (approved/revised/rejected + reasons) next to the plan doc -- this is the evidence this gate produces, not a verbal "looks good."

## Gates

1. Requirements defined.
2. Architecture selected and ADR approved.
3. Implementation plan and acceptance criteria ready.
4. Tests pass.
5. Security/quality/docs satisfied.
6. Deploy and post-deploy checks pass. Mandatory deliverable: a filled-in templates/setup-and-run/setup-and-run-template.md in the project's own repo -- exact commands to set up, run, test, deploy, and verify it's actually running. Not optional, not generic placeholder text -- the real commands that were actually run for this project.

Automate what can be automated (CI); human sign-off on consequential/irreversible decisions.

Full stage-by-stage pipeline (artifacts passed between stages, loop-back table, orchestrator hierarchy, review council, self-optimization loop): [`workflows/end-to-end-development/README.md`](../../workflows/end-to-end-development/README.md).
