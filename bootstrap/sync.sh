#!/usr/bin/env bash
# Pull latest canonical config, report local drift. Never force-overwrites local changes.
set -euo pipefail
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

echo "== Sync =="
git fetch origin main

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "Up to date."
  exit 0
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "WARN: local uncommitted changes present. Stash or commit before syncing:"
  git status --short
  exit 1
fi

git merge --ff-only origin/main || {
  echo "FAIL: local main has diverged from origin/main -- resolve manually (merge conflict risk)."
  exit 1
}
echo "Synced to $(git rev-parse --short HEAD)."
