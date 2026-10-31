#!/usr/bin/env bash
# Manual, on-demand check: for each GitHub-sourced registry entry, fetch its current
# pushed_at/archived status and flag entries that look stale or newly archived.
# Run by hand when you want to re-verify the registry -- not scheduled, no daemon.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

command -v gh >/dev/null || { echo "FAIL: gh CLI required"; exit 1; }

echo "== Registry refresh check =="
grep -hoE 'source: .*github\.com/[A-Za-z0-9._-]+/[A-Za-z0-9._-]+' registry/*.yaml \
  | sed -E 's#.*github\.com/([A-Za-z0-9._-]+/[A-Za-z0-9._-]+).*#\1#' \
  | sort -u \
  | while read -r repo; do
      info=$(gh api "repos/$repo" --jq '"\(.archived) \(.pushed_at)"' 2>/dev/null) || {
        echo "WARN  $repo -- could not fetch (renamed, deleted, or private?)"
        continue
      }
      archived=$(echo "$info" | cut -d' ' -f1)
      pushed=$(echo "$info" | cut -d' ' -f2)
      if [ "$archived" = "true" ]; then
        echo "FLAG  $repo -- now ARCHIVED, re-evaluate its registry entry"
      else
        echo "OK    $repo -- active, last pushed $pushed"
      fi
    done
echo "== Done. Cross-check FLAG/WARN lines against registry/*.yaml and update last_reviewed when you act on this. =="
