---
id: SPEC-GENE-001
type: acceptance
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
tags: [gene, report-card, centrality, INO, biosummary, AI-summary]
---

# SPEC-GENE-001: Acceptance Criteria -- Interactive Gene Report Card

## AC-1: Gene Metadata Display

### Scenario 1.1: Full gene metadata shown

**Given** user searches for gene "TNF"
**When** the report card loads
**Then** the header displays:
  - Symbol: "TNF"
  - Description: "tumor necrosis factor"
  - GeneID, type_of_gene, chromosome, tax_id, and Synonyms

### Scenario 1.2: Gene not found

**Given** user searches for a non-existent gene symbol "ZZZZZ"
**When** the API responds
**Then** the page displays "Gene not found" error message
**And** the search bar remains available for a new search

### Scenario 1.3: Gene metadata partially missing

**Given** a gene exists in `t_gene_info` but some fields are NULL
**When** the report card loads
**Then** NULL fields display "N/A" instead of empty space

---

## AC-2: Centrality Scores

### Scenario 2.1: All 4 centrality scores displayed

**Given** gene "TNF" has entries in `t_centrality_score_dignet` for score_types d, p, c, b
**When** the report card loads
**Then** 4 metric cards are displayed:
  - Degree Centrality with score and percentile bar
  - PageRank with score and percentile bar
  - Closeness Centrality with score and percentile bar
  - Betweenness Centrality with score and percentile bar

### Scenario 2.2: Percentile calculation correct

**Given** gene "TNF" has degree centrality score of 0.85 and ranks in the top 3% of all genes
**When** the centrality card renders
**Then** the percentile bar is filled to 97% width
**And** the text reads "Top 3%"

### Scenario 2.3: Gene without centrality data

**Given** a gene has no entries in `t_centrality_score_dignet`
**When** the report card loads
**Then** all 4 centrality cards display "No centrality data available"

---

## AC-3: Top 20 Neighbors

### Scenario 3.1: Neighbor list displayed

**Given** gene "TNF" has 100+ interaction partners
**When** the report card loads
**Then** the top 20 neighbors are listed by co-occurrence count (descending)
**And** each row shows: rank, neighbor symbol, co-occurrence count, unique PMIDs

### Scenario 3.2: Neighbor links navigate to report card

**Given** the neighbor list shows "IL6" at rank 1
**When** user clicks "IL6"
**Then** the page navigates to `/gene?q=IL6` and loads IL6's report card

### Scenario 3.3: Gene with no neighbors

**Given** a rare gene with no interaction partners
**When** the report card loads
**Then** the neighbors section shows "No interaction partners found"

---

## AC-4: INO Interaction Type Breakdown

### Scenario 4.1: Bar chart displays INO distribution

**Given** gene "TNF" has interaction sentences with INO annotations
**When** the report card loads
**Then** a horizontal bar chart shows the top INO interaction types
**And** bars are colored by category (green=positive, red=inhibition, blue=binding, gray=unknown)
**And** each bar is labeled with the type name and count

### Scenario 4.2: INO bars sorted by count

**Given** the INO distribution data
**When** the bar chart renders
**Then** bars are sorted from most frequent to least frequent (top to bottom)

### Scenario 4.3: No INO data

**Given** a gene with no INO annotations in `ino_host25`
**When** the report card loads
**Then** the INO section displays "No interaction type data available"

---

## AC-5: Drug and Disease Associations

### Scenario 5.1: Drug tag cloud displayed

**Given** gene "TNF" has associated drugs in `biosummary25_Host`
**When** the report card loads
**Then** drug terms are displayed as a tag cloud
**And** more frequent terms have larger font sizes
**And** at least the top 30 drugs are shown

### Scenario 5.2: Disease tag cloud displayed

**Given** gene "TNF" has associated diseases (HDO terms) in `biosummary25_Host`
**When** the report card loads
**Then** disease terms are displayed as a tag cloud
**And** more frequent terms have larger font sizes

### Scenario 5.3: Tag click shows evidence

**Given** user clicks on drug tag "infliximab"
**When** the evidence endpoint responds
**Then** an expandable panel shows the supporting sentences
**And** each sentence shows the PMID (linked to PubMed), gene pair, and sentence text

### Scenario 5.4: No drug/disease associations

**Given** a gene with no entries in `biosummary25_Host`
**When** the report card loads
**Then** the drug and disease sections are hidden cleanly

