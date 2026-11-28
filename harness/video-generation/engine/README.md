# Explainer engine (HyperFrames + Kokoro)

Spec JSON in, narrated vertical explainer MP4 out, in the style of reference reel DgOhKCftUY1: one continuous dark
canvas, colour-coded nodes, title zone, caption zone, calm British narration, no music.
Style rules: `docs/research_notes/video-references/PLAYBOOK.md`.

```powershell
& "C:\Coding Projects\CAT_Guide\video\tts-venv\Scripts\python.exe" explainer.py examples\trig-hexagon.json
```

Pipeline: validate spec (unknown node/edge ids fail fast) -> Kokoro narration per beat (`narration.wav`,
`timing.json`) -> HyperFrames composition (`index.html`, paused GSAP timeline, actions placed 200ms before each
beat's words) -> `hyperframes@0.9.104 render --strict -q delivery` -> `renders/<spec>/<spec>.mp4`.
Spec fields are documented at the top of `explainer.py`.

Verify every render by watching it back: `video-watch <mp4> --gemini --out ~/video-watch/<name>`, then compare the
transcript and keyframes with the spec.

Verified 2026-11-28 on Windows (RTX 3050 6GB): `examples/trig-hexagon.json` -> 35.6s 1080x1920, rendered in ~32s;
video-watch transcript matched all 8 beats; Gemini read it as one calm British female voice, no music, single
continuous 9:16 frame, titles and captions in sync.

Elements: `nodes` + `edges` (diagram), `counters` (big number that counts up, optional decimals/prefix/suffix/label),
`charts` (bar chart, bars grow in sequence with counting values). Beat actions: `show`, `draw`, `pulse`, `hide`
(nodes dim, counters/charts clear), `count`, `grow`, plus `title`/`caption` swaps.

Round 2 verified 2026-11-28: default voice speed 1.2 (`examples/reference-pacing.json`: ~150 WPM including pauses,
~178 while speaking); counters and bar chart checked frame by frame (values 0.6/1.5/5.3/13.1/15.0 land exactly,
lining sans digits); hexagon demo re-rendered at speed 1.15 (31.6s, unchanged visuals). Ruff and Bandit clean
apart from long HTML template lines and the expected low-severity subprocess notes.

Review fixes 2026-11-28 (independent opus review, no high findings): `validate` now rejects unsafe ids (letters,
digits, `-` only), non-`#rrggbb` colours, non-numeric fields, empty/out-of-range charts, blank narration and missing
keys before TTS runs; titles/captions are escaped for inline script; an element already on screen is not popped in
again and a same-beat pulse waits for its pop-in; counters centre through GSAP; render has a 30 min timeout and a
safe output-name check. A second review round added: finite-number and range checks (speed > 0, hold >= 0, chart
max/decimals), text-type checks for labels/titles/captions, shape checks for edges/draw/id lists, a caught render
timeout, and message-specific tests. Not checked: whether a pulse/draw targets something currently visible (it still
renders, just without a visible effect). Tests: `python -m pytest test_explainer.py` (27 pass). Both demos
re-rendered and frame-checked.

Known limits: math labels are plain Unicode, not LaTeX; no images, line charts or camera moves yet.
HyperFrames' own agent skills are not installed (needs `npx skills add heygen-com/hyperframes`, run by the owner);
the engine only needs the CLI. HyperFrames sends usage telemetry from the CLI.
