"""Checks for the spec validator and HTML builder (no TTS, no render). Run: python -m pytest test_explainer.py"""
import copy
import json
from pathlib import Path

import pytest

import explainer as e

HERE = Path(__file__).parent
BASE = json.loads((HERE / "examples/reference-pacing.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("example", ["reference-pacing.json", "trig-hexagon.json"])
def test_examples_validate(example):
    e.validate(json.loads((HERE / "examples" / example).read_text(encoding="utf-8")))


@pytest.mark.parametrize("name,mutate", [
    ("quote in id", lambda s: s["counters"][0].update(id='a"b')),
    ("underscore in id", lambda s: s["counters"][0].update(id="a_b")),
    ("named colour", lambda s: s["counters"][0].update(color="white")),
    ("string number", lambda s: s["counters"][0].update(to="5")),
    ("empty bars", lambda s: s["charts"][0].update(bars=[])),
    ("value over max", lambda s: s["charts"][0]["bars"][0].update(value=99)),
    ("negative value", lambda s: s["charts"][0]["bars"][0].update(value=-1)),
    ("blank say", lambda s: s["beats"][0].update(say=" ")),
    ("missing x", lambda s: s["counters"][0].pop("x")),
    ("duplicate id", lambda s: s["counters"][1].update(id="videos")),
    ("unknown grow target", lambda s: s["beats"][2].update(grow=["videos"])),
    ("bad palette", lambda s: s.setdefault("palette", {}).update(bg="#fff")),
])
def test_bad_specs_rejected(name, mutate):
    spec = copy.deepcopy(BASE)
    mutate(spec)
    with pytest.raises(SystemExit):
        e.validate(spec)


def test_script_breakout_escaped():
    assert "</script>" not in e.js_str("</script><b>")


def test_already_visible_element_not_popped_again_and_pulse_waits():
    spec = {"nodes": [{"id": "a", "label": "A", "x": 0.5, "y": 0.5}],
            "beats": [{"say": "one", "show": ["a"], "pulse": ["a"]}, {"say": "two", "show": ["a"]}]}
    e.validate(spec)
    page = e.build_html(spec, [{"start": 1.0, "dur": 1}, {"start": 3.0, "dur": 1}], 5, 1080, 1920)
    assert page.count('tl.fromTo("#n-a"') == 1  # second beat does not replay the pop-in
    assert 'repeat: 1, ease: "power2.inOut"}, 1.40)' in page  # pulse after pop-in (0.8 + 0.15 + 0.45)
