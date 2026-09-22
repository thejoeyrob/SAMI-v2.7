# SAMI v2.7.13 - Audit report

## Provenance and recovery

- Supplied v2.7.6 ZIP SHA-256: `fa728976f99addfad9d30d3159cda76714bf2b8ec3adda047b63fcb342ed2a35` - verified before use.
- Latest public repository baseline: `thejoeyrob/SAMI-v2.7`, commit `aa59b001941f3d761c490298e6ae54bf0d965e03` (v2.7.12) - clean checkout retained in `baseline_latest/` during development.
- Earlier v2.7.13 work was recovered and compared. Safe W3W/AI improvements were merged. Its one-time IndexedDB/localStorage deletion and cursor/service-worker regressions were rejected.
- v2.7.12's exact touch-release behaviour was retained. All 86 latest-baseline files remain present; two verified PWA screenshots were added.
- The shipped first-party JavaScript is readable. Bundled Leaflet, polygon clipping and QR vendor files remain minified to preserve upstream behaviour and size.

These scores are engineering assessments, not formal security, accessibility or surveying certification.

| Area | Baseline | v2.7.13 | Evidence / remaining limit |
|---|---:|---:|---|
| Correctness | 3/5 | 4.5/5 | Drawing, Trakway, cursor, imports, services and exports pass automated smoke tests; physical-device acceptance remains. |
| Data safety | 2/5 | 4.5/5 | Identity/timestamps retained, failed save blocks replacement, quota warning and portable backup work; the newest asynchronous edit still depends on the browser completing IndexedDB. |
| PWA / offline | 2/5 | 4.5/5 | Versioned shell, 3 s navigation timeout, explicit update and offline update lifecycle pass; basemap tiles remain online by provider policy. |
| UI / UX | 3/5 | 4/5 | Compact field layout, themed menus, keyboard suppression and responsive controls pass the tested viewports; outdoor/glove use needs real devices. |
| Accessibility | 2/5 | 4.5/5 | Browser zoom restored, exact non-drag cursor controls, names/focus/Escape/live status and 13-theme audit pass in Chromium; VoiceOver/TalkBack remain manual. |
| Performance | 2/5 | 3/5 | Warm offline repeat launch measured 419 ms; uncompressed throttled cold load measured 9.96 s, above the 2.5 s target. |
| Security | 2/5 | 3.5/5 | CSP, bounded imports, injection fixtures and secret-free backups pass; a meta CSP and configurable HTTPS integrations are intentionally broader than deployment headers should be. |
| Maintainability | 2/5 | 4/5 | Single version/precache generator, readable source, asset classification and current reports; large legacy modules remain tightly coupled. |

## Finding status

