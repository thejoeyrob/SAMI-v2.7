# SAMI v2.7.10 — QA

## Passed static checks

- All JavaScript files pass `node --check`.
- `manifest.webmanifest` parses as valid JSON.
- PWA remains root-flat; no build subdirectory is required.
- Service-worker shell still includes the application workspace and icon assets.
- Version/cache references updated to 2.7.10 / `v=2710`.
- Measurement code retains both line and area commit paths and the existing `Use measured area for site plan` path.
- Existing v2.7.9 source was used as the baseline; changes are scoped to measurement interaction/UI, app version/cache metadata, icon badge, and these release notes.

## Interaction checks represented in code

- Cursor drag uses pointer capture and one animation-frame update queue.
- Map drag is disabled only for the active cursor drag and restored on pointer up/cancel.
- Two-finger input cancels the active cursor drag and suppresses the accidental map click.
- Cursor movement calls the lightweight live refresh path; committed measurement geometry is not rebuilt per pointer movement.
- Point add/undo/mode change invokes the full committed-geometry refresh path.
