# Per-project Software Factory — plan v2 (research folded in)

## Host facts (audited 2026-11-27)
Windows 11, Git Bash + PowerShell 5.1. node 26.13, git 2.53, gh 2.101 (authed), python 3.11.9, gitleaks 8.28,
osv-scanner 2.2.3, lizard 1.24, jscpd 5.3, semgrep 1.177 (exe in parked 12_Dimension_Harness venv, on PATH), deno MISSING.
Global ~/.claude hooks: SessionStart + PreCompact (engineering-operating-system), plus plugin hooks (GateGuard etc).

## Scope (N = 4)
| Project | Root | Branch | Stack | Blind-QA runtime | Ports |
|---|---|---|---|---|---|
| fitness-intelligence-platform | own repo + GitHub | main, clean | TS worker, eslint/tsc/vitest | node demo/serve.js | 4100-4119 |
| lynceon-ai | own repo + GitHub | feat/neon-r2-migration, clean | vite web (tsc, vitest), api (wrangler), supabase deno fns | web vite preview | 4200-4219 |
| CAT_Guide | subdir of worktree happy-kare-2afdc0 (root repo, NO remote), branch claude/fable-subagents-setup-93ce3f, 30 uncommitted files of another session | static PWA, serve.py, python validators, node e2e | python serve.py PORT | 4300-4319 |
| engineering-operating-system | own repo + GitHub | main, clean | md/yaml, node hooks, sh/ps1 | CLI (doctor + hook self-tests) | none |
Excluded: 12_Dimension_Harness (parked), AI_Content_Detector (unregistered, no remote), non-git coursework dirs.

## Kit (same code, COPIED into each project; no shared path; parameterised by factory.json)
`.claude/factory/`:
- factory.json: name, defaultBranch, ports, fastChecks per extension, stopCheck cmd, audit steps [{id, cmd, required, timeoutSec}], sandbox {start (with {PORT}), cwd, health, smoke[{path,status,contains}]}, thresholds {maxDiffLines 400/commit, dupPct, ccn 15}.
- lib.mjs: root detect, git helpers, HMAC token, free-port pick, kill tree (taskkill /T /F), JSON stdin, fail-closed wrapper (any exception => exit 2).
- guard.mjs (PreToolUse):
  Bash: deny destructive (rm -rf root/../~, git reset --hard, git clean -fdx, push --force/-f/--force-with-lease to default, branch -D default, filter-branch/update-ref, --no-verify, git config core.hooksPath, writes/redirects/rm/mv touching protected paths);
  ship gate: git push, gh pr create|merge, gh release, wrangler deploy, npm publish, supabase deploy => require verify(HEAD) ok;
  commit gate: git commit on defaultBranch denied;
  dep gate: npm/pnpm/yarn add|install <name>, pip install <name> => `npm view <name> time.created` / PyPI JSON; deny if missing or created < 30 days (unless already in lockfile).
  Edit|Write|MultiEdit|NotebookEdit: path must be inside project root; deny protected (.claude/factory/**, .claude/settings*.json, .claude/agents/**, .factory/**, .git/**, CLAUDE.md factory block untouched? -> CLAUDE.md allowed); deny when branch == defaultBranch in main checkout; deny Write > 400 lines over an existing file.
- post-edit.mjs (PostToolUse Edit|Write|MultiEdit): fast check for that file (eslint / node --check / py_compile / JSON parse) + added-line slop lint vs HEAD (empty catch, except: pass, @ts-ignore/@ts-nocheck, eslint-disable, noqa, type: ignore, `|| true`; in tests: .only/.skip/xit/xdescribe/it.todo/pytest skip, expect(true).toBe(true), assert True) + gitleaks on the file. Fail => exit 2, message fed back.
- stop-gate.mjs (Stop): if stop_hook_active => allow. Else if tree has source changes: run stopCheck; fail => block with output. Source changed without any test change => block once. Final assistant message claims done/passing/verified but transcript has no test/audit run after last edit => block.
- audit.mjs: clean tree required → steps: lint, typecheck, tests (from factory.json) → test-tamper vs merge-base (assertion + case counts must not drop, no deleted tests; waiver trailer TEST-REMOVAL-APPROVED:) → diff-size (LARGE-DIFF-APPROVED:) → jscpd on changed files (--exitCode 1) → lizard CCN on changed files → gitleaks git base..HEAD → semgrep p/default --baseline-commit base --error → new deps exist + age + osv-scanner lockfile → spec traceability (AC-n ids in docs/factory/specs must appear in a test) → review record present for HEAD with no HIGH (written by review.mjs) → sandbox up + smoke + teardown (port freed, no orphan). Writes .factory/audit/<sha>.json with HMAC (key: .git/factory-audit.key, per repo, uncommitted). Waivers logged in token. Prints a release report.
- review.mjs: `claude -p` headless with reviewer agent (opus, read-only tools), input = diff base..HEAD + spec only (not author summary); expects JSON findings; writes .factory/review/<sha>.json.
- sandbox.mjs: up/down/status; pid + port in .factory/sandbox/.
- verify.mjs: token for sha exists, HMAC ok, sha == HEAD, tree clean, all required passed.
- install.mjs: key gen, .git/hooks/pre-push (backup existing), .gitignore lines, self-test.
- selftest.mjs: guardrail test suite (crafted hook JSON) — reusable proof.
`.git/hooks/pre-push`: verify token for each pushed sha; block force push to defaultBranch; rerun gitleaks on range.
`.claude/settings.json`: model claude-opus-5-5; hooks wired as `node "$CLAUDE_PROJECT_DIR/.claude/factory/x.mjs"`; permissions.deny for protected paths.
`.claude/agents/`: planner (opus), builder (sonnet, worktree), reviewer (opus, read-only), blind-qa (sonnet; Bash + browser; no Read/Grep/Glob/Edit/Write; receives acceptance criteria + URL only), scout (haiku, read-only).
CLAUDE.md "Software factory" section: pipeline + quickstart. .gitignore: .factory/, .claude/worktrees/, .claude/settings.local.json.

## Rollout
fitness, EOS: branch chore/software-factory from main. lynceon: branch from current HEAD. Local commits only, no push.
CAT: untracked files only, no commit, no git hook (hooks dir shared with root repo; root has no remote). Gap flagged.

## Verification evidence per project
selftest (guard deny/allow matrix), post-edit failure feedback, audit pass→token / injected failure→no token,
tamper token→deny, sandbox up/curl/down + port free, pre-push against temp local bare remote (blocked w/o token, passes with),
headless `claude -p` haiku in project asked to push → blocked (proves settings load), concurrent sandboxes on distinct ports,
grep factory for out-of-root paths → none.

## Deferred (state openly)
Mutation testing (Stryker/mutmut not installed; would add deps), knip/vulture dead code, GitHub branch protection (needs user OK).
