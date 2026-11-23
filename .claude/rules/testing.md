# Testing Standards

Concrete, tool-backed pipeline for any audit/QA/test request: [`ai-code-qa-gate.md`](ai-code-qa-gate.md). This file sets the general standard; that one names the actual tools and checklist.

- Every non-trivial logic path (branch, loop, parser, money/security path) gets a runnable check before being called done -- unit test minimum.
- Test categories to consider per workflows/testing/: unit, integration, e2e, regression, security, performance -- pick what the project's risk profile actually needs, not the full list by default.
- Never report a skipped/flaky-skipped test as passing.
- Coverage targets are per-project (see that project's registry entry), not a blanket number imposed here.
- Quality gate before merge-ready: format, lint, type-check (where applicable), relevant tests, security scan, secret scan, dependency check, docs check, reviewed diff. See .github/workflows/.
