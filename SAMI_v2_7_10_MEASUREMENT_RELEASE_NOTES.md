# SAMI v2.7.10 — Measurement Touch Rework

Baseline: **SAMI v2.7.9 Stable Function Restore**. This release is deliberately scoped to the map/precision measurement interaction and version metadata so existing drawing, Trakway, service/OHL, project, export and cinematic functionality is preserved.

## Measurement changes

- Reworked the measurement cursor into a direct one-finger drag interaction.
- The cursor centre now follows the actual touch point rather than using a stale drag rectangle or indirect map coordinate when a real pointer coordinate is available.
- Map panning is temporarily suspended only while the measurement cursor is being dragged, then restored immediately.
- The cursor starts at the centre of the current map viewport and retains its relative position through resize/orientation changes.
- Multi-touch cancels a cursor drag cleanly so normal two-finger map interaction is not confused with a measurement gesture.
- Cursor drag rendering is now split into **static committed geometry** and a **lightweight live preview**. Fixed points, segments and labels are rebuilt only when a point is added/removed; finger movement updates only the live preview. This removes the previous full Leaflet layer rebuild on every pointer frame.
- Live segment distance remains visible while moving the cursor. Committed segment distances and total distance remain displayed on the map.
- Area mode retains live perimeter and area feedback.
- Tap the cursor to place a point. Tapping the map can still reposition the cursor without placing a point.
- Added small haptic feedback where supported when a point is placed.

## Compact measurement controls

The large measurement window has been replaced by a compact toolbar:

- **Distance / Area** mode
- concise live measurement readout
- **Undo**
- **Done**
- **More** (contains `Use measured area for site plan` and `Clear points`)
- **Close**

The old separate `Drop point` button is removed because point placement is now handled directly by tapping the cursor.

## Reference interaction

The interaction is based on the simple crosshair/pin workflow documented for Measure Map Pro: move the crosshair, place pins, retain intermediate segment measurements, and keep secondary operations out of the primary measurement gesture.

## Versioning / PWA

- Application version: **2.7.10**
- Service-worker cache key bumped to force the updated measurement code/CSS to replace the previous installed shell.
- PWA icon badge updated to **v2.7.10**.
