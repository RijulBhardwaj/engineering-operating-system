#!/usr/bin/env python3
"""Registry drift check for projects/project-registry.yaml.

Fails (exit 1) when any entry:
  - does not validate against schemas/project.schema.json (which requires a
    `profile:` block with size/risk/ui/team), or
  - has a `last_checkpoint` whose leading YYYY-MM-DD date is more than
    --max-age-days old (default 14), unless its status is exempt.

Usage:
  python3 scripts/registry/check_registry.py [--registry PATH] [--schema PATH]
                                             [--max-age-days N] [--today YYYY-MM-DD]
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

import yaml
from jsonschema import Draft7Validator

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_REGISTRY = REPO_ROOT / "projects" / "project-registry.yaml"
DEFAULT_SCHEMA = REPO_ROOT / "schemas" / "project.schema.json"

# A paused/finished project is expected to stop producing checkpoints, so a
# stale date there is not drift. planned/in-progress are still checked.
STALENESS_EXEMPT_STATUSES = {"paused", "complete", "archived"}

DATE_PREFIX = re.compile(r"^\s*(\d{4}-\d{2}-\d{2})")


def checkpoint_date(value: object) -> dt.date | None:
    if not isinstance(value, str):
        return None
    m = DATE_PREFIX.match(value)
    if not m:
        return None
    try:
        return dt.date.fromisoformat(m.group(1))
    except ValueError:
        return None


def check(registry: dict, schema: dict, today: dt.date, max_age_days: int) -> list[str]:
    errors: list[str] = []
    projects = registry.get("projects") if isinstance(registry, dict) else None
    if not isinstance(projects, list):
        return ["registry: top-level `projects:` list is missing or not a list"]

    validator = Draft7Validator(schema)
    seen_ids: set[str] = set()
    for i, entry in enumerate(projects):
        label = f"projects[{i}]"
        if isinstance(entry, dict) and entry.get("project_id"):
            label = str(entry["project_id"])

        for err in sorted(validator.iter_errors(entry), key=lambda e: list(e.path)):
            where = ".".join(str(p) for p in err.path) or "(entry)"
            errors.append(f"{label}: schema: {where}: {err.message}")

        if not isinstance(entry, dict):
            continue

        pid = entry.get("project_id")
        if pid in seen_ids:
            errors.append(f"{label}: duplicate project_id")
        seen_ids.add(pid)

        if entry.get("status") in STALENESS_EXEMPT_STATUSES:
            continue
        if "last_checkpoint" not in entry:
            continue  # already reported as a schema error
        date = checkpoint_date(entry.get("last_checkpoint"))
        if date is None:
            errors.append(f"{label}: last_checkpoint does not start with a valid YYYY-MM-DD date")
            continue
        age = (today - date).days
        if age > max_age_days:
            errors.append(
                f"{label}: last_checkpoint is {age} days old ({date}), limit is {max_age_days}"
            )
        elif age < 0:
            errors.append(f"{label}: last_checkpoint {date} is in the future")
    return errors


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--registry", type=Path, default=DEFAULT_REGISTRY)
    ap.add_argument("--schema", type=Path, default=DEFAULT_SCHEMA)
    ap.add_argument("--max-age-days", type=int, default=14)
    ap.add_argument("--today", type=dt.date.fromisoformat, default=None,
                    help="override today's date (UTC), for tests/reproducibility")
    args = ap.parse_args(argv)

    today = args.today or dt.datetime.now(dt.timezone.utc).date()
    registry = yaml.safe_load(args.registry.read_text(encoding="utf-8"))
    schema = json.loads(args.schema.read_text(encoding="utf-8"))

    errors = check(registry, schema, today, args.max_age_days)
    if errors:
        print(f"registry drift: {len(errors)} problem(s) in {args.registry.name} (today={today}):")
        for e in errors:
            print(f"  - {e}")
        return 1
    count = len(registry.get("projects", []))
    print(f"registry ok: {count} project(s), all have a valid profile and a checkpoint <= {args.max_age_days} days old")
    return 0


if __name__ == "__main__":
    sys.exit(main())
