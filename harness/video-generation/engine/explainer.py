"""Explainer-reel engine: spec JSON -> narrated, animated diagram video (HyperFrames + Kokoro).

Style source: reference reel DgOhKCftUY1 (one continuous dark canvas, colour-coded nodes, yellow title
zone, caption zone, calm British narration, no music). Rules: docs/research_notes/video-references/PLAYBOOK.md.

Usage:
  python explainer.py spec.json [--out DIR] [--no-render]
Run with the Kokoro venv's python (CAT_Guide/video/tts-venv) -- it needs kokoro, numpy, soundfile.

Spec shape (see examples/trig-hexagon.json):
  {"voice": "bf_emma", "speed": 1.2, "resolution": "portrait",
   "palette": {"bg": "#05080f", "title": "#f5c542", "caption": "#4fd1e8", "line": "#5b6b8c"},
   "nodes": [{"id": "sin", "label": "sin θ", "x": 0.37, "y": 0.24, "color": "#34d399"}],   # x,y = fraction of frame
   "edges": [["sin", "cos"]],
   "counters": [{"id": "n", "x": 0.5, "y": 0.3, "to": 27, "from": 0, "prefix": "", "suffix": "",
                 "label": "identities", "color": "#f5c542", "size": 0.16}],               # x,y = centre
   "charts": [{"id": "c", "x": 0.1, "y": 0.3, "w": 0.8, "h": 0.32, "max": 20, "decimals": 1,
               "bars": [{"label": "A", "value": 12, "color": "#60a5fa"}]}],              # x,y = top-left
   "beats": [{"say": "narration line",
              "title": "optional new title", "caption": "optional caption",
              "show": ["node/counter/chart ids to pop in"], "draw": [["a", "b"]], "pulse": ["ids"],
              "hide": ["ids"], "count": ["counter ids"], "grow": ["chart ids"], "hold": 0.3}]}
Each beat lasts as long as its narration (+ gap/hold); its visual actions start LEAD_VISUAL before it.
"""
import argparse
import html
import json
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SR = 24000
GAP, LEAD, TAIL = 0.35, 0.6, 1.8
LEAD_VISUAL = 0.2  # playbook: visuals land ~200ms before the spoken word
SIZES = {"portrait": (1080, 1920), "landscape": (1920, 1080), "square": (1080, 1080)}
HF = "hyperframes@0.9.104"  # pinned: the version verified rendering on Windows 2026-11-28
ID = re.compile(r"^[A-Za-z0-9-]+$")  # edge ids join two node ids with "__", so no "_" in ids
COLOUR = re.compile(r"^#[0-9a-fA-F]{6}$")  # glow appends a 2-digit alpha, so only #rrggbb works
SAFE_NAME = re.compile(r"^[\w.-]+$")  # output name is passed through npx.cmd, i.e. parsed by cmd.exe


def tts(spec, out):
    import numpy as np
    import soundfile as sf
    from kokoro import KPipeline
    voice = spec.get("voice", "bf_emma")
    pipe = KPipeline(lang_code=voice[0])  # 'a' American, 'b' British: first letter of the voice id
    parts, t, timing = [np.zeros(int(LEAD * SR), np.float32)], LEAD, []
    for b in spec["beats"]:
        chunks = [np.asarray(a, np.float32) for _, _, a in pipe(b["say"], voice=voice, speed=spec.get("speed", 1.2))]
        audio = np.concatenate(chunks) if chunks else np.zeros(0, np.float32)
        if not len(audio):
            sys.exit(f"Kokoro produced no audio for beat {b['say'][:40]!r}")
        d = len(audio) / SR
        timing.append({"start": round(t, 3), "dur": round(d, 3)})
        gap = GAP + b.get("hold", 0)
        parts += [audio, np.zeros(int(gap * SR), np.float32)]
        t += d + gap
    parts.append(np.zeros(int(TAIL * SR), np.float32))
    sf.write(out / "narration.wav", np.concatenate(parts), SR)
    return timing, round(t + TAIL, 3)


