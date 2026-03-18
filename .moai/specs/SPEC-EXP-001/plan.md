---
id: SPEC-EXP-001
type: plan
version: "1.0.0"
status: draft
created: "2026-03-18"
---

# SPEC-EXP-001: Implementation Plan - Publication-Ready Exports

## Overview

Add comprehensive export capabilities across the platform: enhanced GraphML with metadata, gene report CSV, BioBERT-enriched GenePair CSV, and client-side Cytoscape image exports (PNG/SVG).

## Technical Approach

### Architecture

```
Export Dropdown (React, reusable component)
  |
  +-- GraphML: GET /api/v1/dignet/<id>/export/graphml (enhanced)
  |     |-- t_centrality_score_dignet (node attributes)
  |     +-- ino_host25 (edge attributes)
  |
  +-- Gene CSV: GET /api/v1/genes/<symbol>/export/csv (new)
  |     |-- t_gene_info (gene metadata)
  |     |-- t_centrality_score_dignet (centrality scores)
  |     +-- t_sentence_hit_gene2gene_Host (partner counts)
  |
  +-- Pair CSV: GET /api/v1/pairs/<s1>/<s2>?format=csv (enhanced)
  |     |-- Existing pair data + BioBERT scores + INO terms
  |
  +-- PNG/SVG: Cytoscape.js client-side export
        |-- cy.png() for raster
        +-- cy.svg() for vector
```

### Key Design Decisions

1. **Reusable ExportDropdown component**: A single React component used on all pages that support exports, configured with available formats per page context.
2. **Backend CSV generation**: Gene report and GenePair CSVs generated server-side to handle large datasets and ensure consistent formatting. CSV uses UTF-8 with BOM for Excel compatibility.
3. **Client-side image export**: PNG and SVG use Cytoscape.js built-in methods. No server-side rendering needed, which avoids headless browser dependencies.
4. **Enhanced GraphML**: Extend existing endpoint (not replace) by adding `<key>` attribute declarations for INO terms and centrality scores. Maintains backward compatibility.
5. **PubMed URL format**: All CSV exports include `https://pubmed.ncbi.nlm.nih.gov/{PMID}` as a dedicated column.

## Milestones

### Primary Goal: Backend Export Enhancements

**Files**: `api/routes/dignet.py`, `api/routes/genes.py`, `api/routes/pairs.py`

- **GraphML enhancement** (`dignet.py`):
  - Add `<key>` declarations for `ino_term`, `degree_centrality`, `pagerank`, `closeness`, `betweenness`, `pmid_count`, `pmid_list`
  - Join `t_centrality_score_dignet` to add node-level centrality attributes
  - Join `ino_host25` to add edge-level INO term attributes
  - Add `pmid_count` and `pmid_list` (top 20) as edge attributes
  - Validate output against GraphML schema

- **Gene CSV endpoint** (`genes.py`):
  - New `GET /api/v1/genes/<symbol>/export/csv`
  - Query `t_gene_info` for metadata, `t_centrality_score_dignet` for scores
  - Query top 20 interaction partners from `t_sentence_hit_gene2gene_Host` (GROUP BY partner, ORDER BY COUNT DESC)
  - Stream CSV response with proper headers

- **Pair CSV enhancement** (`pairs.py`):
  - Add `format=csv` query parameter check
  - When CSV format, return `text/csv` response with columns: Gene1, Gene2, PMID, PubMed_URL, Sentence, BioBERT_Score, INO_Type, HasVaccine
  - Pagination disabled for CSV export (return all matching rows, capped at 10,000)

### Secondary Goal: Frontend Export Components

**Files**: `frontend/src/components/ExportDropdown.jsx` (new), `frontend/src/pages/GenePair.jsx`, `frontend/src/pages/NetworkSearch.jsx`, `frontend/src/pages/Gene.jsx`, `frontend/src/pages/Explore.jsx`

- Create `ExportDropdown.jsx`:
  - Props: `formats` (array of {label, value, icon}), `onExport(format)`, `disabled`
  - Renders as a button with dropdown list
  - Includes loading state per format during export

- Integrate PNG/SVG export using Cytoscape.js:
  - Access `cy` instance ref from Cytoscape component
  - PNG: `cy.png({ output: 'blob', bg: 'white', scale: 2, full: true })`
  - SVG: `cy.svg({ scale: 1, full: true, bg: 'white' })`
  - Trigger browser download via `URL.createObjectURL(blob)`

- Wire up ExportDropdown on each page:
  - Dignet/NetworkSearch: GraphML + CSV edge list + PNG + SVG
  - Gene: CSV
  - GenePair: CSV (enhanced, replaces existing downloadCSV function)

### Final Goal: Polish and Compatibility

- Test GraphML import in Cytoscape Desktop 3.x
- Verify CSV opens correctly in Excel (UTF-8 BOM handling)
- Test PNG export at 2x scale for graphs with 100+ nodes
- Verify SVG export preserves all styles and labels
- Add file size warning for large SVG exports (>500 nodes)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| GraphML schema validation failure | Cytoscape Desktop import fails | Test with multiple Cytoscape Desktop versions; validate against XSD |
| Large CSV exports (10K+ rows) | Slow generation, browser timeout | Server-side streaming response; cap at 10K rows with warning |
| PNG memory issues for large graphs | Browser crash | Cap at 2x scale; warn for graphs > 500 nodes |
| Excel CSV encoding issues | Garbled characters | UTF-8 BOM prefix; test with Excel on Windows |

## Dependencies

- SPEC-PPI-001: BioBERT scores must be available for GenePair CSV export
- Existing GraphML endpoint in `api/routes/dignet.py` (lines ~319-394)
- Existing `downloadCSV()` function in `frontend/src/pages/GenePair.jsx`
- Cytoscape.js `.png()` and `.svg()` methods (already available in installed version)

## Files to Modify/Create

| File | Change Type |
|------|------------|
| `api/routes/dignet.py` | Enhance GraphML export with metadata |
| `api/routes/genes.py` | Add CSV export endpoint |
| `api/routes/pairs.py` | Add format=csv parameter support |
| `frontend/src/components/ExportDropdown.jsx` | **New file** |
| `frontend/src/pages/GenePair.jsx` | Replace downloadCSV, add ExportDropdown |
| `frontend/src/pages/NetworkSearch.jsx` | Add ExportDropdown with all formats |
| `frontend/src/pages/Gene.jsx` | Add ExportDropdown with CSV |
