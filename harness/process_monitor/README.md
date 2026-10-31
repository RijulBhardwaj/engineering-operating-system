# Process Monitor

Real, but on-demand, not a background daemon: scripts/health/process-check.sh. Tested: RUNNING, DONE and STALLED paths all verified against a live shell PID during the build of this harness (see observability/progress/ checkpoint). Recovery on a STALLED report is manual -- the script reports, it does not auto-terminate or auto-retry. A real always-on watcher needs a persistent host this account does not currently have; documented as the upgrade path, not claimed as built.
