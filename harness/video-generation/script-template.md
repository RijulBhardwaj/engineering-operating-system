# Script Writing Template

Source: user-supplied PDF, "Short-Form Storytelling (Writing Guide)" (Kallaway), adopted 2026-11-25. This is the base template for stage 2 (Script + scene plan) of [README.md](README.md)'s pipeline -- every script this toolkit produces starts here, then goes through the feedback loop below before stage 3. Expand this file over time; don't fork a second template.

## Structure (fill every numbered slot)

1. **Hook** (1-2 sentences)
2. **Lock-In Zone** (2-4 sentences)
3. **Body Block 1** -- one non-obvious insight/common mistake (3-5 sentences)
4. **Rehook 1** (1 sentence)
5. **Body Block 2** -- one non-obvious insight/common mistake (3-5 sentences)
6. **Rehook 2** (1 sentence)
7. *(Optional)* **Body Block 3** (3-5 sentences)
8. *(Optional)* **Closing** (1-2 sentences)
9. **CTA** (1 sentence)

Target length: 45-90 seconds of narration. Don't pad to hit a length -- cut to the shortest script that still lands the concept.

## Core principles (apply to every script)

- Reduce fluff. Every sentence earns its place.
- Clear logic flow -- each sentence either extends the previous one or deliberately opens a new thread. No unexplained jumps.
- Tease the value early -- the viewer should know within 2 sentences why this is worth their next 60 seconds.
- Simple words. High clarity over cleverness.

## Per-component guide

**Hook** -- goal: the viewer opts in. Four S's: *Subject* (name the topic in sentence 1), *Stakes* (why this matters to them, right now), *Simple* (plain words), *Superclear* (punchy sentence structure, no hedging).

**Lock-In Zone** -- convinces them the rest is worth it. Pick one mechanism: tease proof, tease a payoff/transformation, clarify contrast with the common (wrong) belief, introduce a magic-box term/framework name, pre-empt the obvious objection, or double down on the hook's claim. Exit state: "I have to keep watching."

**Body Blocks** -- the substance. Each one states a non-obvious frame, then defends it in 2-4 sentences (fact, example, or worked step). Aim for at least two blocks -- two separate "aha" hits beat one long one.

**Rehooks** -- one sentence resetting attention between blocks (viewers have ~20-25s of attention even when engaged). Build contrast/curiosity into the next block ("That's the easy part. Here's where almost everyone gets it wrong...").

**Closing** -- optional 1-2 sentence summary/takeaway. Skip it if every script carries a CTA instead.

**CTA** -- one sentence, every script. Not a sales pitch here: point at the next concrete action for a CAT-prep viewer -- a practice problem, a related concept, a "test yourself" prompt. Still measurable (did they act on it), same principle as the source's "use a CTA so you can measure conversion."

## CAT-prep adaptation (how this toolkit maps the template)

- **Subject/Stakes** = the concept + why it costs marks if misunderstood (a wrong answer pattern, a common trap, a timing cost in the exam).
- **Body Block "non-obvious insight"** = the part of the concept students usually get backwards, not just the textbook definition -- this is what makes it worth watching over a textbook page.
- **CTA** = a specific next step (try this problem / watch the next concept / revisit a prerequisite), never a generic "like and subscribe."

## Feedback generation loop (mandatory before stage 3)

Same discipline as [release-review-passes.md](../../.claude/rules/release-review-passes.md): draft, freeze, review, revise -- never let the drafting pass also grade itself.

1. **Draft** -- write the script filling every required slot above, from whatever prompt/concept was given.
2. **Fresh review pass** (new context, same goldfish principle as `architecture.md` Gate 0) scores the draft against a checklist, not a vibe:
   - Hook has all 4 S's? Subject named in sentence 1?
   - Lock-in zone present and using one of the six named mechanisms?
   - Every body block states a non-obvious frame, not just a fact restated?
   - At least one rehook between blocks, doing real contrast work (not just "anyway...")?
   - Logic flow: can you read it once and never ask "wait, how did we get here"?
   - Length: realistic spoken duration (roughly 150 words/minute) lands in 45-90s, or is intentionally longer only if the concept genuinely needs it (approved by the user/caller, not the drafting pass)?
   - CTA is a specific next action, not generic filler?
3. **Revise** -- fix only what the review flagged. No rewriting-for-style beyond the findings, same smallest-correct-change rule as `coding-standards.md`.
4. **Approve** -- once the checklist passes clean, the script is frozen and handed to stage 3 (Manim diagram code / scene plan). A script that fails the same check twice gets escalated (concept may be too complex for 90s -- split it into two videos rather than forcing one bloated script).
