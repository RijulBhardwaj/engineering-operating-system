# Video Playbook (explainer reels + launch videos)
Derived from 5 watched references (see README.md). Primary style: DgOhKCftUY1 (LOGIC GATE hexagon). Numbers marked (est) are guesses from frames, not measured.

## 1. Format presets
| | A. Vertical reel explainer (primary) | B. Horizontal launch video |
|---|---|---|
| Canvas | 1080x1920, 30 fps | 1920x1080, 30 fps |
| Length | 60-100s (ref: 100s) | 30-60s launch, 2-5 min tutorial |
| Cuts | 0 (one continuous canvas) | 1-2s beat-synced in intro, 4-5s avg in demo |
| Voice | calm female/neutral, ~150 WPM | brisk male/female, ~180 WPM |
| Music | none (ref) or very low bed -28 LUFS | bed -22 to -18 LUFS under VO, ducked 6 dB |
| Refs | DgOhKCftUY1, DgPbO11hYFR | mPFRrq_ezp0, 5HDa5HCb0pc, Dfbb756oMOs |

## 2. Script structure (preset A)
| Beat | Time | Words | Content |
|---|---|---|---|
| Hook | 0-5s | 15-20 | Pain vs relief: "27 things to memorize, or just one picture." Visible by 3s. |
| Build | 5-20s | 35-45 | Draw the diagram, name each part once. End "That's it. Now we just read it." |
| Rules 1..N | 15-20s each, N=3-5 | 40-50 each | Title "N. NAME"; 1 sentence rule, 2-3 examples, count ("Three lines, six identities"). |
| Recap | 8-10s | 25 | One 2-3 word cue per rule ("Opposites for reciprocals..."). |
| Outro | 3-5s | 10 | "N things. One picture. Follow X for more." |
Total words = duration x 2.5 (150 WPM). Sentences <=16 words. One idea per sentence. Verify a non-obvious claim aloud ("Check it, and it really is sine").
Preset B script: cold open on the finished result (0-15s) -> credibility/numbers -> step list "STEP 01.." -> showcase -> CTA. Hook can be a blind test or POV caption.

## 3. Voice direction (TTS)
- Voice: single, neutral accent, female mid-low register for A. Never switch voices inside A. B may use two (calm for showcase, brisk for how-to).
- Rate: A 0.95-1.0x (~150 WPM); B tutorials 1.1x (~180-215 WPM); hooks may run 1.1x.
- Style: calm, instructional, encouraging; no emphasis spikes; pitch variance low (+/-10%).
- Pauses: 250-400 ms after each sentence, 600-800 ms before a new rule title; lead-in 300 ms.
- Numbers spoken in full ("twenty-seven"); symbols spelled how they sound ("sine theta"). Pronounce-check jargon.
- Generate per-scene audio files; scene duration = audio length + 400 ms tail.

## 4. Music / SFX rules
- A (reference style): no music, no SFX. Optional: -30 LUFS ambient pad, no melody. Voice -16 LUFS.
- A (kinetic 3D variant, DgPbO11hYFR): low synth bed + SFX per action: whoosh on text in (80-150 ms), tick on number, ping on idea, switch-click on toggle, pop on card.
- B: bed 100-130 BPM tech/electronic, drops to -6 dB under VO; punchy 0-10s hook track; a change of bed for showcase; typing clicks for prompt entry; showreel w/o VO: phonk 130-140 BPM with cuts on beats.
- Every SFX peak sits within 50 ms of its visual event. Max 1 SFX per second.

## 5. Visual system (preset A, 1080x1920)
Scale factor from 768x1366 reference = 1.406.
- Background #050A14 (est), flat, optional 4% vignette. No gradients behind the diagram.
- Palette (est): gold title/accent #F5C842, green #3DDC97, blue #4C8DFF, orange #FF9F43, cyan #2DD4E0, violet #9B7BFF, pink #FF5FA2, white #FFFFFF (centre/neutral), muted edge #6B7394 @ 40%. Assign colour per symbol once; reuse in node, formula, caption.
- Type: title bold serif caps 84-96 px gold; node labels serif 36-40 px; formulas serif 64-72 px; caption bold serif 52-56 px; line height 1.15. Max 28 chars/title, 36 chars/caption (one line).
- Safe zones (9:16): top 250 px and bottom 380 px reserved for platform UI; nothing important there. Side margin 90 px.
- Layout zones: title y 240-330; diagram y 420-1000 (centre x 540, width <=680); formulas y 1100-1400; caption y 1450-1520 (above bottom unsafe 1540); recap/outro replaces formula + caption zones.
- Nodes: circle d=120 px, 4 px colour outline, 24 px soft glow at 25%, fill #0B1220.
- Highlight fill: gold polygon @ 30% alpha, 6 px gold edges.
Preset B: same palette ideas; dark navy #0A1030 UI cards, 24 px radius, one accent per video; explainer floor: hex-grid ground, chip labels (navy box, white bold 28 px, 6 px coloured left tick, year badge top-left). Caption box fixed for POV (white box, black bold).

