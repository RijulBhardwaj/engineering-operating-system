# Coding Standards

- Smallest correct change. Preserve existing architecture/conventions/APIs unless the task explicitly asks to change them.
- No unrequested abstractions -- no interface for one implementation, no config for a value that never changes, no boilerplate "for later."
- Match the project's existing style over a personal preference; this file sets defaults for projects that don't yet have their own.
- Language-specific detail lives in engineering/standards/ per language, created on first real need, not pre-populated speculatively.
- Comments explain why, not what. Delete a comment that just restates the code.

## Andrej Karpathy guidelines (adopted 2026-10-31, mandatory)

1. **Think before coding.** State assumptions out loud. If a request has multiple valid interpretations, present them instead of silently picking one. Suggest a simpler approach when one exists. Ask when something is genuinely unclear -- don't guess past a real ambiguity.
2. **Simplicity first.** Write only what's requested. No speculative features, no single-use abstractions, no unrequested configurability. Simplify code that's more complicated than the problem needs. (This overlaps with, and reinforces, the smallest-correct-change rule above and the YAGNI anti-patterns in engineering-principles.md.)
3. **Surgical changes.** Touch only what the task requires. Don't refactor or reformat unrelated code in the same change. Match the existing style. Note unrelated dead code instead of deleting it unasked. Remove only the imports/functions your own change made unused.
4. **Goal-driven execution.** Turn a task into a verifiable goal -- e.g. write a test that reproduces a bug before fixing it. For multi-step work, outline the steps with a check for each one, not just a final "done."

Apply with judgment on trivial tasks -- a one-line fix doesn't need a presented-alternatives discussion. Source: https://github.com/multica-ai/andrej-karpathy-skills
