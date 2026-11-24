# Metrics and Monitoring

What to record for every video this toolkit produces, and what to check once a run finishes. Source: user asked for real lifecycle metrics plus a standing monitor, 2026-11-25, after the first end-to-end test render (`profit-loss-explainer.mp4`/`-v2.mp4` in CAT_Guide/video).

## Per-run ledger (log one row per video)

| Field | What it proves |
|---|---|
| Script word count / estimated duration (150wpm) | Caught the CAT-2026 test script running ~105s against a 90s target before any render was spent on it -- check at script-approval, before stage 3. |
| Stage wall-clock (script, diagram render, TTS, composition, final render) | Where time actually goes -- don't guess, the agent `usage` block on every dispatch reports `tool_uses` and `duration_ms` per stage. |
| Tokens spent (subagent `usage.subagent_tokens`, or this session's own if done inline) | Real cost per video, same evidence this file's own worked example uses -- never report a token estimate, only the number the agent/session actually returned. |
| Diagram path taken | Manim (real render) vs Remotion-native fallback vs Three.js -- and why, if a fallback was used (missing LaTeX, missing manim, etc). |
| SFX tier used | Openverse (tier 1, search hit) vs earshot (tier 2, generated) vs none. |
| Final file: size, resolution, fps, duration, frame count rendered vs expected | `ffprobe`/the renderer's own frame-count report -- a short file or a frame-count mismatch is the first sign of a silent partial render. |
| Render errors/warnings count | 0 is the bar; anything else gets named, not waved through. |
| Caption coverage | words aligned vs words in the approved script -- a mismatch means the alignment step silently dropped or merged tokens (this happened once already, see the Nov 24 run -- `difflib` merge-splitting was needed). |

## Quality indicators to actually check (not just log)

- **Frame completeness**: rendered frame count == expected (duration x fps). A render that reports success with fewer frames is a silent truncation.
- **Audio-video sync drift**: spot-check 3-4 word timestamps against the known sentence boundaries in `timing.json` -- same method already used and proven on the Nov 24 run.
- **Fallback transparency**: if the diagram stage fell back from Manim to Remotion-native (or any other tier fell back), that must appear in the ledger, not just in agent chat -- a fallback is a quality-relevant fact, not an implementation detail.
- **Script-template compliance**: re-run `script-template.md`'s own checklist against the frozen script before it's counted as "approved" -- this file's example above is the worked case of catching a failure (length) before spending render budget on it.
- **Dependency-gap flags still open**: this toolkit currently tracks two (fontconfig, LaTeX) in `registry/tools.yaml` -- check that file's `decision` fields before assuming either is resolved; don't re-derive from memory.

## Where this lives

Log each run as a row appended to this file's table (or, once volume justifies it, split into `harness/video-generation/runs/<date>-<slug>.md` per run and link it here) -- same "file it, don't let it evaporate into chat history" rule as `knowledge-wiki-ops.md`. Token/cost totals across many runs: use the existing `ecc:token-card`/`ecc:cost-report` skills (already in this account) rather than re-deriving a running total by hand.
