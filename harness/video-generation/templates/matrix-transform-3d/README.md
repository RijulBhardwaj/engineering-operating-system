# Matrix Transform 3D (template)

Drop-in Remotion template for "real math transforming a real 3D object" content: a
mesh driven frame-by-frame by an explicit `THREE.Matrix4` (built with `makeRotationY`
+ `makeScale`, not a canned animation helper), with a live on-screen overlay of the
matrix values and a transformed-corner readout.

Proven working via `harness/video-generation/_eval/three-matrix-test/` (see
`animation-styles.md`'s "True 3D" section) — rendered to a real MP4 with
`npx remotion render`, 150/150 frames, 0 errors.

## Use this for
CGI Motion, Explainer 3D, 3D Data Chart, Glow Atom styles, or any brief that wants a
spinning/transforming 3D shape with the underlying matrix math shown, not faked.

## Drop-in steps
1. Copy this folder's `src/` into the target Remotion project (or copy the whole
   folder and `npm install` its `package.json` deps: `@remotion/three`, `three`,
   `remotion`, `react`, `react-dom`).
2. Register `MatrixTransform` as a `<Composition>` (see `src/Root.tsx`) or import
   `MatrixCube.tsx`'s `MatrixTransform` component directly into an existing Root.
3. Swap the geometry (`boxGeometry` in `MatrixCube.tsx`), the matrix construction
   (model/view/projection — whatever the script calls for), and the overlay copy/CTA
   question to match the actual script.
4. Render: `npx remotion render src/index.ts MatrixTransform out/<name>.mp4`.

## What's real here
- `THREE.Matrix4` built and multiplied per frame (model = rotation * scale), applied
  to the mesh via `matrixAutoUpdate={false}` + explicit `matrix` prop — not an eased
  spring or Remotion `interpolate` faking a transform.
- The overlay reads the matrix's own `.elements` and a `Vector3.applyMatrix4` result
  live, every frame — the numbers on screen are the numbers actually driving the mesh.
- `@remotion/three`'s `<ThreeCanvas>` renders the three.js scene deterministically
  inside Remotion's frame-by-frame render pipeline (not a live/realtime canvas loop).

## Honest caveat
This template was built to match the *described genre and technique* of a referenced
Instagram reel (3D object transformed live by rotation/model/view/projection matrices,
minimal on-screen matrix/axis overlay, ending on an engagement question) — the caption
was readable but the actual video frames were never watched (Instagram serves no
frames to a logged-out fetch). Treat this as "the right category of thing," not a
verified shot-for-shot match.
