# Security Policy

This repo holds engineering *configuration and process*, not application secrets. No real credentials, API keys, tokens, or production environment files are ever committed here — see [`policies/security-policy.md`](policies/security-policy.md).

## Reporting a problem

If you (future me, on another machine) find a secret committed here: rotate it immediately at the provider, then strip it from history (`git filter-repo` or BFG), then force-push with explicit awareness this rewrites history — never silently.

## Scope

Covers this repo only. Per-project security policy lives in that project's own `SECURITY.md`, inheriting the baseline in `policies/security-policy.md`.
