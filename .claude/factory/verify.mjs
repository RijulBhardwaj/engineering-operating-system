// node .claude/factory/verify.mjs [sha]        -> exit 0 iff a valid passing audit token exists for sha (default HEAD)
// node .claude/factory/verify.mjs --pre-push   -> git pre-push hook mode (reads ref lines on stdin)
import fs from "node:fs";
import * as L from "./lib.mjs";

const ZERO = /^0+$/;
const args = process.argv.slice(2);

async function prePush() {
  const lines = fs.readFileSync(0, "utf8").split(/\r?\n/).filter(Boolean);
  const head = L.head();
  let bad = 0;
  for (const line of lines) {
    const [lref, lsha, rref, rsha] = line.split(" ");
    if (ZERO.test(lsha)) { console.error(`software-factory: deleting ${rref} is blocked (ask the user)`); bad++; continue; }
    if (rsha && !ZERO.test(rsha) && L.gitOk(["cat-file", "-e", `${rsha}^{commit}`]) && !L.gitOk(["merge-base", "--is-ancestor", rsha, lsha])) {
      console.error(`software-factory: non-fast-forward (force) push to ${rref} is blocked`); bad++; continue;
    }
    if (rsha && !ZERO.test(rsha) && !L.gitOk(["cat-file", "-e", `${rsha}^{commit}`])) {
      console.error(`software-factory: remote ${rref} has commits you have not fetched; fetch and re-audit first`); bad++; continue;
    }
    const v = L.verifyToken(lsha, L.ROOT, { requireHead: false, requireClean: lsha === head });
    if (!v.ok) { console.error(`software-factory: push of ${lref} (${lsha.slice(0, 12)}) blocked: ${v.reason}`); bad++; continue; }
    // Re-run the cheap independent check rather than trusting the token alone.
    const range = rsha && !ZERO.test(rsha) ? `${rsha}..${lsha}` : `${v.token.base}..${lsha}`;
    const g = await L.run(`gitleaks git --no-banner --redact --exit-code 1 --log-opts="${range}" .`, { timeoutSec: 300 });
    if (g.code !== 0) { console.error(`software-factory: gitleaks found secrets in ${range}:\n${L.tail(g.out, 15)}`); bad++; continue; }
    L.log("prepush", `OK ${lref} ${lsha} -> ${rref}`);
    console.error(`software-factory: ${lref} ${lsha.slice(0, 12)} verified (audit ${v.token.ts})`);
  }
  if (bad) L.log("prepush", `BLOCK ${bad}`);
  process.exit(bad ? 1 : 0);
}

try {
  if (args[0] === "--pre-push") await prePush();
  else {
    const sha = args[0] || L.head();
    const v = L.verifyToken(sha);
    console.log(v.ok ? `OK ${sha}: ${v.reason} (audited ${v.token.ts})` : `NOT VERIFIED ${sha}: ${v.reason}`);
    process.exit(v.ok ? 0 : 1);
  }
} catch (e) {
  console.error(`software-factory verify error (blocking): ${e.message}`);
  process.exit(1);
}
