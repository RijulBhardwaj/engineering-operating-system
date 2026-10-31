# Skill/Tool Installation Authorization

Standing rule, set 2026-10-31, supersedes the "needs per-item review before install" default in registry/skills.yaml for the case below.

## Authorized without asking each time

Installing a skill/tool/MCP server/plugin when it is actually needed to build or maintain an active project (registered in projects/project-registry.yaml). Still required before install, every time: source inspection (read what it actually does), compatibility check, dependency check, update registry/skills.yaml or registry/tools.yaml with the decision and evidence. Security review is not skipped -- only the "ask permission first" step is.

## Still requires asking first

- A *new* skill/tool discovered independently (not supplied by the user, not needed for an active project) -- surface it, don't install it, wait for a yes.
- Anything requesting broad permissions (MCP/hook-level tool-call interception, unrestricted filesystem/network access) regardless of source.
- Anything with no active project need yet (the speculative candidates in registry/skills.yaml stay not-installed until a project needs them).

## Daily discovery review

User wants a once-a-day check for new GitHub skills/tools that could help the build process. `scripts/discovery/registry-refresh-check.sh` checks existing registry entries for staleness; it does not search for *new* candidates. Finding new candidates is a research task (WebSearch/gh search), not a script -- run manually or via a scheduled trigger once a day, report findings, wait for a yes before installing any of them (per "still requires asking first" above).

## New feature requests from the user

When the user hands over a new feature/resource to add (a URL, a tool name, a description): classify it (skill / MCP server / plugin / tool / infrastructure -- see schemas/registry-entry.schema.json categories), add it to the correct registry/*.yaml file with a decision, and use it going forward wherever relevant. Don't just file it and forget it -- it's live inventory the moment it's classified correctly.
