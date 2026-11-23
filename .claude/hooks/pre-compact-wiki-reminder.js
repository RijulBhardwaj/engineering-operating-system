// PreCompact hook: force a vault-ingest reminder into context right before
// compaction, the exact moment this session's own work is about to become
// expensive to re-derive. Fires automatically in every project, no manual
// trigger needed -- this is the mechanical half of knowledge-wiki-ops.md,
// which on its own is just a rule a session could forget to follow.
process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "PreCompact",
    additionalContext:
      "[Automatic reminder, per engineering-operating-system's knowledge-wiki-ops.md] " +
      "Before this compaction proceeds: has this session's substantial work (decisions, " +
      "fixes, finished features, new tools) been filed into the harness vault at " +
      "C:/Coding Projects/engineering-operating-system/knowledge/wiki/ (project home note " +
      "+ a knowledge/log.md ingest entry)? If not, do that now, before the detail is gone. " +
      "If it's already filed, or this session's work genuinely doesn't warrant it, continue normally.",
  },
}));
