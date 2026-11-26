// Independent adversarial review of base..HEAD by a different model than the builder.
// Sees only the diff and changed specs (never the author's summary). Hooks are disabled in the child
// to avoid recursion; it runs in an empty temp dir with every tool denied.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as L from "./lib.mjs";

const c = L.cfg();
const sha = L.head();
const base = L.mergeBase();
const model = c.review?.model || "opus";
const diff = L.git(["diff", "-U5", `${base}..HEAD`, "--", ".", ":(exclude)package-lock.json", ":(exclude)*.lock", ":(exclude)dist/**"], { raw: true });
const specs = L.git(["diff", "--name-only", `${base}..HEAD`, "--", "docs/factory/specs"]).split("\n").filter(Boolean).map((f) => `--- ${f}\n${fs.readFileSync(path.join(L.ROOT, f), "utf8")}`).join("\n");
const MAX = 180_000;
// Fallback when headless `claude -p` is unavailable: record the JSON reply of the in-session `reviewer`
// subagent (spawned by the orchestrator, opus, read-only). Attested by the orchestrator, so it is marked as such.
if (process.argv[2] === "--record") {
  const f = process.argv[3];
  let j;
  try { j = JSON.parse(fs.readFileSync(f, "utf8").replace(/^﻿/, "")); } catch (e) { console.error(`--record needs a JSON file: ${e.message}`); process.exit(1); }
  if (!Array.isArray(j.findings) || !j.findings.every((x) => x && typeof x.title === "string" && /^(high|medium|low|critical)$/i.test(x.severity || ""))) { console.error("findings must be [{severity, title, ...}]"); process.exit(1); }
  write({ model: `reviewer-agent (${process.argv[4] || "opus"}, recorded)`, attested: true, findings: j.findings });
  console.log(`recorded ${j.findings.length} findings for ${sha.slice(0, 12)}`);
  process.exit(0);
}
if (!diff.trim()) { write({ model, findings: [], note: "empty diff" }); process.exit(0); }
if (diff.length > MAX) { console.error(`diff is ${diff.length} chars (> ${MAX}); split the change before review`); process.exit(1); }

const prompt = `You are an adversarial senior reviewer for the project "${c.name}". You did not write this code and must not trust it.
Review ONLY the diff below for: correctness and edge cases (null/empty, off-by-one, races, error paths), security (injection, XSS, authz, secrets, unsafe deserialisation, SSRF, permissive CORS), test cheating (weakened/removed assertions, special-casing test inputs, mocks that make tests meaningless, skipped tests), silent failure (swallowed errors, catch-and-return-default), dead or duplicated code, and changes that do not match the spec.
Severity: high = will cause wrong behaviour, data loss, a security hole, or the tests no longer prove the behaviour; medium = likely bug or maintainability problem; low = nit.
Reply with ONLY a JSON object, no prose, no code fences: {"findings":[{"severity":"high|medium|low","file":"path","line":123,"title":"short","detail":"why and how to fix"}]}. Empty list if nothing is wrong. Do not invent issues.

SPECS (may be empty):
${specs || "(none)"}

DIFF ${base.slice(0, 12)}..${sha.slice(0, 12)}:
${diff}`;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `review-${c.name}-`));
const settings = path.join(tmp, "settings.json");
fs.writeFileSync(settings, JSON.stringify({ disableAllHooks: true }));
const bin = L.which("claude");
if (!bin) { console.error("claude CLI not found on PATH"); process.exit(1); }
const r = spawnSync(bin, ["-p", "--model", model, "--output-format", "json", "--settings", settings, "--disallowedTools", "Bash", "Edit", "Write", "MultiEdit", "NotebookEdit", "Read", "Grep", "Glob", "WebFetch", "WebSearch", "Agent", "Task", "PowerShell"], {
  input: prompt, cwd: tmp, encoding: "utf8", timeout: 840_000, windowsHide: true, maxBuffer: 32 * 1024 * 1024,
});
try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 }); } catch (e) { console.error(`note: could not remove ${tmp}: ${e.code}`); }
if (r.status !== 0) { console.error(`claude -p failed (exit ${r.status}): ${L.tail(`${r.stdout}${r.stderr}`, 10)}`); process.exit(1); }
let text;
try { text = JSON.parse(r.stdout).result; } catch { text = r.stdout; }
const m = String(text).match(/\{[\s\S]*\}/);
let parsed;
try { parsed = JSON.parse(m[0]); } catch { console.error(`reviewer did not return JSON:\n${String(text).slice(0, 800)}`); process.exit(1); }
if (!Array.isArray(parsed.findings)) { console.error("reviewer JSON has no findings array"); process.exit(1); }
write({ model, findings: parsed.findings });
for (const f of parsed.findings) console.log(`[${f.severity}] ${f.file || ""}:${f.line || ""} ${f.title}\n    ${f.detail || ""}`);
console.log(`review: ${parsed.findings.length} findings (${parsed.findings.filter((f) => /high|critical/i.test(f.severity)).length} high) by ${model}`);

function write(obj) {
  const p = path.join(L.STATE_DIR(), "review", `${sha}.json`);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify({ sha, base, ts: new Date().toISOString(), ...obj }, null, 2));
}
