# Improvement

Implemented as a manual, on-demand review procedure: scripts/discovery/ (run it when you want to re-check the registry against upstream reality), not a scheduled job. See registry/*.yaml 'last_reviewed' fields -- treat anything not re-run recently as potentially stale.
