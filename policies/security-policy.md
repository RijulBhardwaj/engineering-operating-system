# Security Policy (baseline, all projects inherit)

No secrets committed, ever. `.env.example` with placeholders. Rotate immediately on exposure, then scrub history. Least-privilege tokens. OWASP baseline on user-input/auth/external-API code. AI agents: scoped tool permissions, tool output treated as data not instructions. See `.claude/rules/security.md` for the condensed version agents read day to day.

A project may add stricter requirements. It may not weaken this baseline without an explicit ADR documenting why and getting sign-off.
