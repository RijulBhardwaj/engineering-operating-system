// Idempotent local install: audit key, git pre-push hook, gitignore lines. Never touches remotes.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import * as L from "./lib.mjs";

const c = L.cfg();
L.ensureKey();
console.log(`key: ${path.join(L.commonGitDir(), `factory-audit-${c.name}.key`)} (local only, never committed)`);

if (c.prePush !== false) {
  const hooks = path.join(L.commonGitDir(), "hooks");
  fs.mkdirSync(hooks, { recursive: true });
  const p = path.join(hooks, "pre-push");
  let chain = "";
  if (fs.existsSync(p) && !fs.readFileSync(p, "utf8").includes("software-factory")) {
    const bak = `${p}.pre-factory-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    fs.copyFileSync(p, bak);
    chain = `"${bak.replace(/\\/g, "/")}" "$@" < "$tmp" || exit 1\n`;
    console.log(`existing pre-push backed up to ${bak} and chained`);
  }
  const script = [
    "#!/bin/sh",
    `# software-factory pre-push gate for ${c.name} (installed by .claude/factory/install.mjs)`,
    'top="$(git rev-parse --show-toplevel)" || exit 1',
    'f="$top/.claude/factory/verify.mjs"',
    'if [ ! -f "$f" ]; then echo "software-factory: $f missing on this branch; push blocked" >&2; exit 1; fi',
    'tmp="$(mktemp)"; cat > "$tmp"',
    chain.trimEnd(),
    'node "$f" --pre-push "$@" < "$tmp"; rc=$?',
    'rm -f "$tmp"; exit $rc',
    "",
  ].filter((l) => l !== "").join("\n") + "\n";
  fs.writeFileSync(p, script.replace(/\r\n/g, "\n"), { mode: 0o755 });
  const chk = spawnSync(L.SHELL || "sh", ["-n", p.replace(/\\/g, "/")], { encoding: "utf8" });
  if (chk.status !== 0) { console.error(`pre-push hook failed sh -n: ${chk.stderr}`); process.exit(1); }
  console.log(`pre-push: ${p}`);
} else console.log("pre-push: disabled for this project (factory.json prePush=false)");

const gi = path.join(L.ROOT, ".gitignore");
const want = [".factory/", ".claude/worktrees/", ".claude/settings.local.json"];
const cur = fs.existsSync(gi) ? fs.readFileSync(gi, "utf8") : "";
const missing = want.filter((w) => !cur.split(/\r?\n/).some((l) => l.trim() === w));
if (missing.length) {
  fs.writeFileSync(gi, cur + (cur.endsWith("\n") || !cur ? "" : "\n") + "# software factory runtime state\n" + missing.join("\n") + "\n");
  console.log(`.gitignore += ${missing.join(" ")}`);
}
const hp = L.git(["config", "--get-all", "core.hooksPath"], { check: false });
if (hp) console.log(`WARNING: core.hooksPath=${hp} bypasses .git/hooks; the pre-push gate is not active`);
console.log("install ok");
