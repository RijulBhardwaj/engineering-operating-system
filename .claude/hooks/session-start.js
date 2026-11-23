// SessionStart hook: force the harness's CLAUDE.md into every session's context
// automatically, regardless of which project directory the session starts in.
// Instructions and memory can be forgotten or skipped under compaction; a hook can't be.
const fs = require("fs");

const HARNESS_CLAUDE_MD = "C:/Coding Projects/engineering-operating-system/CLAUDE.md";

let body;
try {
  body = fs.readFileSync(HARNESS_CLAUDE_MD, "utf8");
} catch (e) {
  body = "HARNESS CLAUDE.md NOT FOUND at " + HARNESS_CLAUDE_MD + " -- " + e.message;
}

const additionalContext =
  "[engineering-operating-system harness -- force-loaded by a SessionStart hook, not optional reading]\n\n" +
  body +
  "\n\nIf the current project is registered in projects/project-registry.yaml above, check that " +
  "entry and the project's own docs/SESSION_STATE.md before starting real work.";

process.stdout.write(JSON.stringify({
  hookSpecificOutput: { hookEventName: "SessionStart", additionalContext },
}));
