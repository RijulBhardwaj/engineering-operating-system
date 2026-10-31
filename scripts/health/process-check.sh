#!/usr/bin/env bash
# On-demand health check for a long-running shell job: is it still making progress?
# Not a daemon -- run this by hand (or from a session) against a job you're waiting on.
# ponytail: no automatic kill, no background polling loop -- that needs a persistent host
# this account doesn't have. Upgrade path: a real watcher process if a host becomes available.
set -euo pipefail

usage() {
  echo "Usage: process-check.sh <pid> <output-file> [stall-seconds]" >&2
  echo "  Compares output-file's mtime against now. If older than stall-seconds (default 120)" >&2
  echo "  and the pid is still running, reports STALLED. Otherwise reports RUNNING or DONE." >&2
  exit 1
}

[ $# -ge 2 ] || usage
pid="$1"
outfile="$2"
stall_seconds="${3:-120}"

if ! kill -0 "$pid" 2>/dev/null; then
  echo "DONE: pid $pid no longer running"
  exit 0
fi

if [ ! -f "$outfile" ]; then
  echo "WARN: output file $outfile does not exist yet, pid $pid still running"
  exit 0
fi

now=$(date +%s)
mtime=$(date -r "$outfile" +%s 2>/dev/null || stat -c %Y "$outfile" 2>/dev/null)
age=$((now - mtime))

if [ "$age" -gt "$stall_seconds" ]; then
  echo "STALLED: pid $pid running, but $outfile has not changed in ${age}s (threshold ${stall_seconds}s)"
  echo "Recovery: inspect the tail of $outfile, decide whether to wait longer or terminate pid $pid yourself."
  exit 2
fi

echo "RUNNING: pid $pid active, $outfile updated ${age}s ago"
exit 0