## 6. Motion vocabulary (ms, easing)
| Primitive | Duration | Easing | Notes |
|---|---|---|---|
| Node pop-in | 350 | easeOutBack (overshoot 1.15) | stagger 120 ms, clockwise from top-left |
| Edge draw-on | 500 | easeInOutCubic | stroke-dashoffset, 0.1 stagger |
| Text fade-up | 300 | easeOutCubic | 16 px rise; title swap = 200 out, 300 in |
| Highlight pulse | 600 | easeInOutSine | glow 25%->60%->25%, 1 pulse on mention |
| Polygon fill | 400 | easeOutQuad | alpha 0->0.30 |
| Arrow draw | 700 | easeInOutCubic | curved, with head appearing last |
| Formula reveal | 450 per term | easeOutCubic | left-to-right, term colour = node colour |
| Counter / number | 800 | easeOutExpo | tabular digits |
| Dim others | 250 | linear | non-active nodes to 35% |
| Clear for next rule | 250 | easeInCubic | geometry stays |
| Camera move (B/3D) | 1200-2500 | easeInOutCubic | dolly along path, <=15 deg orbit |
| Hard cut (B only) | 0 | - | 1-2s beat-synced in hook only |
Rules: preset A has no camera moves and no cuts. Visual onset leads the spoken word by 150-250 ms. Never animate more than 3 things at once. Hold finished frame >=800 ms before next rule. Nothing loops except the pulse.
Transition types allowed: highlight swap (A default), title swap, zoom-out reveal (B finale), whip pan (B hook). No spins, no wipes.

## 7. Per-scene JSON the engine can consume
```json
{
  "canvas": {"w": 1080, "h": 1920, "fps": 30, "bg": "#050A14", "preset": "reel-explainer"},
  "voice": {"engine": "tts", "rate": 1.0, "pause_after_ms": 300},
  "scenes": [{
    "id": "rule2-quotient",
    "duration_ms": 18000,
    "narration": "Rule two, quotients. Any corner equals the next corner divided by the one after.",
    "zones": {"title": "2. QUOTIENT", "caption": "check: it really is sin", "caption_color": "green"},
    "elements": [
      {"id": "n_sin", "type": "node", "label": "sin", "color": "#3DDC97", "pos": [370, 560], "persist": true},
      {"id": "arrow1", "type": "arrow", "from": "n_sin", "to": "n_cot", "color": "#F5C842"},
      {"id": "f1", "type": "formula", "tex": "\\sin\\theta=\\frac{\\cos\\theta}{\\cot\\theta}", "pos": [540, 1180]}
    ],
    "animations": [
      {"target": "title", "op": "text_swap", "at_ms": 0, "dur_ms": 500},
      {"target": "arrow1", "op": "draw_on", "at_ms": 2200, "dur_ms": 700, "ease": "easeInOutCubic", "sync_word": "divided"},
      {"target": ["n_sin", "n_cot"], "op": "pulse", "at_ms": 2200, "dur_ms": 600},
      {"target": "f1", "op": "reveal", "at_ms": 3800, "dur_ms": 900}
    ],
    "sfx": [], "music": null
  }]
}
```
Rules for the engine: `persist` elements carry across scenes (no re-draw); `sync_word` aligns onset to TTS word timestamps minus 200 ms; scene duration is computed from audio, not hand-set; fail the build if any element enters the unsafe zones or caption > 36 chars.

## 8. Top rules (short)
1. One continuous canvas; change by highlight, never by cut (A).
2. Hook in 3s: pain vs relief, then build the diagram once.
3. Numbered rules, each with title "N. NAME" top and one coloured caption bottom.
4. One colour per concept, reused everywhere; one accent for emphasis.
5. 150 WPM, calm voice, no music for A; B uses music + per-action SFX.
6. Recap = one 2-3 word cue per rule; outro under 5s.
