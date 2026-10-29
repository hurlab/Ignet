# Research workbench: integration candidate

Status: bounded v1 implemented and locally verified after independent plan review, root approval and independent code review. See validation 06 for measured results and limits.
Baseline: Ignet a2d471c, isolated branch WT-research-workbench. Scope is features 1–3 requested by the operator. No mining, ingestion, production publication, deployment, or account-backed sharing.

## Goal and completion

A researcher can import validated experiment values, inspect an existing literature network with an explicit experimental overlay, review/select paper-grouped evidence, and explicitly save/export/import an analysis recipe with exact selected excerpts. Complete when bounded parser/storage/API tests and an API-mocked browser journey demonstrate these transitions without modifying legacy saved gene sets or submitting measurement values.

## Assumptions and product decisions

- Extend existing Gene Set, Enrichment, Dignet and GenePair flows; add one Workspaces management page. Avoid a second implementation of network analysis.
- One experiment, 2–500 genes for network analysis, UTF-8 CSV/TSV with explicit gene/log2FC/padj columns. File limit 2 MiB across import paths; cap accepted unique genes at 500. Missing values are null. Reject conflicting duplicate normalized symbols; collapse exact duplicates with a reported count.
- Values stay in browser memory until explicit Save or Export. Analysis submits gene symbols to the existing API, never experiment measurements. No payloads in URLs or analytics.
- Gene fill may encode log2FC on an explicit symmetric blue–neutral–orange scale. Degree remains size; literature remains edge weight. Missing is visually distinct from measured zero; padj remains numeric context. No causal or directional inference.
- Evidence review is limited to loaded API rows, 50 rows/page, 500 loaded base rows/pair, 100 selected excerpts across the workspace. Group by validated PMID, preserve exact text, union annotations, preserve observed score conflicts. Missing source/revision/model metadata remains unknown.
- Fix the existing endpoint's LIMIT-after-annotation-fanout prerequisite while preserving response envelope/scalars. Verify its deterministic base-row identity from schema evidence before use. No unrestricted paper metadata fetching.
- A workspace preserves a recipe and selected evidence snapshots, not an immutable database generation. Restoring must not run network requests. Re-analysis is explicit and may produce changed results.
- Browser-local library and JSON transfer, no server sharing. Schema version 1, strict allowlists, 2 MiB per file/library, 20 saved items, 100 excerpts, 20k text characters/excerpt subject to total cap. No silent eviction. Storage/import failure preserves previous active and saved state. No autosave of newly imported private data before explicit Save; draft autosave may be omitted in v1.
- Graph position restoration is optional for v1. If implemented, apply only for matching typed graph identity, preserve selection/viewport on overlay toggle, and prevent automatic layout from overwriting restored positions. Otherwise clearly describe workspace as recipe/settings/excerpts only.
- V1 workspace recipe supports Enrichment input genes + overlay/display settings and selected pair context; full Dignet keyword/cohort state adapters are deferred. Dignet can use the shared experiment overlay without claiming its entire query state is saved.

## Shared interface to ratify before implementation

Pure modules do not import React context:

- experimentData.js: parseExperimentTable(text), validateExperiment(value), experimentColor(value, range), helpers for decorating gene nodes and safe export. Normalized experiment: {schema:'ignet-experiment-v1',name,importedAt,rows:[{gene,inputSymbol,log2FC:null|finite,padj:null|number}]}.
- evidenceUtils.js: normalize/group rows, evidenceKey(snapshot), validateEvidenceSnapshot(value), safe CSV/JSON export. Snapshot: {schemaVersion:1,pair:[A,B],sentenceId:null|string,pmid:null|string,sentenceText:null|string,scores:[],inoAnnotations:[],origin:null,sourceRevision:null,modelVersion:null,fetchedAt}. Identity includes canonical pair, ID, PMID, exact text; same ID with different text never overwrites a selection.
- workspace.js: versioned validators/serialization/storage using the two pure payload validators; no imported arbitrary object spreads into state.
- WorkspaceContext.jsx/useWorkspace(): experiment/setExperiment, selectedEvidence/toggleEvidence/clearEvidence, recipe/setRecipe, restoreToken, save/load/export/import/delete + visible storage errors. Recipe {genes:[],colorScheme:'none'|'experiment',log2FCMax:2}; workspace owns no legacy GeneSet state. Exact export names may be adapted once documented consistently.
- Overlay controls keep selection/positions stable; explicit restoration updates inputs without silently submitting them. Stale responses from before restore or pair changes must be ignored.

## Implementation ownership

Feature 1 owner: experimentData.js, ExperimentImport.jsx, experiment tests, narrow NetworkGraph/Enrichment/Dignet/GeneSet integration.
Feature 2 owner: pairs.py + API tests, evidenceUtils.js + tests, EvidenceWorkbench.jsx, GenePair + api.js integration; popup scope wording if needed.
Feature 3 owner: workspace.js + tests, WorkspaceContext.jsx, Workspaces.jsx, WorkspaceControls.jsx. Root owns main.jsx/App.jsx/tools catalogue registration, cross-feature contract reconciliation and integration browser tests. Owners must coordinate before touching another owner's files.

## Verification

