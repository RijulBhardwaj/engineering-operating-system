// Software factory helpers. A copy lives in each project; it never reads outside its project
// except the git common dir (for worktrees) and the host's tool binaries.
import { spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const FACTORY_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(FACTORY_DIR, "..", "..");
const CFG_PATH = path.join(FACTORY_DIR, "factory.json");

let _cfg;
export function cfg() {
  if (_cfg) return _cfg;
  const raw = fs.readFileSync(CFG_PATH, "utf8").replace(/^\uFEFF/, "");
  const c = JSON.parse(raw);
  if (!c.name || !/^[a-z0-9-]+$/.test(c.name)) throw new Error("factory.json: name must be kebab-case");
  if (!c.defaultBranch) throw new Error("factory.json: defaultBranch required");
  if (c.ports !== null && !(Array.isArray(c.ports) && c.ports.length === 2 && c.ports.every(Number.isInteger) && c.ports[0] <= c.ports[1]))
    throw new Error("factory.json: ports must be [lo, hi] integers or null");
  if (!Array.isArray(c.audit)) throw new Error("factory.json: audit must be an array");
  _cfg = c;
  return c;
}
export function cfgHash() { return crypto.createHash("sha256").update(fs.readFileSync(CFG_PATH)).digest("hex"); }

export const STATE_DIR = (cwd = ROOT) => path.join(cwd, ".factory");
export function log(name, line, cwd = ROOT) {
  try {
    fs.mkdirSync(STATE_DIR(cwd), { recursive: true });
    fs.appendFileSync(path.join(STATE_DIR(cwd), `${name}.log`), `${new Date().toISOString()} ${line}\n`);
  } catch {}
}

// raw=true keeps leading whitespace (porcelain status needs it).
export function git(args, { cwd = ROOT, check = true, raw = false } = {}) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
  if (check && r.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${(r.stderr || "").trim()}`);
  const out = r.stdout || "";
  return raw ? out : out.trim();
}
export const gitOk = (args, cwd = ROOT) => spawnSync("git", args, { cwd, windowsHide: true, stdio: "ignore" }).status === 0;

export function commonGitDir(cwd = ROOT) { return path.resolve(cwd, git(["rev-parse", "--git-common-dir"], { cwd })); }
export function head(cwd = ROOT) { return git(["rev-parse", "HEAD"], { cwd }); }

// Fails closed: detached HEAD or git failure throws instead of returning "".
export function branch(cwd = ROOT) {
  const b = git(["symbolic-ref", "-q", "--short", "HEAD"], { cwd, check: false });
  if (!b) throw new Error(`cannot determine branch in ${cwd} (detached HEAD?)`);
  return b;
}

export function dirtyFiles(cwd = ROOT) {
  const out = git(["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", "."], { cwd, raw: true });
  return out.split("\0").filter(Boolean).filter((e) => !/^.. \.factory\//.test(e));
}

// Base for diff-scoped checks. Fails rather than silently auditing an empty range.
export function mergeBase(cwd = ROOT) {
  const c = cfg();
  const refs = c.baseRef ? [c.baseRef] : [`origin/${c.defaultBranch}`, c.defaultBranch];
  for (const ref of refs) {
    if (!gitOk(["rev-parse", "--verify", "-q", ref], cwd)) continue;
    const b = git(["merge-base", "HEAD", ref], { cwd, check: false });
    if (b) return b;
  }
  throw new Error(`no merge-base with ${refs.join(" / ")}; set baseRef in factory.json`);
}

function keyPath(cwd = ROOT) { return path.join(commonGitDir(cwd), `factory-audit-${cfg().name}.key`); }
export function ensureKey(cwd = ROOT) {
  const p = keyPath(cwd);
  if (!fs.existsSync(p)) fs.writeFileSync(p, crypto.randomBytes(32).toString("hex"), { mode: 0o600 });
  return fs.readFileSync(p, "utf8").trim();
}
const canon = (o) => JSON.stringify(o, (k, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((x) => [x, v[x]])) : v));
const mac = (key, body) => crypto.createHmac("sha256", key).update(canon(body)).digest("hex");

export function tokenPath(sha, cwd = ROOT) { return path.join(STATE_DIR(cwd), "audit", `${sha}.json`); }
export function writeToken(body, cwd = ROOT) {
  const p = tokenPath(body.sha, cwd);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify({ ...body, hmac: mac(ensureKey(cwd), body) }, null, 2));
  return p;
}

// The HMAC detects accidental/stale tokens; it is not proof against a process running as the user.
export function verifyToken(sha, cwd = ROOT, { requireHead = true, requireClean = true } = {}) {
  const p = tokenPath(sha, cwd);
  if (!fs.existsSync(p)) return { ok: false, reason: `no audit token for ${sha.slice(0, 12)}; run: node .claude/factory/audit.mjs` };
  let tok;
  try { tok = JSON.parse(fs.readFileSync(p, "utf8")); } catch { return { ok: false, reason: "audit token unreadable" }; }
  const { hmac, ...body } = tok;
  const kp = keyPath(cwd);
  if (!fs.existsSync(kp)) return { ok: false, reason: "factory key missing; run: node .claude/factory/install.mjs" };
  const want = Buffer.from(mac(fs.readFileSync(kp, "utf8").trim(), body), "hex");
  const got = typeof hmac === "string" && /^[0-9a-f]{64}$/.test(hmac) ? Buffer.from(hmac, "hex") : Buffer.alloc(0);
  if (got.length !== want.length || !crypto.timingSafeEqual(got, want)) return { ok: false, reason: "audit token signature invalid (tampered or stale key)" };
  if (body.sha !== sha) return { ok: false, reason: "audit token sha mismatch" };
  if (body.cfgHash !== cfgHash()) return { ok: false, reason: "factory.json changed since audit" };
  if (requireHead && head(cwd) !== sha) return { ok: false, reason: "HEAD moved since audit; re-run audit" };
  if (requireClean && dirtyFiles(cwd).length) return { ok: false, reason: "working tree not clean" };
  const byId = new Map((body.steps || []).map((s) => [s.id, s]));
  const missing = cfg().audit.filter((s) => s.required !== false && byId.get(s.id)?.status !== "pass").map((s) => s.id);
  for (const fixed of ["clean-tree", "factory-integrity", "test-tamper", "gitleaks", "sandbox"])
    if (byId.get(fixed)?.status === "fail" || (fixed !== "sandbox" && byId.get(fixed)?.status !== "pass") || (fixed === "sandbox" && cfg().sandbox && byId.get(fixed)?.status !== "pass")) missing.push(fixed);
  if (missing.length || body.result !== "pass") return { ok: false, reason: `audit did not pass: ${missing.join(", ") || body.result}` };
  return { ok: true, reason: "audit token valid", token: body };
}

// Throws on empty/invalid stdin so the caller fails closed.
export function readStdinJson() {
  const s = fs.readFileSync(0, "utf8").replace(/^\uFEFF/, "");
  if (!s.trim()) throw new Error("hook received empty stdin");
  return JSON.parse(s);
}

const GIT_BASH = ["C:/Program Files/Git/bin/bash.exe", "C:/Program Files (x86)/Git/bin/bash.exe"].find((p) => fs.existsSync(p));
export const SHELL = process.platform === "win32" ? GIT_BASH : "/bin/bash";

// Runs a bash command (Git Bash on Windows); kills the whole tree on timeout.
export function run(cmd, { cwd = ROOT, timeoutSec = 600, env } = {}) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    if (!SHELL) return resolve({ code: 127, out: "Git Bash not found", ms: 0 });
    const child = spawn(SHELL, ["-c", cmd], { cwd, windowsHide: true, env: { ...process.env, ...env } });
    let out = "";
    const add = (d) => { out += d; if (out.length > 4_000_000) out = out.slice(-2_000_000); };
    child.stdout.on("data", add); child.stderr.on("data", add);
    let timedOut = false;
    const t = setTimeout(() => { timedOut = true; killTree(child.pid); }, timeoutSec * 1000);
    child.on("close", (code) => { clearTimeout(t); resolve({ code: timedOut ? 124 : code ?? 1, out, ms: Date.now() - t0, timedOut }); });
    child.on("error", (e) => { clearTimeout(t); resolve({ code: 127, out: String(e), ms: Date.now() - t0 }); });
  });
}

export function which(bin) {
  const r = spawnSync(process.platform === "win32" ? "where" : "which", [bin], { encoding: "utf8", windowsHide: true });
  return r.status === 0 ? r.stdout.split(/\r?\n/)[0].trim() : null;
}

export const tail = (s, n = 40) => s.split(/\r?\n/).filter(Boolean).slice(-n).join("\n");

export function canBind(port, host) {
  return new Promise((res) => {
    const s = net.createServer().once("error", (e) => res(e.code === "EADDRNOTAVAIL" || e.code === "EAFNOSUPPORT"))
      .once("listening", () => s.close(() => res(true)));
    s.listen(port, host);
  });
}
export async function portFree(port) { return (await canBind(port, "127.0.0.1")) && (await canBind(port, "::1")) && (await canBind(port, "0.0.0.0")); }
export async function pickPort() {
  const p = cfg().ports;
  if (!p) throw new Error("project has no port range");
  for (let x = p[0]; x <= p[1]; x++) if (await portFree(x)) return x;
  throw new Error(`no free port in ${p[0]}-${p[1]}`);
}

export function killTree(pid) {
  if (!pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
  else { try { process.kill(-pid, "SIGKILL"); } catch { try { process.kill(pid, "SIGKILL"); } catch {} } }
}

// --- paths: Windows-aware, case-insensitive, Git Bash style, ~, trailing dots/spaces, ADS
export function normPath(p, base = ROOT) {
  let s = String(p).trim().replace(/^["']|["']$/g, "");
  if (s.startsWith("~")) s = path.join(process.env.USERPROFILE || process.env.HOME || "", s.slice(1));
  const m = /^\/([a-zA-Z])(\/|$)/.exec(s);
  if (process.platform === "win32" && m) s = `${m[1]}:/${s.slice(3)}`;
  if (process.platform === "win32" && /^[a-zA-Z]:.*:/.test(s)) throw new Error(`path with stream/colon denied: ${p}`);
  let abs = path.resolve(base, s);
  abs = abs.split(path.sep).map((seg, i) => (i === 0 ? seg : seg.replace(/[. ]+$/, ""))).join(path.sep);
  let probe = abs; const rest = [];
  while (!fs.existsSync(probe) && path.dirname(probe) !== probe) { rest.unshift(path.basename(probe)); probe = path.dirname(probe); }
  try { abs = path.join(fs.realpathSync.native(probe), ...rest); } catch {}
  return process.platform === "win32" ? abs.toLowerCase() : abs;
}
export function inside(p, dir, base = ROOT) {
  const d = normPath(dir), a = normPath(p, base);
  return a === d || a.startsWith(d + path.sep);
}
export function relToRoot(p, base = ROOT) { return path.relative(normPath(ROOT), normPath(p, base)).split(path.sep).join("/"); }
