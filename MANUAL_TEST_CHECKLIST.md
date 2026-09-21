# SAMI v2.7.7 — Real-device acceptance checklist

Deploy the flat-root ZIP to a test HTTPS origin first. Export a v2.7.6 project backup before upgrading production.

## Data and update — test first

- [ ] In v2.7.6 create a named project containing a site area, Trakway, service, note, photo/logo and custom shape. Export a `.sami` backup and record counts/dimensions.
- [ ] Replace hosted files with v2.7.7 while an old tab remains open. Confirm it does **not** reload mid-edit. Finish an edit, choose **Save & reload**, and verify all data after update.
- [ ] Close/reopen with a waiting update and verify the same project identity is selected rather than a duplicate.
- [ ] Make an edit, wait for **Saved**, force-close and reopen offline. Compare geometry, notes and drawings. Repeat immediately after an edit to assess the latest asynchronous-write window.
- [ ] Deny/fill site storage on a test device. Verify visible save/recovery warning, Retry, Backup, and that New/Open does not discard the current unsaved project.
- [ ] Export a backup, verify the file exists in Downloads/Files, import it, and confirm it opens as a **separate** project while the original remains accessible.
- [ ] Confirm API keys/connected-service preferences are absent from the portable backup.
- [ ] Test persistent-storage permission granted, denied and unsupported.
- [ ] Back up before browser-data clear/uninstall. After reinstall, import the backup; do not expect cleared browser storage to survive.

## Installation / devices

- [ ] iPhone/iPad Safari: Add to Home Screen, standalone first launch, Skip, repeat direct-to-workspace, safe areas, keyboard and background/foreground return.
- [ ] iOS Chrome/Firefox: verify actual current Add to Home Screen capability; otherwise follow the Safari/copy-link handoff. No dead end.
- [ ] Android Chrome: install prompt, cancellation/retry, appinstalled state and standalone relaunch.
- [ ] Samsung Internet and Firefox Android: verify current menu installation and standalone detection.
- [ ] WhatsApp/Teams/Outlook in-app browser: copy/open in a supported browser; no unusable Install button.
- [ ] Desktop Chrome/Edge/Firefox/Safari: guidance matches actual install/Add to Dock capability.
- [ ] iPadOS desktop mode and rotation with inspector/precision controls open.
- [ ] Phone portrait (~390 px), short landscape and tablet landscape: no clipped essential action; cursor/panel do not obscure each other; map rail scrolls; Undo/Redo reachable.

## Drawing and input

- [ ] Site area by rectangle, points and freehand; verify frame/scale/orientation after save/reopen.
- [ ] Trakway single/run/fill/corners and other surfaces/assets; move/rotate/resize where allowed; group, lock, hide, duplicate, delete, Undo/Redo.
- [ ] Precision with finger, pen, mouse: drag, Tap position, Drop point, 1 m/5 m nudges, arrows/Shift, Enter/Space, Backspace, Escape, Add to plan and Use for site plan.
- [ ] Repeat precision at several zooms/bearings and compare metre steps with a known reference. A second touch/pinch must not add a point.
- [ ] Several hundred vertices: pan/zoom/draw responsiveness and long-session stability.
- [ ] All 13 themes, system default, manual override, custom accent and Outdoor contrast over real satellite imagery/direct sunlight.
- [ ] Browser/text zoom to 200%; keyboard-only navigation; VoiceOver/TalkBack names/focus/menu/drawer/modal/save/toast states.
- [ ] OS reduced motion and in-app reduced motion. Intro/replay Skip reachable. No audio before a user gesture.
- [ ] Location and microphone permission: granted, denied and changed later. Existing projects must not be recentered unexpectedly.
- [ ] Wake lock enabled during active drawing, released after finish/cancel/background; denied/unsupported state is honest.

## Offline, connected services and outputs

- [ ] Open once online, then Airplane mode: reload shell, open/save/edit project, draw, backup and local exports. Do **not** expect an offline basemap unless separately licensed/provisioned.
- [ ] Weak-signal/black-hole test: navigation should fall back to cached shell after ~3 s. A failed `.js`, `.css` or `.mp3` must never receive HTML.
- [ ] First-ever launch with no cache/no network: show unavailable rather than claiming offline readiness; reconnect and retry.
- [ ] Play promo/voice once, then test cached audio seeking/ranges offline.
- [ ] Search address/coordinates/what3words; HGV route; services/constraints/OHL; test no key, timeout, cancellation, no result and service unavailable. Independently validate operational route suitability.
- [ ] Import valid/malformed/oversized project, GeoJSON, SVG, DXF, shape pack and supported Visio. Error paths must leave the active project intact. KML is an export capability; do not assume general KML import.
- [ ] Export A4/A3 CAD/map/satellite PDF, browser print, GeoJSON, DXF, KML, CSV and `.sami` backup. Compare title block, scale, north, coordinates, layers, logos, notes, QR and route sheets with the screen.
- [ ] Cancel a PDF during a long job; no unintended download and the project remains unchanged.
- [ ] Verify current map/imagery attribution/licensing for the actual distributed output.
- [ ] Test manifest shortcuts: New site, Last project and Route. New site must save/preserve the previous project.

Record device, OS/browser version, deployment URL, pass/fail and screenshots. Stop rollout for data loss, failed upgrade/reload, materially incorrect scale/geometry or an inaccessible essential control.
