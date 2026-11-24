# Video Generation Toolkit

A generic, project-agnostic pipeline for making explainer/diagram videos: concept -> script -> math/code diagrams -> narration -> composed video -> SFX -> render -> rollout. Any project or session can spin up its own independent workspace with `setup.sh`; this folder is the toolkit's home, not a specific video's home. **CAT_Guide** (`video/` subfolder) is the first consumer, not where the toolkit lives.

See also: [animation-styles.md](animation-styles.md) (which tool renders which named animation style) and [brand-assets-template/](brand-assets-template/) (per-project colors/fonts/logo seed, copied in by `setup.sh`).

## Pipeline stages

1. **Concept** -- what the video explains, for whom, how long.
2. **Script + scene plan** -- narration text broken into scenes/beats (remotion-superpowers' `create-video`/`create-short` skills do this).
3. **Manim diagram code** -- 3Blue1Brown-style math/code animations generated as Manim scenes.
4. **Parallel render**: Manim renders diagram clips (frames) while Kokoro TTS renders narration audio for the same scenes -- independent, run side by side.
5. **Remotion composition** -- diagram clips + narration audio + captions/music assembled into a timeline (`remotion-superpowers` skills: `add-voiceover`, `add-captions`, `add-music`, `add-transitions`), importing colors/fonts/logo from the project's own `video/brand/` (see brand-assets-template below) rather than hardcoding them.
6. **SFX** -- sound effects for the composition, two-tier, both free/local/no-API-key-required for moderate use:
   - **Tier 1 (search first):** [Openverse](https://openverse.org) API -- free CC-licensed audio/SFX search. Anonymous HTTP calls work without a key for moderate use; register for a key only if rate-limited under heavy use. No install needed.
   - **Tier 2 (generate if nothing matches):** [earshot](https://github.com/Leonxlnx/earshot) -- open-source, MIT, CPU-only CLI/Python-API/MCP-server that synthesizes new sound effects in code (`earshot forge`) when Openverse has no good match, plus a bank of ~900 effects-as-code it can render directly. See `registry/tools.yaml`'s `earshot` entry for install status.
   - A tool named "Real SFX" was proposed via an ad but could not be verified anywhere (no GitHub, no docs) -- not installed; Openverse + earshot cover the same job for free and are independently verifiable.
7. **Remotion Studio preview loop** -- `npm run dev`, iterate visually.
8. **Remotion render** -- `npx remotion render` to final MP4.
9. **Finalize** -- review pass (`remotion-superpowers:review-video`), fix, re-render.
10. **Rollout** -- hand off / publish (project-specific, out of scope here).

## Tool list and install status

| Tool | What it does | Install status |
|---|---|---|
| [Remotion](https://remotion.dev) | React-based video composition/render engine | Per-project npm dependency -- scaffolded fresh into each project's `video/` dir via `create-video@latest`. Cannot be "installed globally" in a meaningful sense; each project's compositions are its own code. |
| [remotion-superpowers](https://github.com/remotion-dev) Claude Code plugin | Script/scene-plan/voiceover/music/caption orchestration skills on top of Remotion (`create-video`, `create-short`, `add-voiceover`, `add-captions`, `add-music`, `add-transitions`, `review-video`, etc.) | **Global** -- installed as a Claude Code plugin, available account-wide to any project/session already. |
| [Kokoro TTS](https://github.com/hexgrad/kokoro) | Local, CPU-only, Apache-2.0 text-to-speech for narration | **Per-project** -- Python package in an isolated venv (`<video-dir>/tts-venv`). A venv is inherently per-project; there is no meaningful "global Kokoro install" (Python envs don't share across unrelated Remotion projects cleanly), so `setup.sh` recreates it fresh each time. |
| GSAP + Motion Design Claude skills | Web animation easing/timeline knowledge, usable inside Remotion compositions | **Global** -- already available account-wide, no install needed. |
| [Manim skill](https://github.com/adithya-s-k/manim_skill) (`manimce-best-practices`, `manimgl-best-practices`, `manim-composer`) | Best-practice knowledge + code patterns for 3Blue1Brown-style math/diagram animations (Manim Community Edition and ManimGL) | **Global** -- installed 2026-11-24 via `npx skills add -g adithya-s-k/manim_skill`, landing in `~/.agents/skills/` and symlinked into `~/.claude/skills/`, the same mechanism and location as the pre-existing GSAP/Motion skills. Available to any project automatically. **Caveat**: these are *skills* (knowledge/patterns for the agent), not the Manim renderer itself -- actually rendering a scene still needs the `manim` (or `manimgl`) Python package, FFmpeg, and a LaTeX distribution installed wherever the render runs (per the skill's own README). That has not been verified on this machine: no GPU/LaTeX dependency check was run. The first project that actually renders a Manim scene needs to confirm `pip install manim`, FFmpeg on PATH, and a LaTeX distribution (MiKTeX on Windows) separately. |
| [earshot](https://github.com/Leonxlnx/earshot) | CPU-only SFX synthesis-in-code (CLI/Python API/MCP server), Tier-2 fallback behind Openverse search | **Global (user-scope)**, same tier as remotion-superpowers/GSAP/Motion -- see `registry/tools.yaml`'s `earshot` entry for exact install status/verification. |
| [threejs-fundamentals](https://skills.sh/CloudAI-X/threejs-skills) skill | Three.js scene/camera/renderer fundamentals for genuine 3D rendering inside a Remotion composition | **Global** -- installed 2026-11-24 via `npx skills add -g cloudai-x/threejs-skills@threejs-fundamentals`. Reverses an earlier "not needed yet" decision -- see `animation-styles.md`'s True-3D section for the named styles that justify it. |
| [text-to-lottie](https://skills.sh/diffusionstudio/lottie) skill | Generates/edits Lottie (Bodymovin JSON) vector animations | **Global** -- installed 2026-11-24 via `npx skills add -g diffusionstudio/lottie@text-to-lottie`. Promoted from optional/tier-2 to installed -- lightweight, and directly useful for the Flat-Vector/icon-reveal styles in `animation-styles.md`. |

## How any session invokes this

Run `harness/video-generation/setup.sh <target-dir>` from any project. It scaffolds an independent Remotion + Kokoro workspace at `<target-dir>`:

```bash
harness/video-generation/setup.sh ../my-project/video
```

This is idempotent and safe to run once per workspace. Because each call creates its own Remotion project and its own `tts-venv`, multiple projects -- or multiple parallel video tasks within one project -- can each run an independent instance without colliding; only the *shared* tools (remotion-superpowers plugin, GSAP/Motion skills, Manim skill) are centralized, matching how those already work for any other project.

What the script does NOT do: it does not centralize per-project state (scripts, scene plans, rendered clips, voice samples) here in the harness -- that belongs to the consuming project, same as any other per-project artifact.
