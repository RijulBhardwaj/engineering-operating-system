# Security

Implemented. Standards: .claude/rules/security.md, policies/security-policy.md. Enforced in CI: .github/workflows/security.yml (gitleaks secret scan). Dependency scanning: vulnerability-alerts enabled on this repo; dependency-review workflow was tried and removed since this repo has no package manifests (see observability/decisions log).
