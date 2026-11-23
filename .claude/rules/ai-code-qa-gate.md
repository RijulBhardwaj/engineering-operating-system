# AI Code QA Gate

Standing pipeline. Run this whenever the user says "audit", "QA", "review quality", or "test" a codebase/change — not only when they spell out the five layers. Source: Vibe Coding Bible, "AI Code Quality Assurance: Checklists and Best Practices" (Tom Smykowski), adopted 2026-11-24 per explicit user instruction to apply it everywhere.

Trivial fixes (typo, one-line change) don't need the full gate -- same exception as architecture.md.

## Five layers, in order

1. **Static analysis** -- style, type errors, known anti-patterns, before anything runs.
2. **Unit tests** -- happy path + edge cases (empty/null input, boundary values, concurrent access, malformed data) + error conditions.
3. **Integration tests** -- confirm the new/AI-generated code actually works with existing modules, not just in isolation.
4. **Peer review** -- logic, naming, security, architectural fit, duplication (AI doesn't know what already exists three directories away). Tag AI-generated code in commits/PRs so review attention goes to security/error-handling/integration, not style.
5. **Runtime monitoring** -- logging/alerts/observability for regressions post-deploy. (Project-dependent; flag if the project has none.)

Skip a layer and you create a blind spot -- static analysis alone misses logic errors, tests alone miss naming/duplication. Mutation testing (below) checks whether layer 2 is actually strong, not just present -- a green test suite with weak assertions is false confidence.

## Tool stack (installed on this machine 2026-11-24, see registry/tools.yaml)

| Layer | JS/TS | Python |
|---|---|---|
| Lint | eslint | ruff (style+lint), pylint (deeper) |
| Type check | tsc (project dep, not global) | mypy |
| Security scan | semgrep (polyglot, already covers JS/TS too) | bandit, semgrep |
| Unit test | Jest/Vitest (project dep, pick per project) | pytest (project dep) |
| Mutation test | `npx stryker` (@stryker-mutator/core) | mutmut -- **Windows: needs WSL, won't run natively here** (upstream limitation, not a harness gap). Use WSL or a Linux CI runner for Python mutation testing; skip the layer gracefully and say so if neither is available, don't silently fake it. |
| Dependency audit | `npm audit` (built-in) | pip-audit |

**Snyk Code deliberately not installed** -- account/paid-tier gated, violates the zero-budget default (policies/engineering-principles.md). Semgrep + Bandit + pip-audit/npm audit together cover the same ground for free; use those instead. If a project genuinely needs Snyk's specific coverage, that's a per-project ADR decision, not a default.

Global installs: Python tools via the Windows Store Python at `AppData/Local/Microsoft/WindowsApps/python.exe -m pip install --user`, not whatever venv happens to be on PATH (this machine has the parked `12_Dimension_Harness` venv shadowing `python` -- always check `which python`/`sys.prefix` before a global pip install, or the tool lands in the wrong place). JS tools via `npm install -g`.

## Checklist (apply per change/PR)

- [ ] Static analysis clean (linter + type checker) on all new/changed files
- [ ] Unit tests cover happy path, edge cases, error conditions
- [ ] Mutation testing run where the platform supports it (JS/TS always; Python only with WSL/Linux available) -- a weak test suite reported as-is, not hidden
- [ ] Security scan (Semgrep + Bandit for Python, Semgrep for JS/TS) clean or findings triaged
- [ ] Dependency audit (`npm audit` / `pip-audit`) clean or findings triaged
- [ ] AI-generated code tagged in the PR/commit for focused review
- [ ] Integration tests pass with existing modules
- [ ] No hardcoded secrets, missing input validation, or exposed internal error details
- [ ] No duplicated logic that already exists elsewhere in the codebase
- [ ] Naming matches project conventions
- [ ] Runtime monitoring/alerting exists for the changed path, or its absence is flagged

Report results as evidence (tool output, pass/fail counts), not verbal assurance -- same rule as agent-coordination.md.
