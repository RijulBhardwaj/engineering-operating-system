# UI/UX States Checklist

Mandatory inventory for any UI surface (page, form, flow) before calling frontend work done -- not every state applies to every screen, but each must be a deliberate skip, not an oversight. Source: VikasBuilds "UI & UX Visual Guide" (vikasbuilds.com), ingested 2026-11-24 per user instruction. Pairs with `ai-code-qa-gate.md` layer 2 (unit tests: edge cases) and `architecture.md` Gate 4 (tests pass).

For each state below: when it fires, what to show, what the user must instantly understand, and the one-tap/one-glance test that proves it.

| # | State | Fires when | Must convey | Quick check |
|---|---|---|---|---|
| 1 | Empty | No content yet exists | "Nothing here, I can add it" | New user understands page + next action in one glance |
| 2 | Loading | Fetching/computing | "Working, content coming" | No layout shift once data arrives (skeleton matches shape) |
| 3 | Saving | Save/Update in flight | "Stored right now" | Button disabled; 5 rapid taps = 1 network request |
| 4 | Progress | Long upload/export/import | "I know % and time left" | Bar reflects real bytes, not a fake timer |
| 5 | Error | Server/API/connection failure | "Failed, here's how to retry" | One tap retry recovers; no raw stack traces shown |
| 6 | Permission denied | Missing role/access | "I know why, and who to ask" | Request-access path exists, no dead-end |
| 7 | Success | Action completed | "Succeeded, here's confirmation" | Reference ID matches what was just created |
| 8 | No results | Search/filter -> 0 matches | "Nothing matched, easy to reset" | Clear-filters restores full list instantly |
| 9 | Validation | Bad input | "Here's the mistake, here's the fix" | Error clears live on correction, not on first keystroke |
| 10 | Warning | Destructive/irreversible action pending | "I see the full permanent impact" | Cancel is the safe default; destructive button is visually distinct |
| 11 | Offline | No network | "Offline, but my work's safe" | Cached content readable, drafts saved locally |
| 12 | Reconnecting | Auto-retry after drop | "Handling the hiccup automatically" | Resumes session with no reload; exponential backoff |
| 13 | Session expired | Token/cookie timeout | "Expired for safety, work is kept" | Re-login restores exact form state |
| 14 | Unsaved changes | Navigating away from dirty form | "I can choose to keep or discard" | "Stay on page" preserves every field |
| 15 | Partial success | Batch job, some items failed | "Most succeeded, I fix the rest" | Retry only touches failed subset, no duplicates |
| 16 | Disabled | Action blocked by unmet precondition | "I know what's missing" | Filling requirement instantly activates control |
| 17 | Confirmation | High-impact/irreversible action | "I can double-check first" | Esc/Cancel safely aborts, no side effect |
| 18 | Timeout | External server exceeds deadline | "Slow, but verify before retrying" | UI blocks duplicate submission (no double charge) |
| 19 | Conflict | Concurrent edit collision | "Conflict exists, nothing's lost" | Merge/overwrite/save-as-copy all preserve data |
| 20 | Upload/download (multi-file) | Batch file transfer | "I see each file's own status" | Cancelling one file doesn't abort the others |
| 21 | Background processing | Heavy async job | "Working in background, I can leave" | Switching tabs doesn't cancel the job; notifies on done |
| 22 | Cancelled | User aborts a process | "Cancelled cleanly, nothing leaked" | Restart loads fresh defaults, no orphaned state |
| 23 | Maintenance | Planned downtime | "Scheduled work, back by X" | Status page is independently hosted, reachable |
| 24 | First-time user | Fresh signup, first dashboard visit | "I know exactly where to start" | Skip option visible beside primary CTA |
| 25 | Completion/milestone | Onboarding/setup finished | "Done, ready to work" | Primary CTA opens live dashboard, wizard never reshows |
| 26 | Hover/focus/pressed | Any input method interaction | "My input registered" | Tab+Enter alone can operate it; focus ring never stripped |
| 27 | Instant update + undo (optimistic UI) | Toggle/like/checkbox | "Fast, and reversible on failure" | Simulated 500 response rolls back state + shows toast |
| 28 | Undo (destructive, timed) | Delete/archive/trash | "Mistake fixed with one tap" | Undo window 6-10s, restores item exactly |
| 29 | Rate limited | Too many requests/attempts | "Wait N seconds, here's when" | Countdown auto-unlocks the control at zero |
| 30 | Queue position | High-demand flow (checkout, generation) | "I'm holding my place" | Refresh does not lose queue position |
| 31 | Stale/cached data | Cached metrics/analytics shown | "This is cached, I can refresh" | Refresh updates both timestamp and values |
| 32 | Sync status | Cloud-synced documents | "I know if it's safely stored" | Typing isn't blocked while sync indicator updates |
| 33 | Multi-step form | Long wizard flow | "I know where I am, what's left" | Back preserves every prior field; auto-saved per step |
| 34 | Accessibility | Any screen, always | "Everyone can read and operate this" | 4.5:1 contrast, 44px+ targets, full aria-labels, no keyboard trap |
| 35 | Update required | Breaking API/schema/security patch | "One tap updates me" | Store link opens directly to the listing |

## Universal anti-patterns (apply across all states)
Blank/dead-end screens with no next action. Raw error codes/stack traces shown to users. Silent failures (success claimed before server confirms). Confirmation-dialog overuse for routine/reversible actions. Losing user input on any transition (error, timeout, reconnect, session expiry).
