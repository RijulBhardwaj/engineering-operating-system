# ENV.md — <project> — every key, and where it lives

Sibling of AUTH-template.md / SECURITY-template.md (same instruction, same linking points).

| Key | Where | Visible | Rotation owner |
|---|---|---|---|
| | Server / Browser / Build | Private / Public | |

Rules:
- A `*_PUBLIC_*`-style or client-bundled key is public by definition — never put a value there that would matter if read by anyone. Service-role keys, secret keys, and anything with write/admin power stay server-side only.
- `.env` is gitignored; `.env.example` lists every key above with placeholder values, not real ones.
- A key already committed to the repo (any commit, any branch) is already leaked — rotate at the provider, then scrub history. Don't just delete it going forward.

Fill in and keep current as new env vars are added — stale is worse than missing, since it implies a false audit.
