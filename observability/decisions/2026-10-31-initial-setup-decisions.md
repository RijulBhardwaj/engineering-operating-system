# Setup decisions -- 2026-10-31

- Repo name: `engineering-operating-system`, private. Account is `RijulBhardwaj` (the pasted prompt said `rijulbo3`, which does not exist on GitHub -- corrected after `gh repo list` returned "owner handle not recognized").
- No LICENSE added: this is a personal private config repo, not an open-source release. Add one only if it's ever made public.
- No CONTRIBUTING.md / CODE_OF_CONDUCT.md: solo repo, no external contributors yet. Add when that changes, not speculatively.
- CI trimmed to validate (shellcheck+yamllint) + security (gitleaks) + dependency-review. Skipped test.yml/release.yml/documentation.yml/repository-health.yml from the original spec list -- there's no application code or release artifact in this repo to drive them yet. Add each when a real need shows up.
- `develop` branch not created -- trunk-based (feature branches -> main) fits a solo repo better than a permanent integration branch. Revisit if collaborators join.
