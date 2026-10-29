# Experiment-value overlay — independent plan

Status: proposed, pending independent review and root approval. No implementation is claimed.

## Goal and assumptions

Let a researcher import one small gene-level experiment table and view its measured values on existing Ignet networks, then inspect the underlying literature. Uploaded expression measurements must remain distinct from literature evidence, model scores, connectivity and biological interaction direction.

Assumptions: v1 is one contrast and human-style gene symbols; there is no automatic identifier/alias/species conversion. The current 500-gene analysis limit remains. Measurements are processed in the browser and transmitted only through an explicit user-controlled export; gene symbols are sent to existing Ignet analysis endpoints when the researcher requests analysis. The workspace feature owns persistence, schema versioning and restore. These decisions are proposed implementation boundaries, not validated user demand.

## Observed existing code

Source inspected read-only in `/home/juhur/PROJECTS/10_apps/Ignet` during this session:

- `frontend/src/GeneSetContext.jsx:6` caps sets at 500; `:74` saves `{name, genes, createdAt}`, without measurements.
- `frontend/src/pages/GeneSet.jsx:10` tokenizes every comma/tab/space token as a gene. Reusing it for a multicolumn table would import numbers as purported symbols. A separate experiment import is needed. FileReader and a 5 MB check already exist at `:47`.
- `frontend/src/pages/Enrichment.jsx:61` constructs graph nodes from returned interaction endpoints. A submitted gene without a displayed edge is absent from the graph; this does not establish invalid identity.
- `api/routes/enrichment.py:42` validates 2–500 symbols. `:96` canonicalizes pair orientation and separately returns evidence count, distinct PMID count and max score.
- `frontend/src/components/NetworkGraph.jsx:40` recolors nodes imperatively without relayout; `:99` sizes genes by connectivity and styles entity nodes separately. `:299` exposes graph props, clicks and `onCyReady`. CYJS export at `:421` can retain added data attributes; XGMML at `:432` enumerates attributes explicitly.
- `frontend/src/pages/Dignet.jsx:1144` provides default/function/INO/degree/species color choices.
- `api/utils.py:5` accepts 1–60 ASCII alphanumeric/dot/underscore/hyphen characters, trims and uppercases. This is format validation, not HGNC identity resolution.
- Existing pure color tests use Vitest. `frontend/vite.config.js:19` writes builds into tracked `dist-react`, so routine verification must not invoke a deploy-adjacent build accidentally.

## Smallest useful v1

1. Add a distinct “Import experiment values” panel to Gene Set Builder, with file/paste input and downloadable example.
2. Preview normalized rows, errors and counts before replacing the active dataset. Invalid import leaves the previous dataset unchanged.
3. Show active experiment name/count and clear/replace actions. “Analyze these genes” reuses existing Enrichment for 2–500 genes.
4. Add an explicit experimental color option on Enrichment and Dignet. Uploaded measurements must not silently override another color scheme.
5. Show signed values in node tooltip and an accessible table. Give counts for matched displayed genes and measurements “not in this displayed network,” rather than calling the latter unknown genes.
6. Export normalized TSV; connect the payload to workspace export/restore.

## Import and normalization contract

- UTF-8 CSV or TSV with a header; required `gene`, optional `log2FC`, optional `padj`, with at least one measurement column.
- Documented header aliases only: `symbol`/`gene_symbol`; `log2FoldChange`; `adjusted_p`/`adj_p`. Duplicate or ambiguous mappings reject.
- Handle BOM, CRLF, scientific notation and quoted fields. Use a bounded tested delimiter parser, not `split(',')` for CSV. No XLSX or new dependency is needed.
- Empty cells and declared missing tokens (`NA`, `N/A`, `NaN`) map consistently to null. Missing is never zero. Each row needs at least one nonmissing measurement.
- Require complete finite numeric parsing; reject numeric prefixes such as `1junk`. `log2FC` can be signed or zero. `padj` must lie within [0,1], including zero.
- Require valid symbols and report row-numbered errors. Normalize trim/case only; retain `inputSymbol`. Do not infer aliases, Entrez/Ensembl conversions or species.
- Collapse identical duplicate normalized rows with an explicit count. Reject conflicting duplicates; do not average, choose the minimum p-value, or silently take the last row.
- Reject >5 MB before file reading and >500 unique genes before committing. Do not truncate. Limit preview size and error count while providing total counts.
- Unmatched displayed nodes and invalid syntax are distinct states; graph absence does not determine identity validity.

## Shared model and interfaces

Proposed plain serializable payload:

