# SAMI v2.7.13 — Clean Workspace + AI Readiness

## Project privacy / clean start
- Moved local project storage to a new v3 namespace.
- One-time cleanup removes the previous SAMI local project database and legacy recovery keys.
- Previous projects and designer profiles from earlier builds are not carried into the v2.7.13 workspace.
- New installations therefore start from a clean private local workspace.
- Dashboard wording now makes clear that local projects remain on the device unless deliberately exported.

## Profiles terminology
- Existing Profiles are now labelled **Designer profiles**.
- Designer profiles are reusable company / designer metadata and logos only.
- They are deliberately not represented as sign-in accounts or project-sharing identities.

## what3words
- The supplied what3words API key is configured as the build default.
- Existing direct 3-word-address to coordinate lookup now works without each user entering a key.
- Existing access-point reverse lookup can populate address and what3words from a placed entrance pin.
- A local Settings override remains available.
- Production deployment should restrict the key to the SAMI production domain / app in the what3words key settings.

## Ask SAMI / AI
- Fixed a connection bug: the AI URL saved in Voice & connected services is now actually used by Ask SAMI.
- Reordered Ask SAMI behaviour so deterministic app commands run first, then a connected AI handles natural questions, then local official-source fallback is used only when no AI service is configured.
- Expanded the payload sent to a connected SAMI AI service with current project context, item counts, panel catalogue, service types, current HGV profile and UK jurisdiction policy.
- Added a strict UK-construction profile: official sources first, distinguish law / guidance / project rules, no invented dimensions or service locations, source regulatory claims, and call out competent-person / site-specific verification where required.
- The UI now correctly describes the connection as **SAMI AI HTTPS endpoint**, rather than only an asset-design endpoint.
- OpenAI credentials are intentionally not embedded in the PWA. They must remain server-side.

## Voice
- Existing natural recorded SAMI voice behaviour is preserved.
- Voice remains a presentation layer over the same Ask SAMI request; connecting AI improves both typed and spoken question usefulness.

## Measurement
- v2.7.12 touch-release alignment fix is retained unchanged.

## Required cloud phase
For real user accounts, cross-device project save and project sharing, use a dedicated authenticated cloud workspace. The recommended SAMI design is:
1. Supabase Auth for account identity.
2. `profiles` for personal/company metadata.
3. `projects` with an owner ID.
4. `project_members` with Owner / Editor / Viewer roles.
5. `project_versions` for checkpoints and recovery.
6. Storage for project files, logos, photos and exports.
7. Row Level Security so users only see projects they own or have been invited to.
8. A Supabase Edge Function (or equivalent serverless backend) for the OpenAI Responses API so the API key never reaches the browser.

Do not reuse Designer profiles as authentication accounts.