def js_str(s):
    """JSON string safe inside an inline <script>: escaping every '<' covers both '</script>' and '<!--'."""
    return json.dumps(s).replace("<", "\\u003c")


def build_html(spec, timing, total, w, h):
    p = {"bg": "#05080f", "title": "#f5c542", "caption": "#4fd1e8", "line": "#5b6b8c", **spec.get("palette", {})}
    node_list = spec.get("nodes", [])  # nodes are optional: a chart- or counter-only video is valid
    nodes = {n["id"]: n for n in node_list}
    r = int(min(w, h) * 0.075)  # node radius
    edges_svg, nodes_html = [], []
    for a, b in spec.get("edges", []):
        A, B = nodes[a], nodes[b]
        edges_svg.append(f'<line id="e-{a}__{b}" class="edge" x1="{A["x"] * w:.0f}" y1="{A["y"] * h:.0f}" '
                         f'x2="{B["x"] * w:.0f}" y2="{B["y"] * h:.0f}"/>')
    for n in node_list:
        c = n.get("color", "#ffffff")
        nodes_html.append(
            f'<div id="n-{n["id"]}" class="node" style="left:{n["x"] * w - r:.0f}px;top:{n["y"] * h - r:.0f}px;'
            f'width:{2 * r}px;height:{2 * r}px;border-color:{c};color:{c};box-shadow:0 0 28px {c}55">'
            f'{html.escape(n["label"])}</div>')

    sel = {n["id"]: f"#n-{n['id']}" for n in node_list}
    extra_html = []
    for k in spec.get("counters", []):
        sel[k["id"]] = f"#k-{k['id']}"
        c, fs = k.get("color", p["title"]), k.get("size", 0.16) * w
        extra_html.append(
            f'<div id="k-{k["id"]}" class="counter" style="left:{k["x"] * w:.0f}px;top:{k["y"] * h:.0f}px;color:{c}">'
            f'<div style="font-size:{fs:.0f}px">{html.escape(k.get("prefix", ""))}'
            f'<span class="num" data-d="{k.get("decimals", 0)}">{k.get("from", 0)}</span>'
            f'{html.escape(k.get("suffix", ""))}</div>'
            f'<div class="lbl" style="font-size:{fs * 0.28:.0f}px">{html.escape(k.get("label", ""))}</div></div>')
    for ch in spec.get("charts", []):
        sel[ch["id"]] = f"#c-{ch['id']}"
        top = ch.get("max") or max(b["value"] for b in ch["bars"])
        cols = "".join(
            f'<div class="col"><div class="val num" data-d="{ch.get("decimals", 0)}">0</div>'
            f'<div class="bar" style="height:{100 * b["value"] / top:.1f}%;background:{b.get("color", p["caption"])}"></div>'
            f'<div class="blbl">{html.escape(b["label"])}</div></div>' for b in ch["bars"])
        extra_html.append(
            f'<div id="c-{ch["id"]}" class="chart" style="left:{ch["x"] * w:.0f}px;top:{ch["y"] * h:.0f}px;'
            f'width:{ch["w"] * w:.0f}px;height:{ch["h"] * h:.0f}px">{cols}</div>')
    charts = {ch["id"]: ch for ch in spec.get("charts", [])}
    counters = {k["id"]: k for k in spec.get("counters", [])}

    js, visible = [], set()
    for b, tm in zip(spec["beats"], timing, strict=True):
        t = max(0.0, tm["start"] - LEAD_VISUAL)
        if "title" in b:
            js.append(f'swap("#title", {js_str(b["title"])}, {t:.2f});')
        if "caption" in b:
            js.append(f'swap("#caption", {js_str(b["caption"])}, {t:.2f});')
        for nid in b.get("hide", []):
            # nodes dim (diagram context stays readable); counters/charts clear the stage fully
            js.append(f'tl.to("{sel[nid]}", {{opacity: {0.15 if nid in nodes else 0}, duration: 0.3}}, {t:.2f});')
            visible.discard(nid)
        # count/grow imply show; an element already on screen is not popped in again
        shown = [i for i in dict.fromkeys(b.get("show", []) + b.get("count", []) + b.get("grow", []))
                 if i not in visible]
        for i, nid in enumerate(shown):
            js.append(f'tl.fromTo("{sel[nid]}", {{scale: 0, opacity: 0}}, '
                      f'{{scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)"}}, {t + 0.15 * i:.2f});')
        visible.update(shown)
        for i, (a, bb) in enumerate(b.get("draw", [])):
            js.append(f'draw("#e-{a}__{bb}", {t + 0.2 * i:.2f});')
        for nid in b.get("pulse", []):
            pt = t + 0.15 * shown.index(nid) + 0.45 if nid in shown else t  # pulse right after its own pop-in
            js.append(f'tl.to("{sel[nid]}", {{scale: 1.18, duration: 0.25, yoyo: true, repeat: 1, '
                      f'ease: "power2.inOut"}}, {pt:.2f});')
        for kid in b.get("count", []):
            k = counters[kid]
            js.append(f'count("#k-{kid} .num", {k.get("from", 0)}, {k["to"]}, 1.4, {t + 0.2:.2f});')
        for cid in b.get("grow", []):
            for i, bar in enumerate(charts[cid]["bars"]):
                bt = t + 0.3 + 0.18 * i
                js.append(f'tl.fromTo("#c-{cid} .col:nth-child({i + 1}) .bar", {{scaleY: 0}}, '
                          f'{{scaleY: 1, duration: 0.7, ease: "power3.out"}}, {bt:.2f});')
                js.append(f'count("#c-{cid} .col:nth-child({i + 1}) .val", 0, {bar["value"]}, 0.7, {bt:.2f});')
    actions = "\n  ".join(js)

    # Title sits just below the 250px top safe zone, caption above the 380px bottom safe zone (9:16).
    return f"""<!doctype html>
<html lang="en" data-resolution="{spec.get('resolution', 'portrait')}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width={w}, height={h}" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ width: {w}px; height: {h}px; overflow: hidden; background: {p['bg']}; }}
  #root {{ position: relative; width: 100%; height: 100%; font-family: "Times New Roman", Georgia, serif; }}
  #title {{ position: absolute; top: {h * 0.135:.0f}px; width: 100%; text-align: center; color: {p['title']};
           font-size: {w * 0.062:.0f}px; font-weight: 700; letter-spacing: 0.01em; }}
  #caption {{ position: absolute; top: {h * 0.74:.0f}px; left: 6%; width: 88%; text-align: center; color: {p['caption']};
             font-size: {w * 0.042:.0f}px; font-weight: 700; line-height: 1.3; }}
  svg {{ position: absolute; inset: 0; }}
  .edge {{ stroke: {p['line']}; stroke-width: 3; stroke-linecap: round; }}
  .node {{ position: absolute; border: 4px solid; border-radius: 50%; background: #0c1220;
          display: flex; align-items: center; justify-content: center; font-size: {r * 0.42:.0f}px;
          font-style: italic; opacity: 0; transform: scale(0); }}
  .counter {{ position: absolute; text-align: center; font-weight: 700;
             font-variant-numeric: lining-nums tabular-nums; opacity: 0; transform: scale(0); }}
  /* the headless-Chrome serif fallback draws old-style digits even with lining-nums: numbers get a sans face */
  .num {{ font-family: "Segoe UI", Arial, sans-serif; }}
  .counter .lbl {{ color: {p['caption']}; font-weight: 400; letter-spacing: 0.04em; }}
  .chart {{ position: absolute; display: flex; align-items: flex-end; gap: 4%; opacity: 0; transform: scale(0);
           border-bottom: 3px solid {p['line']}; }}
  .col {{ flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center;
         position: relative; }}
  .bar {{ width: 100%; border-radius: 10px 10px 0 0; transform-origin: bottom; transform: scaleY(0); }}
  .val {{ color: #ffffff; font-size: {w * 0.045:.0f}px; font-weight: 700; margin-bottom: 10px;
         font-variant-numeric: lining-nums tabular-nums; }}
  .blbl {{ position: absolute; bottom: -{w * 0.06:.0f}px; color: {p['caption']}; font-size: {w * 0.03:.0f}px;
          font-weight: 700; white-space: nowrap; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="{w}" data-height="{h}">
  <svg id="diagram" class="clip" data-start="0" data-duration="{total}" data-track-index="0" width="{w}" height="{h}">{''.join(edges_svg)}</svg>
  {''.join(nodes_html)}
  {''.join(extra_html)}
  <h1 id="title"></h1>
  <p id="caption"></p>
  <audio id="narration" class="clip" data-start="0" data-duration="{total}" data-track-index="1" src="narration.wav"></audio>
</div>
<script>
  window.__timelines = window.__timelines || {{}};  // HyperFrames provides it; plain-browser preview does not
  const tl = gsap.timeline({{ paused: true }});
  // centre counters through GSAP's own transform so scale tweens and centring never fight
  gsap.set(".counter", {{ xPercent: -50, yPercent: -50 }});
  // edges start undrawn; draw() animates the stroke on
  document.querySelectorAll(".edge").forEach(e => {{
    const L = Math.hypot(e.x2.baseVal.value - e.x1.baseVal.value, e.y2.baseVal.value - e.y1.baseVal.value);
    e.style.strokeDasharray = L; e.style.strokeDashoffset = L;
  }});
  function draw(sel, t) {{ tl.to(sel, {{ strokeDashoffset: 0, duration: 0.6, ease: "power2.out" }}, t); }}
  // text swap: fade old out, set text at the beat time, fade new in (deterministic under seek)
  function swap(sel, text, t) {{
    tl.to(sel, {{ opacity: 0, y: -10, duration: 0.15 }}, Math.max(0, t - 0.15));
    tl.set(sel, {{ textContent: text }}, t);
    tl.fromTo(sel, {{ opacity: 0, y: 14 }}, {{ opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }}, t);
  }}
  // number count-up: modifiers format during render, so it stays correct under seek (no onUpdate callbacks)
  function count(sel, from, to, dur, t) {{
    document.querySelectorAll(sel).forEach(el => {{
      const d = +el.dataset.d || 0;
      tl.fromTo(el, {{ innerText: from }}, {{ innerText: to, duration: dur, ease: "power2.out",
        modifiers: {{ innerText: v => (+v).toFixed(d) }} }}, t);
    }});
  }}
  {actions}
  window.__timelines["main"] = tl;
  tl.seek(0);
</script>
</body>
</html>
"""


