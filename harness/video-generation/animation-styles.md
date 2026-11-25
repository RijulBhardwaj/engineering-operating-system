# Animation Style Mapping

Maps the viral "Claude animation style" list to whichever tool in this toolkit already renders it. Grouped by mechanism, not a 1:1 style-to-tool list -- a style already achievable with an existing, installed tool gets no new install; only genuine gaps add one.

## CSS/SVG motion styles -- Remotion + GSAP/Motion Design skills (already installed, no new tool)

Flat Vector, Flat 2D, Minimal Line, Isometric, Paper collage, Swiss, Bauhaus, Memphis, Glassmorphism, Y2K chrome, Risograph, Vaporwave, Synthwave, Glitch, Particles, Neobrutalism, Kinetic type, Pop art, Line art, Low poly.

All of these are 2D compositions (flat color, vector shape, typographic, or stylized-filter looks) animated with CSS/SVG transforms, filters and timelines -- exactly what Remotion (the composition/render engine) plus the `gsap-core`/`gsap-timeline`/`gsap-scrolltrigger`/`design-motion-principles` skills already cover. No renderer gap.

## Hand-drawn / toy / stylized -- `example-skills:algorithmic-art` + GSAP (already installed, no new tool)

ChalkBoard, Glow Sketch, Comic Art, Pixel Art, Lego Style, Clay 3D, PS2 Style.

These are rendering-style choices (sketch/chalk texture, pixel grid, toy-brick/clay shading, low-fidelity PS2-era look) achievable as generative/procedural art + motion, not a distinct 3D pipeline -- `example-skills:algorithmic-art` for the generative look, GSAP for the motion. No renderer gap.

## True 3D (Three.js via @remotion/three) -- now the default, proven working 2026-11-25

CGI Motion, Explainer 3D, 3D Data Chart, Glow Atom.

Remotion/CSS can fake flat or pseudo-isometric looks, but cannot genuinely render lit, lensed, camera-moved 3D geometry -- these four styles need a real 3D scene graph and renderer. **This is now the default path for all four styles, not an option alongside a CSS-transform fallback.** A Three.js skill was installed 2026-11-24 for this; on 2026-11-25 the actual Remotion integration was proven end-to-end (not just "the skill exists"):

- **Package**: `@remotion/three` -- Remotion's own official integration, exporting `<ThreeCanvas>`, which renders a three.js scene deterministically per-frame inside Remotion's render pipeline (not a live/realtime canvas loop -- it matches Remotion's frame-exact render model). Installs alongside plain `three`, `react`, `react-dom` -- no exotic setup.
- **Approach**: build the model/view/projection matrices for real with three.js's own `THREE.Matrix4`/`Matrix3` (e.g. `new THREE.Matrix4().makeRotationY(angle)`), apply to a mesh via `matrixAutoUpdate={false}` + an explicit `matrix` prop, and read the same matrix's `.elements` back out for any on-screen overlay -- so the displayed numbers are the numbers actually driving the geometry, not a decorative animation.
- **Proof**: isolated test project at `harness/video-generation/_eval/three-matrix-test/` -- a cube rotated by a real per-frame rotation matrix, with a live matrix-value overlay and a transformed-corner readout, rendered via `npx remotion render` to a real MP4: 150/150 frames, 0 render errors, 1080x1920 @ 30fps, 5.000s, ~516 KB (verified with `ffprobe`). The risk the CAT_Guide render avoided (wiring Three.js into Remotion) was real to investigate but did not materialize as a blocker -- it works cleanly once `@remotion/three` (not a manual Three.js canvas) is used.
- **Reusable template**: `harness/video-generation/templates/matrix-transform-3d/` -- copy its `src/` into a project for "show real math transforming a 3D object" content; see that folder's README for drop-in steps and its own honest-caveat note (built to the *described* genre of a referenced reel whose actual frames were never watched, not a verified frame-for-frame copy).
- **CSS-transform fallback is now secondary/degraded only** -- reach for it only if `@remotion/three` genuinely fails in a given project's environment (e.g. an unresolvable WebGL/headless-render issue), and say so explicitly when falling back; it is no longer the default assumption for these four styles.

Blender MCP was considered and **not installed** -- full 3D modeling/sculpting is overkill for motion-graphics-style 3D that a Three.js scene in a Remotion composition already covers.

## Evaluated and rejected: Blender Grease Pencil for "moving painting" (2026-11-25)

Tested specifically to see if Blender's Grease Pencil (GPv3, 2D-in-3D ink/brush system, Blender 5.x)
could close the gap the prior deterministic SVG-filter attempt
(`CAT_Guide/video/templates/painterly-deterministic/`) was rated as missing -- real brush-stroke
variance and organic silhouette noise ("moving painting"), not "roughened flat vector." Full eval,
rendered frames and MP4: `harness/video-generation/_eval/blender-grease-pencil/README.md`.

Result: **rejected, gap not closed**. A scripted `bpy` Grease Pencil scene (jittered-circle +
rays, 120 frames/5s, Eevee) rendered cheaply (0.2s/frame, GPU-bound -- render cost is not the
problem) but the output reads as a faceted, near-constant-width polygon outline with no visible
fill -- same "flat vector" failure mode as the SVG attempt, not better. `claude-blender-skills`
(https://github.com/mromidev/claude-blender-skills), installed alongside this test, turned out to
be 3 Cycles-photoreal skills (night drone city, forest, car film) with zero Grease Pencil content
-- confirms the project's existing read that Blender's heavy path is overkill here, and adds that
its one 2D-painterly-shaped feature doesn't close the gap either, at least not through a simple
scripted path. Not promoted to a candidate stage; not the default. See `registry/tools.yaml` for
the `blender` / `claude-blender-skills` entries and their `decision` fields.

## Math/diagram explainer -- Manim skill (installed this same pass)

Math Diagram, Cartoon Explainer, Domino Reveal.

3Blue1Brown-style math/code animation and sequential reveal animations are exactly what the Manim skill (`manimce-best-practices`, `manimgl-best-practices`, `manim-composer`) covers -- see `registry/tools.yaml`'s `manim-skill` entry and this toolkit's README. No separate tool.

## Supporting tool: Text-to-Lottie (installed 2026-11-24)

Not a style on the list itself, but the vector/icon-reveal look used by several styles above (Flat Vector, Minimal Line, Kinetic type) benefits from generating actual Lottie/JSON vector animations instead of hand-coding every keyframe. Installed globally via `npx skills add -g diffusionstudio/lottie@text-to-lottie` -- previously listed as optional/tier-2, promoted to installed now since it's lightweight and the Flat-Vector-style group above directly benefits.
