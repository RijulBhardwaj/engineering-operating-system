import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as L from "./lib.mjs";

const deny = (why) => { L.log("guard", `DENY ${why}`); process.stderr.write(`software-factory: BLOCKED. ${why}\n`); process.exit(2); };
const allow = (why = "") => { if (why) L.log("guard", `ALLOW ${why}`); process.exit(0); };

// ---------- path protection ----------
const PROTECTED = [
  /^\.claude\/factory(\/|$)/, /^\.claude\/settings(\.local)?\.json$/, /^\.claude\/agents(\/|$)/,
  /^\.factory(\/|$)/, /^\.git(\/|$)/, /^\.github\/workflows\/factory\.yml$/, /^\.gitattributes$/,
];
const HOME = os.homedir();
const HOME_DENY = [path.join(HOME, ".claude", "settings.json"), path.join(HOME, ".claude", "settings.local.json"), path.join(HOME, ".gitconfig")];
const OUTSIDE_ALLOW = [os.tmpdir(), path.join(HOME, ".claude", "projects"), path.join(HOME, ".claude", "plans"), path.join(HOME, ".claude", "todos")];

// Strip nested worktree prefixes so a worktree's own kit is protected too.
function projectRel(p, base) {
  let rel = L.relToRoot(p, base);
  while (/^\.claude\/worktrees\/[^/]+\//.test(rel)) rel = rel.replace(/^\.claude\/worktrees\/[^/]+\//, "");
  return rel;
}
function checkWritePath(p, base, tool) {
  if (!p) deny(`${tool}: no file path given`);
  if (HOME_DENY.some((h) => L.normPath(p, base) === L.normPath(h))) deny(`${tool}: user-level Claude/git settings are off limits`);
  if (/factory-audit-[a-z0-9-]+\.key/i.test(p)) deny(`${tool}: factory key is off limits`);
  if (!L.inside(p, L.ROOT, base)) {
    if (OUTSIDE_ALLOW.some((d) => L.inside(p, d, base))) return;
    deny(`${tool}: ${p} is outside this project (${L.ROOT}). Factories never write to other projects.`);
  }
  const rel = projectRel(p, base);
  const unprotect = L.cfg().unprotect ? new RegExp(L.cfg().unprotect) : null;
  if (PROTECTED.some((r) => r.test(rel)) && !(unprotect && unprotect.test(rel))) deny(`${tool}: ${rel} is a protected factory/git file. Changing the factory needs the user.`);
  let dir = path.dirname(path.resolve(base, String(p).replace(/^\/([a-zA-Z])\//, "$1:/")));
  while (!fs.existsSync(dir) && path.dirname(dir) !== dir) dir = path.dirname(dir);
  const br = L.branch(dir);
  if (br === L.cfg().defaultBranch) deny(`${tool}: you are on '${br}'. Create a feature branch or worktree first (git switch -c feat/<name>).`);
}

// ---------- shell command analysis ----------
const SHIP = [
  [/\bgit\b(?:\s+-[cC]\s+(?:"[^"]*"|'[^']*'|\S+)|\s+--?[a-z-]+(?:=\S+)?)*\s+push\b/i, "git push"],
  [/\bgh\s+pr\s+(create|merge|ready)\b/i, "gh pr create/merge/ready"],
  [/\bgh\s+release\b/i, "gh release"],
  [/\bwrangler\s+(deploy|publish|pages\s+deploy|versions\s+(upload|deploy)|rollback)\b(?![^;&|]*--dry-run)/i, "wrangler deploy"],
  [/\bsupabase\s+(db\s+push|functions\s+deploy|link|migration\s+up)\b/i, "supabase deploy"],
  [/\b(npm|pnpm|yarn)\s+publish\b/i, "package publish"],
  [/\b(vercel|netlify)\b.*\b(deploy|--prod)\b/i, "hosted deploy"],
];
const HARD_DENY = [
  [/\bgit\b.*\s--no-verify\b/i, "--no-verify skips the factory's git hooks"],
  [/\bgit\b.*\bcommit\b(?:\s+\S+)*?\s-[a-zA-Z]*n[a-zA-Z]*(\s|$)/, "git commit -n skips hooks"],
  [/hookspath|GIT_CONFIG_(PARAMETERS|GLOBAL|SYSTEM|COUNT|KEY|VALUE)|disableAllHooks/i, "changing git hooks path / git config env / disabling hooks"],
  [/\bgit\b.*\s-c\s+alias\.|\bgit\s+config\b.*\balias\./i, "git command aliases"],
  [/\bgit\s+reset\b.*--hard\b/i, "git reset --hard discards work"],
  [/\bgit\s+clean\b.*\s-[a-z]*f/i, "git clean -f deletes untracked work"],
  [/\bgit\s+(checkout|restore)\s+(--\s+)?\.(\s|$)/i, "discarding all working-tree changes"],
  [/\bgit\s+stash\s+(drop|clear)\b/i, "dropping stashes"],
  [/\bgit\s+(filter-branch|filter-repo|update-ref|replace)\b|\breflog\s+expire\b|\bgc\b.*--prune=now/i, "history rewriting"],
  [/\bgit\s+branch\s+.*-[dD]\b|\bgit\s+push\b.*(--delete|\s:[^\s]+)/i, "deleting branches needs the user"],
  [/\bgit\s+push\b.*(\s-f\b|--force|\s\+\S)/i, "force push"],
  [/\bgh\s+auth\s+(token|logout|refresh|setup-git)\b/i, "GitHub credentials"],
  [/\bgh\s+(repo\s+(delete|edit|rename|archive)|secret|variable|ruleset)\b|\bgh\s+api\b.*\/(protection|rulesets|collaborators|keys|hooks)\b/i, "GitHub settings/credentials need the user"],
  [/\bgh\s+api\b.*(\s-X\s*(?!GET\b)\w+|--method[\s=](?!GET\b)\w+|\s-[fF]\s|--field|--raw-field|\bgraphql\b)/i, "non-GET GitHub API calls"],
  [/factory-audit-[a-z0-9-]*\.key|\.factory[\\/]+audit/i, "factory audit key/tokens are off limits"],
  [/\b(Invoke-Expression|iex)\b|-EncodedCommand\b|\bbase64\s+(-d|--decode)\b.*\|\s*(ba)?sh/i, "encoded/evaluated commands"],
];
const PROTECTED_MENTION = /(\.claude[\\/]+(factory|settings(\.local)?\.json|agents)|\.git[\\/]+(hooks|config)|\.github[\\/]+workflows[\\/]+factory\.yml)/i;
const WRITEY = /(>|\btee\b|\bsed\s+-i|\b(cp|mv|rm|del|ln|touch|truncate|chmod|attrib|copy|move|xcopy|robocopy)\b|\b(Set|Add|Clear)-Content\b|\bOut-File\b|\b(New|Copy|Move|Remove|Rename)-Item\b|\bgit\s+(checkout|restore|rm|mv|apply|am)\b|\b(node|python|py|perl|ruby|deno|bun)\b|\bpowershell\b|\bpwsh\b)/i;
const RUNNER = /\bnode\s+["']?(?:\.\/)?\.claude[\\/]factory[\\/](audit|verify|sandbox|selftest|review|status)\.mjs\b[^;&|>]*/gi;
const EVAL = /\b(node|bun|deno)\s+(-e|-p|--eval|--print|eval)\b|\b(python3?|py)\s+-c\b|\beval\s/i;
const SHIPWORDS = /push|deploy|publish|merge|release|writeToken|hmac|hookspath|factory|\.git\b|settings\.json/i;
const RM_ROOTISH = /^(\/|\/\*|~\/?|~\/\*|\.\.?\/?|\.\.[\\/].*|\*|[a-zA-Z]:[\\/]?\*?|\$HOME[\\/]?\*?|\$\{HOME\}[\\/]?\*?|%USERPROFILE%)$/;

function npmScripts(cwd) {
  try { return JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf8")).scripts || {}; } catch { return {}; }
}
// Expand `npm run x` to its script text (two levels) so wrapped deploys are still gated.
function expandScripts(cmd, cwd) {
  const scripts = npmScripts(cwd);
  let out = cmd;
  for (let i = 0; i < 2; i++)
    out = out.replace(/\b(?:npm|pnpm|yarn)\s+(?:run\s+|run-script\s+)?(?:-s\s+|--silent\s+)?([\w:.-]+)(?!\s*\[)/g, (m, n) => (scripts[n] ? `${m} [${scripts[n]}]` : m));
  return out;
}

function effectiveCwd(cmd, cwd) {
  const m = [...cmd.matchAll(/(?:^|&&|;)\s*cd\s+("[^"]+"|'[^']+'|\S+)/g)].pop();
  const c = [...cmd.matchAll(/\bgit\s+-C\s+("[^"]+"|'[^']+'|\S+)/g)].pop();
  const pick = (c || m)?.[1]?.replace(/^["']|["']$/g, "");
  if (!pick) return cwd;
  const p = path.resolve(cwd, pick.replace(/^\/([a-zA-Z])\//, "$1:/"));
  return fs.existsSync(p) ? p : cwd;
}

function shipGate(what, cwd) {
  const sha = L.head(cwd);
  const v = L.verifyToken(sha, cwd);
  if (!v.ok) deny(`${what} needs a passing factory audit for HEAD ${sha.slice(0, 12)}: ${v.reason}`);
  if (/gh pr/.test(what)) {
    const up = L.git(["rev-parse", "@{u}"], { cwd, check: false });
    if (up !== sha) deny(`${what}: push the audited HEAD first (upstream ${up ? up.slice(0, 12) : "none"} != HEAD ${sha.slice(0, 12)})`);
  }
  L.log("guard", `SHIP-OK ${what} ${sha}`);
}

function depGate(cmd) {
  const m = /\b(npm|pnpm|yarn)\s+(i|install|add)\s+([^;&|]+)/i.exec(cmd) || /\b(pip3?|python\s+-m\s+pip|uv\s+pip)\s+install\s+([^;&|]+)/i.exec(cmd) || /\b(npx|pnpm\s+dlx|bunx|uvx)\s+([^;&|]+)/i.exec(cmd);
  if (!m) return;
  const isPy = /pip|uv\b/.test(m[1]);
  const isX = /npx|dlx|bunx|uvx/.test(m[1]);
  const toks = (m[m.length - 1] || "").trim().split(/\s+/);
  if (isPy && toks.some((t) => t === "-r" || t.startsWith("--requirement"))) return; // requirements files are covered by the audit
  const args = toks.filter((a) => a && !a.startsWith("-") && !/^[./\\~]|:\/\/|^[a-zA-Z]:/.test(a));
  const names = isX ? args.slice(0, 1) : args;
  const lock = (() => { try { return fs.readFileSync(path.join(L.ROOT, "package-lock.json"), "utf8"); } catch { return ""; } })();
  for (const raw of names) {
    const name = isPy ? raw.split(/[<>=!~[]/)[0] : raw.replace(/^(@?[^@]+)@.*$/, "$1");
    if (!name || (!isPy && lock.includes(`"node_modules/${name}"`))) continue;
    if (isX && fs.existsSync(path.join(L.ROOT, "node_modules", ".bin", name))) continue;
    let created;
    if (isPy) {
      const r = spawnSync("python", ["-c", "import json,sys,urllib.request;d=json.load(urllib.request.urlopen('https://pypi.org/pypi/'+sys.argv[1]+'/json',timeout=15));print(min((f['upload_time'] for v in d['releases'].values() for f in v),default=''))", name], { encoding: "utf8", timeout: 25000, windowsHide: true });
      if (r.status !== 0) deny(`pip package '${name}' not found on PyPI (possible hallucinated/slopsquatted name) or registry unreachable`);
      created = r.stdout.trim();
    } else {
      if (!/^(@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(name)) deny(`unexpected package name '${name}'`);
      const r = spawnSync(L.SHELL, ["-c", `npm view '${name}' time.created --json`], { encoding: "utf8", timeout: 25000, windowsHide: true });
      if (r.status !== 0) deny(`npm package '${name}' not found in the registry (possible hallucinated/slopsquatted name) or registry unreachable`);
      try { created = JSON.parse(r.stdout); } catch { created = ""; }
    }
    const age = (Date.now() - Date.parse(created)) / 86400000;
    if (!(age >= 30)) deny(`package '${name}' first published ${Number.isFinite(age) ? Math.floor(age) : "?"} days ago (<30 days); ask the user`);
  }
}

function checkCommand(cmd, cwd, tool) {
  if (typeof cmd !== "string" || !cmd.trim()) deny(`${tool}: empty command`);
  const ecwd = effectiveCwd(cmd, cwd);
  const full = expandScripts(cmd, ecwd);
  for (const [re, why] of HARD_DENY) if (re.test(full)) deny(`${tool}: ${why}.`);
  for (const seg of full.split(/&&|\|\||;|\|/)) {
    const t = seg.trim().split(/\s+/);
    const at = t.findIndex((x) => /^(rm|Remove-Item|rd|rmdir|del)$/i.test(x));
    if (at < 0) continue;
    const rest = t.slice(at + 1);
    const recursive = rest.some((x) => /^-[a-z]*r|^-Recurse$|^\/s$/i.test(x));
    const targets = rest.filter((x) => !x.startsWith("-") && !/^\/[sqf]$/i.test(x)).map((x) => x.replace(/^["']|["']$/g, ""));
    if (recursive && targets.some((x) => RM_ROOTISH.test(x))) deny(`${tool}: recursive delete of a root/home/parent path`);
  }
  const stripped = full.replace(RUNNER, " ");
  if (PROTECTED_MENTION.test(stripped) && WRITEY.test(stripped)) deny(`${tool}: command may modify protected factory/git files`);
  if (/\.claude[\\/]+settings(\.local)?\.json/i.test(stripped) && WRITEY.test(stripped)) deny(`${tool}: command may modify Claude settings`);
  if (EVAL.test(stripped) && SHIPWORDS.test(stripped)) deny(`${tool}: inline-evaluated code touching git/ship/factory; write a reviewed script instead`);
  if (/\bgit\b.*\bcommit\b/i.test(full) && L.branch(ecwd) === L.cfg().defaultBranch)
    deny(`${tool}: committing directly to '${L.cfg().defaultBranch}' is blocked; use a feature branch or worktree`);
  for (const [re, what] of SHIP) if (re.test(full)) shipGate(what, ecwd);
  depGate(full);
}

// ---------- MCP / other tools ----------
const MCP_ALLOW = /^mcp__(hearthbot|ccd_|claude-code-remote|visualize|Claude_Browser|playwright|claude-in-chrome|plugin_ecc_chrome-devtools|d1e572d8)/;
const MCP_ALLOW_DENY = /__(delete|archive|move_to_cloud|set_session_permission_mode|set_remote_control|file_upload|upload_image)/;
const MCP_DENY = /(deploy|migration|merge|secret|env_var|promote|rollback|delete|apply_|publish|push|create_project|pause|restore|execute_sql|share|trash|bash|workbench|proxy_execute|multi_execute|write_file|edit_block|move_file|start_process|interact_with_process|create_directory|run_in_terminal|computer-use|create_branch|reset_branch|rebase_branch|set_app|upload|attach_domain|create_pull|update_file|create_file|copy_file|label|spam|send|draft|create_event|update_event)/i;

async function guard() {
  const inp = L.readStdinJson();
  const tool = inp.tool_name;
  const ti = inp.tool_input || {};
  const cwd = inp.cwd && fs.existsSync(inp.cwd) ? inp.cwd : L.ROOT;
  if (!tool) deny("hook input had no tool_name");
  if (/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(tool)) { checkWritePath(ti.file_path || ti.notebook_path, cwd, tool); return allow(); }
  if (/^(Read|Grep|Glob|LS)$/.test(tool)) {
    if (/factory-audit-[a-z0-9-]*\.key/i.test(String(ti.file_path || ti.path || ti.pattern || ti.glob || ""))) deny(`${tool}: factory key is off limits`);
    return allow();
  }
  if (tool === "Bash" || tool === "PowerShell") { checkCommand(ti.command, cwd, tool); return allow(`${tool} ${String(ti.command).slice(0, 160).replace(/\s+/g, " ")}`); }
  if (tool === "Agent" || tool === "Task") {
    if (ti.isolation === "remote") deny("remote agents run without this project's hooks");
    return allow();
  }
  if (tool === "mcp__terminal__run_in_terminal") { checkCommand(ti.command || ti.text, cwd, tool); return allow(tool); }
  if (tool.startsWith("mcp__")) {
    if (MCP_ALLOW.test(tool) && !MCP_ALLOW_DENY.test(tool)) return allow();
    if (MCP_DENY.test(tool) || MCP_ALLOW_DENY.test(tool)) deny(`${tool} can change things outside the factory gates; ask the user`);
    return allow(tool);
  }
  return allow();
}

// ---------- PostToolUse: per-file fast checks + slop lint + secrets ----------
const SLOP_SRC = [
  [/catch\s*(\([^)]*\))?\s*\{\s*\}/, "empty catch block"],
  [/^\s*except\s*(Exception)?\s*(as\s+\w+)?\s*:\s*(pass)?\s*$/, "bare/blanket except"],
  [/@ts-(ignore|nocheck)\b/, "@ts-ignore/@ts-nocheck"],
  [/eslint-disable/, "eslint-disable"],
  [/#\s*(noqa|type:\s*ignore)\b/, "noqa/type: ignore"],
  [/\|\|\s*true\s*$/, "'|| true' swallows failures"],
  [/catch\s*(\([^)]*\))?\s*\{\s*return\s+(null|undefined|\[\]|\{\}|false)\s*;?\s*\}/, "catch that silently returns a default"],
];
const SLOP_TEST = [
  [/\b(it|test|describe)\.(only|skip|todo|skipIf|runIf|fails)\b|\b(xit|xdescribe|xtest)\s*\(/, "focused/skipped/expected-fail test"],
  [/@pytest\.mark\.(skip|xfail)|@unittest\.skip|\bpytest\.skip\(/, "skipped python test"],
  [/expect\(\s*(true|1|false)\s*\)\.(toBe|toEqual)\(\s*(true|1|false)\s*\)|\bassert\s+True\b|assert\.ok\(\s*true\s*\)/, "tautological assertion"],
];
export const isTest = (rel) => new RegExp(L.cfg().testRegex || "(^|/)(tests?|__tests__|spec)/|\\.(test|spec)\\.[cm]?[jt]sx?$|(^|/)test_[^/]+\\.py$").test(rel);

function addedLines(abs) {
  if (!L.gitOk(["ls-files", "--error-unmatch", "--", abs])) return fs.readFileSync(abs, "utf8").split(/\r?\n/);
  return L.git(["diff", "-U0", "HEAD", "--", abs], { raw: true }).split(/\r?\n/).filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1));
}

async function post() {
  const inp = L.readStdinJson();
  const ti = inp.tool_input || {};
  const p = ti.file_path || ti.notebook_path;
  if (!p) return;
  const abs = path.resolve(inp.cwd || L.ROOT, p);
  if (!fs.existsSync(abs) || !L.inside(abs, L.ROOT)) return;
  const rel = L.relToRoot(abs);
  const problems = [];
  const ext = path.extname(abs).toLowerCase();
  const c = L.cfg();
  if (ext === ".json") { try { JSON.parse(fs.readFileSync(abs, "utf8").replace(/^﻿/, "")); } catch (e) { problems.push(`JSON parse error: ${e.message}`); } }
  const fc = (c.fastChecks || {})[ext];
  if (fc && !(c.fastCheckSkip && new RegExp(c.fastCheckSkip).test(rel))) {
    const r = await L.run(fc.replaceAll("{file}", `"${abs.replace(/\\/g, "/")}"`), { timeoutSec: 90 });
    if (r.code !== 0) problems.push(`fast check failed (${fc.split(" ").slice(0, 3).join(" ")}):\n${L.tail(r.out, 30)}`);
  }
  const rules = [...SLOP_SRC, ...(isTest(rel) ? SLOP_TEST : [])];
  if (!(c.slopSkip && new RegExp(c.slopSkip).test(rel)))
    for (const line of addedLines(abs)) for (const [re, why] of rules) if (re.test(line)) problems.push(`slop: ${why}: "${line.trim().slice(0, 100)}"`);
  if (L.which("gitleaks")) {
    const r = await L.run(`gitleaks dir "${abs.replace(/\\/g, "/")}" --no-banner --redact --exit-code 1`, { timeoutSec: 60 });
    if (r.code === 1) problems.push(`possible secret:\n${L.tail(r.out, 15)}`);
  }
  if (problems.length) {
    L.log("post", `FAIL ${rel} ${problems.length}`);
    process.stderr.write(`software-factory post-edit check failed for ${rel}. Fix these before continuing:\n- ${problems.join("\n- ")}\n`);
    process.exit(2);
  }
  L.log("post", `OK ${rel}`);
}

// ---------- Stop / SubagentStop ----------
function lastTurn(transcript) {
  try {
    const rows = fs.readFileSync(transcript, "utf8").trim().split(/\n/).slice(-400).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    const testRe = new RegExp(L.cfg().testCmdRegex || "test|vitest|pytest|audit\\.mjs|tsc|eslint");
    let lastEdit = -1, lastTest = -1, lastText = "";
    rows.forEach((r, i) => {
      const content = Array.isArray(r.message?.content) ? r.message.content : [];
      for (const c of content) {
        if (c.type === "tool_use" && /^(Edit|Write|MultiEdit|NotebookEdit)$/.test(c.name)) lastEdit = i;
        if (c.type === "tool_use" && /^(Bash|PowerShell)$/.test(c.name) && testRe.test(c.input?.command || "")) lastTest = i;
        if (r.type === "assistant" && c.type === "text") lastText = c.text;
      }
    });
    return { lastEdit, lastTest, lastText };
  } catch { return null; }
}

async function stop() {
  const inp = L.readStdinJson();
  if (inp.stop_hook_active) return;
  const c = L.cfg();
  const dirty = L.dirtyFiles().map((e) => e.slice(3));
  const src = new RegExp(c.sourceRegex || "\\.([cm]?[jt]sx?|py)$");
  const changedSrc = dirty.filter((f) => src.test(f) && !isTest(f));
  const reasons = [];
  const stateFile = path.join(L.STATE_DIR(), "stop", `${String(inp.session_id || "x").replace(/[^\w-]/g, "")}.json`);
  const state = (() => { try { return JSON.parse(fs.readFileSync(stateFile, "utf8")); } catch { return {}; } })();
  if (changedSrc.length && c.stopCheck) {
    const h = crypto.createHash("sha256");
    for (const f of [...dirty].sort()) { h.update(f); try { h.update(fs.readFileSync(path.join(L.ROOT, f))); } catch {} }
    const key = h.digest("hex");
    if (state.passKey !== key) {
      const r = await L.run(c.stopCheck, { timeoutSec: c.stopCheckTimeoutSec || 240 });
      if (r.code !== 0) reasons.push(`stop check failed (${c.stopCheck}):\n${L.tail(r.out, 40)}`);
      else state.passKey = key;
    }
  }
  if (changedSrc.length && !dirty.some(isTest) && !state.warnedNoTests) {
    reasons.push(`source changed (${changedSrc.slice(0, 5).join(", ")}) but no test changed. Add or update a test, or say plainly why none is needed.`);
    state.warnedNoTests = true;
  }
  const t = inp.transcript_path && lastTurn(inp.transcript_path);
  if (t && t.lastEdit >= 0 && t.lastTest < t.lastEdit && /\b(all tests pass|tests pass|verified|works now|fully working|fixed|done|complete)\b/i.test(t.lastText) && !state.warnedClaim) {
    reasons.push("your final message claims success but no test/audit command ran after your last edit. Run the checks and report the real result.");
    state.warnedClaim = true;
  }
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state));
  if (reasons.length) {
    L.log("stop", `BLOCK ${reasons.length}`);
    process.stdout.write(JSON.stringify({ decision: "block", reason: `software-factory stop gate:\n- ${reasons.join("\n- ")}` }));
  }
}

// ---------- SessionStart: integrity alarm + quickstart ----------
async function session() {
  const c = L.cfg();
  const alarms = [];
  const hp = L.git(["config", "--show-origin", "--get-all", "core.hooksPath"], { check: false });
  if (hp) alarms.push(`core.hooksPath is set (${hp}); the factory pre-push hook may be bypassed`);
  const pp = path.join(L.commonGitDir(), "hooks", "pre-push");
  if (c.prePush !== false && !(fs.existsSync(pp) && fs.readFileSync(pp, "utf8").includes("software-factory"))) alarms.push("pre-push hook missing; run node .claude/factory/install.mjs");
  for (const f of [path.join(L.ROOT, ".claude", "settings.local.json"), ...HOME_DENY.slice(0, 2)])
    try { if (/"disableAllHooks"\s*:\s*true/.test(fs.readFileSync(f, "utf8"))) alarms.push(`${f} disables all hooks`); } catch {}
  let br = "?"; try { br = L.branch(); } catch {}
  L.log("session", alarms.length ? `ALARMS ${alarms.join(" | ")}` : "ok");
  process.stdout.write([
    `[software-factory:${c.name}] branch=${br} ports=${JSON.stringify(c.ports)}. Read .claude/factory/README.md. Pipeline: planner -> builder (worktree) -> audit (node .claude/factory/audit.mjs) -> reviewer -> blind-qa -> ship. Push/PR/deploy are blocked until the audit passes for HEAD.`,
    ...alarms.map((a) => `FACTORY ALARM: ${a}`),
  ].join("\n") + "\n");
}

export async function main(mode) {
  if (mode === "guard") return guard();
  if (mode === "post") return post();
  if (mode === "stop") return stop();
  if (mode === "session") return session();
  throw new Error(`unknown hook mode ${mode}`);
}
