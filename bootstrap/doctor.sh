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

command -v git >/dev/null && check "git installed" "PASS" || check "git installed" "FAIL"
command -v gh >/dev/null && check "gh CLI installed" "PASS" || check "gh CLI installed" "WARN not found"
gh auth status >/dev/null 2>&1 && check "gh authenticated" "PASS" || check "gh authenticated" "WARN not logged in"
[ -d "$CLAUDE_DIR" ] && check "~/.claude exists" "PASS" || check "~/.claude exists" "FAIL"
grep -qF "engineering-operating-system" "$CLAUDE_DIR/CLAUDE.md" 2>/dev/null && check "global CLAUDE.md linked" "PASS" || check "global CLAUDE.md linked" "WARN run install.sh"
[ -d "$REPO_DIR/.git" ] && check "repo is a git checkout" "PASS" || check "repo is a git checkout" "FAIL"
git -C "$REPO_DIR" remote get-url origin >/dev/null 2>&1 && check "origin remote configured" "PASS" || check "origin remote configured" "WARN no remote set"

echo "---"
echo "PASS=$pass WARN=$warn FAIL=$fail"
[ "$fail" -gt 0 ] && exit 1
exit 0
