# SAMI v2.7.6 — Phase 1 audit (before implementation)

Audit performed against the verified supplied ZIP. No application edits were made before this report and Phase 2 plan were delivered. Zero regressions is the release goal; no static review can certify it, and real-device testing remains required.

## Scores before changes

Scale: 1 = weak, 5 = strong. These are engineering assessments, not compliance certifications.

| Area | Score / 5 | Basis |
|---|---:|---|
| Correctness | 3 | Broad functioning toolset, split controller paths and measurement edge cases |
| Data safety | 2 | IndexedDB and versions exist, but autosave diverges and identity is lost on normalisation |
| PWA / offline | 1 | Untimed network-first, incorrect asset fallback, forced activation |
| UI / UX | 3 | Coherent stages; small targets and obstructive launch |
| Accessibility | 2 | Modal work exists; zoom blocked, no cursor movement alternative, weak light contrast |
| Performance | 2 | Measured slow cold start; shared dependencies limit low-risk lazy loading |
| Security | 2 | Escaping mostly used; imported SVG style sinks require repair; no CSP |
| Maintainability | 2 | Clear file roles but minified core and layered overrides/version drift |

## Evidence, fixes and risk

| ID | Severity | Baseline location | Evidence | Planned fix | Change risk |
|---|---|---|---|---|---|
| D01 | Critical | engine.js:2237 saveSoon/saveNow; workspace.js:1139 save | Autosave writes only legacy localStorage; manual workspace saves go to IndexedDB. Recovery can select an older journal over newer legacy content. | Unify autosave into workspace/store; timestamp-aware recovery across all existing sources; test legacy and quota failures. | Medium |
| D02 | High | project-store.js: journal, recover; workspace.js: normaliseProject | Journal quota errors return false silently; localStorage access in recover is partly unguarded. Project normalisation does not carry id/createdAt/checkpointAt from the input. | Keep project identity; visible degraded/failed state; commit to IndexedDB and preserve raw recovery sources; retries and persistence request. | Medium |
| D03 | High | workspace.js:1320 newProject, recent-open, history; engine.js:handleImport | Project switches continue even if saving fails. Import restore uses older lifecycle directly. | Require successful save before destructive switch; import as a new copy through lifecycle; backup remains available on failure. | Medium |
| P01 | High | sw.js: install/fetch/activate | Network first without timeout; failed assets receive HTML; all assets including MP3 in atomic addAll; immediate activation/claim. | Generated critical shell, cache-first versioned assets, bounded navigation fallback, optional media, consented update preserving existing clients. | High |
| P02 | High | index.html; config.js:build; engine.js:865; workspace.js:applyAppearance; manifest icons | Version references 271/276/266 and 0.9.1 disagree. | VERSION.json and Node stamp/validation script; consistent 2.7.7 query strings/UI/manifest/SW. | Low |
| A01 | High | index.html viewport; app.css control dimensions | Page zoom disabled; small targets (baseline map controls ~38 px). | Allow zoom; map touch handling only; 44 px controls/48 px map tools; safe-area and small-height layouts. | Medium |
| A02 | High | app.css light-theme tokens; appearance logic | Light-theme muted text minima 3.86–4.18:1 on declared surfaces; all theme line2/surface pairs below 3:1. | Theme-derived text and UI border tokens; contrast-safe accent ink; system default + existing manual override; optional outdoor contrast. | Medium |
| A03 | High | workspace.js:2248–2605 precision cursor | Only drag positions cursor; Enter/Space drops but arrows absent. Pointer move reads layout/rebuilds all markers, multi-touch has no explicit guard. Area perimeter preview omits closing edge. | rAF/coalesced movement, cached drag rectangles, transform position; tap-position toggle, metre nudges/arrows; incremental preview; exact closed perimeter. | Medium |
| A04 | Medium | workspace.js menu/openDrawer; engine.js modalTrap | Modal trap/restore already exists; menu Escape does not restore focus, drawer collapse can hide focused element; input keyboard arming uses pointer only. | Retain nonmodal map inspector; explicit focus return, menu trap, keyboard arming and named live states. | Low |
| L01 | High | cinema.js:19, play, startup; cinema.css install rules | Install-required class on every browser; gate visibility uses viewport CSS. Initial intro has hidden skip; every launch animates. Hidden/visible resume can play promo audio unconditionally. | Capability/platform guide, copy URL fallback, no unsupported-browser bypass by default; fast installed repeat entry, always reachable skip, audio only after gesture. | Medium |
| S01 | High | workspace.js:paintPatterns/preview/loadProfiles; symbols.js:color/svgParts | Imported styleFill/styleColor enters SVG attribute strings without escaping at shared symbol renderer/patterns. Project miniature can embed untrusted style values. | DOM attributes for patterns; escape all dynamic SVG attributes/IDs; validate symbol colours and image URL schemes; malicious import fixture. | Medium |
| S02 | Medium | index.html; custom endpoints in config/preferences | No CSP; keys are local device preferences, not encrypted. Unrestricted user-configured endpoint origins prevent a fixed complete connect-src allowlist. | Hash externalised startup script, strict scripts/object/base policies; default service allowlist and explicit integration-compatible policy decision; document limits. | Medium |
| S03 | Medium | shape-import.js:parse/Visio decompression; engine.js:handleImport | Basic size caps and try/catch already exist. Decompressed archive totals and malformed XML/JSON shape validation need targeted checks. | Bound decompression/entry counts, preserve existing limits, reject malformed inputs before replacing project. | Low |
| N01 | Medium | engine.js/workspace.js service fetches; documents.js attribution | Some existing timeout/cancel/cache logic; no shared Nominatim queue/cache; OSM legacy subdomain URL; generic Esri attribution. | Shared bounded request helper for explicit queries, repeat caching/dedup/backoff; do not silently switch providers; strengthen attribution. | Medium |
| N02 | Policy constraint | engine.js tile providers; requested offline area downloads | Current OSM public tile policy forbids save-area/offline prefetch; World Imagery layer is not for offline tile export. | Do not fetch offline areas from these providers. Design bounded provider-approved solution in roadmap. Local drawing/backup remains offline. | High if ignored |
| F01 | Medium | documents/studio/global dependencies; cinema.js startup | 4x CPU/1.6 Mbps/150 ms uncompressed cold test: 10,757.7 ms to workspace ready, still intro-gated; six long tasks >50 ms. Heavy modules have synchronous rendering dependencies. | Remove eager audio; direct repeat entry; lazy-load only safely separable QR/import modules; do not blindly defer shared document renderer. | Medium |
| W01 | Low–Medium | manifest.webmanifest; workspace controls | No maskable icon/screenshots/lang/categories or action shortcuts; no wake-lock toggle. | Add metadata, verified screenshots and shortcuts, user-controlled active-task wake lock with honest support status. | Low |

