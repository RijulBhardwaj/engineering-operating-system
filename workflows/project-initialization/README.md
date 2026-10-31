# Project Initialization

1. Discovery: problem, users, functional + non-functional requirements, constraints, success metrics. Ask only essential clarifying questions; document assumptions explicitly.
2. Spec: PRD -> functional/non-functional spec -> (if architecture-worthy) alternatives + ADR.
3. Structure: generate what the project actually needs (README, CLAUDE.md, tests, CI) -- not a universal template forced onto a weekend script.
4. Register it in `projects/project-registry.yaml`.
5. First branch, first PR, first CI run before calling it "set up."

Trivial/one-off scripts skip steps 2-3's heavier docs -- see `.claude/rules/architecture.md` for the trivial-change exception.

## Default file structure for a real (non-trivial) app

Adapt to the chosen architecture/language -- this is the starting skeleton, not a forced template:

```
<project>/
├── README.md                          -- what it is, link to setup-and-run doc
├── SETUP_AND_RUN.md                    -- filled from templates/setup-and-run/ (mandatory, Gate 6)
├── CLAUDE.md                          -- project-specific additions only, inherits harness rules
├── .env.example
├── .gitignore
├── docker-compose.yml                  -- if the app has more than one process (app + db, etc)
├── Dockerfile
├── docs/
│   ├── PRD.md                          -- from templates/PRD/
│   ├── technical-specification.md      -- from templates/technical-specification/
│   └── architecture/decisions/         -- this project's own ADRs
├── src/ (or the language's standard layout)
├── tests/
└── .github/workflows/                  -- CI: lint, test, security scan (same pattern as this harness's own)
```

## Running it locally once built (VS Code + Docker path)

1. `docker compose up --build` (or the project's equivalent) -- the exact command lives in `SETUP_AND_RUN.md`, not just here.
2. Open the project folder in VS Code; recommended extensions/devcontainer config goes in `.vscode/` if the stack benefits from it -- don't add speculative devcontainer config for a project that doesn't need it.
3. Verify with the one check named in `SETUP_AND_RUN.md`'s "Verify it's actually running" section before calling the build done.

