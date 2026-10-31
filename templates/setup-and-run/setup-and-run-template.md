# Setup & Run: <project name>

Shipped alongside every application built through this harness -- this is Gate 6 of `.claude/rules/architecture.md` ("deploy and post-deploy checks pass"), not optional.

## Prerequisites
<!-- exact versions: e.g. Docker 24+, Node 20+, Python 3.12 -- not "recent version" -->

## First-time setup
```bash
git clone <repo-url>
cd <project>
cp .env.example .env   # fill in real values
```

## Run locally
```bash
<exact command, e.g. docker compose up --build>
```
Then open: <url, e.g. http://localhost:3000>

## Run tests
```bash
<exact command>
```

## Deploy
<actual target named -- Fly.io / Railway / a VPS / etc, with the real deploy command, not a placeholder>

## Verify it's actually running
<the one command/curl/click that proves it works, e.g. `curl localhost:3000/health` -> expects `{"status":"ok"}`>

## Troubleshooting
<the 2-3 things that actually went wrong while building this, not a generic list>