| ID | Severity | Location | Evidence | Status / decision |
|---|---|---|---|---|
| D01 | Critical | `engine.js`, `workspace.js`, `project-store.js` | Recovered projects lost identity/timestamps and could duplicate. | **Fixed.** v2.7.6 fixture ID, dates, notes and subsequent save survive reload. |
| D02 | High | `project-store.js`, `workspace.js` | localStorage journal quota was swallowed. | **Fixed.** IndexedDB still saves; a persistent one-tap backup warning is shown. |
| D03 | High | `workspace.js` | New Project continued after final-save failure. | **Fixed.** Current project remains active and retry succeeds. |
| P01 | Critical | `sw.js`, `pwa.js` | Unlimited network-first waits and all-request HTML fallback. | **Fixed.** 3 s navigation timeout, navigation-only HTML, 503 assets, cache-first shell and lazy audio. |
| P02 | High | release files | Cache/UI/manifest version drift. | **Fixed.** `VERSION.json` stamps v2.7.13 everywhere, including dynamic favicon selection. |
| P03 | High | service-worker lifecycle | Automatic takeover could mix old/new code. | **Fixed.** Update waits for **Save & reload**; automated 2.7.13 to 2.7.14 simulation preserved the project. |
| A01 | High | `index.html`, `app.css` | Browser zoom disabled; small controls. | **Fixed.** Zoom restriction removed; 44 px general and 48 px map controls with safe areas. |
| A02 | High | all 13 themes | Light/menu contrast risks. | **Fixed in tested states.** Automated axe subset and token contrast pass all themes. |
| A03 | High | `workspace.js`, `app.css` | Drag-only precision cursor and release shift. | **Fixed.** Drag/tap/keyboard/nudge alternatives, exact touch end, rAF movement and multi-touch guard. |
| U01 | High | `workspace.js`, `engine.js` | Address/search input focused on entry. | **Fixed.** Initial active element is BODY; shortcuts also leave no input focused. |
| U02 | High | asset library | Drag/drop binding absent from current workspace tiles. | **Fixed.** Desktop HTML5 drag and touch-drag placement tested. |
| S01 | High | OHL/services | Incomplete voltage/tag coverage and snapshot loss on errors. | **Improved.** 400 V/11 kV/400 kV/untagged mocked records and supports pass; last-good data remains. Completeness is limited by source mapping. |
| S02 | Medium | utilities | Gas/water/drainage not surfaced consistently. | **Improved.** Public mapped records and KML/KMZ survey imports are supported. They are not statutory utility plans. |
| I01 | Medium | `shape-import.js` | Visio archives and malformed/oversized files. | **Fixed/improved.** Modern Open XML families and VDX work with archive limits; legacy binary formats receive conversion guidance. |
| X01 | Medium | dynamic HTML producers | Project/import/API strings reaching HTML sinks. | **Hardened and tested.** First-party sink count did not increase (59); injected project names/notes and SVG style payloads do not execute. Continue review when adding producers. |
| X02 | Medium | `index.html` | No CSP. | **Improved.** Meta CSP restricts scripts/object/base/form use. Host response headers remain preferable. |
| E01 | Medium | `documents.js` | CAD layout, logo, attribution, service weights and OHL details. | **Fixed/improved.** Two-page A3 fixture visually inspected; schedule boxes and text extraction pass. |
| L01 | Medium | `cinema.js` | Install dead ends and audio/intro behaviour. | **Fixed in UA logic.** Browser intro, always-visible Skip, gesture-only audio and platform hand-off tested; real browser install UI remains manual. |
| F01 | Medium | eager JavaScript | Roughly 1 MB first-party/vendor JS before full readiness. | **Partly improved.** Audio is lazy and repeat/offline launch is fast. Wider module splitting is proposed, not applied, to avoid another drawing regression. |

## Provider and data-use review

Checked 22 September 2026 against official/current provider material:

- OSM standard tiles prohibit bulk prefetch/offline use: `https://operations.osmfoundation.org/policies/tiles/`. SAMI therefore does not add **Save area offline** against that service.
- Public Nominatim is limited capacity and requires conservative identified use: `https://operations.osmfoundation.org/policies/nominatim/`. SAMI uses deliberate searches, not autocomplete; professional fleet use needs a controlled provider.
- Public Overpass instances are shared small-project infrastructure with no SLA: `https://wiki.openstreetmap.org/wiki/Overpass_API`. SAMI bounds queries, tries mirrors and retains last-good data; professional use should be hosted/contracted.
- The public Valhalla endpoint is a fair-use demo and rate-limited: `https://github.com/valhalla/valhalla`. It remains clearly labelled a route preview, not an approved HGV route.
- ArcGIS Online imagery requires visible attribution and a suitable licence: `https://developers.arcgis.com/javascript/latest/references/core/layers/ImageryLayer/`. SAMI displays/prints attribution; the customer must confirm licensed export use.
- Planning Data is beta/open data, generally OGL v3 with Crown attribution and no accuracy warranty: `https://www.planning.data.gov.uk/docs` and `https://www.planning.data.gov.uk/terms-and-conditions`. The PDF now includes the relevant attribution/caveat.

## Integrity decisions

- IndexedDB database name/version/stores, recovery keys and project JSON schema are unchanged. No deletion/migration routine was added.
- Recorded speech wording and every matching MP3 are unchanged.
- No provider was silently replaced and no heavy runtime dependency was added.
- The app remains a flat-root, static HTML/CSS/vanilla-JS PWA suitable for GitHub Pages HTTPS hosting.
- Public OHL/utility data remains a planning reference. Absence on screen never means absence on site.

## Residual release risks

1. Complete the supplied iPhone/iPad/Android/desktop checklist before operational rollout.
2. Contract/self-host geocoding, routing, Overpass/utility sources for production capacity and authoritative data.
3. The cold throttled uncompressed test misses the requested target; use host compression now and perform module splitting only as a separately regression-tested release.
4. Verify PDF scale, HGV suitability, OHL and underground utilities through competent professional processes before work.
5. Restrict the configured W3W key by allowed domain/usage and keep all AI/provider secrets server-side.
