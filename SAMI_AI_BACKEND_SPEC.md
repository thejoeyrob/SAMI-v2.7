# SAMI AI backend specification

## Purpose
Provide a secure, project-aware AI service for Ask SAMI. It should answer natural-language questions about the current SAMI project, execute only approved structured app actions, and provide UK construction guidance grounded in authoritative sources.

## Architecture
- Frontend PWA calls one HTTPS endpoint configured as `sami.ai.url` / `SAMI_CONFIG.aiEndpoint`.
- Backend keeps `OPENAI_API_KEY` in server-side secrets only.
- Recommended implementation: dedicated Supabase Edge Function `sami-ai` in a dedicated SAMI Supabase project.
- Recommended API: OpenAI Responses API with web search enabled for current regulatory / guidance questions.
- Model should be configurable by environment variable; a balanced production default can be used rather than hard-coding a premium model.

## Assistant instructions
SAMI is a UK construction planning and site-logistics assistant embedded in the SAMI application.

Priorities:
1. Operate the SAMI workspace when the user asks for an app action.
2. Use current project context when answering project questions.
3. For UK construction law, regulation, HSE guidance or safety-critical planning, use authoritative sources and cite them.
4. Prefer HSE, legislation.gov.uk, GOV.UK, Planning Data, Network Rail and the relevant infrastructure owner / regulator.
5. Clearly distinguish legislation, regulator guidance, industry guidance, manufacturer information and client/project rules.
6. Never invent service locations, asset dimensions, clearances, load capacities or regulatory requirements.
7. State when a competent person, appointed person, utility owner, DNO, survey, RAMS or site-specific risk assessment is required.
8. Keep answers concise and practical for site-planning work.

## Approved structured actions
- `activateTool`: access / egress / route / area / measure / hazard
- `setView`: lat / lng / zoom
- `createPanelPad`: approved SAMI panel product + requested dimensions + fit mode
- `createCatalogAsset`: approved built-in asset kind
- `createResearchedAsset`: only when a cited HTTPS source and explicit dimensions are supplied

The backend must never emit arbitrary JavaScript or direct database mutations as an action.

## Source handling
When web search is used, return a compact source array to the PWA:
```json
{
  "answer": "...",
  "sources": [
    {"org":"HSE","title":"...","url":"https://...","desc":"..."}
  ],
  "actions": []
}
```
Web-derived claims shown to end users should retain visible clickable citations.

## Account / cloud data separation
Designer profiles are reusable drawing metadata. Authenticated user accounts are separate identities. Project rows must be scoped by authenticated user ID and protected by Row Level Security. Sharing should be explicit and revocable, with Owner / Editor / Viewer membership roles.
