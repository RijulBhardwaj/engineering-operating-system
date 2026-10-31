# Branch Protection Policy

`main` is protected on every repo bootstrapped from this system:
- No direct pushes (PR required).
- Require status checks to pass before merge (CI: validate + security at minimum).
- Require 1 review (self-review acceptable for a solo repo, but the review step -- re-reading the diff -- is not skippable).
- No force-push to main. No bypass, including admin bypass, unless this specific repo has no collaborators and the action is reversible.

Applied to this repo via `gh api repos/:owner/:repo/branches/main/protection` -- see `FINAL_IMPLEMENTATION_REPORT.md` for actual applied ruleset and any gaps.
