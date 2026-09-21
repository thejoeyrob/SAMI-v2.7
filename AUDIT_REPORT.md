# SAMI v2.7.7 — Audit Report

This report closes the Phase 1 audit performed on the hash-verified v2.7.6 baseline (`fa728976f99addfad9d30d3159cda76714bf2b8ec3adda047b63fcb342ed2a35`). The original read-only audit and feature inventory are retained separately in `PHASE_1_AUDIT.md` and `FEATURE_INVENTORY.md`.

## Release assessment

These are engineering assessments, not accessibility/security certifications.

| Area | v2.7.6 audit | v2.7.7 assessment | Main change |
|---|---:|---:|---|
| Correctness | 3/5 | 4/5 | Unified lifecycle paths; precision and import edge cases repaired |
| Data safety | 2/5 | 4/5 | IndexedDB-first save path, visible failures, safe project switching, backup UI |
| PWA / offline | 1/5 | 4/5 | Versioned shell, timed navigation fallback, explicit update flow, lazy media |
| UI / UX | 3/5 | 4/5 | Larger field targets, responsive cursor controls, install/update/data-safety states |
| Accessibility | 2/5 | 4/5 | Zoom restored, non-drag measurement controls, focus fixes, contrast work |
| Performance | 2/5 | 3/5 | Faster repeat launch/lazy execution, but simulated cold start remains above target |
| Security | 2/5 | 4/5 | CSP, safer SVG/style paths, bounded imports, malformed-file preservation |
| Maintainability | 2/5 | 3/5 | Single version source and generated cache list; large legacy modules remain compact |

## Phase 1 finding status

| ID | Status in v2.7.7 | Notes |
|---|---|---|
| D01 | Fixed | Autosave and explicit saves converge on the existing project store; legacy recovery source retained for compatibility. |
| D02 | Fixed / hardened | Project identity retained; journal failures surface visibly; persistent-storage request and backup path added. A browser/OS kill can still interrupt the very latest asynchronous write. |
| D03 | Fixed | New/Open/Restore/Close paths stop when the current project cannot be saved; backup import opens a separate copy. |
| P01 | Fixed for shell lifecycle | 3 s navigation fallback, version-pinned shell, non-navigation asset failures, lazy media, no automatic takeover. Old shell-cache pruning is intentionally deferred. |
| P02 | Fixed | `VERSION.json` stamps v2.7.7 into config/UI/query strings/manifest/SW/cache. Historical “v2.7.6” CSS comments remain comments only. |
| A01 | Fixed | Browser zoom restriction removed; 44 px general actions and 48 px map controls are enforced with responsive/safe-area rules. |
| A02 | Fixed in the tested token/UI states | Light-theme tokens and explicit UI borders were strengthened; outdoor contrast option added. Real imagery/device glare still requires manual acceptance. |
| A03 | Fixed | Drag, tap-position, nudge and keyboard alternatives; rAF movement; multi-touch suppression; coordinate/bearing/snap readout; closed perimeter. |
| A04 | Fixed / improved | Menu/drawer focus restoration, keyboard arming and modal Escape handling. Map inspector remains intentionally non-modal. |
| L01 | Fixed / improved | Install-first decision retained with capability/platform guidance; repeat standalone launch is fast-path; Skip accessible; audio gesture-gated. |
| S01 | Fixed in identified producers | Shared symbol colours constrained; pattern SVG built with DOM attributes; dynamic IDs/actions escaped; data-image scheme bounded. |
| S02 | Improved | Meta CSP blocks object/base misuse and external scripts. `connect-src https:`/media HTTPS remain broad to preserve deliberately configurable integrations; host-level CSP remains roadmap work. |
| S03 | Fixed / improved | Existing upload limits retained; malformed project files fail without replacing the current project; Visio archive entry/expanded-size bounds added. |
| N01 | Improved | Nominatim explicit-query de-dup/cache/rate/timeout helper added; export attribution strengthened. Production-wide rate limiting still needs a controlled service. |
| N02 | Proposed, not applied | Public OSM/standard Esri tile services are not bulk-prefetched for offline areas. A licensed/self-hosted provider is required first. |
| F01 | Improved, target not met | Promo preload removed; repeat launch fast-path; QR/shape code executes on demand. Large shared renderer/catalogue modules remain eager to avoid patch-release dependency regressions. |
| W01 | Mostly fixed | Maskable icon, language, categories, display override, shortcuts and wake lock added. Fresh install screenshots were not regenerated after environment policy blocked localhost browser navigation, so the manifest does not advertise unverified screenshots. |

## Integrity decisions

- Database names/schema versions and existing `sami.*` preference/recovery keys are retained.
- All baseline files remain present in the release; no recorded voice file or wording is intentionally changed.
- Providers are not silently swapped.
- The shipped app remains a flat-root, static HTML/CSS/vanilla-JS PWA with no runtime build step or framework.
- Dev-time `build.mjs` is dependency-free and only stamps/generates static release files.
- Offline basemap area downloads remain deliberately absent until a provider explicitly permits that use.

## Remaining material risks

1. Full real-device qualification is required before operational rollout, especially iOS/iPadOS standalone storage, permission prompts and background/kill recovery.
2. Public geocoding/routing/Overpass endpoints provide no professional SLA and browser-only rate limiting cannot enforce an application-wide quota across a fleet.
3. The measured simulated cold-start result remains materially above the requested 2.5 s target.
4. PDF/map scale, HGV route suitability and service/constraint data remain planning aids that need operational/survey verification.
5. A meta CSP cannot provide every protection available through deployment response headers.
