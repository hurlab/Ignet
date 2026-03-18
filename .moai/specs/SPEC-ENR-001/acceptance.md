---
id: SPEC-ENR-001
type: acceptance
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
tags: [enrichment, gene-set, subnetwork, INO, biosummary]
---

# SPEC-ENR-001: Acceptance Criteria -- Gene Set Enrichment

## AC-1: Gene List Input and Validation

### Scenario 1.1: Valid gene list parsed correctly

**Given** user pastes the text "TNF, IL6, IFNG, TP53, BRCA1"
**When** the system parses the input
**Then** 5 unique gene symbols are extracted
**And** each is validated against `t_gene_info`
**And** recognized genes are displayed with green badges
**And** unrecognized genes (if any) are displayed with red badges

### Scenario 1.2: Mixed delimiters handled

**Given** user pastes "TNF\nIL6, IFNG\tTP53 BRCA1"
**When** the system parses the input
**Then** 5 unique gene symbols are correctly extracted regardless of delimiter type

### Scenario 1.3: Duplicate genes deduplicated

**Given** user pastes "TNF, IL6, TNF, tnf, IL6"
**When** the system parses the input
**Then** 2 unique gene symbols are identified (TNF, IL6)
**And** the count displays "2 unique genes"

### Scenario 1.4: Gene list exceeds 500 limit

**Given** user submits a list containing 501 genes
**When** the analysis is requested
**Then** the system returns a 400 error with message "Gene list exceeds maximum of 500 genes"
**And** no database query is executed

### Scenario 1.5: Empty input rejected

**Given** user submits an empty textarea
**When** the "Analyze" button is clicked
**Then** the button remains disabled or the system shows "Please enter at least one gene symbol"

---

## AC-2: Subnetwork Construction

### Scenario 2.1: Pairwise interactions found

**Given** user submits ["TNF", "IL6", "IFNG"] (genes known to interact)
**When** the enrichment analysis completes
**Then** the response contains edges for all pairs found in `t_sentence_hit_gene2gene_Host`
**And** each edge includes count, unique_pmids, and max_score

### Scenario 2.2: Bidirectional pairs merged

**Given** gene pair (TNF, IL6) exists as both (geneSymbol1=TNF, geneSymbol2=IL6) and (geneSymbol1=IL6, geneSymbol2=TNF)
**When** the subnetwork is built
**Then** these are merged into a single edge with combined counts

### Scenario 2.3: No interactions found

**Given** user submits genes that have no pairwise interactions in the database
**When** the enrichment analysis completes
**Then** the response contains an empty edges array
**And** stats show total_pairs=0 and coverage_pct=0
**And** the UI displays "No interactions found among these genes"

---

## AC-3: Interaction Statistics

### Scenario 3.1: Statistics displayed correctly

**Given** an enrichment analysis with 10 input genes, 15 pair interactions, 450 sentences, and 120 PMIDs
**When** the results render
**Then** statistics cards display:
  - "15 Interaction Pairs"
  - "80% Coverage" (8 of 10 genes have at least one interaction)
  - "450 Evidence Sentences"
  - "120 Unique PMIDs"

### Scenario 3.2: Coverage calculation

**Given** 20 input genes where 12 appear in at least one interaction edge
**When** coverage is calculated
**Then** coverage_pct = 60.0 (12/20 * 100)

---

## AC-4: INO Interaction Type Distribution

### Scenario 4.1: INO distribution displayed as bar chart

**Given** an enrichment result with INO data
**When** the results render
**Then** a horizontal bar chart displays the top INO interaction types sorted by count
**And** each bar width is proportional to its count relative to the maximum
**And** bars are labeled with the INO type name and count

### Scenario 4.2: No INO data available

**Given** an enrichment result where no sentence IDs match `ino_host25`
**When** the results render
**Then** the INO section displays "No interaction type data available"

---

## AC-5: Associated Drugs and Diseases

### Scenario 5.1: Drug tag cloud displayed

