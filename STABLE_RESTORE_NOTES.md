# SAMI v2.7.9 — Stable Function Restore

This release deliberately returns to the hash-verified SAMI v2.7.6 functional baseline (`fa728976f99addfad9d30d3159cda76714bf2b8ec3adda047b63fcb342ed2a35`) rather than carrying forward the extended v2.7.7/v2.7.8 refactor.

## Restored unchanged from v2.7.6

- Site-area drawing and Site Plan workflow.
- Trakway Lion / Hybrid / TuffTrak / Sabre-X placement, touch-line routes, freehand runs, area fills, corner/panel-generation rules and material counts.
- Point, line, area, rectangle, circle, note, photo, service and asset drawing paths.
- Select / move / rotate / edit-points / grouping / undo / redo behaviour.
- Map, route, services/OHL, shape import, Ask SAMI, PDF/GeoJSON/KML/DXF/CSV and project storage implementations.
- Browser cinematic intro and install-first flow.
- All 13 v2.7.6 appearances, recorded voice files and baseline assets.

## Narrow fixes applied

1. **Precision measurement cursor alignment:** dragging now puts the cursor centre directly under the pointer instead of retaining an offset based on where the cursor was first grabbed. Movement is coalesced with `requestAnimationFrame`.
2. **Tap positioning:** while precision measurement is active, tapping the map moves the cursor to that location. Tapping the cursor (or Drop point) records the point. This avoids accidental normal drawing actions while measuring.
3. **Touch safety:** a second touch cancels cursor dragging so pinch gestures do not place points.
4. **Menu readability:** global-menu text is explicitly light on its dark menu surface in every theme, including the light appearances.
5. **Release/cache marker:** cache and registration identifiers are advanced so a deployment over v2.7.8 receives the restored build.

## Verification

- 58/58 baseline files retained before adding this note.
- Only `workspace.js`, `app.css`, `engine.js`, `index.html`, `manifest.webmanifest` and `sw.js` differ from v2.7.6.
- `engine.js` is byte-identical to v2.7.6 after normalising the service-worker URL only. Therefore core Trakway and drawing engine code is restored exactly.
- Workspace functions `activateAsset`, `renderDraft`, `commitPrecision`, `startBoxSelect`, `finishBoxSelect`, `requestEntryPermissions`, `fitArea`, `visibleArea` and `snap` are byte-identical to v2.7.6.
- Workspace action inventory is unchanged.
- All 17 JavaScript files pass `node --check`.
- Browser intro startup code remains present.
- Full interactive Chromium QA could not be rerun in this environment because its managed browser policy returns `ERR_BLOCKED_BY_ADMINISTRATOR` for all navigation. No pass is claimed for a test that could not run.

Test Trakway touch-line drawing and precision drag/tap first on the target iPad/phone after deployment.
