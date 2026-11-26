// Full factory audit for HEAD. Writes a signed token only when every required step passes.
// Usage: node .claude/factory/audit.mjs [--no-review] [--keep-going]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as L from "./lib.mjs";
import * as SB from "./sandbox.mjs";

const argv = new Set(process.argv.slice(2));
const c = L.cfg();
const steps = [];
const waivers = [];
const t0 = Date.now();
const say = (s) => process.stdout.write(s + "\n");

async function step(id, required, fn) {
  const s = { id, required, status: "pass", ms: 0, note: "" };
  const t = Date.now();
  try {
    const r = await fn();
    if (r === "skip") s.status = "skip";
    else if (r && r.fail) { s.status = "fail"; s.note = r.fail; }
    else if (r && r.note) s.note = r.note;
  } catch (e) { s.status = "fail"; s.note = String(e?.message || e); }
  s.ms = Date.now() - t;
  steps.push(s);
  say(`${s.status === "pass" ? "PASS" : s.status === "skip" ? "SKIP" : "FAIL"} ${id} (${s.ms} ms)${s.note ? `\n     ${s.note.split("\n").slice(0, 25).join("\n     ")}` : ""}`);
  if (s.status === "fail" && required && !argv.has("--keep-going") && id === "clean-tree") finish();
  return s;
}

const sha = L.head();
const br = (() => { try { return L.branch(); } catch { return "(detached)"; } })();
let base;
const rangeLog = () => L.git(["log", "--format=%B", `${base}..HEAD`]);
const TRAILERS = {
  "TEST-REMOVAL-APPROVED": /^TEST-REMOVAL-APPROVED:\s*(.+)$/im,
  "LARGE-DIFF-APPROVED": /^LARGE-DIFF-APPROVED:\s*(.+)$/im,
  "FACTORY-CHANGE-APPROVED": /^FACTORY-CHANGE-APPROVED:\s*(.+)$/im,
};
const trailer = (name) => {
  const m = rangeLog().match(TRAILERS[name]);
  if (m) waivers.push(`${name}: ${m[1].trim()}`);
  return !!m;
};
const changed = () => L.git(["diff", "--name-only", "--diff-filter=ACMR", `${base}..HEAD`, "--", "."]).split("\n").filter(Boolean);
const isTest = (rel) => new RegExp(c.testRegex || "(^|/)(tests?|__tests__|spec)/|\\.(test|spec)\\.[cm]?[jt]sx?$|(^|/)test_[^/]+\\.py$").test(rel);
const srcRe = new RegExp(c.sourceRegex || "\\.([cm]?[jt]sx?|py)$");
const showAt = (rev, f) => L.git(["show", `${rev}:${f}`], { check: false, raw: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `factory-${c.name}-`));

say(`software-factory audit: ${c.name} @ ${sha.slice(0, 12)} on ${br}`);

await step("clean-tree", true, () => {
  const d = L.dirtyFiles();
  return d.length ? { fail: `uncommitted changes (commit or stash first):\n${d.slice(0, 15).join("\n")}` } : null;
});
await step("merge-base", true, () => { base = L.mergeBase(); return { note: `base ${base.slice(0, 12)}` }; });

await step("factory-integrity", true, () => {
  const touched = L.git(["diff", "--name-only", `${base}..HEAD`, "--", ".claude/factory", ".claude/settings.json", ".claude/agents", ".github/workflows/factory.yml"]).split("\n").filter(Boolean).filter((f) => !(c.unprotect && new RegExp(c.unprotect).test(f)));
  if (!touched.length) return null;
  if (trailer("FACTORY-CHANGE-APPROVED")) return { note: `factory files changed with approval: ${touched.join(", ")}` };
  return { fail: `factory files changed without a FACTORY-CHANGE-APPROVED: trailer: ${touched.join(", ")}` };
});

