---
id: SPEC-EXP-001
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
author: "MoAI"
priority: high
issue_number: 0
---

# SPEC-EXP-001: Publication-Ready Exports

## Environment

- **Platform**: Ignet 2.0 bioinformatics literature-mining platform
- **Frontend**: React 19 SPA (Vite, Tailwind CSS, Cytoscape.js)
- **Backend**: Flask REST API (port 9637)
- **Database**: MariaDB
- **Key Tables**:
  - `t_sentence_hit_gene2gene_Host` (~15.8M rows): geneSymbol1, geneSymbol2, PMID, sentenceID, score, hasVaccine
  - `t_gene_info` (~20K rows): GeneID, Symbol, description, tax_id
  - `ino_host25` (~7.3M rows): sentence_id, matching_phrase
  - `t_centrality_score_dignet` (~48K rows): genesymbol, score_type, score
  - `biosummary25_Host` (~500K rows): pmid, gene_symbols, drug_term, hdo_term
- **Existing Export Endpoints**:
  - `GET /api/v1/dignet/<query_id>/export/graphml` -- returns GraphML XML (functional)
- **Existing Frontend Downloads**:
  - GenePair page has a basic CSV download (gene1, gene2, PMID, sentence, score)
- **Cytoscape.js**: Already used for network visualization; has built-in `.png()` and `.svg()` export methods

## Assumptions

- GraphML export must be compatible with Cytoscape Desktop (version 3.x) import
- PNG/SVG export is entirely client-side using Cytoscape.js built-in methods (no server-side rendering)
- CSV exports extend existing download patterns rather than creating entirely new mechanisms
- PMID references should be formatted as clickable PubMed URLs in applicable export formats
- The existing GraphML endpoint produces valid XML but lacks INO metadata and centrality scores

## Requirements

### R1: Network Visualization Export Formats (Event-Driven)

**WHEN** user clicks "Export" on any network visualization (Dignet, NetworkSearch), **THEN** the system **SHALL** offer four export options: GraphML, CSV edge list, PNG image, and SVG image.

### R2: Gene Report Card Export (Event-Driven)

**WHEN** user clicks "Export" on a Gene report card page, **THEN** the system **SHALL** generate a downloadable CSV summary containing: gene symbol, description, aliases, centrality scores (degree, PageRank, closeness, betweenness), top interaction partners, and associated PMID count.

### R3: GenePair Export with BioBERT Scores (Event-Driven)

**WHEN** user exports from the GenePair page, **THEN** the system **SHALL** include BioBERT confidence scores and INO interaction types as additional columns in the CSV alongside gene symbols, PMID, and sentence text.

### R4: Graph Image Export with Labels (Event-Driven)

**WHEN** user exports a Cytoscape graph as PNG or SVG, **THEN** the system **SHALL** capture the current graph state including node labels, edge colors, layout positions, and any active highlighting.

### R5: PMID References in Exports (Ubiquitous)

The system **SHALL** include PMID references in all export formats: as `https://pubmed.ncbi.nlm.nih.gov/{PMID}` URLs in CSV/text, as node/edge attributes in GraphML.

### R6: Cytoscape Desktop Compatibility (State-Driven)

**IF** user imports the GraphML file into Cytoscape Desktop, **THEN** the system **SHALL** ensure the file loads without errors, with gene names as node labels and edge attributes (score, INO type, PMID count) visible in the attribute table.

### R7: Export Dropdown Menu (Event-Driven)

**WHEN** user clicks the "Export" button on any page with exportable data, **THEN** the system **SHALL** display a dropdown menu showing available export formats for that page context.

### R8: Large Export Handling (State-Driven)

**IF** the export dataset exceeds 10,000 rows, **THEN** the system **SHALL** display a progress indicator and generate the file asynchronously (for backend exports) or in chunks (for frontend CSV generation).

## Specifications

### Backend

#### S1: Enhance GET /api/v1/dignet/<query_id>/export/graphml

- Add INO interaction types as edge attributes (`ino_term`)
- Add centrality scores as node attributes (`degree_centrality`, `pagerank`, `closeness`, `betweenness`)
- Add `pmid_count` as an edge attribute (number of PMIDs supporting each interaction)
- Add `pmid_list` as an edge attribute (comma-separated PMID list, capped at 20)
- Ensure GraphML namespace and schema declarations are Cytoscape Desktop compatible
- Add GraphML `<key>` declarations for all custom attributes

#### S2: New GET /api/v1/genes/<symbol>/export/csv

- Generate a CSV file for the gene report card containing:
  - Gene Symbol, GeneID, Description, Tax ID
  - Centrality scores: degree, pagerank, closeness, betweenness
  - Top 20 interaction partners (by sentence count) with partner symbol and count
  - Total unique PMIDs, total sentences
- Response: `Content-Type: text/csv` with `Content-Disposition: attachment; filename=ignet-gene-{symbol}.csv`

#### S3: Enhance GET /api/v1/pairs/<sym1>/<sym2> CSV support

- Add `format=csv` query parameter
- When `format=csv`, return CSV with columns: Gene1, Gene2, PMID, PubMed_URL, Sentence, BioBERT_Score, INO_Type, HasVaccine
- Response: `Content-Type: text/csv` with appropriate filename

### Frontend

#### S4: Export Dropdown Component

- Create reusable `ExportDropdown` component accepting:
  - `formats`: array of available formats (e.g., ["graphml", "csv", "png", "svg"])
  - `onExport(format)`: callback function per format
- Render as a button with chevron icon that opens a dropdown list

#### S5: Cytoscape Image Export

- PNG export: Call `cy.png({ output: 'blob', bg: 'white', scale: 2, full: true })` for high-resolution
- SVG export: Call `cy.svg({ scale: 1, full: true, bg: 'white' })` and wrap in a downloadable blob
- Both capture current layout, labels, colors, and highlighting

#### S6: Page-Specific Export Integration

- **Dignet/NetworkSearch pages**: Export dropdown with GraphML, CSV edge list, PNG, SVG
  - GraphML: Link to `GET /api/v1/dignet/<id>/export/graphml`
  - CSV edge list: Frontend-generated from Cytoscape graph data
  - PNG/SVG: Cytoscape.js built-in export
- **Gene page**: Export dropdown with CSV
  - CSV: Link to `GET /api/v1/genes/<symbol>/export/csv`
- **GenePair page**: Export dropdown with CSV (enhanced with BioBERT + INO)
  - CSV: Link to existing pairs endpoint with `format=csv` parameter
  - Enhances existing `downloadCSV()` function

## Constraints

- PNG export resolution capped at 2x scale to prevent memory issues in browsers
- SVG export file size warning if graph has > 500 nodes
- GraphML must validate against the GraphML XML schema (http://graphml.graphdrawing.org/xmlns)
- CSV files must use UTF-8 encoding with BOM for Excel compatibility
- No external charting/rendering libraries for PNG/SVG (use Cytoscape.js built-in only)

## Traceability

- SPEC-EXP-001 > R1-R8 > S1-S6
- Depends on: SPEC-PPI-001 (BioBERT scores in GenePair exports)
- Related: SPEC-CMP-001 (comparison results should also be exportable via CSV)
