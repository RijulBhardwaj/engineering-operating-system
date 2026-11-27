"""Unit tests for check_registry.py. Run: python3 -m unittest discover -s scripts/registry"""
import copy
import datetime as dt
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import check_registry as cr

SCHEMA = json.loads(cr.DEFAULT_SCHEMA.read_text(encoding="utf-8"))
TODAY = dt.date(2026, 11, 26)

GOOD = {
    "project_id": "demo",
    "name": "Demo",
    "status": "in-progress",
    "profile": {"size": "small", "risk": "low", "ui": "none", "team": "solo-agent"},
    "last_checkpoint": "2026-11-20: did a thing",
}


def run(*entries, max_age=14):
    return cr.check({"projects": list(entries)}, SCHEMA, TODAY, max_age)


def with_(**changes):
    e = copy.deepcopy(GOOD)
    for k, v in changes.items():
        if v is None:
            e.pop(k, None)
        else:
            e[k] = v
    return e


class ProfileTests(unittest.TestCase):
    def test_good_entry_passes(self):
        self.assertEqual(run(GOOD), [])

    def test_missing_profile_fails(self):
        errs = run(with_(profile=None))
        self.assertTrue(any("'profile' is a required property" in e for e in errs), errs)

    def test_profile_missing_key_fails(self):
        errs = run(with_(profile={"size": "small", "risk": "low", "ui": "none"}))
        self.assertTrue(any("'team' is a required property" in e for e in errs), errs)

    def test_profile_bad_enum_fails(self):
        errs = run(with_(profile={**GOOD["profile"], "risk": "high"}))
        self.assertTrue(any("profile.risk" in e for e in errs), errs)

    def test_profile_unknown_key_fails(self):
        errs = run(with_(profile={**GOOD["profile"], "extra": 1}))
        self.assertTrue(any("Additional properties" in e for e in errs), errs)

    def test_profile_not_object_fails(self):
        self.assertTrue(run(with_(profile="small")))


class CheckpointTests(unittest.TestCase):
    def test_exactly_at_limit_passes(self):
        self.assertEqual(run(with_(last_checkpoint="2026-11-12")), [])

    def test_one_day_over_limit_fails(self):
        errs = run(with_(last_checkpoint="2026-11-11: x"))
        self.assertTrue(any("15 days old" in e for e in errs), errs)

    def test_missing_checkpoint_fails(self):
        errs = run(with_(last_checkpoint=None))
        self.assertTrue(any("'last_checkpoint' is a required property" in e for e in errs), errs)

    def test_no_date_prefix_fails(self):
        errs = run(with_(last_checkpoint="sometime last week"))
        self.assertTrue(any("YYYY-MM-DD" in e for e in errs), errs)

    def test_invalid_calendar_date_fails(self):
        errs = run(with_(last_checkpoint="2026-02-30: x"))
        self.assertTrue(any("valid YYYY-MM-DD" in e for e in errs), errs)

    def test_future_date_fails(self):
        errs = run(with_(last_checkpoint="2026-12-01"))
        self.assertTrue(any("in the future" in e for e in errs), errs)

    def test_exempt_status_skips_staleness_but_not_profile(self):
        self.assertEqual(run(with_(status="paused", last_checkpoint="2020-01-01")), [])
        self.assertTrue(run(with_(status="archived", profile=None, last_checkpoint="2020-01-01")))

    def test_planned_is_not_exempt(self):
        self.assertTrue(run(with_(status="planned", last_checkpoint="2020-01-01")))

    def test_custom_max_age(self):
        self.assertTrue(run(with_(last_checkpoint="2026-11-20"), max_age=3))


class StructureTests(unittest.TestCase):
    def test_missing_projects_list(self):
        self.assertTrue(cr.check({}, SCHEMA, TODAY, 14))
        self.assertTrue(cr.check(None, SCHEMA, TODAY, 14))

    def test_duplicate_ids(self):
        errs = run(GOOD, GOOD)
        self.assertTrue(any("duplicate project_id" in e for e in errs), errs)

    def test_non_dict_entry_reported_not_crash(self):
        self.assertTrue(run("just a string"))

    def test_empty_registry_passes(self):
        self.assertEqual(run(), [])


class CliTests(unittest.TestCase):
    def test_exit_codes(self):
        import tempfile

        import yaml
        with tempfile.TemporaryDirectory() as d:
            p = Path(d) / "r.yaml"
            p.write_text(yaml.safe_dump({"projects": [GOOD]}))
            self.assertEqual(cr.main(["--registry", str(p), "--today", "2026-11-26"]), 0)
            self.assertEqual(cr.main(["--registry", str(p), "--today", "2027-01-01"]), 1)


if __name__ == "__main__":
    unittest.main()
