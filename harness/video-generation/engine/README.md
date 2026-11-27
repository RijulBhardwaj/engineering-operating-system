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

Known limits: Kokoro reads slightly slow (~115 WPM measured vs the playbook's ~150; raise `speed`); math labels are
plain Unicode, not LaTeX; only the node/edge diagram primitive exists so far (no charts, counters, images).
HyperFrames' own agent skills are not installed (needs `npx skills add heygen-com/hyperframes`, run by the owner);
the engine only needs the CLI. HyperFrames sends usage telemetry from the CLI.
