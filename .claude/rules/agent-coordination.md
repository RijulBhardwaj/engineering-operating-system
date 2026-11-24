# Agent Coordination

- One task, minimum sufficient agent set. A one-line fix does not need the Engineering Lead plus Architect plus Reviewer chain.
- Parallelize independent tasks; serialize tasks touching the same files. Two agents never write the same file concurrently.
- Agents report evidence (test output, diff, command result), not verbal assurance.
- No agent approves its own work -- code review is a separate pass, and CI gates are automated, not self-attested.
- Full roster and responsibilities: .claude/agents/.

## Orchestrator + feedback loop

Adopted 2026-11-24 per explicit user instruction ("end to end logic loops audit etc every step wherever it can be run parallelly it should and must"). One session plays orchestrator for any multi-step build: it does not implement directly once the step count passes trivial -- it decomposes, dispatches, and verifies.

1. **Decompose** the approved plan (post Gate 0 in architecture.md) into tasks. Tag each task's real dependencies -- two tasks with no shared files and no data dependency between them are independent.
2. **Parallelize independents.** Independent tasks dispatch together, in the same message/batch, not one-by-one. Serialize only tasks that actually share files or have a real ordering dependency.
3. **Evidence, not assurance.** Each dispatched agent returns command output/diff/test result, per the rule above -- the orchestrator does not accept "looks done."
4. **Feedback loop.** A failed or incomplete result does not get silently retried or patched over by the orchestrator itself: it routes back to whichever stage owns the defect -- a wrong implementation goes back to the same task with the failure evidence attached; a wrong plan goes back through Gate 0 (new goldfish review) rather than being coded around. Closing the loop at the wrong stage (patching a plan error in code) is the failure mode this step exists to prevent.
5. **Audit pass.** Before declaring the overall task done, run `ai-code-qa-gate.md`'s mechanical layers (1,2,3,5 -- static analysis, unit/integration tests, monitoring) against the combined result, not just each task in isolation -- integration issues between parallel tasks are exactly what a per-task check misses. This is the orchestrator collecting tool *output* (pass/fail), not approving the work: the actual review verdict (layer 4, peer review) still goes to a separate reviewer agent per the no-self-approval rule above, never the orchestrator that dispatched the task.

### Multi-stream orchestration (no agent spawns agents)

Agents never spawn agents -- the orchestrator is always the one session, never a dispatched subagent. For a task with independent *streams* (whole groups of tasks interacting only at a defined interface -- frontend/backend/infra, not just independent leaf tasks): the orchestrating session defines each stream's interface contract, then dispatches every leaf specialist agent itself, batched per stream, issuing independent streams' batches together rather than one stream at a time. "Stream" is a planning grouping, not a second agent layer. A task large enough to need real multi-level delegation starts a separate session (`mcp__ccd_session__start_session`) rather than faking a sub-orchestrator agent. Full detail: `workflows/end-to-end-development/README.md`.
