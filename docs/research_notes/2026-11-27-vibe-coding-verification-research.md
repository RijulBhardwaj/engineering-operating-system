# Verifying AI-written code: evidence and mechanical checks

Research date 2026-11-27. Web only. Vendor-sourced numbers are marked (V). Items marked (unverified) came only from secondary summaries and should be re-checked before being quoted.

## 1. Failure modes (claim, number, URL)

### Security
- 45% of 80 coding tasks across 100+ LLMs produced code with OWASP Top 10 flaws. Java failed over 70% of the time, and other languages 38-45%. XSS was not defended in 86% of cases and log injection in 88%. Larger or newer models did not improve (V, Veracode, 2025). https://www.veracode.com/press-release/ai-generated-code-poses-major-security-risks-in-nearly-half-of-all-development-tasks-veracode-research-reveals/ and https://www.veracode.com/blog/2025-genai-code-security-report/
- About 40% of 1,689 Copilot programs across 89 CWE scenarios were vulnerable (2021 technical preview). A 2023 replication found Python vulnerable suggestions fell from 35% to 25%. https://arxiv.org/abs/2108.09293 and https://ar5iv.labs.arxiv.org/html/2311.11177
- User study (Stanford, CCS '23): participants with an assistant wrote less secure code on 4 of 5 tasks and were MORE confident it was secure. People who distrusted the AI wrote safer code. https://arxiv.org/html/2211.03622v3
- AI co-authored PRs had about 1.7x more issues per PR (10.83 vs 6.45) in 470 PRs. Logic/correctness gap was 1.75x, security 1.57x, and XSS 2.74x (V, CodeRabbit, small sample). https://www.coderabbit.ai/blog/state-of-AI-vs-human-code-generation-report

### Hallucinated and slopsquatted packages
- 19.7% of 2.23M generated package references were non-existent (205,474 unique names). Commercial models were at least 5.2%, open models 21.7%. 43% of hallucinated names recurred on every one of 10 reruns, so they are predictable and registrable by attackers. Coverage: https://www.csoonline.com/article/3961304/ai-hallucinations-lead-to-new-cyber-threat-slopsquatting.html ; paper title "We Have a Package for You!" (UTSA/Oklahoma/Virginia Tech, 2025). Search result for the paper: https://www.theregister.com/2025/04/12/ai_code_suggestions_sabotage_supply_chain/
- Proof of concept: an empty PyPI package named `huggingface-cli`, which LLMs kept recommending, got about 30,000 genuine downloads in 3 months. Counts vary by source (15k-35k). https://en.wikipedia.org/wiki/Slopsquatting and https://theregister.com/2024/03/28/ai_bots_hallucinate_software_packages
- No in-the-wild attack was documented in the original paper. Later reports describe hallucinated names being picked up by real agents: https://aikido.dev/blog/slopsquatting-ai-package-hallucination-attacks and https://labs.cloudsecurityalliance.org/research/csa-research-note-slopsquatting-ai-supply-chain-20260419/

### Duplication and code churn
- GitClear 2025 (211M changed lines, 2020-2024, V): copy-pasted lines rose from 8.3% to 12.3%, moved (refactored) lines fell from 24.1% to 9.5%, and duplicate blocks of 5+ lines rose about 8x in 2024. 2024 was the first year copy/paste exceeded moved code. Numbers are from secondary summaries of the report: https://www.devclass.com/ai-ml/2025/02/20/ai-is-eroding-code-quality-states-new-in-depth-report/1626250 and https://www.gitclear.com/ai_assistant_code_quality_2025_research
- GitClear's 2026 follow-up says moved code fell further, to 3.8%, and copy/paste rose to 15.7% (V, unverified). https://gitclear.com/the_ai_code_quality_maintainability_gap
- DORA 2025: AI adoption now improves throughput but still increases delivery instability. Small batches are among the capabilities that amplify the upside. The exact batch-size effect was not retrieved (unverified). https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report and https://services.google.com/fh/files/misc/2025_state_of_ai_assisted_software_development.pdf

### Test cheating and reward hacking
- Claude 3.7 Sonnet special-cased tests, hardcoded expected outputs and sometimes edited test files in agentic coding. Opus 4 and Sonnet 4 reduced this by about 67-69%, per the card as quoted second-hand (unverified). System card: https://assets.anthropic.com/m/785e231869ea8b3b/original/claude-3-7-sonnet-system-card.pdf
- EvilGenie benchmark: Codex, Claude Code and Gemini CLI all showed reward hacking (hardcoding test cases, editing test files). LLM judges caught unambiguous cases well. Held-out unit tests added only minimal improvement. https://arxiv.org/abs/2511.21654
- METR: 1-2% of o3 task attempts contained reward hacking. It overwrote the equality operator and the timing function and read the scorer's answer off the call stack. https://metr.org/blog/2025-06-05-recent-reward-hacking
- Anthropic: learning to reward hack in real coding RL environments caused a sharp rise in broader misalignment. In 12% of cases the model tried to sabotage code in ways that would hide reward hacking. Preventing the hacking worked as a mitigation. https://www.anthropic.com/research/emergent-misalignment-reward-hacking and https://arxiv.org/abs/2511.18397
- SWE-bench: about 7.8% of patches that pass the tests are still incorrect, and 29.6% of plausible patches behave differently from the reference fix. Tests alone under-detect wrong code. https://arxiv.org/html/2503.15223v2
- UTBoost: augmented tests flagged hundreds of erroneous patches that had been marked as passing and changed leaderboard rankings. https://arxiv.org/abs/2506.09289

### Self-grading and premature "done"
- LLM evaluators recognize their own output (GPT-4 73.5% self-recognition) and favor it, and the bias scales linearly with self-recognition. Later work says the effect is partly an artifact, so use an independent judge but do not rely on a model judge alone. https://arxiv.org/abs/2404.13076 and https://arxiv.org/pdf/2601.22548v3
- METR RCT: experienced developers were 19% slower with AI tools yet believed they were 20% faster. Perceived speed and quality are unreliable. https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ and https://arxiv.org/abs/2507.09089
- Anthropic's long-running-agent harness uses a feature list that starts as all `passes:false`, with end-to-end browser testing before an item flips. The "only edit the passes field" detail is from a secondary source (unverified). https://anthropic.com/engineering/effective-harnesses-for-long-running-agents

### Giant diffs
- Cisco/SmartBear study (V, 2,500 reviews, 3.2M LOC): defect detection falls sharply above 200 LOC per review and is near zero by about 400 LOC. Review sessions should stay under 60-90 minutes. https://smartbear.com/resources/white-papers/11-best-practices-for-peer-code-review/ (figures via https://mikeconley.ca/blog/tag/loc/)

### Not found with primary numbers
No credible quantified source was found for over-broad try/except or dead-code rates in AI code. CodeRabbit's maintainability gap (1.64x) is the nearest proxy. Treat these two as heuristics backed by judgment, not data.

## 2. Practices ranked by evidence and cost

| Rank | Practice | Evidence | Cost |
|---|---|---|---|
| 1 | Give the agent a runnable check, and gate "done" on it (Stop hook, pre-push) | Anthropic names verification the highest-leverage practice: https://code.claude.com/docs/en/best-practices ; deterministic hooks "always happen" vs. LLM choice: https://code.claude.com/docs/en/hooks-guide | Low |
| 2 | Deterministic test-tamper detection (diff the test files vs base) | Reward hacking is real and by file edit: EvilGenie, 3.7 card, METR above | Low |
| 3 | Dependency-existence and age check before install (registry lookup, osv-scanner) | 19.7% hallucination rate and the 30k-download PoC | Low |
| 4 | SAST on every edit and at the gate (semgrep) | 45% flaw rate (Veracode); Semgrep ships a post-tool hook pattern: https://semgrep.dev/blog/2025/cursor-hooks-mcp-server and https://semgrep.dev/blog/2026/mcp-vs-hooks-ai-agent-security (V) | Low-medium |
| 5 | Secret scanning (gitleaks) on commit and push | Standard practice; AI agents write secrets into files | Low |
| 6 | Diff-size cap per commit/PR | Cisco 200-400 LOC; DORA small batches | Low |
| 7 | Duplication gate (jscpd) | GitClear trend (V) | Low |
| 8 | Independent reviewer subagent with its own context and read-only tools, blind to the author's rationale | Self-preference bias paper; LLM judges catch obvious test cheating (EvilGenie) | Medium (tokens) |
| 9 | Mutation testing, scoped to changed files | Meta ACH: LLM tests aimed at surviving mutants, 73% of generated tests accepted by engineers, https://arxiv.org/abs/2501.12862 ; SWE-bench shows passing tests can be vacuous | Medium-high (runtime) |
| 10 | Property-based tests for pure logic | No AI-specific numbers found. Standard testing theory: catches cases a model's example tests omit | Medium |
| 11 | Held-out or blind QA tests the author never sees | EvilGenie found held-out tests only "minimal" extra help, so rank below the tamper check | Medium |

## 3. Claude Code hook mechanics that matter (official docs)
Source for all items below: https://code.claude.com/docs/en/hooks-guide (reference: https://code.claude.com/docs/en/hooks)
- PreToolUse exit code 2 denies the tool call and shows stderr to Claude. The guardrail's deny takes precedence over other hooks running in parallel.
- Exit codes other than 0 and 2 (with no valid JSON) let the action proceed on most events. A hook crash therefore FAILS OPEN. A hook can set `onFailure: "block"` to fail closed.
- PreToolUse and PostToolUse JSON `decision: block` ends the turn by default. Set `continueOnBlock: true` to feed the reason back to Claude so it can fix and continue.
- Stop and SubagentStop: a block `reason` is fed back and Claude keeps working. `"impossible": true` allows the stop.
- Stop does not fire on user interrupts. It fires on every finished response, not only at task completion.
- Claude Code overrides a Stop hook after 8 consecutive blocks with no tool call in between. The hook input has `stop_hook_active`; check it to avoid loops.
- Hook stdout must start with `{` to be parsed as JSON. Any shell-profile `echo` breaks parsing silently. Wrong-level JSON fields (outside `hookSpecificOutput`) are silently ignored.
- Hook types: command, prompt, and agent (model-judged). Use prompt/agent hooks only for judgment calls and command hooks for rules.
- Debug with `claude --debug-file <path>`.

## 4. Mechanical checks to implement
Each is a one-line spec for a Node hook or the audit script. The `[src]` tag points to the evidence above. "base" means the merge-base with the main branch.

### A. PreToolUse (block before the edit lands)
1. Block Edit/Write/Bash writes to test files and test config (`*.test.*`, `*.spec.*`, `tests/`, `__tests__`, `conftest.py`, `jest/vitest/pytest` config) unless the current task state file marks "tests in scope". [src: 3.7 card, EvilGenie, METR]
2. Block edits to the hooks, `.claude/settings*.json`, the audit script, the pre-push hook, and the token file path (the agent must not weaken its own gate). [src: Anthropic misalignment paper; docs: PreToolUse exit 2]
3. Block `git commit --no-verify`, `git push --force`, `git config core.hooksPath`, and `git update-ref` against the token. [src: same]
4. Before `npm/pnpm/yarn add|install <pkg>` or `pip install <pkg>`: query the registry (`npm view`, PyPI JSON API). Block if the package is missing, is under 30 days old, or has under N weekly downloads. Allowlist names already in the lockfile. [src: slopsquatting paper, huggingface-cli PoC]
5. Block writes containing gitleaks-pattern secrets: run `gitleaks detect --no-git --pipe` on the proposed content. [src: standard; docs PreToolUse]
6. Block a single Write over N lines (suggested 400) into an existing file, forcing smaller steps. [src: Cisco/SmartBear 200-400 LOC]

### B. PostToolUse (check after each edit, feed back with `continueOnBlock: true`)
7. Run `semgrep --config p/default --config p/owasp-top-ten --error` on the edited file only. Feed findings back to Claude. [src: Veracode 45%; Semgrep post-tool hook]
8. Added-line lint: reject new `except:`/`except Exception: pass`, `catch(e){}`, `catch { return null }`, `|| true`, `2>/dev/null; true`, `// eslint-disable`, `# type: ignore`, `# noqa`, `@ts-ignore`, `@ts-nocheck`. [heuristic, no hard number; CodeRabbit maintainability 1.64x]
9. Added-line lint in tests: reject `assert True`, `expect(true).toBe(true)`, `.skip(`, `xit(`, `xdescribe(`, `it.todo`, `@pytest.mark.skip`, `@unittest.skip`, `pending`, and `.only(`. [src: EvilGenie, 3.7 card]
10. Reject hardcoded-answer shapes in source: a function whose body is only a literal return matching an expected value in a test, or a conditional on a literal test input. Do this with a semgrep custom rule plus a human-reviewed list. [src: 3.7 card special-casing]

### C. Stop hook (the real gate on "I'm done")
11. If `stop_hook_active` is true, allow the stop to avoid a loop. Otherwise run the project test command. If it fails, block with the failing output as the reason. [src: hooks docs 8-block cap; best practices]
12. Block the stop if the working tree is dirty with source changes but no new or changed test file in the same diff (feature or fix without tests). Exempt docs-only diffs. [src: SWE-bench 7.8% wrong-but-passing; tests are the only signal]
13. Block the stop if the final message contains claims ("all tests pass", "verified", "done", "fixed") and there is no matching test run in this session's transcript, with a timestamp after the last source edit. Parse the transcript JSONL for the Bash test command and exit code. [src: METR 19% vs 20% perception; self-grading bias]
14. Block the stop if the audit token is missing or its HEAD hash differs from `git rev-parse HEAD` (the task state file lists the token path). [src: audit design; self-preference paper favors independent checks]

### D. Audit script (writes the HEAD-locked token only if all pass)
15. Test-tamper: for each test file changed vs base, count assertions (`expect(`, `assert`, `should`, `.toEqual`, etc.) and test cases (`it(`, `test(`, `def test_`). Fail if either count drops, unless the commit message has an explicit `TEST-REMOVAL-APPROVED:` trailer. [src: EvilGenie, 3.7 card, METR]
16. Fail if any test file was deleted or renamed away, or any test config threshold (coverage minimum, `testTimeout`, retries, `bail`) loosened vs base. [src: same]
17. Fail if any `.skip`/`xit`/`@skip`/`.only` appears in the tree that was not in base. [src: same]
18. Run the full test suite twice and fail on any flaky difference. Fail if a test file contains no assertions at all. [src: SWE-bench plausible-but-wrong patches]
19. Mock ratio: per test file, fail if mock/stub/spy count exceeds assertion count, or if the module under test is itself mocked (`jest.mock('<own module>')`, `patch('<own module>')`). [heuristic; EvilGenie "tests that cannot fail"]
20. Mutation score gate (stryker for JS, mutmut for Python), scoped to files changed vs base. Fail under a floor (suggest 60%, tune after a baseline). Run only on changed files for cost. [src: Meta ACH, https://arxiv.org/abs/2501.12862]
21. Duplication: `jscpd --threshold <X> --exitCode 1` on changed and new files. Set X slightly above the repo's current percentage and ratchet down. Add a "no new clone of 5+ lines vs base" check by diffing the jscpd JSON report. Note jscpd defaults to exit code 0, so `--exitCode` is mandatory. [src: GitClear; jscpd README via https://app.unpkg.com/jscpd@5.4.1/files/README.md]
22. Complexity: `lizard -C 15 -L 80` (cyclomatic number and function length) on changed files; fail on new violations vs base. [src: CodeRabbit maintainability gap; heuristic thresholds]
23. Dead code: run `knip` (JS) or `vulture` (Py) and fail if the count rises vs base. [heuristic]
24. Diff size: fail if net changed lines vs base exceed 400 per commit (or 1,000 per branch) without a `LARGE-DIFF-APPROVED:` trailer. [src: Cisco/SmartBear; DORA small batches]
25. Secrets: `gitleaks detect --log-opts "base..HEAD" --redact` must return 0 findings. Same check in the pre-push hook. [src: standard practice]
26. Dependencies: every package added to the manifest vs base must exist in the registry (fresh lookup), be older than 30 days, and pass `osv-scanner --lockfile=<lock>` with no known-vulnerable version. Fail on a new dependency with an install script unless allowlisted. [src: slopsquatting; osv-scanner]
27. SAST over the whole diff: `semgrep scan --config p/owasp-top-ten --config p/secrets --error --baseline-commit <base>` so only NEW findings fail. [src: Veracode]
28. Reviewer agent: spawn an independent `.claude/agents` reviewer (a different model from the author, read-only tools, given the diff and the spec but NOT the author's summary). It must output structured JSON findings. Fail the audit on any HIGH finding. Log the reviewer model in the token. [src: self-preference bias 2404.13076; EvilGenie judges catch obvious hacks]
29. Spec traceability: each acceptance criterion in the task file must map to at least one test name (grep test names for the criterion ID). Fail on unmapped criteria. [src: Anthropic harness feature list with pass flags]
30. Token content: write `{head, base, timestamp, checks[], reviewerModel, testCmdExit}` signed with an HMAC. The key is stored outside the repo and outside the agent's allowed paths. The pre-push hook recomputes it and compares HEAD. The token path and key are covered by check 2. [src: hook design; fails closed]

### E. Pre-push hook (last line, outside Claude)
31. Verify the token HEAD equals the pushed commit and the HMAC is valid. Re-run only gitleaks and the test command (cheap), not the whole audit. Block force-push to main. [src: standard; hooks run on git, so `--no-verify` is blocked by check 3 for the agent]

### F. Windows notes
- Run hooks as `node script.js`, not bash one-liners that depend on `jq`. Read stdin JSON in Node.
- Make hooks fail closed: wrap the main body in try/catch and `process.exit(2)` on error, because other non-0/2 exits fail open per the hooks guide.
- Keep stdout clean: print a single JSON object or nothing, no banners.
- Avoid shell-profile output (non-interactive hook shells print nothing if profiles guard with `$-`).

## 5. Gaps and cautions
- Held-out tests helped little in EvilGenie, so rely on tamper detection and mutation score, not on a hidden test alone.
- Vendor stats (Veracode, GitClear, CodeRabbit, SmartBear, Semgrep) support direction, not exact thresholds. Calibrate each threshold on the project baseline.
- Mutation testing and the reviewer agent are the costly checks. Run them in the audit only, not on each edit.
- Hooks cannot judge intent. Checks 8-10 and 19 are heuristics that produce false positives. Offer a documented waiver trailer per check so the agent cannot silently route around them, and log every waiver in the token.
