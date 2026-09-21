# SAMI v2.7.7 — Field Reliability

## Fixed

- Unified autosave and manual saving through the existing IndexedDB project store. Existing project IDs, creation dates and checkpoint timestamps are preserved when reopening v2.7.6 projects.
- Made recovery-journal/quota problems visible instead of silently swallowing them. Saving now reports **Saving / Saved / Failed**, provides retry/backup access, and blocks destructive project switches after a failed save.
- Backup import opens as a separate project copy rather than replacing the current project.
- Reworked the service worker: version-pinned shell caching, bounded navigation timeout, navigation-only HTML fallback, lazy media caching, correct asset failures, and no forced mid-session worker takeover.
- Consolidated release stamping through `VERSION.json`/`build.mjs`; UI, config, manifest, asset queries and service-worker cache now use v2.7.7.
- Removed browser text-zoom blocking and repaired field touch-target sizing and safe-area handling.
- Repaired light-theme text/control contrast and added an optional outdoor high-contrast mode.
- Repaired imported SVG/style attribute paths, unsafe dynamic IDs, malformed project-file handling and bounded Visio/ZIP expansion.
- Corrected precision area perimeter preview to include the closing edge and removed pixel rounding from metre nudges.
- Fixed precision cursor/panel positioning at narrow/short viewports and moved Undo/Redo into the scrollable map control rail.
- Kept the PDF wordmark legible against paper output and strengthened mapping attribution wording.

## Improved

- Preserved all five workspace stages, all 13 existing themes, storage keys, database stores, providers, MP3 voice files and recorded voice wording.
- Added rAF-coalesced precision-cursor movement, cached drag layout, separate static/live measurement layers and explicit multi-touch suppression.
- Improved keyboard/focus behaviour for drawers, menus, modals and editable fields.
- Repeat installed launches go directly to the workspace; first-launch Skip remains reachable and promo audio only plays after a user gesture.
- Added explicit-query Nominatim de-duplication, a short memory cache, per-page request spacing, timeout and Retry-After handling without silently changing provider.
- Added progress/status and cancellation points to PDF generation.
- QR generation and shape-import code execute on demand while remaining available in the offline shell.
- Added user-controlled screen wake lock during active drawing/measuring where supported.

## Added

- Visible one-tap **Backup** control and a Project backup & storage panel with retry, import, export, backup-request time, storage estimate and persistent-storage request.
- Precision cursor tap-position mode, 1 m/5 m nudge controls, arrow-key movement, Shift+nudge, Enter/Space drop, Backspace undo, Escape cancel, coordinate/bearing readout and snap feedback.
- Follow-system appearance default when no manual theme has been chosen, while retaining every manual theme.
- Platform-specific install guidance, copy-link handoff, update-available banner and explicit **Save & reload** update flow.
- Maskable v2.7.7 app icon, `lang="en-GB"`, categories, display override and New site / Last project / Route shortcuts in the manifest.
- Dependency-free release stamping/precache generator and generated asset manifest.

## Removed

No product feature, theme, provider, storage key, database store, MP3 or licence file was removed. Automatic service-worker activation/claim and eager promo-audio preload were removed as behaviours because they created update/performance risk.

The 2.5-second simulated cold-start target was **not** achieved; see `TEST_REPORT.md` and `ROADMAP.md`.
