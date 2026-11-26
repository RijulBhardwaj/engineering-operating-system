# Software factory kit (template)

Source for the per-project factories. Each project gets a **copy** (never a link) so factories share nothing at runtime. Operating guide for an installed factory: [`kit/README.md`](kit/README.md). Design, hole-poking and research behind it: [`docs/research_notes/2026-11-27-software-factory-plan.md`](../../docs/research_notes/2026-11-27-software-factory-plan.md), [`docs/research_notes/2026-11-27-vibe-coding-verification-research.md`](../../docs/research_notes/2026-11-27-vibe-coding-verification-research.md).

## Installed factories (2026-11-27)
| Project | Config | Ports | Git pre-push | Status |
|---|---|---|---|---|
| fitness-intelligence-platform | `configs/fitness-intelligence-platform.json` | 4100-4119 | yes | installed on `chore/software-factory` |
| lynceon-ai | `configs/lynceon-ai.json` | 4200-4219 | yes | installed on `chore/software-factory` |
| CAT_Guide | `configs/cat-guide.json` | 4300-4319 | no (git dir shared with the parked root repo) | staged, not installed: its worktree holds another session's uncommitted work |
| engineering-operating-system | `configs/engineering-operating-system.json` | none | yes | installed on `chore/software-factory` |

## Install into a project (from that project's root, on a feature branch)
```
K=<path to this folder>
mkdir -p .claude/factory .claude/agents
cp $K/kit/*.mjs $K/kit/README.md .claude/factory/
cp $K/configs/<project>.json .claude/factory/factory.json   # or write one; schema = the existing configs
cp $K/kit/templates/settings.json .claude/settings.json     # back up any existing file first and merge
cp -n $K/kit/templates/agents/*.md .claude/agents/
printf '.claude/factory/** text eol=lf\n' >> .gitattributes
node .claude/factory/install.mjs      # key, pre-push hook, gitignore lines
node .claude/factory/selftest.mjs     # must report N/N passed
git add .claude .gitattributes .gitignore && git commit -m "chore(factory): add software factory" -m "FACTORY-CHANGE-APPROVED: <who approved>"
node .claude/factory/audit.mjs
```
Updating the kit later: change it here first, copy to each project, commit there with a `FACTORY-CHANGE-APPROVED:` trailer, re-run selftest.
