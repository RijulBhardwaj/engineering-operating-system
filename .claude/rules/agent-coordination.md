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
5. **Audit pass.** Before declaring the overall task done, run `ai-code-qa-gate.md`'s checklist against the combined result, not just each task in isolation -- integration issues between parallel tasks are exactly what a per-task check misses.
