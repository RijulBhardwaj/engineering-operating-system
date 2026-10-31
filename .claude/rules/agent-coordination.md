# Agent Coordination

- One task, minimum sufficient agent set. A one-line fix does not need the Engineering Lead plus Architect plus Reviewer chain.
- Parallelize independent tasks; serialize tasks touching the same files. Two agents never write the same file concurrently.
- Agents report evidence (test output, diff, command result), not verbal assurance.
- No agent approves its own work -- code review is a separate pass, and CI gates are automated, not self-attested.
- Full roster and responsibilities: .claude/agents/.
