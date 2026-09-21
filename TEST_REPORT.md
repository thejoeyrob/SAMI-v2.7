# SAMI v2.7.7 — Test Report

## Evidence policy

No test is reported as freshly passed unless it was run. This release was reconstructed from the completed max-thinking work trail after the temporary work directory was cleared. The report therefore separates **fresh reconstruction checks** from **earlier max-thinking browser evidence**. The earlier browser evidence was produced against the same v2.7.7 implementation trail before the temporary directory was cleared; it was not rerun after reconstruction where the current managed Chromium policy blocks localhost navigation.

## Fresh reconstruction checks

- Baseline ZIP SHA-256: **PASS** — `fa728976f99addfad9d30d3159cda76714bf2b8ec3adda047b63fcb342ed2a35`.
- Baseline archive shape: **PASS** — 58 flat-root entries, no path traversal.
- JavaScript syntax: **PASS** — all 23 final `.js` files pass `node --check` after reconstruction.
- Version stamping: **PASS** — `VERSION.json`, `version.js`, manifest and generated service worker are v2.7.7; old legacy 271/266/276 query drift is absent after stamping. Remaining “v2.7.6” text is limited to historical CSS comments.
- Viewport accessibility: **PASS (static)** — `maximum-scale` / `user-scalable=no` are absent.
- Manifest: **PASS (static)** — standalone, language `en-GB`, direction, categories, display override, shortcuts and 192/512/maskable icons are present.
- Service-worker structure: **PASS (static/unit)** — generated critical shell, 3 s navigation timeout, navigation-only HTML fallback, old-version asset guard, lazy MP3 cache/range support and explicit update activation are present.
- Fresh network-helper unit: **PASS** — duplicate request collapsed, repeat query cached, distinct query spacing measured **1101 ms**.
- Fresh service-worker timeout unit: **PASS** — stalled navigation used cached HTML after **3004 ms**; the asset-failure contract remains 503 rather than HTML.
- Baseline preservation: **PASS (final packaging check)** — baseline file names are retained; recorded MP3 and licence-file hashes are checked before packaging.
- Feature/control inventory: **PASS (final packaging check)** — baseline literal HTML IDs/actions and existing `sami.*` literal keys are checked for unexplained removal before packaging.
- Final ZIP: **PASS only after packaging** — archive is reopened, every entry is at root, `unzip -t` succeeds, and the generated `.sha256` line names the actual ZIP.

## Earlier max-thinking browser and functional evidence preserved from the work trail

The following tests were run successfully before the temporary working directory was cleared:

- Baseline headless Chromium load with no JavaScript exceptions.
- v2.7.6 project fixture migration/open: project ID, `createdAt`, notes and saved edits survived reload.
- Autosave to IndexedDB and recovery-journal quota failure: IndexedDB save succeeded and the user received a visible recovery warning.
- Simulated IndexedDB save failure: New Project was prevented from replacing the unsaved project; retry succeeded.
- Service-worker lifecycle: first install, offline reload, versioned JS offline, missing JS returned 503 instead of HTML, cached MP3 byte ranges, waiting-update state, Save & reload activation, existing project survived update.
- Drawing/export smoke: site area, Trakway run, Undo/Redo, project backup/restore, GeoJSON, KML, CSV, DXF, A3 PDF and A4 PDF.
- Precision measurement: 1 m nudge, 5 m/Shift nudge, keyboard/tap controls and add-to-plan path.
- Robustness: malformed project import preserved the active project; dynamic project-name/script injection fixture did not execute; unsafe SVG style/onload path was blocked; QR and shape-import lazy-load path worked.
- Theme/accessibility scope: automated contrast checks passed for all 13 themes in the tested Explore/precision state after the light-theme fixes; phone/short-landscape cursor/rail issues discovered by QA were subsequently fixed.
- Network helper unit: duplicate geocoder query collapsed to one request; repeat query used memory cache; subsequent distinct request was spaced about 1.1 s.
- Service-worker slow-navigation unit: cached navigation fallback occurred at about 3.0 s.
- PDF inspection: A3/A4 document generation and title/project metadata were inspected; the dark wordmark backing and unsupported measurement glyph were corrected afterward.
- Wake-lock/multitouch/version retention checks were added to the work trail: active-tool wake lock releases after tool exit, second touch does not add a precision point, stale save completion must not overwrite a newer Saving state, and version history remains capped at 30.

## Performance

The requested target was first useful screen under roughly 2.5 seconds on a throttled mid-range phone. The max-thinking performance run did **not** meet it:

- Simulated 4× CPU slowdown + approximately 1.6 Mbps / 150 ms cold repeat launch: about **10.2 s**.
- Warm offline repeat launch: about **3.3 s**.

This is a release limitation, not hidden. Wider lazy-loading of `documents.js`, `studio.js` and the built-in asset catalogue would require a larger dependency refactor than is appropriate for a no-regression patch release.

## Current environment limitation

A fresh Chromium rerun after reconstruction was attempted. The managed browser returned `chrome-error://chromewebdata/` with **“127.0.0.1 is blocked — Your organization doesn’t allow you to view this site.”** This environment-level `URLBlocklist` prevents a meaningful localhost PWA/browser rerun. It was not bypassed. Therefore real-device/browser checks are left in `MANUAL_TEST_CHECKLIST.md` and the earlier browser evidence above is explicitly labelled as earlier evidence, not a fresh pass.

## Not certified by automation

- iOS Safari/Chrome/Firefox and iPadOS standalone lifecycle.
- Android Chrome/Samsung/Firefox real install UI and OS eviction behaviour.
- Real GPS/microphone/speech-recognition prompts.
- Outdoor glare/readability and glove/pen ergonomics.
- HGV route suitability, OHL/service completeness or survey-grade geometry.
- Provider licensing for a customer's specific imagery/export use.
- WCAG conformance as a whole.
