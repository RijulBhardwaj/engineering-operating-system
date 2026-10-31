#!/usr/bin/env bash
# Read-only health check. No writes.
set +e
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
pass=0; warn=0; fail=0

check() {
  local label="$1" status="$2"
  printf "%-45s %s\n" "$label" "$status"
  case "$status" in PASS) pass=$((pass+1));; WARN*) warn=$((warn+1));; FAIL*) fail=$((fail+1));; esac
}

if command -v git >/dev/null; then check "git installed" "PASS"; else check "git installed" "FAIL"; fi
if command -v gh >/dev/null; then check "gh CLI installed" "PASS"; else check "gh CLI installed" "WARN not found"; fi
if gh auth status >/dev/null 2>&1; then check "gh authenticated" "PASS"; else check "gh authenticated" "WARN not logged in"; fi
if [ -d "$CLAUDE_DIR" ]; then check "CLAUDE_DIR exists" "PASS"; else check "CLAUDE_DIR exists" "FAIL"; fi
if grep -qF "engineering-operating-system" "$CLAUDE_DIR/CLAUDE.md" 2>/dev/null; then check "global CLAUDE.md linked" "PASS"; else check "global CLAUDE.md linked" "WARN run install.sh"; fi
if [ -d "$REPO_DIR/.git" ]; then check "repo is a git checkout" "PASS"; else check "repo is a git checkout" "FAIL"; fi
if git -C "$REPO_DIR" remote get-url origin >/dev/null 2>&1; then check "origin remote configured" "PASS"; else check "origin remote configured" "WARN no remote set"; fi

echo "---"
echo "PASS=$pass WARN=$warn FAIL=$fail"
if [ "$fail" -gt 0 ]; then exit 1; fi
exit 0
