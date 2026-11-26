// Guardrail proof suite. Part A runs the hooks against THIS project read-only (deny/allow matrix).
// Part B builds a scratch repo with a copy of this kit and proves the full token / pre-push / tamper flows.
// Usage: node .claude/factory/selftest.mjs [--json]
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as L from "./lib.mjs";

const results = [];
const rec = (group, name, ok, detail = "") => { results.push({ group, name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"} [${group}] ${name}${!ok && detail ? `\n      ${detail.slice(0, 300)}` : ""}`); };
const hook = (kitDir, mode, input, cwd) => spawnSync(process.execPath, [path.join(kitDir, "hook.mjs"), mode], { input: typeof input === "string" ? input : JSON.stringify(input), cwd, encoding: "utf8", windowsHide: true, timeout: 120000 });
const expectHook = (group, name, kitDir, mode, input, cwd, wantBlock) => {
  const r = hook(kitDir, mode, input, cwd);
  const blocked = r.status === 2;
  rec(group, name, blocked === wantBlock, `exit ${r.status}: ${(r.stderr || r.stdout || "").trim()}`);
  return r;
};
const bash = (cmd) => ({ tool_name: "Bash", tool_input: { command: cmd }, cwd: L.ROOT, session_id: "selftest" });

// ---------------- Part A: this project, read-only ----------------
const K = L.FACTORY_DIR, R = L.ROOT, A = "project";
const other = path.resolve(R, "..", "some-other-project", "x.ts");
const denyCmds = [
  ["git push without audit token", "git push origin HEAD"],
  ["git push via -C", `git -C "${R.replace(/\\/g, "/")}" push`],
  ["force push", "git push --force origin HEAD"],
  ["rm -rf /", "rm -rf /"],
  ["rm -rf ~", "rm -rf ~"],
  ["rm -rf ..", "rm -rf .."],
  ["commit --no-verify", 'git commit --no-verify -m "x"'],
  ["hooksPath override", "git -c core.hooksPath=/dev/null push"],
  ["git alias trick", "git -c alias.p=push p origin HEAD"],
  ["reset --hard", "git reset --hard HEAD~1"],
  ["git clean -fdx", "git clean -fdx"],
  ["delete branch", "git branch -D main"],
  ["gh pr merge without token", "gh pr merge 12 --squash"],
  ["gh api write", "gh api -X PUT repos/o/r/pulls/1/merge"],
  ["gh api graphql", "gh api graphql -f query='mutation{x}'"],
  ["gh auth token", "gh auth token"],
  ["read audit key", "cat .git/factory-audit-x.key"],
  ["write settings via redirect", "echo '{}' > .claude/settings.json"],
  ["sed factory file", "sed -i s/deny/allow/ .claude/factory/hooks-impl.mjs"],
  ["copy over pre-push", "cp /tmp/x .git/hooks/pre-push"],
  ["inline node push", `node -e "require('child_process').execSync('git push')"`],
  ["disableAllHooks", `echo '{"disableAllHooks":true}' > x.json`],
  ["hallucinated npm package", "npm install zz-factory-selftest-nonexistent-pkg-93ce3f"],
  ["wrangler deploy", "npx wrangler deploy"],
  ["supabase functions deploy", "supabase functions deploy api"],
];
for (const [n, cmd] of denyCmds) expectHook(A, `deny: ${n}`, K, "guard", bash(cmd), R, true);
const scripts = (() => { try { return JSON.parse(fs.readFileSync(path.join(R, "package.json"), "utf8")).scripts || {}; } catch { return {}; } })();
const deployScript = Object.keys(scripts).find((k) => /deploy|publish|release/.test(scripts[k]));
if (deployScript) expectHook(A, `deny: npm run ${deployScript} (wraps a deploy)`, K, "guard", bash(`npm run ${deployScript}`), R, true);
expectHook(A, "deny: PowerShell Remove-Item -Recurse C:\\", K, "guard", { tool_name: "PowerShell", tool_input: { command: "Remove-Item -Recurse -Force C:\\" }, cwd: R }, R, true);
expectHook(A, "deny: PowerShell git push", K, "guard", { tool_name: "PowerShell", tool_input: { command: "git push origin HEAD" }, cwd: R }, R, true);
const W = (p) => ({ tool_name: "Write", tool_input: { file_path: p, content: "x" }, cwd: R });
expectHook(A, "deny: write into another project", K, "guard", W(other), R, true);
expectHook(A, "deny: write factory.json", K, "guard", W(path.join(R, ".claude", "factory", "factory.json")), R, true);
expectHook(A, "deny: write .claude/settings.json", K, "guard", W(path.join(R, ".claude", "settings.json")), R, true);
expectHook(A, "deny: write via Git-Bash path to factory", K, "guard", W(`/${R[0].toLowerCase()}/${R.slice(3).replace(/\\/g, "/")}/.claude/factory/lib.mjs`), R, true);
expectHook(A, "deny: write with trailing dot alias", K, "guard", W(path.join(R, ".claude", "settings.json.")), R, true);
expectHook(A, "deny: write alternate data stream", K, "guard", W(path.join(R, "src", "a.ts::$DATA")), R, true);
expectHook(A, "deny: write ~/.claude/settings.json", K, "guard", W(path.join(os.homedir(), ".claude", "settings.json")), R, true);
expectHook(A, "deny: write .git/hooks/pre-push", K, "guard", W(path.join(R, ".git", "hooks", "pre-push")), R, true);
expectHook(A, "deny: MCP migration tool", K, "guard", { tool_name: "mcp__729ae91e__apply_migration", tool_input: {}, cwd: R }, R, true);
expectHook(A, "deny: MCP write_file bypass", K, "guard", { tool_name: "mcp__Desktop_Commander__write_file", tool_input: {}, cwd: R }, R, true);
expectHook(A, "deny: remote subagent", K, "guard", { tool_name: "Agent", tool_input: { isolation: "remote", prompt: "x" }, cwd: R }, R, true);
expectHook(A, "fail closed: empty stdin", K, "guard", "", R, true);
expectHook(A, "fail closed: garbage stdin", K, "guard", "{not json", R, true);
for (const [n, cmd] of [["git status", "git status"], ["run audit", "node .claude/factory/audit.mjs"], ["run sandbox", "node .claude/factory/sandbox.mjs up"], ["rm -rf node_modules", "rm -rf node_modules"], ["read a factory file", "cat .claude/factory/factory.json"], ["npm install (lockfile)", "npm install"], ["gh api GET", "gh api repos/o/r/pulls"]])
  expectHook(A, `allow: ${n}`, K, "guard", bash(cmd), R, false);
expectHook(A, "allow: Read", K, "guard", { tool_name: "Read", tool_input: { file_path: path.join(R, "README.md") }, cwd: R }, R, false);
expectHook(A, "allow: hearthbot message", K, "guard", { tool_name: "mcp__hearthbot__post_message", tool_input: {}, cwd: R }, R, false);
expectHook(A, "allow: write to temp dir", K, "guard", W(path.join(os.tmpdir(), "factory-selftest.txt")), R, false);

// ---------------- Part B: scratch repo, full flows ----------------
const B = "scratch";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "factory-selftest-"));
const repo = path.join(tmp, "repo"), remote = path.join(tmp, "remote.git");
const sh = (cmd, cwd = repo) => spawnSync(L.SHELL, ["-c", cmd], { cwd, encoding: "utf8", windowsHide: true, timeout: 300000 });
try {
  fs.mkdirSync(path.join(repo, ".claude", "factory"), { recursive: true });
  for (const f of fs.readdirSync(K)) if (f.endsWith(".mjs")) fs.copyFileSync(path.join(K, f), path.join(repo, ".claude", "factory", f));
  const base = L.cfg();
  fs.writeFileSync(path.join(repo, ".claude", "factory", "factory.json"), JSON.stringify({
    name: "selftest", defaultBranch: "main", ports: base.ports, prePush: true, audit: [], sandbox: null, duplication: null, complexity: null, semgrep: false, review: false,
    fastChecks: { ".js": "node --check {file}" }, stopCheck: "node --test", testRegex: "(^|/)tests?/|\\.test\\.js$",
  }, null, 2));
  fs.mkdirSync(path.join(repo, "tests"));
  fs.writeFileSync(path.join(repo, "a.js"), "export const add = (a, b) => a + b;\n");
  fs.writeFileSync(path.join(repo, "tests", "a.test.js"), 'import test from "node:test"; import assert from "node:assert"; import { add } from "../a.js";\ntest("adds", () => { assert.equal(add(1, 2), 3); });\n');
  fs.writeFileSync(path.join(repo, "package.json"), '{"type":"module"}\n');
  let r = sh(`git init -q -b main && git config user.email selftest@local && git config user.name selftest && git config core.autocrlf false && git add -A && git commit -qm init && git init -q --bare "${remote.replace(/\\/g, "/")}" && git remote add origin "${remote.replace(/\\/g, "/")}" && git push -q origin main && node .claude/factory/install.mjs`);
  rec(B, "scratch repo + install", r.status === 0, r.stdout + r.stderr);
  const SK = path.join(repo, ".claude", "factory");
  const SW = (p, content = "x") => ({ tool_name: "Write", tool_input: { file_path: path.join(repo, p), content }, cwd: repo });
  const SB = (cmd) => ({ tool_name: "Bash", tool_input: { command: cmd }, cwd: repo, session_id: "st" });
  expectHook(B, "deny: edit on default branch", SK, "guard", SW("a.js"), repo, true);
  expectHook(B, "deny: commit on default branch", SK, "guard", SB('git commit -am "x"'), repo, true);
  sh("git switch -q -c feat/x");
  expectHook(B, "allow: edit on feature branch", SK, "guard", SW("a.js"), repo, false);
  fs.writeFileSync(path.join(repo, "a.js"), "export const add = (a, b) => a + b;\nexport const sub = (a, b) => a - b;\n");
  fs.writeFileSync(path.join(repo, "tests", "a.test.js"), fs.readFileSync(path.join(repo, "tests", "a.test.js"), "utf8") + 'test("subs", () => { assert.equal(2 - 1, 1); });\n');
  sh('git add -A && git commit -qm "feat: sub"');
  expectHook(B, "deny: push before audit", SK, "guard", SB("git push -u origin feat/x"), repo, true);
  r = sh("node .claude/factory/audit.mjs");
  rec(B, "audit passes on good change -> token", r.status === 0 && /AUDIT PASS/.test(r.stdout), r.stdout.slice(-600));
  expectHook(B, "allow: push after audit", SK, "guard", SB("git push -u origin feat/x"), repo, false);
  r = sh("git push -q -u origin feat/x");
  rec(B, "pre-push hook accepts audited push to local bare remote", r.status === 0, r.stderr);
  const head = sh("git rev-parse HEAD").stdout.trim();
  const tokP = path.join(repo, ".factory", "audit", `${head}.json`);
  const good = fs.readFileSync(tokP, "utf8");
  fs.writeFileSync(tokP, good.replace('"result": "pass"', '"result": "pass" ').replace(/"durationMs": \d+/, '"durationMs": 1'));
  expectHook(B, "deny: push with tampered token", SK, "guard", SB("git push origin feat/x"), repo, true);
  const forged = JSON.parse(good); forged.steps = []; fs.writeFileSync(tokP, JSON.stringify(forged));
  expectHook(B, "deny: token with steps stripped (hmac mismatch)", SK, "guard", SB("git push origin feat/x"), repo, true);
  fs.writeFileSync(tokP, good);
  fs.writeFileSync(path.join(repo, "scratch.txt"), "dirty");
  expectHook(B, "deny: push with dirty tree", SK, "guard", SB("git push origin feat/x"), repo, true);
  fs.rmSync(path.join(repo, "scratch.txt"));
  // post-edit hook feedback
  fs.writeFileSync(path.join(repo, "bad.js"), "export const x = (;\n");
  expectHook(B, "post-edit: syntax error fed back (exit 2)", SK, "post", SW("bad.js"), repo, true);
  fs.writeFileSync(path.join(repo, "bad.js"), "try { f(); } catch (e) {}\n");
  expectHook(B, "post-edit: empty catch flagged", SK, "post", SW("bad.js"), repo, true);
  fs.writeFileSync(path.join(repo, "tests", "b.test.js"), 'import test from "node:test";\ntest.skip("later", () => {});\n');
  expectHook(B, "post-edit: skipped test flagged", SK, "post", SW("tests/b.test.js"), repo, true);
  fs.writeFileSync(path.join(repo, "bad.js"), "export const ok = 1;\n");
  expectHook(B, "post-edit: clean file passes", SK, "post", SW("bad.js"), repo, false);
  fs.rmSync(path.join(repo, "bad.js")); fs.rmSync(path.join(repo, "tests", "b.test.js"));
  // stop gate: source change without test
  fs.writeFileSync(path.join(repo, "a.js"), "export const add = (a, b) => a + b;\nexport const sub = (a, b) => a - b;\nexport const mul = (a, b) => a * b;\n");
  r = hook(SK, "stop", { session_id: "st1", stop_hook_active: false, cwd: repo }, repo);
  rec(B, "stop gate blocks source change with no test", /"decision":"block"/.test(r.stdout) && /no test changed/.test(r.stdout), r.stdout + r.stderr);
  r = hook(SK, "stop", { session_id: "st1", stop_hook_active: true, cwd: repo }, repo);
  rec(B, "stop gate respects stop_hook_active (no loop)", r.status === 0 && !r.stdout.includes("block"), r.stdout);
  fs.writeFileSync(path.join(repo, "tests", "a.test.js"), fs.readFileSync(path.join(repo, "tests", "a.test.js"), "utf8") + 'test("broken", () => { assert.equal(1, 2); });\n');
  r = hook(SK, "stop", { session_id: "st2", stop_hook_active: false, cwd: repo }, repo);
  rec(B, "stop gate feeds failing test output back", /"decision":"block"/.test(r.stdout) && /stop check failed/.test(r.stdout), r.stdout.slice(0, 400));
  sh("git checkout -q -- a.js tests/a.test.js");
  // test tamper: delete assertions -> audit fails, no token
  fs.writeFileSync(path.join(repo, "tests", "a.test.js"), 'import test from "node:test";\ntest("adds", () => {});\n');
  sh('git commit -qam "refactor: simplify tests"');
  r = sh("node .claude/factory/audit.mjs");
  const h2 = sh("git rev-parse HEAD").stdout.trim();
  rec(B, "audit fails when assertions are removed (test tamper)", r.status !== 0 && /FAIL test-tamper/.test(r.stdout) && !fs.existsSync(path.join(repo, ".factory", "audit", `${h2}.json`)), r.stdout.slice(-500));
  r = sh("git push -q origin feat/x");
  rec(B, "pre-push blocks un-audited commit (outside Claude)", r.status !== 0 && /blocked/.test(r.stderr), r.stderr);
  r = sh("git push -q --force origin main:feat/x");
  rec(B, "pre-push blocks force push", r.status !== 0, r.stderr);
  r = sh("git push -q origin :feat/x");
  rec(B, "pre-push blocks remote branch deletion", r.status !== 0, r.stderr);
  // factory change without approval
  sh("git reset -q --hard HEAD~1");
  fs.appendFileSync(path.join(repo, ".claude", "factory", "factory.json"), "\n");
  sh('git commit -qam "chore: tweak factory"');
  r = sh("node .claude/factory/audit.mjs");
  rec(B, "audit fails on unapproved factory change", r.status !== 0 && /FAIL factory-integrity/.test(r.stdout), r.stdout.slice(-400));
  r = hook(SK, "session", { session_id: "s" }, repo);
  rec(B, "session hook prints factory banner, no alarms", /software-factory:selftest/.test(r.stdout) && !/ALARM/.test(r.stdout), r.stdout);
} finally {
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
}

const failed = results.filter((x) => !x.ok);
console.log(`\nselftest ${L.cfg().name}: ${results.length - failed.length}/${results.length} passed`);
fs.mkdirSync(L.STATE_DIR(), { recursive: true });
fs.writeFileSync(path.join(L.STATE_DIR(), "selftest.json"), JSON.stringify({ ts: new Date().toISOString(), project: L.cfg().name, head: L.head(), results }, null, 2));
process.exit(failed.length ? 1 : 0);
