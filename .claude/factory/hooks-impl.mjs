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
    if (OUTSIDE_ALLOW.some((d) => L.inside(p, d, base))) {
      // A worktree or clone in temp still carries a kit: keep its factory, settings, agents and git files protected.
      if (/[\\/](\.claude[\\/](factory|agents)[\\/]|\.claude[\\/]settings(\.local)?\.json$|\.git[\\/]|\.factory[\\/]|\.gitattributes$)/i.test(L.normPath(p, base))) deny(`${tool}: ${p} is a protected factory/git file, even outside the project`);
      return;
    }
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
  [/\bgh\s+pr\s+(create|ready)\b/i, "gh pr create/ready"],
  [/\bgh\s+pr\s+merge\b/i, "gh pr merge"],
  [/\bgh\s+release\b/i, "gh release"],
  [/\bwrangler\b(?![^;&|]*--dry-run)[^;&|]*\b(deploy|publish|upload|rollback|secret|delete)\b/i, "wrangler deploy"],
  [/\bsupabase\b[^;&|]*\b(db\s+push|deploy|link|migration\s+up|secrets|db\s+reset)\b/i, "supabase deploy"],
  [/\b(npm|pnpm|yarn)\s+publish\b/i, "package publish"],
  [/\b(vercel|netlify)\b.*\b(deploy|--prod)\b/i, "hosted deploy"],
];
const HARD_DENY = [
  [/\bgit\b.*\s--no-verify\b/i, "--no-verify skips the factory's git hooks"],
  [/\bgit\b.*\bcommit\b(?:\s+\S+)*?\s-[a-zA-Z]*n[a-zA-Z]*(\s|$)/, "git commit -n skips hooks"],
  [/hookspath|GIT_CONFIG_(PARAMETERS|GLOBAL|SYSTEM|COUNT|KEY|VALUE)|disableAllHooks/i, "changing git hooks path / git config env / disabling hooks"],
  [/\bgit\b.*\s-c\s+alias\.|\bgit\s+config\b.*\balias\./i, "git command aliases"],
  [/\bgit\s+reset\b.*--(hard|keep|merge)\b/i, "git reset --hard/--keep/--merge discards work"],
  [/\bgit\s+checkout\b[^;&|]*\s--(\s|$)/i, "git checkout -- <path> discards working-tree changes"],
  [/\bgit\s+restore\b(?![^;&|]*--staged)/i, "git restore <path> discards working-tree changes (use --staged to unstage)"],
  [/\bgit\s+clean\b.*\s-[a-z]*f/i, "git clean -f deletes untracked work"],
  [/\bgit\s+(checkout|restore)\s+(--\s+)?\.(\s|$)/i, "discarding all working-tree changes"],
  [/\bgit\s+stash\s+(drop|clear)\b/i, "dropping stashes"],
  [/\bgit\s+(filter-branch|filter-repo|update-ref|replace)\b|\breflog\s+expire\b|\bgc\b.*--prune=now/i, "history rewriting"],
  [/\bgit\s+branch\s+.*-[dD]\b|\bgit\s+push\b.*(--delete|\s:[^\s]+)/i, "deleting branches needs the user"],
  [/\bgit\s+push\b.*(\s-f\b|--force|\s\+\S)/i, "force push"],
  [/\bgh\s+auth\s+(token|logout|refresh|setup-git)\b/i, "GitHub credentials"],
  [/\bgh\s+(repo\s+(delete|edit|rename|archive)|secret|variable|ruleset)\b|\bgh\s+api\b.*\/(protection|rulesets|collaborators|keys|hooks)\b/i, "GitHub settings/credentials need the user"],
  [/\bgh\s+api\b.*(\s-X\s*(?!GET\b)\w+|--method[\s=](?!GET\b)\w+|\s-[fF]\s|--field|--raw-field|--input\b|\bgraphql\b)/i, "non-GET GitHub API calls"],
  [/\.git[\\/]+[^\s"';&|]*(\*|\?|\[|\.key\b)|--git-common-dir/i, "globbing .git or reading key files inside it is off limits"],
  [/factory-audit|\.factory[\\/]+(audit|review)\b/i,"factory audit key, tokens and review records are off limits"],
  [/(^|[;&|]\s*)\$\{?\w+\}?\s+push\b|\beval\b.*\bpush\b/i, "indirect git invocation"],
  [/\b(Invoke-Expression|iex)\b|-EncodedCommand\b|\bbase64\s+(-d|--decode)\b.*\|\s*(ba)?sh/i, "encoded/evaluated commands"],
];
// Matches protected names even when reached via `cd .claude && ... factory/x` (no full path in the command).
const PROTECTED_MENTION = /(\.claude\b|\.factory\b|\bfactory[\\/]|factory\.json|hooks-impl|hook\.mjs|settings(\.local)?\.json|\bagents[\\/]|\.git[\\/]+(hooks|config)|pre-push|\.github[\\/]+workflows[\\/]+factory\.yml|\.gitattributes)/i;
const WRITEY = /(>|\btee\b|\bsed\s+-i|\b(cp|mv|rm|del|ln|touch|truncate|chmod|attrib|copy|move|xcopy|robocopy)\b|\b(Set|Add|Clear)-Content\b|\bOut-File\b|\b(New|Copy|Move|Remove|Rename)-Item\b|\bgit\s+(checkout|restore|rm|mv|apply|am)\b|\b(node|python|py|perl|ruby|deno|bun)\b|\bpowershell\b|\bpwsh\b)/i;
const RUNNER = /\bnode\s+["']?(?:\.\/)?\.claude[\\/]factory[\\/](audit|verify|sandbox|selftest|review|status)\.mjs\b[^;&|>]*/gi;
const EVAL = /\b(node|bun|deno)\s+(-e|-p|--eval|--print|eval)\b|\b(python3?|py)\s+-c\b|\beval\s/i;
const SHIPWORDS = /push|deploy|publish|merge|release|writeToken|hmac|hookspath|factory|\.git\b|settings\.json/i;
const RM_ROOTISH = /^(\/|\/\*|\/[a-zA-Z]\/?\*?|~\/?|~\/\*|\.\.?\/?|\.\.[\\/].*|\*|[a-zA-Z]:[\\/]?\*?|\$HOME[\\/]?\*?|\$\{HOME\}[\\/]?\*?|%USERPROFILE%)$/;

function npmScripts(cwd) {
  try { return JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf8")).scripts || {}; } catch { return {}; }
}
// Expand `npm run x` to its script text (two levels) so wrapped deploys are still gated.
function expandScripts(cmd, cwd) {
  const scripts = npmScripts(cwd);
  let out = cmd;
  for (let i = 0; i < 2; i++)
    out = out.replace(/\b(?:npm|pnpm|yarn)\s+(?:run\s+|run-script\s+)?(?:-s\s+|--silent\s+)?([\w:.-]+)(?!\s*\[)/g, (m, n) => (scripts[n] ? `${m} [${scripts[n]}]` : m));
  return expandFiles(out, cwd);
}
// Inline the text of script files a command runs (bash x.sh, node x.mjs, ./x, . x, pwsh -File x.ps1), two levels,
// so `git push --no-verify` hidden in a self-written script is still seen. Kit runners are skipped (they are trusted).
const SCRIPT_REF = /(?:\b(?:bash|sh|zsh|source|node|deno\s+run|bun|python3?|py|perl|ruby|pwsh|powershell)(?:\.exe)?(?:\s+-(?:File|ExecutionPolicy\s+\S+|NoProfile|\w))*\s+|(?:^|[;&|]\s*)\.\s+|(?:^|[;&|(]\s*)(?=\.{1,2}\/))("[^"]+"|'[^']+'|[^\s;&|()<>]+)/g;
function expandFiles(cmd, cwd, depth = 0) {
  if (depth > 1) return cmd;
  const seen = new Set();
  return cmd.replace(SCRIPT_REF, (m, f) => {
    const name = String(f).replace(/^["']|["']$/g, "");
    if (/(^|[\\/])\.claude[\\/]factory[\\/]/.test(name) || seen.has(name)) return m;
    seen.add(name);
    let p;
    try { p = path.resolve(cwd, name.replace(/^\/([a-zA-Z])\//, "$1:/")); if (!fs.statSync(p).isFile()) return m; } catch { return m; } // not a file: nothing to inline
    const txt = fs.readFileSync(p, "utf8").slice(0, 65536);
    return `${m} [file: ${expandFiles(txt, path.dirname(p), depth + 1)}]`;
  });
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
  // Waiver trailers are self-written, so waived work may be pushed for review but never merged by an agent.
  if (/merge|release|deploy|publish/i.test(what) && (v.token.waivers || []).length) deny(`${what}: the audit for ${sha.slice(0, 12)} used waivers (${v.token.waivers.join("; ")}); only the owner can merge or ship waived work`);
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
  const t0 = Date.now();
  for (const raw of names) {
    // Each lookup blocks up to 25s; stay inside the 50s hook watchdog by checking at most one more after 20s.
    if (Date.now() - t0 > 20000) deny("too many new packages to verify in one command; install them a few at a time");
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
  // Match on the expanded text and on a de-obfuscated copy (quotes/backslashes/.exe stripped: gi''t, git.exe, g\it).
  const exp = expandScripts(cmd, ecwd);
  const full = `${exp}\n${exp.replace(/["'`\\]/g, "").replace(/\.exe\b/gi, "")}`;
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
const MCP_ALLOW = /^mcp__(hearthbot__|visualize__|Claude_Browser__|playwright__|claude-in-chrome__|plugin_ecc_chrome-devtools__|d1e572d8[^_]*__|ccd_session__mark_chapter$|ccd_view__)/;
const MCP_ALLOW_DENY = /__(delete|archive|move_to_cloud|set_session_permission_mode|set_remote_control|file_upload|upload_image)/;
const MCP_DENY = /(deploy|migration|merge|secret|env_var|promote|rollback|delete|apply_|publish|push|create_project|pause|restore|execute_sql|share|trash|bash|workbench|proxy_execute|multi_execute|write_file|edit_block|move_file|start_process|interact_with_process|create_directory|run_in_terminal|computer-use|create_branch|reset_branch|rebase_branch|set_app|upload|attach_domain|create_pull|update_file|create_file|copy_file|label|spam|send|draft|create_event|update_event)/i;

// Per-agent limits, keyed on the hook input's agent_type (set inside subagents). Main session: no agent_type, no limits here.
const READ_ONLY_ROLES = new Set(["reviewer", "scout", "blind-qa"]);
const SHELL_WRITES = /((?<![2&])>(?!>?\s*(&\d|\/dev\/null\b|\$null\b|nul\b))|\btee\b|\bsed\s+-i|\b(cp|mv|rm|del|ln|touch|truncate|chmod|mkdir|copy|move|xcopy|robocopy)\b|\b(Set|Add|Clear)-Content\b|\bOut-File\b|\b(New|Copy|Move|Remove|Rename)-Item\b|\bgit\s+(add|commit|push|merge|rebase|reset|checkout|switch|stash|apply|am|cherry-pick|tag)\b|\bnpm\s+(i|install|add|uninstall)\b)/i;
const SOURCE_READS = /\b(cat|head|less|more|grep|rg|sed|awk|type|Get-Content|Select-String|find|ls|dir|tree)\b|\bgit\s+(diff|show|log|blame|grep|ls-files|cat-file)\b/i;
function roleGate(role, tool, ti) {
  if (!role) return;
  const cmd = String(ti.command || ti.text || "").replace(RUNNER, " ");
  const shell = /^(Bash|PowerShell|mcp__terminal__run_in_terminal)$/.test(tool);
  const edit = /^(Edit|Write|MultiEdit|NotebookEdit)$/.test(tool);
  if (READ_ONLY_ROLES.has(role)) {
    if (edit) deny(`${role} is read-only: ${tool} is not allowed`);
    if (shell && SHELL_WRITES.test(cmd)) deny(`${role} is read-only: that command writes or changes git state`);
  }
  if (role === "blind-qa") {
    if (/^(Read|Grep|Glob|LS)$/.test(tool) || (shell && SOURCE_READS.test(cmd))) deny("blind-qa tests through the running app only: reading source, diffs or listings is not allowed");
  }
  if (role === "planner") {
    if (edit && !/^(docs|specs?)\//.test(projectRel(ti.file_path || ti.notebook_path || "", L.ROOT))) deny("planner writes specs only, under docs/ or specs/");
    if (shell && SHELL_WRITES.test(cmd)) deny("planner writes specs only; shell writes and git changes are not allowed");
  }
}

async function guard() {
  const inp = L.readStdinJson();
  const tool = inp.tool_name;
  const ti = inp.tool_input || {};
  const cwd = inp.cwd && fs.existsSync(inp.cwd) ? inp.cwd : L.ROOT;
  if (!tool) deny("hook input had no tool_name");
  roleGate(String(inp.agent_type || "").replace(/^.*:/, ""), tool, ti);
  if (/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(tool)) { checkWritePath(ti.file_path || ti.notebook_path, cwd, tool); return allow(); }
  if (/^(Read|Grep|Glob|LS)$/.test(tool)) {
    const target = [ti.file_path, ti.path, ti.pattern, ti.glob].filter(Boolean).join(" ");
    if (/factory-audit|(^|[\\/\s])\.git([\\/]|\s|$)/i.test(target)) deny(`${tool}: the .git directory and factory key are off limits to file tools; use git commands`);
    return allow();
  }
  if (tool === "Bash" || tool === "PowerShell") { checkCommand(ti.command, cwd, tool); return allow(`${tool} ${String(ti.command).slice(0, 160).replace(/\s+/g, " ")}`); }
  if (tool === "Agent" || tool === "Task") {
    if (ti.isolation === "remote") deny("remote agents run without this project's hooks");
    return allow();
  }
  if (tool === "mcp__terminal__run_in_terminal") { checkCommand(ti.command || ti.text, cwd, tool); return allow(tool); }
  if (tool.startsWith("mcp__")) {
    // Default deny: only the allowlisted servers, plus read-only verbs on any server.
    if (MCP_ALLOW_DENY.test(tool) || MCP_DENY.test(tool.replace(/^mcp__(Claude_Browser|playwright|claude-in-chrome|plugin_ecc_chrome-devtools)__.*/, "")))
      deny(`${tool} can change things outside the factory gates; ask the user`);
    if (MCP_ALLOW.test(tool) || /__(get|list|read|search|query|fetch|find|describe|whoami|status|resolve|view)[a-z_-]*$/i.test(tool)) return allow();
    deny(`${tool} is not on this factory's MCP allowlist; ask the user`);
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

// ---------- PostToolUse(shell): undo any tampering with the factory that slipped past the guard ----------
const KIT_PATHS = [".claude/factory", ".claude/settings.json", ".claude/agents", ".gitattributes"];
async function postShell() {
  L.readStdinJson();
  const c = L.cfg();
  const unprotect = c.unprotect ? new RegExp(c.unprotect) : null;
  const changed = L.git(["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", ...KIT_PATHS], { raw: true })
    .split("\0").filter(Boolean).map((e) => ({ st: e.slice(0, 2), f: e.slice(3) })).filter(({ f }) => !(unprotect && unprotect.test(f)));
  const notes = [];
  if (changed.length) {
    const tracked = changed.filter((x) => x.st !== "??").map((x) => x.f);
    if (tracked.length) L.git(["checkout", "HEAD", "--", ...tracked]);
    for (const x of changed.filter((x) => x.st === "??")) fs.rmSync(path.join(L.ROOT, x.f), { force: true, recursive: true });
    notes.push(`protected factory files were changed and have been restored from HEAD: ${changed.map((x) => x.f).join(", ")}`);
  }
  const pp = path.join(L.commonGitDir(), "hooks", "pre-push");
  if (c.prePush !== false && !(fs.existsSync(pp) && fs.readFileSync(pp, "utf8").includes("software-factory"))) {
    const r = spawnSync(process.execPath, [path.join(L.FACTORY_DIR, "install.mjs")], { cwd: L.ROOT, encoding: "utf8", windowsHide: true });
    notes.push(`the pre-push gate was missing or altered and was reinstalled (exit ${r.status})`);
  }
  const hp = L.git(["config", "--get-all", "core.hooksPath"], { check: false });
  if (hp) notes.push(`core.hooksPath is set to ${hp}; this disables the pre-push gate. Tell the user.`);
  if (notes.length) {
    L.log("guard", `TAMPER ${notes.join(" | ")}`);
    process.stderr.write(`software-factory: ${notes.join("\n")}\nDo not modify the factory; ask the user.\n`);
    process.exit(2);
  }
}

export async function main(mode) {
  if (mode === "postshell") return postShell();
  if (mode === "guard") return guard();
  if (mode === "post") return post();
  if (mode === "stop") return stop();
  if (mode === "session") return session();
  throw new Error(`unknown hook mode ${mode}`);
}
