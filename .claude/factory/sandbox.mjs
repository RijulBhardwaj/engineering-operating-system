// Boot the project in a throwaway process on a port from this project's range, smoke it, tear it down.
// CLI: node .claude/factory/sandbox.mjs up | smoke | down | status
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as L from "./lib.mjs";

const stateFile = () => path.join(L.STATE_DIR(), "sandbox", "state.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readState = () => { try { return JSON.parse(fs.readFileSync(stateFile(), "utf8")); } catch { return null; } };

export async function up() {
  const sb = L.cfg().sandbox;
  if (!sb) throw new Error("no sandbox configured for this project");
  const old = readState();
  if (old) await down();
  const port = await L.pickPort();
  const cmd = sb.start.replaceAll("{PORT}", String(port));
  fs.mkdirSync(path.dirname(stateFile()), { recursive: true });
  const logFd = fs.openSync(path.join(path.dirname(stateFile()), "server.log"), "w");
  // Git Bash spawned directly by node: child.pid is a real Windows pid, so taskkill /T takes its whole tree.
  const child = spawn(L.SHELL, ["-c", cmd], { cwd: path.join(L.ROOT, sb.cwd || "."), detached: true, windowsHide: true, stdio: ["ignore", logFd, logFd], env: { ...process.env, ...(sb.env || {}), PORT: String(port), BROWSER: "none" } });
  child.unref();
  const url = `http://127.0.0.1:${port}`;
  const st = { pid: child.pid, port, url, cmd, startedAt: new Date().toISOString() };
  fs.writeFileSync(stateFile(), JSON.stringify(st, null, 2));
  const deadline = Date.now() + (sb.bootTimeoutSec || 60) * 1000;
  let last = "";
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url + (sb.health || "/"), { signal: AbortSignal.timeout(3000) });
      if (r.status < 500) return st;
      last = `HTTP ${r.status}`;
    } catch (e) { last = e.cause?.code || e.message; }
    await sleep(500);
  }
  const log = (() => { try { return fs.readFileSync(path.join(path.dirname(stateFile()), "server.log"), "utf8"); } catch { return ""; } })();
  await down();
  throw new Error(`sandbox did not become healthy on ${url}${sb.health || "/"} (${last}).\n${L.tail(log, 25)}`);
}

export async function smoke() {
  const st = readState();
  if (!st) throw new Error("sandbox not running");
  const results = [];
  for (const s of L.cfg().sandbox.smoke || []) {
    const r = { path: s.path, ok: false };
    try {
      const res = await fetch(st.url + s.path, { method: s.method || "GET", signal: AbortSignal.timeout(10000) });
      const body = await res.text();
      r.status = res.status;
      r.ok = res.status === (s.status || 200) && (!s.contains || body.includes(s.contains)) && (!s.notContains || !body.includes(s.notContains));
      if (!r.ok) r.note = `expected ${s.status || 200}${s.contains ? ` containing "${s.contains}"` : ""}; got ${res.status}${s.contains && !body.includes(s.contains) ? " without it" : ""}`;
    } catch (e) { r.note = e.message; }
    results.push(r);
  }
  return results;
}

export async function down() {
  const st = readState();
  if (!st) return { freed: true };
  L.killTree(st.pid);
  let freed = false;
  for (let i = 0; i < 40 && !freed; i++) { freed = await L.portFree(st.port); if (!freed) await sleep(250); }
  // Git Bash re-parents grandchildren (e.g. vite), so /T misses them; the port was free at `up`, so its listener is ours.
  if (!freed) { for (const pid of L.portOwners(st.port)) L.killTree(pid);
    for (let i = 0; i < 40 && !freed; i++) { freed = await L.portFree(st.port); if (!freed) await sleep(250); } }
  fs.rmSync(stateFile(), { force: true });
  if (!freed) throw new Error(`port ${st.port} still in use after teardown (orphan process)`);
  return { freed, port: st.port };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cmd = process.argv[2] || "status";
  try {
    if (cmd === "up") { const s = await up(); console.log(`sandbox up: ${s.url} (pid ${s.pid})`); }
    else if (cmd === "smoke") { const r = await smoke(); console.log(JSON.stringify(r, null, 2)); process.exit(r.every((x) => x.ok) ? 0 : 1); }
    else if (cmd === "down") { const r = await down(); console.log(`sandbox down; port ${r.port ?? "-"} free=${r.freed}`); }
    else console.log(JSON.stringify(readState() || { running: false }));
  } catch (e) { console.error(`sandbox ${cmd} failed: ${e.message}`); process.exit(1); }
}
