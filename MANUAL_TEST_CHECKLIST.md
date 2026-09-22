# SAMI v2.7.14 — Real-device acceptance checklist

Deploy the flat ZIP to a staging HTTPS origin. Export a v2.7.6/v2.7.12 project backup before replacing production files.


## 0. v2.7.14 feedback fixes — test before anything else

- [ ] **Windows/macOS installed PWA:** launch from the installed app icon. It must enter SAMI and must not remain trapped on the browser/install screen. Test Chrome/Edge PWA on Windows and Chrome/Edge/Safari-supported install mode on macOS.
- [ ] **iPad/iPhone measurement:** drag the crosshair with one finger and confirm it stays under the finger on release. Also test the alternative workflow: pan the map beneath the crosshair, tap **＋ Point**, and use **◎ Me** to centre on current position before adding a point.
- [ ] **Tap placement:** verify at least one non-Trakway asset, Route destination and measurement point all respond to a deliberate map tap immediately after switching tools.
- [ ] **Route W3W:** with a valid what3words key configured, drop the destination pin and confirm coordinate, address and W3W populate automatically. Repeat offline/without key: coordinate must still remain usable and no project data is lost.
- [ ] **Services:** enable OHL, gas, water and drainage/sewerage. Checked layers should start their refresh without a hidden extra step. Compare public reference data with known source plans.
- [ ] **OHL support popup:** tap a mapped pole/tower. Confirm the compact card shows **+ Add support / Update support** and **Edit** side by side without first opening an edit dialog.
- [ ] **Promo:** replay Why SAMI and watch from **PLAN ACCESS** onwards. Text/scene cues should no longer lag behind the recorded voice.
- [ ] **Arctic Light / Paper / Studio Light:** header, selected-object bubble, area/draw status, inspector, menu and measurement panel must remain readable and belong to the chosen appearance.
- [ ] **Sidebar:** open nested asset/service groups. Subgroups must open directly below their parent with no increasing horizontal stagger. Inspector tabs must visually join the panel below.

## 1. Data and update — test first

- [ ] In the old version create a named project containing a site area, Trakway run, service, note, photo/logo and custom shape; export a `.sami` backup.
- [ ] Deploy v2.7.14 while the old app remains open. Confirm it does not reload mid-edit. Choose **Save & reload** and verify project identity, geometry, notes, images and history.
- [ ] Edit, wait for **Saved**, force-close and reopen offline. Repeat with a simulated save failure; the project must stay open and **Retry**/**Export backup** must work.
- [ ] Export and re-import a backup. Confirm endpoints/API preferences are not included in the portable project.
- [ ] Test persistent-storage granted, denied and unsupported. Back up before clearing browser data or uninstalling.

## 2. Install, intro and devices

- [ ] Browser page launch: the clean centre animation plays without the removed squiggle, **Skip to install** stays reachable, instructions match the platform and no audio starts without a gesture.
- [ ] Installed repeat launch: workspace opens promptly without replaying the browser install sequence.
- [ ] iPhone/iPad Safari, iOS alternate browser handoff, iPad desktop mode, Android Chrome, Samsung Internet, Firefox Android and an in-app browser link.
- [ ] Desktop Chrome/Edge, Firefox and macOS Safari. Verify the gate never presents an unusable install button.
- [ ] Rotate at phone portrait, short landscape and tablet landscape. Safe areas, rails, drawer, inspector and keyboard must not cover the placement point.
- [ ] Enter the workspace: the address/postcode field must not be focused and the on-screen keyboard must stay closed.

## 3. Drawing, assets and cursor

- [ ] Create site area by rectangle, points and freehand. Create Trakway single/run/fill/corners; move, rotate, resize, group, lock, hide, duplicate, delete and Undo/Redo.
- [ ] Drag a catalogue item onto the drawing on iPad/desktop; tap-place the same item on a phone. The item must land at the intended point.
- [ ] Precision cursor with finger, pen and mouse: drag, map tap, cursor tap, drop point, cancel and undo. Pinch zoom must not move or drop the cursor.
- [ ] Test 1 m/5 m on-screen nudges and arrows/Shift at map bearings 0°, 32° and 90°. Compare with a known reference.
- [ ] Test keyboard Enter/Space, Backspace and Escape. Verify coordinate, bearing, next distance and total-distance readout.
- [ ] Confirm wake lock is requested only during active drawing/measuring and releases on finish, cancel or background.
- [ ] Add pylons and poles through **+**. Confirm larger outline/no fill, line-colour choice, selection and compact detail popup.

## 4. Themes, space and accessibility

- [ ] Switch all 13 appearances plus system default/manual override. Menus, drawers and dialogs must follow the selected scheme.
- [ ] Test light themes and outdoor/high-contrast use over satellite imagery in direct sunlight.
- [ ] Verify at least 44 px controls (48 px map tools), thumb reach, no hover-only action and maximum useful map space in portrait/landscape.
- [ ] Browser/text zoom to 200%; keyboard-only navigation; VoiceOver/TalkBack names, focus order, drawer/modal trapping and focus restoration.
- [ ] OS and in-app reduced motion. Check status/toast announcements and that repeated tool selection does not create unnecessary popups.

## 5. OHL and utility services

- [ ] At known sites request OHL for 400 V, 11/33/66/132/275/400 kV, untagged overhead lines, `line` and `minor_line`, and mapped supports.
- [ ] Select each tower/pole and verify reference, description, voltage, line name and owner where the source supplies them.
- [ ] Simulate provider failure. Last-good OHL should remain available and the message must say local tools still work.
- [ ] Load gas, water and drainage/sewerage public/reference layers. Compare against authoritative plans: absence on SAMI must never be read as absence on site.
- [ ] Import representative KML and KMZ statutory/survey service files. Confirm line types, labels, provenance, 1 px default screen line and save/reopen.
- [ ] Check cancellation/error/retry states on weak signal and ensure OSM/Esri/planning attribution remains visible.

## 6. Imports and exports

- [ ] Import GeoJSON, KML, KMZ and malformed/oversized files. A failed import must leave the active project untouched and show a plain-English error.
- [ ] Import VSSX, VSDX, VSTX, VSDM, VSTM, VDX and SVG/DXF samples with curves, groups and scale references. Legacy `.vsd`/`.vss` must show conversion guidance.
- [ ] Export `.sami`, GeoJSON, KML, CSV, DXF and PDF; share where supported.
- [ ] In PDF review keep the OHL schedule off by default, then enable it. Check grouped voltage/name/owner and pole/tower reference/description boxes.
- [ ] Inspect A4/A3 white-paper CAD output: dark SAMI logo without a surrounding box, title block, drawing/revision, scale/north, linked roads, essential main-road labels, 0.25 mm service lines and provider attribution.
- [ ] Verify user/company transparent PNG logos retain aspect ratio and stay inside their designated box.

## 7. Offline and deployment

- [ ] Load online once, then use Airplane mode: reload, open/save/edit/draw, backup and local exports. An offline basemap is not included.
- [ ] On a network black hole, cached navigation should recover at about 3 seconds. Failed JS/CSS/audio must never receive HTML.
- [ ] Fill storage close to quota and verify the visible warning; lazy audio caching must not prevent shell installation.
- [ ] Validate manifest/installability, maskable icon, phone/wide screenshots and New/Last/Route shortcuts from the installed app.
- [ ] Serve the extracted files directly from the repository publication root with HTTPS. Do not add a containing folder; retain `.nojekyll`.

Record device model, OS, browser/PWA mode, build `2.7.14`, pass/fail, screenshot and reproduction steps for every failure.
