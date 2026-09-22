# SAMI v2.7.13 — Phase 2 implementation plan and delivery trace

This is the original pre-implementation plan carried forward from the verified v2.7.6 audit, then reconciled with the repaired GitHub v2.7.12 baseline. The implemented v2.7.13 status and measured results are recorded in `AUDIT_REPORT.md` and `TEST_REPORT.md`.

Delivered before application changes. Applies to the supplied hash-verified baseline. No runtime build, framework, storage schema migration, provider replacement, voice-text change or feature removal is planned.

## Prioritised backlog

Effort S = local patch, M = linked changes, L = lifecycle and cross-file verification. Risk is regression risk, not severity.

| Priority | Work | Effort | Risk | Verification |
|---|---|---|---|---|
| Must | Stable project identity, one autosave path, journal warning, safe switching/recovery, retry/backup | L | Medium | v2.7.6 fixture, quota/IDB failure, reload, existing keys/schema |
| Must | SW shell/version/build generator/update prompt/navigation-only fallback | L | High | First install, offline assets, timed network, waiting update, old client isolation |
| Must | SVG attribute injection repair and malformed import guards | M | Medium | malicious project/shape fixtures and all 59 sinks |
| Must | Zoom enabled, all theme contrast, focus/ARIA, 44/48 px controls | M | Medium | computed ratios, focus/keyboard/browser layout screenshots |
| Must | Precision tap/nudge/keyboard/rAF and multitouch; closed perimeter | L | Medium | pointer deltas, keyboard/tap coordinates, polygon perimeter, vertex performance |
| Should | Visible backup/export/import/status and persistence estimate | M | Low | download/restore roundtrip, denied persistence fallback |
| Should | Correct install guidance and fast repeat launch with reachable skip | M | Medium | UA/capability matrix; real-device checklist |
| Should | Request dedup/cache/rate handling, timeout/error/cancel states and export attribution | M | Medium | synthetic failures, duplicate queries, PDF text/render |
| Should | Measured performance tuning; safely lazy QR/shape import only | M | Medium | dependency check, cold/warm profiles, first-use feature checks |
| Should | Manifest shortcuts/maskable/screenshots and active-tool wake lock | M | Low | manifest file checks, shortcut flows, wake-lock mock |
| Could | Provider-approved offline area maps with quota/cancellation/deletion | L | High | Proposed only until suitable provider permission/configuration exists |
| Could | Split shared documents/studio renderer to allow wider lazy loading | L | High | Proposed only; avoid changing synchronous rendering architecture in patch release |
| Could | New audio encodings, file handlers/share target, full design-system rewrite | L | Medium/High | Proposed only; original MP3 and core layouts remain |

## Before / after layouts

See UI_WIREFRAMES.svg for schematic pairs; dimensions are conceptual. Every planned layout addition is listed here.

| Surface | Before | After |
|---|---|---|
| Header / save | Small text Saved; backup buried in menu | Same header/stages, save-status button opens data safety; visible Backup action; compact update banner with Reload/Later |
| Data safety | No dedicated overview | Accessible modal: honest Saved/Saving/Failed, retry, export/import, last backup request, persistence/quota |
| Precision panel | Distance/area, readout, drop/undo/add/site; drag-only position | Same actions plus tap-position toggle, 1 m/5 m step, four nudges; coordinates/bearing/snap; collapsible controls where viewport is short |
| Workspace ergonomics | Small map controls; dense panel buttons | 48 px map tools and 44 px actions; scrolling/wrapping panel regions; map remains usable in portrait/landscape |
| Appearance | 13 manual themes | Same themes + Follow system + outdoor contrast switch; current explicit preference retained |
| Install / launch | Generic instructions after animation, hidden skip on first launch | Immediate platform-specific install card and copy link; Install only when supported; repeat installed launch opens workspace; replay retained |
| Settings | Existing drawing/voice/integration options | Data safety entry and Keep screen awake toggle, with supported/active/paused status |

## Assumptions and one question batch

The only optional product question is whether unsupported installation browsers should retain install guidance/copy-link only (default), or receive a deliberate browser-workspace fallback. In the absence of an answer, keep the install-first gate and offer the supported-browser handoff. No paid service is selected. The default theme follows the OS only when there is no explicit stored choice. Existing manual themes stay selected. No landscape orientation lock. Auto reload is never performed during an edit; users explicitly save/reload to update. All voice-pack text and bytes remain unchanged.

## Source and release approach

Use readable first-party source for edited modules. Preserve minified vendor code and the data-heavy asset catalogue. The archive may grow modestly due to readable source and diagnostics; record exact raw/ZIP sizes and performance. If cold transfer cost worsens materially, keep runtime minified core with complete readable source in a separate review archive. The runtime remains flat static files. A small dependency-free Node dev-time generator stamps VERSION.json into HTML/config/manifest/cache/query strings and builds the shell list.

Run syntax + inventory comparisons after each implementation group, focused tests for each changed risk, then a consolidated browser/lifecycle suite. Tests use synthetic external responses or block external APIs, avoiding bulk tile traffic. Real hardware, GPS/voice permission prompts, actual stores, tile licences, HGV suitability and 60 fps on physical mid-range phones remain explicitly manual. Final packaging occurs only after report generation and checksum creation.
