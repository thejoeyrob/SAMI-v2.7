# SAMI v2.7.11 — Measurement Touch Fix

Scoped correction based on the exact v2.7.10 repository source.

## Root cause
The measurement reticle used PointerEvent capture on a button layered over a Leaflet map while the viewport also owned touch/rotation handlers. On iOS this can cancel or re-route the pointer stream. Cursor movement was also coupled to Leaflet live-overlay redraw work.

## Changes
- Touch devices now use native `touchstart` / `touchmove` / `touchend` tracking for the measurement reticle.
- Touch movement is prevented from bubbling into Leaflet or map-bearing handlers while the reticle is being dragged.
- Mouse / pen retain the PointerEvent path.
- The reticle position updates immediately; live measurement geometry is refreshed separately on animation frames.
- PWA cache identifiers and asset query versions were bumped to v2.7.11 so installed copies request the corrected files.
- No Trakway, OHL/services, drawing, export or cinematic logic was intentionally altered.
