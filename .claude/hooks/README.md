# Hooks

This repo does not ship global hooks by default -- hooks are account/machine config (`~/.claude/settings.json`), not repo-synced config, since they can execute arbitrary commands and must stay under explicit local control. See `bootstrap/README.md` for what bootstrap *checks* vs *installs*.

If a project needs a repo-local hook (e.g. pre-commit secret scan), define it in that project's own `.claude/settings.json`, not here.