```json
{
  "schema": "ignet-experiment-v1",
  "name": "treated-vs-control",
  "importedAt": "ISO timestamp",
  "rows": [
    { "gene": "TP53", "inputSymbol": "TP53", "log2FC": -1.2, "padj": 0.03 }
  ],
  "display": { "colorBy": "log2FC", "log2FCMax": 2 }
}
```

Use null for missing values consistently across parser, workspace validator and graph. Workspace owns `experiment` and `setExperiment`; do not introduce competing storage in GeneSetContext. Feature 1 owns validation of this embedded payload. Evidence review consumes values as experimental context, never proof of relation direction or model confidence.

Graph accepts an optional experiment payload plus explicit `colorScheme="experiment"`. Pure helpers: parse/validate experiment, build lookup, attach values and calculate colors. Apply only to gene nodes; do not mutate edges or change topology. Ensure measurements reach node data for CYJS and explicitly add allowed fields to XGMML if that format is in scope. Normalized TSV export should use safe text encoding and fixed numeric fields.

## Visual semantics

- v1 modifies gene fill only. Existing size remains connectivity; edge styles and evidence scores remain unchanged.
- Diverging blue–neutral–orange scale, zero-centered and symmetric. Expose the range (initially ±2) and clipping count; preserve original values.
- Missing uses a distinct neutral appearance and legend entry; measured zero remains distinguishable from missing.
- Show `padj` in table/tooltip; defer significance filtering and p-value node size. P-values are neither literature evidence strength nor gene activity.
- Entity/pathogen nodes retain type styling even if an uploaded label happens to match.
- Signed textual values and a legend convey direction without depending on color alone.
- Toggling overlay/settings preserves positions, viewport, selected evidence and handlers.

## Implementation ownership

- New `frontend/src/experimentData.js`: parsing, schema validation, normalization, lookup and export helpers.
- New `frontend/src/components/ExperimentImport.jsx`: UI, preview, actionable errors and replace/clear.
- New `frontend/src/__tests__/experimentData.test.js`.
- Extend `networkColors.js` and tests with pure diverging color helpers.
- Narrow changes to `NetworkGraph.jsx`: optional props, style/legend, tooltip/table, export attributes.
- Wire entry points in GeneSet, Enrichment and Dignet.
- Workspace feature owns persistence/restore and explicit save controls; evidence feature owns evidence selection/provenance. Avoid three overlapping state stores.
- No API schema, mining, persistent sentence-ID or production mutation is required.

## Acceptance criteria

1. Valid CSV/TSV examples produce exact signed/missing values; quoted fields, BOM/CRLF, scientific notation and padj zero work.
2. Nonfinite/partial numeric input, invalid padj, ambiguous headers, conflicting duplicates, oversized files and >500 unique genes reject atomically with useful row-numbered errors.
3. Identical duplicates report collapse; missing never becomes zero; gene formatting matches established API rules without claiming canonical HGNC mapping.
4. Pure color checks cover zero, symmetric limits, clipping, and missing/zero distinction.
5. Overlay changes neither edges nor scores/weights, does not add direction, and does not recolor entity nodes.
6. A mocked-API browser journey imports → analyzes → overlays → clicks an edge → opens evidence → clears overlay.
7. Browser network/analytics checks show no measurement values in API requests, query strings or telemetry. Analysis sends only gene symbols after explicit action.
8. Workspace roundtrip preserves experiment values/style through the same validator; malformed payload cannot partially mutate state.
9. Overlay toggles preserve positions and viewport.
10. Existing color helper tests and scoped lint pass; no incidental `dist-react` mutation.

## Risks, alternatives and deferrals

- Privacy: browser processing does not keep analyzed symbols private from the Ignet server. Explain the boundary clearly. Persistence must be explicit, handle storage failure and support deletion; never automatically retain the raw file.
- Performance: Enrichment may return a dense graph; no runtime capacity claim is established. Overlay should be O(rows + displayed nodes), use a lookup map and Cytoscape batch changes, and add no fetch. Measure actual render/API behavior during implementation.
- A dedicated Experiment route adds navigation/state work before validating value. Prefer the existing Gene Set → Enrichment flow first.
- Using adjusted p for size conflicts with connectivity and needs a special rule for zero; defer.
- Multi-contrast datasets, volcano plots, rank statistics, alias/species resolution, additional graph pruning and XLSX are later scopes.
- No biological activation/inhibition or differential-expression inference is derived from uploaded fold changes.

## Evidence and gaps

Evidence: targeted `rg` searches and numbered source reads in the primary tree above. This plan document was written in the isolated `research-workbench` worktree. No feature code was written, tests run, live API called, runtime performance measured, or deployment performed. Browser privacy behavior, Cytoscape state preservation and combined workspace interfaces remain implementation acceptance checks, not established claims.
