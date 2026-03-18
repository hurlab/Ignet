---
id: SPEC-GENE-001
type: plan
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
tags: [gene, report-card, centrality, INO, biosummary, AI-summary]
---

# SPEC-GENE-001: Implementation Plan -- Interactive Gene Report Card

## Overview

Redesign the Gene page from a simple search-and-table view into a comprehensive report card that aggregates gene metadata, centrality scores, interaction neighbors, INO type breakdown, drug/disease associations, a mini network visualization, and an AI summary button. Requires a new aggregation API endpoint and a complete frontend redesign of `Gene.jsx`.

## Implementation Phases

### Phase 1: Backend -- Gene Report Endpoint (Priority: High)

**Goal**: Create `GET /api/v1/genes/<symbol>/report` that aggregates data from 5 tables into a single response.

**Tasks**:

1. **Create report endpoint in `api/routes/genes.py`**
   - New route: `GET /genes/<symbol>/report`
   - Query `t_gene_info` for gene metadata
   - Query `t_centrality_score_dignet` for 4 centrality scores, pivot by score_type
   - Compute percentile for each score (COUNT of genes with lower score / total genes * 100)
   - Reuse existing neighbor query logic for top 20 neighbors
   - Complexity: Medium

2. **Add INO distribution query**
   - Query `t_sentence_hit_gene2gene_Host` for all sentence IDs involving this gene
   - JOIN `ino_host25` to get matching phrases
   - Aggregate phrase counts, classify into categories
   - Return top 20 INO types by count
   - Complexity: Medium (potential performance concern with large result sets)

3. **Add drug/disease associations query**
   - Collect distinct PMIDs from gene's interactions (limit to top 1000 by score)
   - Query `biosummary25_Host` WHERE pmid IN (:pmids)
   - Aggregate drug_term and hdo_term counts
   - Return top 30 each
   - Complexity: Medium

4. **Add Redis caching**
   - Cache key: `ignet:gene_report:{symbol_upper}`
   - TTL: 24 hours
   - Complexity: Low

**Files Modified**:
- `api/routes/genes.py` (add report endpoint)

**Dependencies**: Index on `t_centrality_score_dignet(genesymbol)` must exist

---

### Phase 2: Backend -- Evidence Sentences Endpoint (Priority: Medium)

**Goal**: Create an endpoint for drilling down into evidence sentences for specific drug/disease associations.

**Tasks**:

1. **Create evidence endpoint**
   - Route: `GET /api/v1/genes/<symbol>/evidence`
   - Query params: `entity` (drug/disease term), `entity_type` (drug/disease), `page`, `per_page`
   - JOIN `t_sentence_hit_gene2gene_Host` with `biosummary25_Host` on PMID
   - Filter by gene symbol and entity term
   - Return paginated sentences with PMID, gene pair, and sentence text
   - Complexity: Medium

**Files Modified**:
- `api/routes/genes.py` (add evidence endpoint)

**Dependencies**: Phase 1 must be complete for context

---

### Phase 3: Frontend -- Report Card Layout (Priority: High)

**Goal**: Redesign `Gene.jsx` into a comprehensive report card.

**Tasks**:

1. **Restructure `Gene.jsx` layout**
   - Keep search bar at top (preserve existing functionality)
   - After search, display report card layout instead of simple table
   - Call new `/genes/<symbol>/report` API endpoint
   - Implement loading skeleton while data fetches
   - Complexity: High

2. **Implement gene metadata header**
   - Hero section with gene symbol, description
   - Detail row: GeneID, type_of_gene, chromosome, tax_id, synonyms
   - Complexity: Low

3. **Implement centrality metric cards**
   - 4-card grid layout
   - Each card: label, raw score, percentile bar (CSS width), percentile text
   - Handle missing scores (show "N/A")
   - Complexity: Low

4. **Implement top neighbors list + mini network side-by-side**
   - Left: ranked list of top 20 neighbors (clickable to navigate)
   - Right: mini Cytoscape network (400x300px container)
   - Pass neighbor data to `NetworkGraph` component
   - Center node highlighted as the queried gene
   - Complexity: Medium

