# SAMI — Proposed, not applied after v2.7.7

Ordered by practical value.

1. **Provider-approved offline basemap areas.** Use a contracted/self-hosted tile source that explicitly permits offline downloads, then add bounded area/zoom selection, byte/tile estimate, storage headroom, cancellation, expiry and deletion. Do not bulk-prefetch the current public OSM or standard Esri imagery endpoints.
2. **Production service gateway.** Put geocoding, HGV routing, Overpass and optional connected services behind controlled capacity/rate limits, identification and monitoring. A browser-only queue cannot enforce an application-wide public Nominatim quota across a fleet.
3. **Cold-start architecture.** Separate the synchronous document/studio/catalogue dependencies so large modules can genuinely load after first useful screen. Serve Brotli/gzip at the host. The current simulated cold result is above target.
4. **Device release qualification.** Run the supplied checklist on representative iPhone/iPad/Android/Windows devices, including OS-kill recovery and update from a populated v2.7.6 project.
5. **Full accessibility audit.** Extend automated/real assistive-tech checks to every modal, state, imported style and satellite overlay; test VoiceOver/TalkBack and 200% text/zoom.
6. **Large-project recovery journal.** Consider a lossless schema-tested IndexedDB write-ahead journal and external attachment storage. v2.7.7 deliberately keeps the existing schema/keys and warns when the localStorage recovery copy cannot be written.
7. **Cross-tab edit ownership and shell-cache pruning.** Prevent conflicting edits in two tabs and safely remove old release caches only when no matching client remains.
8. **Export/licensing and long PDF jobs.** Resolve location/provider-specific imagery credits and use a worker/fully cancellable renderer for very large PDFs. Validate drawing scale/geometry independently for operational use.
9. **Persistent precision scratch sessions.** Optionally restore uncommitted measurement points after restart via a backwards-compatible session extension.
10. **Deployment security headers.** Add server-level CSP including `frame-ancestors`, strict transport/security headers and deployment-specific endpoint allowlists; keep secrets out of portable projects.
11. **Media optimisation.** Only replace MP3s after AAC/Opus quality/iOS tests and regeneration of matching recorded lines. Do not desynchronise recorded wording and audio.
12. **Optional non-installed browser workspace.** Only if the owner explicitly changes the install-first product decision; v2.7.7 retains the gate and provides supported-browser handoff.
