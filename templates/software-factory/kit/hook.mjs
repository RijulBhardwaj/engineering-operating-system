// Claude Code hook entry: node hook.mjs <guard|post|stop|session>
// No static imports: a broken kit/config must still fail closed (exit 2), never open.
const mode = process.argv[2];
// Claude Code lets the tool through when a hook times out, so stop just inside the settings.json timeout and block.
const LIMIT = { guard: 50, post: 170, postshell: 50 }[mode];
if (LIMIT) setTimeout(() => { process.stderr.write(`software-factory ${mode} hook ran past ${LIMIT}s (blocking; retry, or run the slow check yourself)\n`); process.exit(2); }, LIMIT * 1000).unref();
try {
  const m = await import("./hooks-impl.mjs");
  await m.main(mode);
} catch (e) {
  process.stderr.write(`software-factory ${mode} hook error (blocking): ${e?.message || e}\n`);
  // Session/Stop must not wedge the session on a kit bug (the error is still shown); guard/post block.
  process.exit(mode === "session" || mode === "stop" ? 0 : 2);
}