for (const s of c.audit) {
  await step(s.id, s.required !== false, async () => {
    if (s.when && !changed().some((f) => new RegExp(s.when).test(f))) return "skip";
    const r = await L.run(s.cmd, { timeoutSec: s.timeoutSec || 600, cwd: path.join(L.ROOT, s.cwd || ".") });
    const counts = (r.out.match(/(\d+)\s+(passed|failed|skipped)/gi) || []).slice(-3).join(", ");
    return r.code === 0 ? { note: counts } : { fail: `exit ${r.code}${r.timedOut ? " (timeout)" : ""}\n${L.tail(r.out, 30)}` };
  });
}

// Assertions and test cases must not shrink; deleted test files need a waiver.
const countIn = (txt) => ({
  asserts: (txt.match(/\bexpect\s*\(|\bassert(Equal|True|False|Raises|In|Is\w*)?\b|\.should\b|\bt\.(is|deepEqual|true|throws)\b/g) || []).length,
  cases: (txt.match(/\b(it|test)\s*\(|^\s*def\s+test_\w+/gm) || []).length,
  skips: (txt.match(/\.(skip|only|todo|skipIf|fails)\b|\bxit\(|@pytest\.mark\.(skip|xfail)/g) || []).length,
});
await step("test-tamper", true, () => {
  const all = L.git(["diff", "--name-status", "-M", `${base}..HEAD`, "--", "."]).split("\n").filter(Boolean);
  const issues = [];
  for (const line of all) {
    const [st, a, b] = line.split("\t");
    if (!isTest(a) && !(b && isTest(b))) continue;
    if (st === "D" || (st.startsWith("R") && !isTest(b))) { issues.push(`test file removed: ${a}`); continue; }
    if (st === "A") continue;
    const before = countIn(showAt(base, a)), after = countIn(showAt("HEAD", b || a));
    if (after.asserts < before.asserts) issues.push(`${b || a}: assertions ${before.asserts} -> ${after.asserts}`);
    if (after.cases < before.cases) issues.push(`${b || a}: test cases ${before.cases} -> ${after.cases}`);
    if (after.skips > before.skips) issues.push(`${b || a}: skipped/focused tests ${before.skips} -> ${after.skips}`);
  }
  if (!issues.length) return null;
  if (trailer("TEST-REMOVAL-APPROVED")) return { note: `waived: ${issues.join("; ")}` };
  return { fail: issues.join("\n") };
});

await step("diff-size", true, () => {
  const ign = new RegExp(c.diffIgnore || "(package-lock\\.json|pnpm-lock\\.yaml|yarn\\.lock|\\.min\\.|^dist/|\\.snap$)");
  let n = 0;
  for (const l of L.git(["diff", "--numstat", `${base}..HEAD`, "--", "."]).split("\n").filter(Boolean)) {
    const [a, d, f] = l.split("\t");
    if (!ign.test(f) && a !== "-") n += Number(a) + Number(d);
  }
  const max = c.maxDiffLines || 1500;
  if (n <= max) return { note: `${n} changed lines (limit ${max})` };
  if (trailer("LARGE-DIFF-APPROVED")) return { note: `${n} lines, waived` };
  return { fail: `${n} changed lines exceeds ${max}; split the change or add LARGE-DIFF-APPROVED: <reason>` };
});

await step("duplication", c.duplication?.required !== false, async () => {
  if (!c.duplication) return "skip";
  if (!L.which("jscpd")) return { fail: "jscpd not installed" };
  const out = path.join(tmp, "jscpd");
  const r = await L.run(`jscpd ${c.duplication.paths.map((p) => `"${p}"`).join(" ")} --silent --min-lines ${c.duplication.minLines || 6} --reporters json --output "${out.replace(/\\/g, "/")}" --ignore "**/node_modules/**,**/dist/**,**/vendor/**,**/*.min.js"`, { timeoutSec: 300 });
  let pct = "?";
  try { pct = JSON.parse(fs.readFileSync(path.join(out, "jscpd-report.json"), "utf8")).statistics.total.percentage; } catch {}
  if (typeof pct !== "number") return { fail: `jscpd produced no report (exit ${r.code})\n${L.tail(r.out, 15)}` };
  return pct <= c.duplication.threshold ? { note: `duplication ${pct.toFixed(2)}% (threshold ${c.duplication.threshold}%)` } : { fail: `duplication ${pct.toFixed(2)}% over threshold ${c.duplication.threshold}%` };
});

await step("complexity", c.complexity?.required !== false, async () => {
  if (!c.complexity) return "skip";
  if (!L.which("lizard")) return { fail: "lizard not installed" };
  const files = changed().filter((f) => srcRe.test(f) && !isTest(f) && /\.([cm]?[jt]sx?|py)$/.test(f));
  if (!files.length) return { note: "no changed source files" };
  const count = async (dir) => {
    const r = await L.run(`lizard -C ${c.complexity.ccn || 15} -L ${c.complexity.length || 100} -w ${files.map((f) => `"${f}"`).join(" ")}`, { cwd: dir, timeoutSec: 180 });
    return r.out.split(/\r?\n/).filter((l) => /warning:/.test(l));
  };
  const baseDir = path.join(tmp, "base");
  for (const f of files) { const t = showAt(base, f); if (t) { fs.mkdirSync(path.dirname(path.join(baseDir, f)), { recursive: true }); fs.writeFileSync(path.join(baseDir, f), t); } }
  const after = await count(L.ROOT), before = fs.existsSync(baseDir) ? await count(baseDir) : [];
  const strip = (l) => l.replace(/^.*?:\d+:\s*/, "").replace(/\bhas \d+ NLOC.*$/, "").trim();
  const beforeKeys = new Set(before.map(strip));
  const fresh = after.filter((l) => !beforeKeys.has(strip(l)));
  if (after.length <= before.length && !fresh.length) return { note: `${after.length} warnings (base ${before.length})` };
  return { fail: `new complexity warnings (CCN>${c.complexity.ccn || 15} or length>${c.complexity.length || 100}):\n${fresh.slice(0, 10).join("\n")}` };
});

await step("gitleaks", true, async () => {
  if (!L.which("gitleaks")) return { fail: "gitleaks not installed" };
  const r = await L.run(`gitleaks git --no-banner --redact --exit-code 1 --log-opts="${base}..HEAD" .`, { timeoutSec: 300 });
  return r.code === 0 ? { note: "no leaks in range" } : { fail: `gitleaks exit ${r.code}\n${L.tail(r.out, 20)}` };
});

await step("semgrep", c.semgrep?.required !== false, async () => {
  if (c.semgrep === false) return "skip";
  if (!L.which("semgrep")) return { fail: "semgrep not installed" };
  const cfgs = (c.semgrep?.configs || ["p/default"]).map((x) => `--config ${x}`).join(" ");
  const r = await L.run(`semgrep scan ${cfgs} --error --metrics off --quiet --baseline-commit ${base} --exclude node_modules --exclude dist --exclude vendor .`, { timeoutSec: 900, env: { PYTHONUTF8: "1", SEMGREP_SEND_METRICS: "off" } });
  return r.code === 0 ? { note: "no new findings vs base" } : { fail: `semgrep exit ${r.code}\n${L.tail(r.out, 30)}` };
});

const MANIFESTS = /(^|\/)(package\.json|requirements[^/]*\.txt|pyproject\.toml)$/;
const LOCKS = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|requirements[^/]*\.txt|poetry\.lock)$/;
function depNames(txt, file) {
  if (!txt) return new Set();
  if (file.endsWith("package.json")) { try { const j = JSON.parse(txt); return new Set(Object.keys({ ...j.dependencies, ...j.devDependencies, ...j.optionalDependencies, ...j.peerDependencies })); } catch { return new Set(); } }
  return new Set(txt.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#") && !l.startsWith("-") && !l.startsWith("[")).map((l) => l.split(/[<>=!~[;\s]/)[0].toLowerCase()).filter((n) => /^[a-z0-9][\w.-]*$/i.test(n)));
}
await step("dependencies", true, async () => {
  const manifests = L.git(["ls-files"]).split("\n").filter((f) => MANIFESTS.test(f) && !/node_modules/.test(f));
  const added = [];
  for (const f of manifests) {
    const was = depNames(showAt(base, f), f), now = depNames(showAt("HEAD", f), f);
    for (const n of now) if (!was.has(n)) added.push({ n, py: !f.endsWith("package.json") });
  }
  const problems = [];
  for (const { n, py } of added) {
    const r = py
      ? await L.run(`python -c "import json,sys,urllib.request;d=json.load(urllib.request.urlopen('https://pypi.org/pypi/'+sys.argv[1]+'/json',timeout=15));print(min((f['upload_time'] for v in d['releases'].values() for f in v),default=''))" ${n}`, { timeoutSec: 30 })
      : await L.run(`npm view "${n}" time.created --json`, { timeoutSec: 30 });
    if (r.code !== 0) { problems.push(`${n}: not found in registry (hallucinated/slopsquatted?)`); continue; }
    const created = py ? r.out.trim() : (() => { try { return JSON.parse(r.out); } catch { return ""; } })();
    const age = (Date.now() - Date.parse(created)) / 86400000;
    if (!(age >= 30)) problems.push(`${n}: first published ${Math.floor(age)} days ago (<30)`);
  }
  // osv-scanner: fail only on vulnerabilities that are new versus base.
  const locks = L.git(["ls-files"]).split("\n").filter((f) => LOCKS.test(f) && !/node_modules/.test(f));
  let vulnNote = "no lockfiles";
  if (locks.length) {
    if (!L.which("osv-scanner")) return { fail: "osv-scanner not installed" };
    const ids = async (rev) => {
      const dir = path.join(tmp, `osv-${rev}`);
      for (const f of locks) { const t = showAt(rev, f); if (t) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), t); } }
      if (!fs.existsSync(dir)) return new Set();
      const r = await L.run(`osv-scanner scan source -r --format json "${dir.replace(/\\/g, "/")}"`, { timeoutSec: 300 });
      if (r.code !== 0 && r.code !== 1) throw new Error(`osv-scanner exit ${r.code}: ${L.tail(r.out, 8)}`);
      const s = new Set();
      try {
        const j = JSON.parse(r.out.slice(r.out.indexOf("{")));
        for (const res of j.results || []) for (const p of res.packages || []) for (const v of p.vulnerabilities || []) s.add(`${p.package.name}@${p.package.version} ${v.id}`);
      } catch (e) { throw new Error(`osv-scanner output unreadable: ${e.message}`); }
      return s;
    };
    const before = await ids(base), after = await ids("HEAD");
    const fresh = [...after].filter((x) => !before.has(x));
    if (fresh.length) problems.push(`new known vulnerabilities:\n${fresh.slice(0, 15).join("\n")}`);
    vulnNote = `${after.size} known vulns (${before.size} at base, ${fresh.length} new)`;
  }
  return problems.length ? { fail: problems.join("\n") } : { note: `${added.length} new deps checked; ${vulnNote}` };
});