## Contrast measurements

Actual browser-computed token colours; all three text surfaces tested. UI column is line2 against surface, not a claim that every boundary requires contrast.

| Theme | Minimum muted/text ratio | UI border ratio |
|---|---:|---:|
| graphite | 5.73:1 | 1.95:1 |
| carbon | 5.79:1 | 2.15:1 |
| blackout | 6.23:1 | 1.72:1 |
| obsidian | 6.03:1 | 1.84:1 |
| midnight | 5.79:1 | 2.10:1 |
| navy | 5.97:1 | 2.23:1 |
| slate | 5.56:1 | 2.44:1 |
| titanium | 5.91:1 | 2.31:1 |
| sandstone | 5.95:1 | 2.31:1 |
| arctic | 6.19:1 | 2.79:1 |
| arcticLight | 3.86:1 | 2.00:1 |
| paper | 3.98:1 | 2.24:1 |
| studioLight | 4.18:1 | 1.99:1 |

## HTML sink audit

All 59 direct first-party assignments were inspected, including producer helpers for composed HTML. Static strings and escaped plain text are retained. High-risk shared SVG/style producers are identified in S01. Full expressions are retained in the QA evidence; this is not an independent penetration test.

| Sink | Review disposition |
|---|---|
| cinema.js:1367 — setSentence | Static/clearing, escaped text or numeric geometry; preserve |
| cinema.js:1413 — letterMorph | Static/clearing, escaped text or numeric geometry; preserve |
| cinema.js:1429 — letterMorph | Static/clearing, escaped text or numeric geometry; preserve |
| cinema.js:1659 — resetVisual | Static/clearing, escaped text or numeric geometry; preserve |
| cinema.js:1763 — finishAtWelcome | Static/clearing, escaped text or numeric geometry; preserve |
| cinema.js:1875 — setupBrowserGate | Static/clearing, escaped text or numeric geometry; preserve |
| cinema.js:1881 — anonymous | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:985 — updateLock | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:3019 — renderDrawer | Composed UI; trace shared escaped producers |
| engine.js:4529 — findPlace | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:4536 — findPlace | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:4554 — findPlace | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:4575 — findPlace | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:5285 — openExport | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:5448 — showModal | Composed UI; trace shared escaped producers |
| engine.js:5454 — showModal | Composed UI; trace shared escaped producers |
| engine.js:5473 — closeModal | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:7181 — buildPrintTemplate | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:7213 — buildPrintTemplate | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:7220 — buildPrintTemplate | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:7234 — buildPrintTemplate | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:7237 — buildPrintTemplate | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:7240 — buildPrintTemplate | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:7243 — buildPrintTemplate | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:7404 — populateVoiceSelect | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:7577 — addMessage | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:7584 — addMessage | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:8153 — showInstallFallback | Static/clearing, escaped text or numeric geometry; preserve |
| engine.js:8906 — anonymous | Static/clearing, escaped text or numeric geometry; preserve |
| studio.js:317 — anonymous | Repair dynamic attribute producer |
| studio.js:619 — updateLock | Static/clearing, escaped text or numeric geometry; preserve |
| studio.js:1837 — renderDrawer | Composed UI; trace shared escaped producers |
| studio.js:2195 — openCreator | Composed UI; trace shared escaped producers |
| studio.js:2222 — drawCreator | Repair dynamic attribute producer |
| studio.js:2230 — drawCreator | Static/clearing, escaped text or numeric geometry; preserve |
| studio.js:2783 — updateLaunchGate | Static/clearing, escaped text or numeric geometry; preserve |
| studio.js:3331 — anonymous | Static/clearing, escaped text or numeric geometry; preserve |
| studio.js:3523 — dockSection | Static/clearing, escaped text or numeric geometry; preserve |
| studio.js:3572 — mountDock | Static/clearing, escaped text or numeric geometry; preserve |
| studio.js:3678 — anonymous | Static/clearing, escaped text or numeric geometry; preserve |
| studio.js:4179 — anonymous | Repair dynamic attribute producer |
| studio.js:4182 — anonymous | Static/clearing, escaped text or numeric geometry; preserve |
| studio.js:4187 — anonymous | Static/clearing, escaped text or numeric geometry; preserve |
| workspace.js:534 — routeHTML | Composed UI; trace shared escaped producers |
| workspace.js:541 — routeHTML | Composed UI; trace shared escaped producers |
| workspace.js:552 — routeHTML | Composed UI; trace shared escaped producers |
| workspace.js:688 — chrome | Static/clearing, escaped text or numeric geometry; preserve |
| workspace.js:1039 — loadProfiles | Repair dynamic attribute producer |
| workspace.js:1293 — anonymous | Repair dynamic attribute producer |
| workspace.js:1302 — dashboard | Static/clearing, escaped text or numeric geometry; preserve |
| workspace.js:1424 — renderDrawer | Composed UI; trace shared escaped producers |
| workspace.js:1667 — paintPatterns | Repair dynamic attribute producer |
| workspace.js:2287 — ensurePrecisionUI | Static/clearing, escaped text or numeric geometry; preserve |
| workspace.js:2351 — ensurePrecisionUI | Static/clearing, escaped text or numeric geometry; preserve |
| workspace.js:3329 — mount | Static/clearing, escaped text or numeric geometry; preserve |
| workspace.js:3336 — mount | Static/clearing, escaped text or numeric geometry; preserve |
| workspace.js:3345 — mount | Static/clearing, escaped text or numeric geometry; preserve |
| workspace.js:3389 — mount | Static/clearing, escaped text or numeric geometry; preserve |
| workspace.js:3404 — mount | Static/clearing, escaped text or numeric geometry; preserve |

