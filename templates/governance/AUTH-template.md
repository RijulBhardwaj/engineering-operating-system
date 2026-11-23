# AUTH.md — <project> — who gets in, and how

## Identity model
- Mechanism: (password / OAuth / magic link / custom JWT / guest session / none)
- Multi-tenant? (y/n) — if y, what claim scopes a request to a tenant.
- Guest/anonymous access: allowed paths, if any.

## Flows
1. **Sign up** — fields collected, verification step (email/phone), what's stored vs. what's derived.
2. **Log in** — credential check, failure handling, lockout threshold after N failed attempts.
3. **Sessions** — token type (opaque/JWT), storage (cookie/header), lifetime, refresh behavior, auto-expire.
4. **Password/credential reset** — one-time link, expiry window, invalidate-on-use.
5. **Log out** — what's invalidated (session row, token, both).

## Token detail (if JWT or similar)
- Signing algorithm (must be asymmetric if a third party verifies it — HS256 shared-secret doesn't cross trust boundaries safely).
- Claims included, and which ones authorization logic actually reads.
- Issuer/audience checks, expiry, rotation plan and propagation lag.

## Standards
- OWASP ASVS relevant sections checked: ___.
- Rate limiting on auth endpoints: ___.

Fill this in during architecture selection (architecture.md gate 2) for any project with user identity. Link the ADR that made the auth-mechanism decision.
