---
id: SPEC-EXP-001
type: acceptance
version: "1.0.0"
status: draft
created: "2026-03-18"
---

# SPEC-EXP-001: Acceptance Criteria - Publication-Ready Exports

## AC-1: Network Export Menu

**Given** user is on a Dignet or NetworkSearch page with a loaded graph
**When** user clicks the "Export" button
**Then** a dropdown menu appears with options: GraphML, CSV Edge List, PNG Image, SVG Image

**Given** no graph is loaded (e.g., no search performed)
**When** user views the page
**Then** the Export button is disabled or hidden

## AC-2: GraphML Export with Metadata

**Given** a Dignet query with ID 123 containing 30 genes and 45 edges
**When** user clicks "GraphML" in the export dropdown
**Then** a file `ignet_network_query123.graphml` is downloaded
**And** the file contains:
- `<key>` declarations for: `ino_term`, `degree_centrality`, `pagerank`, `closeness`, `betweenness`, `pmid_count`, `pmid_list`
- Each `<node>` has `<data>` elements for centrality scores
- Each `<edge>` has `<data>` elements for `ino_term`, `pmid_count`, and `pmid_list`

**Given** the downloaded GraphML file
**When** imported into Cytoscape Desktop 3.x
**Then** the file loads without errors
**And** the attribute table shows all custom attributes per node and edge

## AC-3: CSV Edge List Export

**Given** a loaded network graph
**When** user clicks "CSV Edge List"
**Then** a CSV file is downloaded with columns: Gene1, Gene2, Score, INO_Type, PMID_Count, PubMed_URLs
**And** PubMed_URLs are formatted as `https://pubmed.ncbi.nlm.nih.gov/{PMID}`

## AC-4: PNG Image Export

**Given** a Cytoscape graph is displayed with labels and colored edges
**When** user clicks "PNG Image"
**Then** a PNG file is downloaded at 2x resolution
**And** the image includes: all node labels, edge colors, current layout positions, white background
**And** any highlighted or selected nodes are visible in the image

## AC-5: SVG Image Export

**Given** a Cytoscape graph is displayed
**When** user clicks "SVG Image"
**Then** an SVG file is downloaded
**And** the SVG is a vector format that scales without pixelation
**And** all labels, colors, and layout positions are preserved

**Given** the graph has > 500 nodes
**When** user clicks "SVG Image"
**Then** a warning is displayed: "Large graph - SVG file may be large. Continue?"

## AC-6: Gene Report Card CSV

**Given** user is on the Gene page for TP53
**When** user clicks "Export CSV"
**Then** a file `ignet-gene-TP53.csv` is downloaded
**And** the CSV contains:
- Header row: Gene Symbol, GeneID, Description, Tax_ID, Degree_Centrality, PageRank, Closeness, Betweenness
- Gene metadata row with all centrality scores
- Section: "Top Interaction Partners"
- Top 20 partner rows: Partner_Symbol, Sentence_Count, PMID_Count

## AC-7: GenePair CSV with BioBERT and INO

**Given** user is on the GenePair page for TP53-BRCA1
**When** user clicks "Export CSV"
**Then** a CSV file is downloaded with columns: Gene1, Gene2, PMID, PubMed_URL, Sentence, BioBERT_Score, INO_Type, HasVaccine
**And** BioBERT_Score shows the numeric confidence (0.0-1.0) or empty if NULL
**And** INO_Type shows the matching phrase from ino_host25 or empty if none
**And** PubMed_URL is formatted as `https://pubmed.ncbi.nlm.nih.gov/{PMID}`

**Given** user views GenePair page
**When** the new Export button is present
**Then** the old standalone "Download CSV" button is removed (replaced by ExportDropdown)

## AC-8: PMID References in All Formats

**Given** any export format (GraphML, CSV, Gene CSV, Pair CSV)
**When** the file is generated
**Then** PMID references are included:
- CSV: Dedicated `PubMed_URL` column with full URL
- GraphML: `pmid_list` edge attribute with comma-separated PMIDs

## AC-9: Large Export Handling

**Given** a GenePair with 15,000 matching sentences
**When** user clicks "Export CSV"
**Then** the CSV is capped at 10,000 rows
**And** a note is appended: "Export limited to 10,000 rows. Apply filters to narrow results."

**Given** a network graph PNG export is in progress
**When** the export takes > 2 seconds
**Then** a loading spinner is shown until the download triggers

## AC-10: UTF-8 and Excel Compatibility

**Given** any exported CSV file
**When** opened in Microsoft Excel
**Then** all characters display correctly (including non-ASCII gene descriptions)
**And** the CSV uses UTF-8 encoding with BOM (byte order mark)

## Quality Gates

- [ ] GraphML validates against GraphML XSD schema
- [ ] GraphML imports successfully in Cytoscape Desktop 3.10+
- [ ] CSV files open correctly in Excel with proper encoding
- [ ] PNG exports at 2x scale for graphs up to 500 nodes without browser memory issues
- [ ] SVG exports preserve all visual styling
- [ ] Gene CSV includes all four centrality score types
- [ ] GenePair CSV includes BioBERT scores and INO types
- [ ] ExportDropdown component is reusable across all pages

## Definition of Done

- Backend: GraphML enhanced with INO + centrality attributes; Gene CSV endpoint functional; Pair CSV format parameter working
- Frontend: ExportDropdown component created and integrated on Dignet, Gene, and GenePair pages
- Image export: PNG and SVG working via Cytoscape.js built-in methods
- All exports include PMID references
- Old GenePair downloadCSV replaced by new ExportDropdown
- Cytoscape Desktop import tested and verified
