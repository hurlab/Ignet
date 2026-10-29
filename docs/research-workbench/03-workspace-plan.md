# Workspace plan — independent feature 3 proposal

Status: proposed, pending independent review and root approval. Source inspection only; no feature implementation or test pass is claimed.

## Objective and minimum scope

Extend the existing GeneSet, Enrichment, Dignet and GenePair flows with a shared optional workspace context. A Workspace page manages local save/load and portable JSON import/export. Do not duplicate API analysis logic or replace existing gene-set storage.

The first useful release restores experimental input values, named analysis recipes, display choices and selected exact evidence excerpts. Network position restoration is optional and must not delay the core flow. Server accounts/share links, immutable full-database snapshots and collaboration are deferred.

## Verified existing integration points

- `frontend/src/GeneSetContext.jsx:4–25`: active genes and named saved sets use separate localStorage keys. `:74–83` stores only name, genes and createdAt. Existing cap is 500 (`:6`). Preserve these keys and behavior.
- `frontend/src/pages/Dignet.jsx:265–274` builds keyword query/filter URLs; `:279–315` holds richer input/category/color/cohort state. `:496–537` performs cohort analysis through existing APIs. Preserve that execution path.
- `frontend/src/components/NetworkGraph.jsx:299` accepts `onCyReady`; Dignet already consumes it at `:1158`. Cytoscape JSON export exists at `NetworkGraph.jsx:421–429`; graph layout is computed at `:317` and supplied at `:579`.
- `frontend/src/main.jsx:12–16` is the provider insertion point. Existing routes are in `frontend/src/App.jsx:50–63`.
- `api/routes/stats.py:47–63` derives coverage date/file number from a tracker and XML mtime; `:196–203` returns them. This is not an immutable database generation identifier.
- `frontend/src/App.jsx:35–38` sends pathname and query string to analytics. Keep experimental values and workspace payloads out of URLs.
- Existing Vitest/Playwright/ESLint are in `frontend/package.json`; no added dependency is necessary.

## Proposed exact shared context contract

Root owns cross-feature wiring and final names. Feature modules should consume one small contract rather than writing each other's page state:

```js
// Context state
{
  draft: WorkspaceV1,
  saved: WorkspaceV1[],
  persistence: { state: 'saved' | 'dirty' | 'error', savedAt: null, message: null }
}

// Context actions, all validated before replacement
setExperiment(experimentOrNull)
setRecipe(recipe)
setDisplay(display)
selectEvidence(evidenceSnapshot)
removeEvidence(selectionKey)
setGraphView(graphViewOrNull)
saveWorkspace(name)
saveWorkspaceCopy(name)
loadWorkspace(id)
importWorkspace(jsonText) // returns validated preview; no mutation yet
restoreWorkspace(validatedPreview)
exportWorkspace(idOrDraft)
deleteWorkspace(id)
clearWorkspaceData()
```

One reducer transition restores a validated workspace. Existing gene basket/saved sets are not overwritten; copying restored experiment genes into the basket is an explicit action. Page adapters hydrate their own inputs from the context, cancel/invalidate in-flight requests, and call existing analysis functions only when the user chooses Run with current data.

```js
// Portable document, constructed only from allowlisted fields
{
  format: 'ignet-workspace',
  version: 1,
  id: 'local-generated-id',
  name: '...',
  createdAt: 'ISO date',
  updatedAt: 'ISO date',
  recipe: {
    kind: 'experiment' | 'dignet' | 'pair',
    inputs: {}, // exact allowlisted fields per recipe kind
    filters: {},
    display: {}
  },
  experiment: null, // feature 1 normalized rows + mapping/units/duplicate policy
  selectedEvidence: [], // feature 2 exact excerpt snapshots and provenance
  graphView: null, // matching graph identity + finite node positions/pan/zoom
  capturedData: {
    observedAt: 'ISO date',
    dataLastUpdated: null,
    dataFileNumber: null
  }
}
```

Feature 1 owns experiment parsing/normalization. Feature 2 owns evidence snapshot identity and selection construction. Workspace validates both contracts, preserves exact text and serializes them; it must not introduce competing parsers or evidence IDs. Keys are local selection identities, never production sentence-ID allocation.

Evidence snapshots need exact captured text, PMID, canonical pair, nullable sentence ID/source metadata, score/model metadata when available, capture timestamp and loaded-page/filter scope. Unknown provenance remains unknown. No inference of abstract/body identity or causal relation is introduced.

## Page integration

1. Add `WorkspaceContext.jsx` within current providers; add pure `workspace.js` constructors/validation/storage helpers.
2. Add reusable `WorkspaceControls.jsx` and `/workspace` management page with Save, Load, Export, Import preview and Delete.
3. GeneSet/feature 1 records normalized experiment values into context; Enrichment reads optional measurements for the overlay while using its existing analysis entry point.
4. GenePair/feature 2 appends selected evidence excerpts; selection survives navigation and reload independently of current API pagination.
5. Dignet may save a bounded recipe for keywords, PMIDs or 2–5 cohorts; restore inputs first, execute only on explicit Run. Preserve its existing URL search behavior.
6. NetworkGraph optionally captures positions through `onCyReady` and receives a validated matching view. Use preset layout for valid restored positions; a mismatched graph gets a fresh layout and a clear message.

