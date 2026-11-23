# THREAT-MODEL.md — <project> — protect what, from whom

Sibling of AUTH-template.md / SECURITY-template.md (same instruction, same linking points).

## Assets (protect)
- User data: ___
- Payments/financial data: ___
- Keys/credentials: ___
- (add rows as the project's actual data model requires)

## Adversaries (threats)
- Bots / automated abuse: ___
- Other authenticated users (lateral access, IDOR): ___
- Scrapers / unauthenticated external actors: ___
- Insider/compromised-credential scenario, if relevant: ___

## STRIDE pass (one line each, skip categories that don't apply)
- Spoofing: ___
- Tampering: ___
- Repudiation: ___
- Information disclosure: ___
- Denial of service: ___
- Elevation of privilege: ___

## Mitigations in place vs. open
| Threat | Mitigation | Status |
|---|---|---|
| | | Done / Planned / Accepted risk |

Fill in during architecture selection, revisit when the attack surface changes (new integration, new data type, new auth flow). An "accepted risk" row needs a reason, not silence.
