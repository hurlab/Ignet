---
id: SPEC-CMP-001
type: acceptance
version: "1.0.0"
status: draft
created: "2026-03-18"
---

# SPEC-CMP-001: Acceptance Criteria - Comparative Network Analysis

## AC-1: Dual Query Execution

**Given** user enters "cancer AND TP53" in query A and "diabetes AND insulin" in query B
**When** user clicks "Compare"
**Then** both queries are executed and two network graphs are displayed side-by-side
**And** each graph panel shows the query label and gene/edge count

**Given** both queries are already cached in Redis
**When** user clicks "Compare"
**Then** results load within 3 seconds (no NCBI fetching needed)

## AC-2: Set Operations

**Given** network A contains genes {TP53, BRCA1, EGFR, MYC} and network B contains {TP53, EGFR, INS, GCK}
**When** comparison is computed
**Then** shared genes = {TP53, EGFR}
**And** unique to A = {BRCA1, MYC}
**And** unique to B = {INS, GCK}
**And** Jaccard index = 2/6 = 0.33

## AC-3: Venn Diagram

**Given** comparison results with overlap stats
**When** the Venn diagram renders
**Then** two overlapping circles are displayed, sized proportionally to gene counts
**And** intersection region shows the shared gene count
**And** non-overlapping regions show unique gene counts
**And** each circle is labeled with its query name

## AC-4: Cross-Network Highlighting

**Given** TP53 is a shared gene appearing in both networks
**When** user clicks TP53 in the shared genes table
**Then** the TP53 node is highlighted (yellow ring or pulse) in both Cytoscape graphs simultaneously
**And** the graphs auto-pan to center the highlighted node if it is off-screen

**Given** user clicks a gene unique to network A
**When** the click is processed
**Then** only the network A graph highlights the gene (no action on network B)

## AC-5: CSV Export

**Given** comparison results are displayed
**When** user clicks "Export CSV"
**Then** a CSV file is downloaded with the filename pattern `ignet-compare-{queryA_short}-vs-{queryB_short}.csv`
**And** the CSV contains three sections with headers: "Shared Genes", "Unique to Query A", "Unique to Query B"
**And** each gene row includes: Symbol, Description, Degree Centrality, PageRank Centrality

## AC-6: Cache Reuse

**Given** query A "cancer AND TP53" was previously searched on the Dignet page and cached
**When** user enters the same query in the Compare page
**Then** the cached result is reused without re-querying PubMed
**And** only query B triggers a fresh search if uncached

## AC-7: Overlap Statistics

**Given** both networks are loaded
**When** the statistics panel renders
**Then** the following metrics are displayed:
- Network A: N genes, M edges
- Network B: N genes, M edges
- Shared genes: N (XX% Jaccard index)
- Shared edges: N
- Total unique genes: N

## AC-8: Input Validation

**Given** user enters the same query in both fields
**When** user clicks "Compare"
**Then** the system displays: "Please enter two different queries to compare"
**And** no API request is made

**Given** one or both query fields are empty
**When** user clicks "Compare"
**Then** the system displays: "Both queries are required"
**And** no API request is made

## AC-9: Edge Cases

**Given** query A returns results but query B returns zero genes
**When** comparison is computed
**Then** shared genes list is empty
**And** Venn diagram shows one full circle and one empty circle
**And** message: "Query B returned no gene interactions"

**Given** both queries return identical gene sets
**When** comparison is computed
**Then** Jaccard index = 1.0
**And** unique lists are empty
**And** Venn diagram shows fully overlapping circles

## Quality Gates

- [ ] Compare endpoint returns within 5 seconds when both queries are cached
- [ ] Venn diagram renders correctly for overlap percentages 0%, 25%, 50%, 75%, 100%
- [ ] Both Cytoscape graphs can be independently panned and zoomed
- [ ] CSV export includes all three gene lists with correct headers
- [ ] Navigation: Compare page accessible from header and from Dignet results

## Definition of Done

- Backend: Compare endpoint functional, reusing Dignet search pipeline and Redis cache
- Frontend: Compare page with dual graphs, Venn diagram, gene tables, CSV export
- Cross-network highlighting works for shared genes
- Input validation prevents duplicate or empty queries
- Responsive layout degrades gracefully on mobile (stacked graphs)
