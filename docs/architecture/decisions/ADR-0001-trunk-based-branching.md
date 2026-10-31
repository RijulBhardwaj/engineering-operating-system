# ADR-0001: Trunk-based branching over permanent develop branch

**Date:** 2026-10-31
**Status:** Accepted

## Context
The original spec listed a permanent `develop` integration branch alongside `main`.

## Problem statement
Does this solo repo need a permanent integration branch?

## Requirements
Safe, reviewable changes reaching `main`; no process overhead that doesn't pay for itself with one contributor.

## Alternatives considered
| Option | Pros | Cons |
|---|---|---|
| Gitflow (main + develop) | Clear release/integration separation | Extra merge step with no second contributor to integrate against; branch to keep in sync for no reason |
| Trunk-based (feature branches -> main) | Simple, matches GitHub-flow CI/CD norms, less to keep in sync | Less isolation before a "release" -- irrelevant here, this repo has no release cadence |

## Evaluation criteria
Process overhead vs. actual benefit, given exactly one contributor and no release train.

## Decision
Trunk-based: feature/fix/infra/docs/security/chore/hotfix branches merge directly to `main` via PR.

## Rationale
No second contributor to integrate against means `develop` buys nothing but an extra merge step.

## Trade-offs
Less buffer before `main` reflects a change. Acceptable -- CI gates (`validate`, `security`) run on every PR before merge regardless.

## Risks
None material at current scale. Revisit if collaborators join or a release cadence is introduced.

## Consequences
`policies/branch-protection.md` and `.claude/rules/git-workflow.md` reflect trunk-based flow, no `develop` branch created.

## Validation evidence
None beyond reasoning above -- low-stakes, reversible decision; no spike needed.

## Related
Specs: none. ADRs: none prior (first ADR in this repo).
