# RLS-POLICIES.md — <project> — users see only their rows

Sibling of AUTH-template.md / SECURITY-template.md (same instruction, same linking points).

Applies to any project with row-level multi-tenant or per-user data in a database that supports row security (Postgres/Supabase, etc). Skip this file entirely if authorization is single-tenant or enforced only at the app layer by design (document that choice in the ADR instead).

## Claim → row mapping
- Identity claim used to scope rows (e.g. `auth.uid()`, `auth.jwt()->>'tenant_id'`): ___.
- Per table: which column it's checked against.

## Per-table policy table
| Table | SELECT | INSERT | UPDATE | DELETE | Notes |
|---|---|---|---|---|---|
| | | | | | |

(`using (...)` = read scope, `with check (...)` = write scope. A table with no policy and RLS enabled denies everything by default — that's correct for a table only a privileged/ops path should touch.)

## Verification
- Advisor/linter run after applying policies (e.g. Supabase `get_advisors`, or equivalent): findings and fixes: ___.
- Confirmed: no table in the trust boundary has RLS disabled while holding non-public data.

Enabling RLS with correct-but-not-yet-satisfiable policies (auth not wired up yet) is still strictly safer than RLS off — denies all anon access by default rather than exposing everything.