Baseline frontend Vitest: 5 files, 34 tests passed in this worktree. Add behavior tests for malformed/ambiguous imports, finite numeric bounds, duplicate conflicts, exact Unicode snapshots, safe CSV, schema/size/storage-failure atomicity, paging before annotation fanout and stale-response rejection. Browser journey uses mocked API and local Vite; never live production endpoints. Check overlay toggles preserve topology/viewport, reload requires explicit restore/run, and measurement payloads never leave the browser. Run scoped lint and API checks. Do not run the deploy-bound default build; if bundle verification is necessary, use an explicitly separate temporary outDir.

## Approval record

Pending independent reviewer verdict and root resolution. Operator explicitly delegated approval of the reviewed plans to root and authorized implementation after that approval. Public deployment and changes to existing SciMiner execution remain excluded.

## Authoritative overrides after independent review R1–R3

This section overrides alternative proposals in plans 01–03 and the provisional interface above. All implementation owners must use this contract. Explicit Save only; no autosave, no promise of unsaved draft recovery. Imports/library are 2 MiB, maximum 20 saves and 100 selected excerpts. Graph positions and full Dignet query/cohort restore are deferred; UI says inputs, overlay settings and selected excerpts. No unsaved experiment values are added to legacy GeneSet storage.

Normalized experiment is exactly `{schema:'ignet-experiment-v1',name,importedAt,rows:[{gene,inputSymbol,log2FC:null|finite,padj:null|number}]}`. Display settings exist only in `recipe.display`, never in the experiment payload. `validateExperiment(value)` and `validateEvidenceSnapshot(value)` return reconstructed trusted objects or throw; modules are context-free. Evidence identity is always recomputed from canonical pair/ID/PMID/exact text, never trusted from an imported key. `evidenceKey(snapshot)` returns JSON encoding of that tuple.

Recipe is exactly `{genes:[],pair:null|[A,B],display:{colorScheme:'none'|'experiment',log2FCMax:2}}`, with bounded, validated gene symbols and a positive finite range (0.01–100). Portable workspace is `{format:'ignet-workspace',version:1,id,name,createdAt,updatedAt,recipe,experiment,selectedEvidence}`. Unknown fields/versions are rejected; metadata not actually observed is not invented. IDs/names/timestamps are bounded and validated. Pure workspace module owns `validateWorkspace`, `parseWorkspace(text)`, `serializeWorkspace(value)` and bounded library load/write helpers.

`useWorkspace()` exposes `{experiment,selectedEvidence,recipe,restoreToken,savedWorkspaces,persistence,setExperiment,setRecipe,toggleEvidence,clearEvidence,saveWorkspace,loadWorkspace,restoreWorkspace,exportWorkspace,deleteWorkspace,clearWorkspace}`. `setRecipe(partial)` merges only known top-level fields and a supplied validated display object. `setExperiment` replaces only experiment + recipe gene inputs, preserving evidence. `toggleEvidence(snapshot)` validates/recomputes identity before add/remove; cap failures are visible. `saveWorkspace(name)` explicitly persists a copy of current draft, returns success boolean and exposes failures through persistence. `loadWorkspace(id)`/`restoreWorkspace(validatedPreview)` restore one validated draft atomically and increment `restoreToken`; they never perform network I/O or overwrite legacy gene sets. `exportWorkspace()` returns current validated draft JSON even after a save quota error. Saved exports can use pure serialization on the saved value. Invalid import preserves both draft and library. Save failure preserves edited draft for export and the prior persisted library. Reload lists saved workspaces without automatically running or restoring them. Deletion writes a new bounded library before committing its in-memory list; no silent eviction.

Restore navigation uses clean `/enrichment` or `/genepair` paths and context state, never `?genes=` or pair query parameters that auto-submit. Enrichment/GenePair adapters on restore hydrate inputs, clear old results and invalidate request generations without querying. Existing direct-link auto-run stays available on ordinary entry, but is suppressed for restored context. Explicit Run uses current data. Every analysis/pair/restore/unmount advances a request generation; only its current generation may set results/errors/loading, including Enrichment non-abortable fallback and GenePair prediction-refresh/trend paths. Experiment replacement invalidates any affected in-flight analysis. Browser acceptance includes a delayed old fallback resolving after restore and producing no state change.

API targets the recorded schema from migration `scripts/01_rename_tables.sql:21–30` and prior audit `live-allocator-schema.json` in the preserved pubmed-contract-audit tree: `t_gene_pairs.id` is BIGINT primary auto_increment, `t_sentences.sentence_id` primary. This is historical metadata read in this turn, not a fresh production query. Select the bounded `h` page ordered by requested column plus `h.id` before hydrating sentence text and INO annotations for those IDs. Preserve scalar fields and envelope, add full `ino_annotations`. Test route behavior on tied scores, reversed orientation, annotation fanout, null sentence IDs and empty pages. Deployment requires a later schema compatibility check.

Independent review disposition: R1–R3 incorporated here. Independent reviewer appended APPROVE for bounded implementation to review 04 after focused recheck. Root reviewed the findings, resolved all three requirements, and approves implementation of this bounded v1 under the operator's explicit delegation. Implementation starts only after this recorded approval. Runtime gates and independent code review remain required before completion; deployment is not authorized by this record.
