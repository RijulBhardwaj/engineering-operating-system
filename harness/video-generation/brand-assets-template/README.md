# Brand Assets Template

Seed, not a shared live asset store. `setup.sh` copies this whole directory into each new project's `video/brand/` on first scaffold. The Remotion composition then imports colors/fonts/logo from its own project-local `video/brand/` instead of hardcoding them inline. Each project keeps adding to and editing its own copy over time (real logo files, real brand colors) -- changes there never flow back here, and changes here only affect projects scaffolded afterward.

Contents:
- `colors.json` -- stub palette (primary/secondary/accent/background/text).
- `fonts.json` -- stub font stack (heading/body/mono).
- `logo/` -- empty placeholder directory for the project's actual logo file(s).