**Given** an enrichment result with drug associations from `biosummary25_Host`
**When** the results render
**Then** drug terms are displayed as a tag cloud
**And** tag size scales with frequency (more frequent = larger)
**And** the top 50 drug terms are shown

### Scenario 5.2: Disease tag cloud displayed

**Given** an enrichment result with disease (HDO) associations
**When** the results render
**Then** HDO terms are displayed as a tag cloud
**And** tag size scales with frequency

### Scenario 5.3: Clicking a tag shows evidence

**Given** user clicks a drug or disease tag
**When** the click event fires
**Then** an expanded section or modal displays the evidence sentences and PMIDs associated with that term
(Note: this may be deferred to a follow-up iteration)

### Scenario 5.4: No drug/disease associations

**Given** an enrichment result where no PMIDs match `biosummary25_Host`
**When** the results render
**Then** the drug and disease sections are hidden with no error

---

## AC-6: Subnetwork Visualization

### Scenario 6.1: Graph renders on button click

**Given** an enrichment analysis with interaction results
**When** user clicks "Visualize"
**Then** a Cytoscape.js graph renders showing:
  - Nodes for all input genes
  - Edges for discovered interactions
  - Isolated genes as unconnected nodes (dimmed styling)

### Scenario 6.2: Edge width reflects evidence

**Given** a rendered subnetwork
**When** edges have varying evidence counts
**Then** edge width scales proportionally (min 1px, max 6px)

### Scenario 6.3: Empty subnetwork

**Given** an enrichment analysis with no interactions
**When** user clicks "Visualize"
**Then** only isolated nodes are displayed with a message "No interactions found"

---

## AC-7: CSV Export

### Scenario 7.1: CSV contains complete results

**Given** an enrichment analysis with results
**When** user clicks "Export CSV"
**Then** a CSV file downloads containing:
  - Section 1: Gene pairs with count, PMIDs, max score
  - Section 2: INO type distribution
  - Section 3: Top drug associations
  - Section 4: Top disease associations

### Scenario 7.2: Filename includes context

**Given** user exports CSV
**When** the file downloads
**Then** the filename is `ignet-enrichment-{gene_count}genes-{timestamp}.csv`

---

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Single gene submitted | Return no edges; show gene info only; coverage = 0% |
| Two genes with no interaction | Return empty edges; coverage = 0% |
| Gene symbol with special characters | Strip non-alphanumeric; validate against t_gene_info |
| Very common genes (e.g., TP53 with thousands of interactions) | Return all pairs within the input set only; response may be large but bounded by gene count |
| Gene not in t_gene_info but present in interaction table | Mark as "unrecognized" but still include in interaction query |
| biosummary25_Host returns thousands of drug terms | Limit to top 50 by frequency |

## Performance Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| API response time (50 genes) | < 3 seconds | Server-side timing |
| API response time (500 genes) | < 15 seconds | Server-side timing |
| Frontend render time (results) | < 1 second | Browser profiling |
| Gene validation time | < 500ms | Server-side timing |

## Definition of Done

- [ ] Backend: `POST /api/v1/enrichment/analyze` endpoint functional
- [ ] Backend: Gene symbol validation against `t_gene_info` works case-insensitively
- [ ] Backend: Pairwise interaction query handles bidirectional pairs
- [ ] Backend: INO aggregation from `ino_host25` returns type distribution
- [ ] Backend: Drug and disease extraction from `biosummary25_Host` works
- [ ] Backend: 500-gene limit enforced with proper error response
- [ ] Backend: Redis caching implemented
- [ ] Frontend: Enrichment page with gene list textarea
- [ ] Frontend: Validation display (recognized/unrecognized badges)
- [ ] Frontend: Statistics cards render correctly
- [ ] Frontend: INO distribution bar chart renders (CSS-only)
- [ ] Frontend: Drug and disease tag clouds render
- [ ] Frontend: Subnetwork visualization via Cytoscape
- [ ] Frontend: CSV export works
- [ ] Frontend: Route registered and navigation link added
- [ ] Performance: 50-gene analysis completes within 3 seconds
