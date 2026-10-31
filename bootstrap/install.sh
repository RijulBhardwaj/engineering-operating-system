#!/usr/bin/env bash
# Bootstrap: install approved global CLAUDE.md reference + report environment.
# ponytail: no package manager detection, no OS branching beyond what's needed --
# this just checks tools exist and wires one reference line into the user's global CLAUDE.md.
set -euo pipefail

CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
GLOBAL_CLAUDE_MD="$CLAUDE_DIR/CLAUDE.md"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MARKER="# --- engineering-operating-system (managed, see below) ---"

echo "== Engineering OS bootstrap =="

command -v git >/dev/null || { echo "FAIL: git not found"; exit 1; }
command -v gh >/dev/null || echo "WARN: gh (GitHub CLI) not found -- PR/issue automation won't work until installed"

if ! gh auth status >/dev/null 2>&1; then
  echo "WARN: gh not authenticated. Run: gh auth login"
fi

mkdir -p "$CLAUDE_DIR"

if [ -f "$GLOBAL_CLAUDE_MD" ] && ! grep -qF "$MARKER" "$GLOBAL_CLAUDE_MD"; then
  cp "$GLOBAL_CLAUDE_MD" "$GLOBAL_CLAUDE_MD.bak.$(date +%s)"
  echo "Backed up existing $GLOBAL_CLAUDE_MD"
fi

if [ ! -f "$GLOBAL_CLAUDE_MD" ] || ! grep -qF "$MARKER" "$GLOBAL_CLAUDE_MD"; then
  {
    echo ""
    echo "$MARKER"
    echo "See $REPO_DIR/CLAUDE.md for engineering standards, agents, and workflows that apply across all projects."
    echo "# --- end engineering-operating-system ---"
  } >> "$GLOBAL_CLAUDE_MD"
  echo "Linked $GLOBAL_CLAUDE_MD -> $REPO_DIR/CLAUDE.md"
else
  echo "Already linked, skipping."
fi

echo "== Done. Run bootstrap/doctor.sh to verify. =="