def validate(spec):
    """Fail early, before TTS, on anything that would crash later or render a silently missing animation.
    Ids and colours go straight into HTML/CSS/JS, so they are restricted to safe character sets here."""
    def fail(msg):
        sys.exit(f"spec error: {msg}")

    def need(obj, keys, what):
        for k in keys:
            if k not in obj:
                fail(f"{what} {obj.get('id', '')!r} is missing {k!r}")

    def num(obj, key, what, default=None, lo=None):
        v = obj.get(key, default)
        if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v):
            fail(f"{what} {obj.get('id', '')!r}: {key!r} must be a finite number, got {v!r}")
        if lo is not None and v < lo:
            fail(f"{what} {obj.get('id', '')!r}: {key!r} must be >= {lo}, got {v!r}")
        return v

    def decimals(obj, what):
        d = obj.get("decimals", 0)
        if isinstance(d, bool) or not isinstance(d, int) or not 0 <= d <= 4:
            fail(f"{what} {obj['id']!r}: decimals must be an integer 0-4")

    def pair(e, what):
        if not (isinstance(e, list) and len(e) == 2 and all(isinstance(x, str) for x in e)):
            fail(f"{what} {e!r} must be a pair of node ids")
        return e

    def id_list(b, key):
        v = b.get(key, [])
        if not (isinstance(v, list) and all(isinstance(x, str) for x in v)):
            fail(f"beat {b['say'][:40]!r}: {key!r} must be a list of ids")
        return v

    def colour(v, what):
        if v is not None and not (isinstance(v, str) and COLOUR.fullmatch(v)):
            fail(f"{what}: colour {v!r} must be #rrggbb")

    if not isinstance(spec.get("palette", {}), dict):
        fail("palette must be an object")
    for k, v in spec.get("palette", {}).items():
        colour(v, f"palette.{k}")
    if not (isinstance(spec.get("voice", "bf_emma"), str) and spec.get("voice", "bf_emma")):
        fail("voice must be a non-empty Kokoro voice id such as 'bf_emma'")
    for group in ("nodes", "counters", "charts", "edges", "beats"):
        if not isinstance(spec.get(group, []), list):
            fail(f"{group} must be a list")
    for el in spec.get("nodes", []) + spec.get("counters", []) + spec.get("charts", []) + spec.get("beats", []):
        if not isinstance(el, dict):
            fail(f"every node, counter, chart and beat must be an object, got {el!r:.40}")
    if spec.get("resolution", "portrait") not in SIZES:
        fail(f"resolution must be one of {sorted(SIZES)}")
    if num(spec, "speed", "spec", 1.2) <= 0:
        fail("speed must be > 0")
    nodes, counters, charts = set(), set(), set()
    for group, bucket, keys in (("nodes", nodes, ("id", "label", "x", "y")),
                                ("counters", counters, ("id", "x", "y", "to")),
                                ("charts", charts, ("id", "x", "y", "w", "h", "bars"))):
        for el in spec.get(group, []):
            need(el, keys, group[:-1])
            if not isinstance(el["id"], str) or not ID.fullmatch(el["id"]):
                fail(f"id {el['id']!r} may only use letters, digits and '-'")
            for k in keys[1:]:
                if k not in ("label", "bars"):
                    num(el, k, group[:-1])
            colour(el.get("color"), f"{group[:-1]} {el['id']}")
            for k in ("label", "prefix", "suffix"):
                if k in el and not isinstance(el[k], str):
                    fail(f"{group[:-1]} {el['id']!r}: {k!r} must be text")
            bucket.add(el["id"])
    if len(nodes | counters | charts) != len(nodes) + len(counters) + len(charts) or \
            len(nodes) != len(spec.get("nodes", [])) or len(counters) != len(spec.get("counters", [])) or \
            len(charts) != len(spec.get("charts", [])):
        fail("node/counter/chart ids must be unique across all three")
    ids = nodes | counters | charts
    for k in spec.get("counters", []):
        num(k, "from", "counter", 0)
        if num(k, "size", "counter", 0.16) <= 0:
            fail(f"counter {k['id']!r}: size must be > 0")
        decimals(k, "counter")
    for ch in spec.get("charts", []):
        if not isinstance(ch["bars"], list) or not ch["bars"]:
            fail(f"chart {ch['id']!r} has no bars")
        decimals(ch, "chart")
        for bar in ch["bars"]:
            if not isinstance(bar, dict):
                fail(f"chart {ch['id']!r}: every bar must be an object")
            need(bar, ("label", "value"), f"bar of chart {ch['id']}")
            num(bar, "value", f"bar of chart {ch['id']}")
            if not isinstance(bar["label"], str):
                fail(f"bar of chart {ch['id']!r}: label must be text")
            colour(bar.get("color"), f"bar of chart {ch['id']}")
        top = num(ch, "max", "chart") if "max" in ch else max(bar["value"] for bar in ch["bars"])
        if top <= 0 or any(not 0 <= bar["value"] <= top for bar in ch["bars"]):
            fail(f"chart {ch['id']!r}: need max > 0 and every value within 0..max")
    edges = [pair(e, "edge") for e in spec.get("edges", [])]
    for i, e in enumerate(edges):
        if set(e) - nodes or e[0] == e[1]:
            fail(f"edge {e} must name two different known nodes")
        if e in edges[:i]:
            fail(f"edge {e} is listed twice")
    if not isinstance(spec.get("beats"), list) or not spec["beats"]:
        fail("no beats")
    for b in spec["beats"]:
        if not isinstance(b, dict) or not isinstance(b.get("say"), str) or not b["say"].strip():
            fail(f"every beat needs non-empty 'say' text (beat {b!r:.60})")
        for k in ("title", "caption"):
            if k in b and not isinstance(b[k], str):
                fail(f"beat {b['say'][:40]!r}: {k!r} must be text")
        num(b, "hold", "beat", 0, lo=0)
        bad = (set(id_list(b, "show")) | set(id_list(b, "pulse")) | set(id_list(b, "hide"))) - ids
        bad |= set(id_list(b, "count")) - counters
        bad |= set(id_list(b, "grow")) - charts
        if not isinstance(b.get("draw", []), list):
            fail(f"beat {b['say'][:40]!r}: 'draw' must be a list of node pairs")
        bad |= {f"{x}->{y}" for x, y in (pair(d, "draw") for d in b.get("draw", [])) if [x, y] not in edges}
        if bad:
            fail(f"beat {b['say'][:40]!r}: unknown {sorted(bad)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--out", help="project dir (default: renders/<spec name>/ next to this file)")
    ap.add_argument("--no-render", action="store_true")
    a = ap.parse_args()
    spec = json.loads(Path(a.spec).read_text(encoding="utf-8"))
    validate(spec)
    out = (Path(a.out) if a.out else HERE / "renders" / Path(a.spec).stem).resolve()
    if not SAFE_NAME.fullmatch(out.name) or not out.name.strip("."):
        sys.exit(f"output name {out.name!r} may only use letters, digits, '_', '.', '-'")
    out.mkdir(parents=True, exist_ok=True)
    w, h = SIZES[spec.get("resolution", "portrait")]

    print("[engine] narration (Kokoro)", file=sys.stderr)
    timing, total = tts(spec, out)
    (out / "timing.json").write_text(json.dumps(timing, indent=1), encoding="utf-8")
    (out / "index.html").write_text(build_html(spec, timing, total, w, h), encoding="utf-8")
    (out / "hyperframes.json").write_text(json.dumps({"name": out.name}), encoding="utf-8")
    print(f"[engine] composition {total:.1f}s -> {out / 'index.html'}", file=sys.stderr)
    if a.no_render:
        return
    mp4 = out / f"{out.name}.mp4"
    mp4.unlink(missing_ok=True)  # an old render must never be reported as this run's result
    print("[engine] rendering (HyperFrames)", file=sys.stderr)
    # relative -o + captured output: an absolute path with spaces / inherited console made the CLI exit 1 on Windows
    p = subprocess.Popen([shutil.which("npx") or "npx", "-y", HF, "render", "-o", mp4.name, "-q", "delivery",
                          "--strict"], cwd=out, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                         encoding="utf-8", errors="replace")
    try:
        stdout, stderr = p.communicate(timeout=1800)
    except subprocess.TimeoutExpired:
        # npx.cmd -> node -> Chrome/ffmpeg: killing only the direct child leaves the tree holding the pipes
        if sys.platform == "win32":
            subprocess.run(["taskkill", "/T", "/F", "/PID", str(p.pid)], capture_output=True)
        else:
            p.kill()
        try:
            stdout, stderr = p.communicate(timeout=30)
        except subprocess.TimeoutExpired:  # a surviving grandchild still holds the pipes
            stdout, stderr = "", ""
        sys.exit(f"render timed out after 30 min:\n{stdout[-2000:]}\n{stderr[-2000:]}")
    if p.returncode or not mp4.exists():
        sys.exit(f"render failed ({p.returncode}):\n{stdout[-2000:]}\n{stderr[-2000:]}")
    print(mp4)


if __name__ == "__main__":
    main()
