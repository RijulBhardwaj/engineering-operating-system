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

### "The goal is met when..." phrasing (adopted 2026-11-24)

Source: Instagram @ceciliakimdesign reel, via explicit user instruction. A concrete technique for rule 4 above, especially for UI/visual asks where vague adjectives ("clean", "premium", "easier to use", "on brand", "smooth") let an AI call anything done. Replace the adjective with a measurable condition before starting work, not after:

- "Make it look clean" -> no info repeats, all spacing is a multiple of 4.
- "Make it premium" -> every card has a 24pt corner radius, inner elements 16pt, shadows match.
- "Make it easier to use" -> every tappable target is >=44pt (Apple HIG minimum), nothing clips at max text size.
- "Make it on brand" -> every screen uses only brand colors, max 2 fonts.
- "Make errors friendlier" -> every error states what went wrong, why, and what to do next (ties to `ui-ux-states.md` state 5/9).
- "Add empty states" -> every empty screen has one icon, one sentence on what will appear, one next-step button (state 1).
- "Make loading better" -> every screen loads with a skeleton of its real layout, no header/tab-bar jump (state 2).
- "Make it feel smooth" -> small animations finish in ~250ms with a spring, never an abrupt stop.
- "Make numbers look nicer" -> tabular (fixed-width) digits, so values don't shift width on change.

When the ask implies the whole app, say "every single screen" explicitly in the goal -- otherwise a single-screen fix gets reported as done. This is the same discipline as this file's smallest-correct-change rule and `architecture.md`'s acceptance-criteria requirement: a spec item phrased as a measurable condition, not an adjective, is what review council passes (`release-review-passes.md`) and the QA gate checklist actually check against.