5. **Implement INO bar chart**
   - Horizontal CSS bars
   - Color by INO category (green/red/blue/gray per SPEC-NET-001)
   - Sort by count descending
   - Complexity: Low

6. **Implement drug/disease tag clouds**
   - Two side-by-side sections
   - Tags with logarithmic font scaling
   - Clickable tags (wire up to evidence endpoint in Phase 4)
   - Complexity: Medium

7. **Implement AI Summary section**
   - "Generate AI Summary" button
   - Call existing `api.summarize([symbol])`
   - Collapsible panel with loading spinner
   - Cache result in React state
   - Complexity: Low

**Files Modified**:
- `frontend/src/pages/Gene.jsx` (major rewrite)
- `frontend/src/api.js` (add geneReport, geneEvidence methods)

**Dependencies**: Phase 1 API must be deployed

---

### Phase 4: Frontend -- Evidence Drill-Down (Priority: Medium)

**Goal**: Enable clicking drug/disease tags to view evidence sentences.

**Tasks**:

1. **Implement evidence panel**
   - On tag click, fetch from `/genes/<symbol>/evidence?entity=X&entity_type=drug`
   - Display in expandable panel below tag cloud
   - Show sentences with highlighted gene symbols and PMID links
   - Paginate results
   - Complexity: Medium

2. **Add PubMed link integration**
   - Each PMID links to `https://pubmed.ncbi.nlm.nih.gov/{pmid}`
   - Complexity: Low

**Files Modified**:
- `frontend/src/pages/Gene.jsx`

**Dependencies**: Phase 2 and Phase 3 must be complete

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Report endpoint slow (5 table aggregation) | Medium | High | Cache aggressively in Redis (24h); parallelize DB queries within the endpoint using threading or sequential optimization |
| INO query for highly connected genes (e.g., TP53) returns huge result set | High | Medium | Limit to top 1000 sentences by score for INO aggregation; use LIMIT in subquery |
| BioSummarAI response time (5-10s) | High | Low | Already async with loading indicator; user-initiated only |
| Gene page rewrite breaks existing search flow | Medium | High | Preserve search bar and URL parameter handling exactly as-is; report card loads after search |
| Missing data for rare genes | High | Low | Each section handles null/empty gracefully; show "No data available" |

## Technical Approach

### Report Endpoint Query Strategy

Execute queries sequentially within a single database connection to minimize connection overhead:

1. Gene info: single row lookup by Symbol (indexed)
2. Centrality: 4 rows lookup by genesymbol (indexed)
3. Percentiles: pre-compute COUNT(*) per score_type at startup or cache
4. Top neighbors: reuse existing `gene_neighbors` logic internally
5. INO distribution: subquery on sentence IDs, then JOIN ino_host25
6. Drug/disease: collect PMIDs from neighbor edges, query biosummary25_Host

Total expected query time: 1-3 seconds for average genes, up to 5 seconds for highly connected genes.

### Frontend Architecture

The Gene report card is a single-page component with lazy-loaded sections:
1. Gene metadata + centrality: loaded immediately from report API
2. Neighbors + mini network: loaded immediately from report API
3. INO chart + tag clouds: loaded immediately from report API
4. AI Summary: loaded on-demand (user click)
5. Evidence sentences: loaded on-demand (tag click)

### CSS Bar Chart Implementation

```html
<div class="bar-container">
  <div class="bar-label">positive regulation</div>
  <div class="bar-track">
    <div class="bar-fill" style="width: 65%; background: #38A169;"></div>
  </div>
  <div class="bar-count">1,240</div>
</div>
```

No chart library needed. Pure Tailwind CSS utility classes.

## File Change Summary

| File | Action | Description |
|------|--------|-------------|
| `api/routes/genes.py` | Modify | Add /report and /evidence endpoints |
| `frontend/src/pages/Gene.jsx` | Major rewrite | Report card layout |
| `frontend/src/api.js` | Modify | Add geneReport, geneEvidence methods |
