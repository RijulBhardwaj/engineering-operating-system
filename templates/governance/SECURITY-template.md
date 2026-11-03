# SECURITY.md — <project> — rules the agent (and anyone) can never break

Supersedes nothing; new template. Linked from `workflows/project-initialization/README.md` and `.claude/rules/architecture.md` gate 5. Project-level detail that implements the harness-wide `.claude/rules/security.md` rules for this specific codebase.

## No secrets in code
- All keys/tokens/credentials come from env vars, never hardcoded. `.env.example` has placeholders only, `.env` is gitignored.
- Pre-commit/CI secret scanning enabled: ___.

## Validate every input
- Type, length, format checked at every trust boundary (API input, form submission, file upload, query params).
- Validation library/approach used: ___.

## Rate limit public routes
- Which routes are public, and the per-IP/per-key cap: ___. (See system-design-patterns.md #1 for pure-code vs. infra-backed options.)

## Authorization
- Every data-access path checks "is this caller allowed to touch this row," not just "is this caller logged in." (RLS or app-layer check — see RLS-POLICIES-template.md if the DB enforces it.)

## Standards
- OWASP Top 10 reviewed against this project's actual attack surface: ___.
- Dependency/vulnerability scanning: ___.

## Pre-deploy checklist
Run before every production deploy, not just at setup. Check off, don't skip:
- [ ] Admin/privileged routes require an authz check server-side, not just hidden in the UI.
- [ ] Every data-access path enforces "caller owns this row" server-side (RLS or app-layer — see Authorization above).
- [ ] Emails verified, passwords hashed (bcrypt/argon2, never plain/reversible).
- [ ] Auth tokens never in `localStorage`/unencrypted client storage if XSS-exploitable; httpOnly cookies or equivalent.
- [ ] API keys/secrets never shipped to the client — server-side only.
- [ ] `.env`/secrets not in git (working tree and history — `git log -p` or a scanner, not just `.gitignore` going forward).
- [ ] Logs don't contain passwords, tokens, PII.
- [ ] DB queries parameterized, never string-concatenated.
- [ ] Output encoded / sanitized against XSS; file uploads validated by content, not just extension.
- [ ] Webhook endpoints verify the provider's signature.
- [ ] Sensitive routes (auth, payment, password reset) rate-limited.
- [ ] Security headers set (CSP, X-Frame-Options, HSTS, etc.).
- [ ] DB/storage bucket permissions are least-privilege, not world-readable/writable.
- [ ] Debug mode off, stack traces not leaked to clients, in production.
- [ ] Dependencies scanned for known vulnerabilities and updated.
- [ ] Unused packages, routes, and feature flags removed.
- [ ] No exposed files (`.git/`, backups, config dumps) reachable at a public URL.

Fill in during implementation, keep current as routes/data model change. A secret that leaks anyway gets rotated at the provider immediately, then stripped from git history — never left in place.
