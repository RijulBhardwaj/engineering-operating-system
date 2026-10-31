# Project Initialization

1. Discovery: problem, users, functional + non-functional requirements, constraints, success metrics. Ask only essential clarifying questions; document assumptions explicitly.
2. Spec: PRD -> functional/non-functional spec -> (if architecture-worthy) alternatives + ADR.
3. Structure: generate what the project actually needs (README, CLAUDE.md, tests, CI) -- not a universal template forced onto a weekend script.
4. Register it in `projects/project-registry.yaml`.
5. First branch, first PR, first CI run before calling it "set up."

Trivial/one-off scripts skip steps 2-3's heavier docs -- see `.claude/rules/architecture.md` for the trivial-change exception.
