# Checkpoint: engineering-operating-system -- 2026-11-26 (covers work through 2026-11-25)

Supersedes `2026-10-31-completion-pass.md` as the latest checkpoint. That file's "waiting on the user to name the first project" is no longer true: three projects are now registered, and Fitness Intelligence Platform has been live in production since early November.

Sources: `git log main` (PRs #15-#51), `knowledge/log.md`, `harness/video-generation/README.md`, and the fitness repo's `docs/SESSION_STATE.md` + `docs/TASK_REGISTER.md`. Nothing below was re-run in this pass. It is a summary of evidence those sources already record.

**Status:** harness in active use. `main` at `2e92860` (#51), no open PRs.

## Completed since the last checkpoint

**2026-11-03 to 11-11 (PRs #15-#24):** recovered the harness bootstrap (agent contracts, registries, Graphify) and set up the Obsidian vault (#15). Vendored rag-architect, git-worktree, unslop, and agent-desktop. Registered the mobile ECC plugin, EGM, Higgsfield MCP, Impeccable, React Bits (eval), and GetLayers MCP. Registered `lynceon-ai` as a skeleton (#21).

**2026-11-24 (PRs #25-#42), harness governance pass.** Per-item detail is in `knowledge/log.md`.
- AI Code QA Gate: a six-layer pipeline with the tool stack installed (#26). Layer 6, the live walkthrough, came from #37.
- Knowledge vault: llm-wiki pattern adopted (#27) and restructured into `raw/wiki/output` (#29). Hooks added: SessionStart harness force-load (#28) and a PreCompact wiki reminder (#30).
- `architecture.md` Gate 0 (Elephant-Goldfish), orchestrator feedback loop, 44-state UI/UX checklist, and tokenomics tracking (#33, #34).
- Master end-to-end pipeline doc (#35). It went through 5 goldfish reviews: Rev 1-4 rejected, Rev 5 approved with minor revisions, Rev 6 merged.
- Hard gate: no PR is opened until the QA gate and the security scan pass locally (#36).
- `release-review-passes.md`: 7 passes, the live walkthrough, and the Zapier baseline (#37, #39).
- Smaller additions: "goal is met when" acceptance phrasing (#38), slow-app checklist (#41), Obscura (#25), CLI-Anything (#42, with a correction of what it actually does).
- The fitness vault page was backfilled (#31). It surfaced the `checkout -b` stale-ref gotcha, now in `git-workflow.md` (#32).

**2026-11-25 (PRs #43-#51), video-generation toolkit.** This is `harness/video-generation/`, the first harness module that is real working tooling rather than a policy pointer. CAT_Guide is its first consumer.
- #43: generic Remotion + Manim + Kokoro pipeline with a `setup.sh` scaffolder.
- #44: Volta for Node isolation, FFmpeg, and an OpenMontage eval. Its own pytest suite: 2909 passed, 18 skipped, 7 failed.
- #45, #46: script template, feedback loop, and a per-run metrics ledger.
- #47: fixed the OpenMontage fontconfig gap (7 failures down to 5, 3 of them test-only). Fixed the Manim LaTeX gap: Tectonic proved incompatible, so MiKTeX Basic was installed and a real `MathTex` scene was rendered.
- #48: `@remotion/three` proven, rendering 150/150 frames with 0 errors (checked with ffprobe). Added the `matrix-transform-3d` template.
- #49-#51: looked for "moving painting" style output. Blender Grease Pencil was rejected. Wan2GP fixed the VRAM problem on the 6GB RTX 3050 (peak about 850MB), but its output is flat vector. Prompt iteration did not fix that. **The style gap is still open**, recorded as a negative result.

## Fitness Intelligence Platform (summary; the project repo is the source of truth)
- 2026-11-04: ADR-0011 was accepted, moving the database from Supabase back to Neon. **The migration has not been done**: it is blocked on a credential, and production still runs on Supabase (`wrangler.toml`).
- 2026-11-05: PDF plan export and widget UX work, including the draggable panel and several PDF rendering fixes.
- 2026-11-24: production chat was down. Cloudflare deprecated the model (`qwen3-30b-a3b-fp8`) on 11-20. The outage was found by the new automated RLS-isolation integration test and fixed with ADR-0012 (`llama-3.3-70b-instruct-fp8-fast`). Same day: fixed the safety-gate singular-"calorie" gap and added a CI `audit` job (npm audit and gitleaks).
- Detail is in `projects/project-registry.yaml`, the fitness repo's `docs/TASK_REGISTER.md`, and `docs/SESSION_STATE.md`.

## Open items and known gaps
1. **The vault log was not kept up on 11-25.** `knowledge/log.md` has no entries for PRs #43-#51, which breaks `knowledge-wiki-ops.md`'s "every substantial piece of work gets filed" rule. Next action: add a `## [2026-11-25] ingest | video-generation toolkit` entry and a wiki page under `knowledge/wiki/`.
2. **Policy and configuration disagree on branch protection.** `policies/branch-protection.md` requires 1 approving review, but the GitHub setting is 0 (recorded in `knowledge/log.md`, 11-24). Still unresolved; the user has to pick one.
3. The project-profile schema has no validator. Self-optimization has flagged it as a candidate.
4. Secret scanning: this repo's CI now runs gitleaks (`.github/workflows/security.yml`) and the fitness repo has it too. Whether every *bootstrapped* repo gets it, as `security.md` requires, has not been checked.
5. Stale branch `docs/fitness-intelligence-platform-vault-backfill` (at `749350d`, #29) is an ancestor of `main` with no unique commits. Proposed for deletion, waiting on the user's approval.
6. `12_Dimension_Harness` has still never been pushed to GitHub. Lynceon.ai is still at the planned stage only.

## Next action
Close gap 1 (file the 11-25 work into the vault), then get the user's decision on gap 2. For fitness, the next step is in its `SESSION_STATE.md`: re-run the 12-category benchmark against the new production model, and click through the demo UI again.