await step("spec-trace", true, () => {
  const specs = changed().filter((f) => /^docs\/factory\/specs\/.+\.md$/.test(f));
  if (!specs.length) return { note: "no spec changed" };
  const ids = new Set(specs.flatMap((f) => (fs.readFileSync(path.join(L.ROOT, f), "utf8").match(/\bAC-\d+\b/g) || []).map((id) => `${path.basename(f, ".md")}:${id}`)));
  const tests = L.git(["ls-files"]).split("\n").filter(isTest).map((f) => { try { return fs.readFileSync(path.join(L.ROOT, f), "utf8"); } catch { return ""; } }).join("\n");
  const titled = new Set();
  for (const m of tests.matchAll(/\b(?:it|test|describe)\s*\(\s*(["'`])(.*?)\1/g)) for (const id of m[2].match(/\bAC-\d+\b/g) || []) titled.add(id);
  for (const m of tests.matchAll(/def\s+test_\w*?(ac_?\d+)/gi)) titled.add(m[1].toUpperCase().replace(/AC_?/, "AC-"));
  const missing = [...ids].filter((x) => !titled.has(x.split(":")[1]));
  return missing.length ? { fail: `acceptance criteria with no test titled with their id: ${missing.join(", ")}` } : { note: `${ids.size} criteria traced to tests` };
});

await step("review", c.review?.required !== false, async () => {
  if (c.review === false) return "skip";
  const p = path.join(L.STATE_DIR(), "review", `${sha}.json`);
  if (!fs.existsSync(p) && !argv.has("--no-review")) {
    const r = await L.run(`node .claude/factory/review.mjs`, { timeoutSec: 900 });
    if (r.code !== 0 && !fs.existsSync(p)) return { fail: `headless review failed; spawn the reviewer agent on ${base.slice(0, 12)}..HEAD, save its JSON to a temp file, then: node .claude/factory/review.mjs --record <file>\n${L.tail(r.out, 6)}` };
  }
  if (!fs.existsSync(p)) return { fail: "no independent review for HEAD (run node .claude/factory/review.mjs)" };
  const rv = JSON.parse(fs.readFileSync(p, "utf8"));
  const high = (rv.findings || []).filter((f) => /high|critical/i.test(f.severity || ""));
  if (high.length) return { fail: `reviewer (${rv.model}) found ${high.length} high-severity issue(s):\n${high.map((f) => `- ${f.file || ""}:${f.line || ""} ${f.title}`).join("\n")}` };
  return { note: `reviewer ${rv.model}: ${(rv.findings || []).length} findings, none high` };
});

await step("sandbox", !!c.sandbox, async () => {
  if (!c.sandbox) return "skip";
  const st = await SB.up();
  try {
    const res = await SB.smoke();
    const bad = res.filter((r) => !r.ok);
    if (bad.length) return { fail: `${st.url}: ${bad.map((b) => `${b.path} ${b.note}`).join("; ")}` };
    return { note: `${st.url}: ${res.length}/${res.length} smoke checks passed` };
  } finally {
    const d = await SB.down();
    if (!d.freed) throw new Error(`teardown left port ${d.port} busy`);
  }
});

finish();

function finish() {
  fs.rmSync(tmp, { recursive: true, force: true });
  const failed = steps.filter((s) => s.required && s.status === "fail");
  const result = failed.length ? "fail" : "pass";
  const body = { sha, base: base || null, branch: br, project: c.name, ts: new Date().toISOString(), result, steps, waivers, cfgHash: L.cfgHash(), durationMs: Date.now() - t0 };
  const files = base ? L.git(["diff", "--stat", `${base}..HEAD`, "--", "."]) : "";
  const report = [
    `# Factory release report: ${c.name} @ ${sha.slice(0, 12)} (${br})`,
    `Result: **${result.toUpperCase()}** at ${body.ts}, ${Math.round(body.durationMs / 1000)} s`,
    "", "| step | required | status | note |", "|---|---|---|---|",
    ...steps.map((s) => `| ${s.id} | ${s.required ? "yes" : "no"} | ${s.status} | ${(s.note || "").split("\n")[0].replace(/\|/g, "/").slice(0, 140)} |`),
    "", waivers.length ? `Waivers: ${waivers.join("; ")}` : "Waivers: none",
    "", "Changed files:", "```", files || "(none)", "```",
  ].join("\n");
  fs.mkdirSync(path.join(L.STATE_DIR(), "reports"), { recursive: true });
  fs.writeFileSync(path.join(L.STATE_DIR(), "reports", `${sha}.md`), report);
  if (result === "pass") say(`\nAUDIT PASS. token: ${L.writeToken(body)}`);
  else { fs.rmSync(L.tokenPath(sha), { force: true }); say(`\nAUDIT FAIL: ${failed.map((s) => s.id).join(", ")}. No token written.`); }
  say(`report: .factory/reports/${sha}.md`);
  process.exit(result === "pass" ? 0 : 1);
}