---

## AC-6: AI Summary

### Scenario 6.1: Summary generated on button click

**Given** user views the TNF report card
**When** user clicks "Generate AI Summary"
**Then** a loading spinner appears
**And** the BioSummarAI endpoint is called with ["TNF"]
**And** the generated summary is displayed in a collapsible panel

### Scenario 6.2: Summary cached in component state

**Given** user has already generated a summary for TNF
**When** the summary panel is collapsed and re-expanded
**Then** the cached summary is shown without re-calling the API

### Scenario 6.3: BioSummarAI unavailable

**Given** the BioSummarAI service is down or returns an error
**When** user clicks "Generate AI Summary"
**Then** an error message displays: "AI summary is temporarily unavailable. Please try again later."

---

## AC-7: Mini Network Visualization

### Scenario 7.1: Mini network renders

**Given** the report card loads with top 20 neighbors
**When** the mini network section renders
**Then** a Cytoscape.js graph displays in a 400x300px container
**And** the queried gene is the center node with highlighted styling
**And** all 20 neighbors are connected to the center node

### Scenario 7.2: Mini network node click navigates

**Given** the mini network is rendered
**When** user clicks on neighbor node "IL6"
**Then** the page navigates to `/gene?q=IL6`

### Scenario 7.3: Mini network does not scroll page

**Given** the mini network is rendered
**When** user pans or zooms the mini network
**Then** the main page does not scroll

---

## AC-8: Search Functionality Preserved

### Scenario 8.1: Search bar works as before

**Given** user is on the Gene page
**When** user types "BRCA1" and clicks Search
**Then** the BRCA1 report card loads (same UX flow as before, enhanced display)

### Scenario 8.2: URL parameter search works

**Given** user navigates to `/gene?q=TP53`
**When** the page loads
**Then** the TP53 report card auto-loads without manual search

### Scenario 8.3: Autocomplete still works

**Given** user types "IF" in the search box
**When** autocomplete suggestions appear
**Then** gene suggestions are shown (e.g., IFNG, IFNA1)
**And** clicking a suggestion loads that gene's report card

---

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Gene with >10,000 neighbors | Only top 20 shown in list; mini network shows top 20 only |
| Gene symbol case variation (tnf vs TNF) | Case-insensitive matching; normalize to uppercase |
| Gene in interactions but not in t_gene_info | Show interactions; gene metadata section shows partial info from symbol only |
| Centrality score_type missing one type | Show available scores; missing type shows "N/A" |
| Drug term contains special characters | HTML-escape in tag cloud; preserve original text |
| Very long gene description | Truncate with ellipsis; show full on hover |
| Multiple INO categories for same gene-neighbor pair | Show all categories in breakdown (not deduplicated) |

## Performance Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Report API response time (average gene) | < 3 seconds | Server-side timing |
| Report API response time (highly connected gene like TP53) | < 5 seconds | Server-side timing |
| Evidence endpoint response time | < 2 seconds | Server-side timing |
| Frontend render time (full report card) | < 1 second | Browser profiling |
| AI Summary generation time | < 15 seconds | End-to-end timing |
| Mini network render time | < 500ms | Browser profiling |

## Definition of Done

- [ ] Backend: `GET /api/v1/genes/<symbol>/report` returns aggregated data from 5 tables
- [ ] Backend: Centrality percentiles calculated correctly
- [ ] Backend: INO distribution aggregated from ino_host25
- [ ] Backend: Drug/disease associations extracted from biosummary25_Host
- [ ] Backend: `GET /api/v1/genes/<symbol>/evidence` endpoint functional
- [ ] Backend: Redis caching for report endpoint (24h TTL)
- [ ] Frontend: Gene page redesigned as report card layout
- [ ] Frontend: Centrality metric cards with percentile bars
- [ ] Frontend: Top 20 neighbors list with navigation links
- [ ] Frontend: INO bar chart renders correctly (CSS-only)
- [ ] Frontend: Drug and disease tag clouds render
- [ ] Frontend: Tag click shows evidence sentences
- [ ] Frontend: Mini network visualization works (400x300px)
- [ ] Frontend: AI Summary button calls BioSummarAI
- [ ] Frontend: Search bar and autocomplete preserved
- [ ] Frontend: URL parameter search preserved
- [ ] Performance: Report API < 3s for average genes
- [ ] All sections handle missing data gracefully
