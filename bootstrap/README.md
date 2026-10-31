# Bootstrap

Reproduces the approved engineering environment on a new machine from this repo. GitHub is canonical; a machine's local Claude config is disposable and re-derivable.

## What it does

1. Verify git + GitHub CLI auth.
2. Clone/update this repo (if not already the cwd).
3. Detect the local Claude config directory (`~/.claude/`).
4. Symlink/copy the approved global `CLAUDE.md` fragment (see `install.sh` -- it appends a routing line, it does not overwrite your existing global CLAUDE.md).
5. Report what it did and did not touch.

## What it explicitly does NOT do

- Never overwrites an existing `~/.claude/CLAUDE.md` -- backs it up first, appends a reference line only.
- Never syncs secrets, API keys, or `~/.claude/.credentials.json`.
- Never installs hooks without telling you what they do first.

## Scripts

- `install.sh` / `install.ps1` -- first-time setup.
- `sync.sh` / `sync.ps1` -- pull latest, re-check for drift.
- `doctor.sh` / `doctor.ps1` -- health check only, no writes.