## Service policies and platform evidence

- [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/): visible attribution/Referer, normal browser caching; no offline area download or bulk prefetch. No public tile requests were sent by our automated map tests.
- [Nominatim policy](https://operations.osmfoundation.org/policies/nominatim/): explicit user queries, repeat-query caching, maximum one request/second **for the entire application**; autocomplete prohibited. A browser-only per-device queue cannot ensure a production fleet meets that limit. Use a controlled proxy/self-hosted or contracted geocoder for deployment at scale.
- [Overpass resource guidance](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html): shared capacity, backoff and reasonable query size. Fallback hosts are separate operators; availability is not guaranteed.
- [Valhalla demo guidance](https://valhalla.github.io/valhalla/): public demo fair use, no commercial SLA. A contracted/self-hosted route service is a professional deployment decision.
- [Planning Data terms](https://www.planning.data.gov.uk/terms-and-conditions): OGL where applicable; verify source/dataset licensing and geographic completeness.
- [Esri World Imagery](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9) and [static map terms](https://doc.arcgis.com/en/arcgis-online/reference/static-maps.htm): keep attribution near outputs, check provider acknowledgements; this standard layer is not the offline export service. This audit does not certify a commercial imagery licence.
- [Apple web app guidance](https://developer.apple.com/videos/play/wwdc2023/10120/): iOS/iPadOS support for third-party browser Add to Home Screen APIs means “Chrome/Firefox on iOS cannot install” is too broad. Guide by available Share options, with Safari as fallback. macOS Safari supports Add to Dock on suitable versions.
- [MDN installability](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable): install UI differs across browsers; beforeinstallprompt is capability-detected.
- what3words remains optional and user-key based. Current plan entitlements and domain restrictions were not independently verified; no claim of free/professional entitlement is made.

Baseline headless Chromium loaded the app with no page exceptions. Map/service traffic was deliberately blocked. Real device and live API correctness are unverified at this stage.
