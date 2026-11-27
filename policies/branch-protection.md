# Branch Protection Policy

`main` is protected on every repo bootstrapped from this system:
- No direct pushes (PR required).
- Require status checks to pass before merge, set as required checks in GitHub: `shellcheck`, `yaml-lint` (validate.yml) and `secret-scan` (security.yml) at minimum. (Not yet applied on this repo as of 2026-11-27 -- see `FINAL_IMPLEMENTATION_REPORT.md` OS-02.)
- Required approvals in GitHub: **0** on a solo repo. GitHub doesn't let a PR author approve their own PR, so requiring 1 approval with admin enforcement on blocks every merge. The review step is still mandatory as process, not as a GitHub setting: re-read the full diff (or run the review passes in `.claude/rules/release-review-passes.md`) before merging. Raise this to 1 the day a repo gets a second collaborator.
- No force-push to main. No bypass, including admin bypass, unless this specific repo has no collaborators and the action is reversible.

Applied to this repo via `gh api repos/:owner/:repo/branches/main/protection` -- see `FINAL_IMPLEMENTATION_REPORT.md` for actual applied ruleset and any gaps.

Private repos on the free GitHub plan can't use branch protection at all (API returns 403). For those, this policy is followed by hand and CI still runs on every PR.
