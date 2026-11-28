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


# each case asserts the message of the check it targets, so an unrelated earlier failure cannot pass it
@pytest.mark.parametrize("mutate,message", [
    (lambda s: s["counters"][0].update(id='a"b'), "may only use letters"),
    (lambda s: s["counters"][0].update(id="a_b"), "may only use letters"),
    (lambda s: s["counters"][0].update(id="a\n"), "may only use letters"),
    (lambda s: s["counters"][0].update(color="#ffffff\n"), "must be #rrggbb"),
    (lambda s: s["counters"][0].update(size=0), "size must be > 0"),
    (lambda s: s.update(voice=""), "voice must be"),
    (lambda s: s.update(palette=[]), "palette must be an object"),
    (lambda s: s["beats"].append("x"), "must be an object"),
    (lambda s: s["counters"][0].update(color="white"), "must be #rrggbb"),
    (lambda s: s.setdefault("palette", {}).update(bg="#fff"), "must be #rrggbb"),
    (lambda s: s["counters"][0].update(to="5"), "'to' must be a finite number"),
    (lambda s: s["counters"][0].update(to=float("inf")), "'to' must be a finite number"),
    (lambda s: s["counters"][0].update(decimals='1"><img>'), "decimals must be an integer"),
    (lambda s: s["charts"][0].update(decimals='1"><img>'), "decimals must be an integer"),
    (lambda s: s["charts"][0].update(max="16"), "'max' must be a finite number"),
    (lambda s: s["charts"][0].update(bars=[]), "has no bars"),
    (lambda s: s["charts"][0]["bars"][0].update(value=99), "within 0..max"),
    (lambda s: s["charts"][0]["bars"][0].update(value=-1), "within 0..max"),
    (lambda s: s["counters"][0].update(label=5), "'label' must be text"),
    (lambda s: s["beats"][0].update(say=" "), "non-empty 'say'"),
    (lambda s: s["beats"][0].update(hold=-1), "'hold' must be >= 0"),
    (lambda s: s.update(speed=0), "speed must be > 0"),
    (lambda s: s.pop("beats"), "no beats"),
    (lambda s: s["counters"][0].pop("x"), "missing 'x'"),
    (lambda s: s["counters"][1].update(id="videos"), "must be unique"),
    (lambda s: s["beats"][2].update(grow=["videos"]), "unknown"),
    (lambda s: s["beats"][2].update(show="pace"), "must be a list of ids"),
    (lambda s: s["beats"][2].update(draw=[["a", ["b"]]]), "must be a pair of node ids"),
])
def test_bad_specs_rejected(mutate, message):
    spec = copy.deepcopy(BASE)
    mutate(spec)
    with pytest.raises(SystemExit, match=message):
        e.validate(spec)


def test_script_breakout_escaped():
    for s in ("</script><b>", "<!--<script>"):
        out = e.js_str(s)
        assert "<" not in out and json.loads(out) == s  # same string for JS, no raw '<' for the HTML tokenizer


def test_counter_and_chart_markup_escaped_and_animated():
    spec = copy.deepcopy(BASE)
    spec["counters"][0]["label"] = "<b>x</b>"
    spec["beats"][0]["caption"] = "</script>"
    e.validate(spec)
    timing = [{"start": 1.0 + 3 * i, "dur": 2} for i in range(len(spec["beats"]))]
    page = e.build_html(spec, timing, 25, 1080, 1920)
    assert "&lt;b&gt;x&lt;/b&gt;" in page and "<b>x</b>" not in page
    assert page.count("</script>") == 2  # the gsap include and the timeline block, nothing from the caption
    assert 'count("#k-videos .num", 0, 5,' in page
    assert page.count('.bar", {scaleY: 0}') == 5  # one grow tween per bar


def test_already_visible_element_not_popped_again_and_pulse_waits():
    spec = {"nodes": [{"id": "a", "label": "A", "x": 0.5, "y": 0.5}],
            "beats": [{"say": "one", "show": ["a"], "pulse": ["a"]}, {"say": "two", "show": ["a"]}]}
    e.validate(spec)
    page = e.build_html(spec, [{"start": 1.0, "dur": 1}, {"start": 3.0, "dur": 1}], 5, 1080, 1920)
    assert page.count('tl.fromTo("#n-a"') == 1  # second beat does not replay the pop-in
    assert 'repeat: 1, ease: "power2.inOut"}, 1.25)' in page  # pulse right after pop-in (0.8 + 0.45)
