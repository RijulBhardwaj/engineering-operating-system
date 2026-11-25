# Blender Grease Pencil eval -- "moving painting" gap test (2026-11-25)

Tests whether Blender's Grease Pencil (GPv3, the curves-based 2D-in-3D ink/brush system in
Blender 5.x) closes the gap the prior deterministic SVG-filter attempt
(`CAT_Guide/video/templates/painterly-deterministic/`) was honestly rated as missing: real
brush-stroke-width variance and organic silhouette noise, not "roughened flat vector."

## What was installed

- **Blender 5.3.0**, portable zip build (`blender.org/release/Blender5.3/blender-5.3.0-windows-x64.zip`),
  extracted to `tools/blender-portable/` (gitignored, not committed -- see `.gitignore` note below).
  The winget MSI path (`BlenderFoundation.Blender`) requires an interactive UAC elevation prompt
  this session cannot click through non-interactively -- it hung at 0% CPU waiting on the prompt.
  The portable zip is the same official build, needs no admin rights, and is what was actually
  used for every step below. `blender --version` confirmed: `Blender 5.3.0, build date: 2026-11-10`.
- **`claude-blender-skills`** (https://github.com/mromidev/claude-blender-skills), copied into
  `~/.claude/skills/` per its own documented install method. Read its README first, as instructed:
  it is **3 Claude Skills (markdown workflows + Python scripts)**, not an MCP server or plugin. Each
  skill (`blender-film`, `blender-forest`, `blender-car-film`) drives an *already-open* Blender GUI
  through a live socket bridge (`tools/bridge.py` run inside Blender's Scripting tab, listening on
  `127.0.0.1:9876`) so Claude can send it Python over `tools/send.py`. All three skills are **Cycles
  photoreal workflows** (night drone city flythrough, forest+car, cinematic car film) -- grepping the
  entire repo for "grease" returns zero hits. It targets exactly the heavy photoreal path the task
  brief said was already ruled out as overkill, not the Grease Pencil 2D-painterly path. It was
  installed as instructed, but none of its workflows applied to this eval; the Grease Pencil test
  below was written directly against Blender's `bpy` API instead.

## The test scene

`gp_test.py` (run via `blender --background --python gp_test.py -- <frames_dir>`):
- One Grease Pencil object, GPv3 curves API (`drawing.add_strokes(sizes)` + `position`/`radius`/`cyclic`
  point & curve attributes -- the legacy `stroke.points.add()` API from GPv2 no longer exists in 5.x).
- A jittered 40-point closed "sun" circle + 6 loose open-stroke "rays", with per-point `radius`
  jittered via `sin()` to attempt hand-drawn stroke-width variance, and a material with
  `show_fill=True` for an ink/fill look.
- 5s / 120 frames @ 24fps, a simple rotate+scale-pulse animation (the "moving" in "moving painting").
- Rendered via Eevee (`BLENDER_EEVEE_NEXT` not present as an engine id in this 5.3 build's enum --
  fell back to the `BLENDER_EEVEE` id, which in 5.x *is* the former "Eevee Next" raster engine).
- Encoded to MP4 by muxing the PNG sequence with `ffmpeg` (not Blender's own VSE).

## Render cost (the actual numbers)

```
engine=BLENDER_EEVEE
frames=120
resolution=960x540
total_render_seconds=24.62
seconds_per_frame=0.205
```

120 frames in 24.62s wall-clock on this machine (RTX 3050 laptop GPU 6GB + Intel iGPU), i.e.
**~0.2s/frame**, GPU-bound Eevee raster, not CPU Cycles. For a 5-10s clip this is **cheap** --
seconds, not minutes, per video. Render cost is not what rules this out (see below).

Output: `grease-pencil-test.mp4` -- verified with `ffprobe`: h264, 960x540, 24/1 fps, exactly
5.000000s duration, 234KB. Real encoded MP4, not just a PNG sequence.

## Honest visual verdict: does NOT close the gap

Inspected `frames/frame_0001.png` and `frames/frame_0060.png` (start and mid-rotation) directly.
Both show a faceted, constant-width polygon outline on a flat grey background -- the jittered
40-point circle reads as a many-sided polygon with slightly uneven vertex spacing, not a smooth
hand-drawn curve, and the per-point `radius` jitter (intended as brush-pressure variance) is **not
visibly expressed as stroke-width variance in the render** -- the line reads as near-constant
thickness throughout. The fill (`show_fill=True`, `fill_color` set) also **did not render** --
both frames show hollow outlines only, no ink/watercolor fill despite the material being
configured for it (a further default-material/Eevee-GP-interaction gap, not chased down further
since the stroke-variance result alone is decisive).

Compared to the prior SVG-filter attempt (`CAT_Guide/video/out/painterly-test.mp4`, rated
"roughened flat vector," missing brush-stroke variance and organic silhouette noise): this
Grease Pencil test lands in the **same category, and on this specific default setup, arguably
produces less visible texture** -- no fill, and width variance that reads as flat rather than
organic. This is a scripted, default-settings, un-tuned test (it does not use the GUI brush
presets, textured brush stamps, or the "Draw" mode ink/watercolor fill styles Grease Pencil
*can* produce when drawn by hand or tuned through the GUI with actual brush textures) -- so this
is not proof Grease Pencil can *never* look painterly, only that the straightforward scripted
`bpy` path used here, which is what a cheap/local/automated per-video pipeline would actually use,
does not get there out of the box. Reaching real brush/ink texture would need per-point brush
texture/opacity attributes and material-level ink/watercolor settings that are not exposed as a
simple one-call API -- a meaningfully bigger investment than this eval's "small automated script"
scope, with no guarantee of reaching the diffusion-model bar even then.

## Verdict: not worth pursuing further for "moving painting"

- **Render cost**: not a blocker (0.2s/frame, GPU-bound, cheap).
- **Visual gap**: not closed. Default scripted Grease Pencil output reads as flat vector with
  faceted edges, same failure mode as the SVG-filter attempt it was meant to beat, with the added
  problem that this scripted path's fill didn't even render.
- **claude-blender-skills**: confirmed to be a Cycles-photoreal skill set (3 skills, live-bridge
  workflow), not a Grease Pencil tool at all -- no reuse value for this specific gap.

Not registered as a candidate animation-style stage in `animation-styles.md` -- documented there
as an evaluated-and-rejected option instead, so a future session doesn't re-run this same
experiment from scratch. `blender` and `claude-blender-skills` are registered in
`registry/tools.yaml` as installed-but-not-adopted-for-this-purpose, per the same honesty
standard as every other tool in this toolkit.