Do not create a second enrichment/search API workflow on the Workspace page. Initial delivery may support the experiment/evidence journey first and add all Dignet modes only if their adapters remain small.

## Recipe and snapshot honesty

- Recipe: input values and settings can be restored exactly.
- Selected evidence snapshot: captured excerpts and metadata can be reopened offline.
- Live analysis: rerunning queries current data, so results can change.

Record available data date/file number as observational metadata, never as proof of an immutable database revision. Do not call the result a fully reproducible historical network. Import/load must not silently rerun queries.

## Persistence, privacy and recovery

Use a new namespace such as `ignet_workspaces_v1`; leave `ignet_geneset`, `ignet_geneset_saved` and existing transfer keys unchanged. Persist one bounded library/draft envelope with one localStorage write. Validate and serialize completely before writing; commit state only after validation. On quota/denied-storage errors, retain the previous persisted document and show unsaved status plus an export action.

Use debounced draft persistence and explicit Save. Display the last successful save. A power cut may lose the most recent unsaved edits; local persistence is not a backup against disk failure or browser-data clearing. Portable JSON is the transfer/recovery mechanism.

Saving does not upload workspace contents. Running existing analyses still sends their required inputs to existing endpoints. Exported files intentionally contain the user's research data. Do not store tokens, BYOK keys, headers, arbitrary API responses, HTML, executable Cytoscape configuration or server paths. Do not place private payloads in URLs or analytics.

Detect cross-tab changes; when local draft is dirty, offer Reload or Save copy rather than silently applying external changes. Do not promise transactional multi-user collaboration.

## Validation and proposed bounds

Ratify these proposed limits alongside feature 1/2 contracts:

- Imported file and aggregate saved envelope: at most 2 MiB UTF-8 each; check file size before read. No silent eviction.
- Workspace name: 120 characters.
- Initial experiment rows: 500, aligned with current gene-set cap unless feature 1 explicitly justifies a separate larger input/display cap.
- Selected evidence: at most 200 excerpts, individual text at most 20,000 characters, still constrained by total byte limit.
- Optional graph positions: at most 1,000 nodes; finite coordinates/pan and bounded positive zoom; no entire Cytoscape object import.
- Dignet preserves its current 50,000 PMID per input and 2–5 cohort limits.
- Validate every enum/range, nullable measurement and adjusted-p semantics with feature 1. Reconstruct allowed fields; do not spread untrusted objects into state.
- Unsupported future versions are rejected clearly. Version migrations must be explicit, pure and tested; no speculative best-effort import.
- Invalid import leaves active workspace and named gene sets unchanged. Preview before replacement.

Graph identity must use typed node IDs and edge endpoints, not ordering-dependent edge IDs alone. Restore coordinates only for a matching network. Capture on Save or debounced graph events, not every render.

## Alternatives and delivery order

Browser storage plus portable JSON is the minimum useful v1. Full workspace URLs expose payloads and run into length/privacy limits. Account-backed sharing introduces auth, ownership, ACL, retention and migration work, so defer it. IndexedDB is a later option if measured payload needs exceed this bounded design.

Order: agree contracts → pure validation/storage tests → shared provider/Workspace controls → feature 1 and feature 2 adapters → restore/reload/import journey → optional graph view → bounded Dignet adapters.

## Acceptance and meaningful checks

1. Reload restores normalized experiment values, filters/display and exact selected Unicode evidence text.
2. Export/import round-trip retains semantic content; import preview performs no API request.
3. Invalid version, oversized bytes/collections, malformed values, unsafe fields/routes and corrupted stored JSON are handled before mutation.
4. Quota/storage-denial failures preserve the prior document, show an error and permit export.
5. Existing gene-set keys/content and current analysis/export workflows remain unchanged.
6. Restored recipes do not claim frozen result reproduction; captured excerpts are distinguished from newly fetched evidence.
7. Old network/API responses cannot overwrite restored workspace state.
8. Private measurements/excerpts never enter generated URLs or automatic analytics page paths.
9. Matching positions restore without competing auto-layout; mismatched identities generate fresh layout with a message.

Use pure Vitest tests for validation, storage failure/round-trip, future schema, malicious keys and Unicode. Use one API-mocked Playwright journey for edit → save → reload → export → import → explicit rerun, including stale-response protection. Run focused ESLint. No verification-only production build: Vite writes to tracked `dist-react` (`frontend/vite.config.js`).

## Gaps and risks

No browser-storage capacity measurement or runtime testing was performed in this planning pass. Existing source was read in the primary checkout; root reports the research-workbench tree uses the same baseline. Exact historical database generation is unavailable from the inspected stats response. Multi-tab handling is conflict detection, not atomic distributed editing. Full graph/result snapshots and server sharing remain explicit later scopes. No production, mining or staging changes are part of this feature.
