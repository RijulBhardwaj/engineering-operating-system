#!/usr/bin/env bash
# Scaffold a per-project Remotion + Kokoro TTS video workspace. Idempotent:
# safe to re-run against an existing target (create-video / venv steps skip
# if already present). See harness/video-generation/README.md for the full
# pipeline and what's global vs per-project.
set -euo pipefail

usage() {
  echo "Usage: setup.sh <target-dir>" >&2
  echo "  Scaffolds a Remotion project at <target-dir> and a Python venv with" >&2
  echo "  kokoro + soundfile at <target-dir>/tts-venv." >&2
  exit 1
}

[ $# -eq 1 ] || usage
target="$1"

if [ -d "$target" ] && [ -n "$(ls -A "$target" 2>/dev/null)" ]; then
  echo "Target '$target' exists and is non-empty -- skipping Remotion scaffold (assuming already set up)."
else
  npx --yes create-video@latest "$target" --blank --skills --yes --no-tailwind
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
brand_dir="$target/brand"
if [ -d "$brand_dir" ]; then
  echo "brand/ already exists at $brand_dir -- skipping template copy."
else
  cp -r "$script_dir/brand-assets-template" "$brand_dir"
fi

venv="$target/tts-venv"
if [ -d "$venv" ]; then
  echo "venv already exists at $venv -- skipping creation."
else
  python -m venv "$venv"
fi

# shortcut: assumes a POSIX-style venv layout (bin/); on native Windows Python
# this venv is activated via tts-venv/Scripts/activate instead -- upgrade path:
# detect OS and pick the right activate script if this trips a Windows session.
if [ -f "$venv/bin/pip" ]; then
  "$venv/bin/pip" install --quiet --upgrade pip
  "$venv/bin/pip" install --quiet kokoro soundfile
elif [ -f "$venv/Scripts/pip.exe" ]; then
  "$venv/Scripts/pip.exe" install --quiet --upgrade pip
  "$venv/Scripts/pip.exe" install --quiet kokoro soundfile
else
  echo "Could not find pip inside $venv -- venv creation may have failed." >&2
  exit 1
fi

cat <<EOF

Done. Next steps:
  cd "$target"
  npm i --loglevel=error          # Remotion deps
  npm run dev                     # Remotion Studio preview

  # Narration (Kokoro TTS), POSIX:
  source tts-venv/bin/activate
  # or on Windows:
  tts-venv\\Scripts\\activate

remotion-superpowers plugin skills, GSAP/Motion skills, and the Manim skill
are already global -- no per-project install needed for those.
EOF
