---
id: SPEC-ENR-001
type: plan
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
tags: [enrichment, gene-set, subnetwork, INO, biosummary]
---

# SPEC-ENR-001: Implementation Plan -- Gene Set Enrichment

## Overview

Build a new Gene Set Enrichment feature that allows users to paste a gene list, discover all pairwise interactions among those genes, view INO type distributions, and explore associated drugs and diseases. This is a new feature requiring both a new API endpoint and a new frontend page.

## Implementation Phases

### Phase 1: Backend -- Enrichment Endpoint (Priority: High)

**Goal**: Create the `POST /api/v1/enrichment/analyze` endpoint with full subnetwork analysis.

**Tasks**:

1. **Create `api/routes/enrichment.py`**
   - Define `enrichment_bp` Blueprint
   - Implement `POST /enrichment/analyze` route
   - Gene symbol validation against `t_gene_info` (case-insensitive)
   - Pairwise interaction query with IN-clause chunking
   - Response structure with edges, stats, INO distribution, drug/disease associations
   - Complexity: High

2. **Implement pairwise query optimization**
   - For N genes, query: `WHERE geneSymbol1 IN (:genes) AND geneSymbol2 IN (:genes)`
   - Also query reversed direction to capture bidirectional pairs
   - Chunk gene lists > 100 into batches for the IN-clause
   - Aggregate by (gene1, gene2) using GROUP BY
   - Complexity: Medium

3. **Implement INO aggregation**
   - JOIN `ino_host25` on sentence_id for matching interactions
   - Aggregate matching_phrase counts across the subnetwork
   - Reuse INO classifier from SPEC-NET-001 if available, otherwise inline
   - Complexity: Medium

4. **Implement biosummary aggregation**
   - Collect all unique PMIDs from the subnetwork edges
   - Query `biosummary25_Host` WHERE pmid IN (:pmids)
   - Aggregate drug_term and hdo_term with counts
   - Sort by frequency, return top 50 each
   - Complexity: Medium

5. **Register Blueprint in main app**
   - Import and register `enrichment_bp` in the Flask app factory
   - Complexity: Low

6. **Add Redis caching**
   - Cache key: `ignet:enrichment:{sha256(sorted_genes)}`
   - TTL: 1 hour
   - Complexity: Low

**Files Modified**:
- `api/routes/enrichment.py` (new file)
- `api/app.py` or main app file (register blueprint)

**Dependencies**: Index on `t_sentence_hit_gene2gene_Host(geneSymbol1, geneSymbol2)` should exist or be verified

---

### Phase 2: Frontend -- Enrichment Page (Priority: High)

**Goal**: Create the Enrichment page with gene list input, validation display, and results.

**Tasks**:

1. **Create `frontend/src/pages/Enrichment.jsx`**
   - Gene list textarea with placeholder and delimiter detection
   - "Analyze" button with loading state
   - Gene validation display (recognized green, unrecognized red)
   - Complexity: Medium

2. **Implement results display**
   - Statistics cards row (total pairs, coverage %, sentences, PMIDs)
   - INO distribution bar chart using CSS width percentages
   - Drug tag cloud (font-size scaled by count)
   - Disease tag cloud (font-size scaled by count)
   - Complexity: Medium

3. **Implement subnetwork visualization**
   - "Visualize" button that passes edges to `NetworkGraph` component
   - Build Cytoscape elements from enrichment response
   - Show isolated genes as unconnected nodes
   - Complexity: Low (reuses existing component)

4. **Implement CSV export**
   - Client-side CSV generation from enrichment results
   - Include gene pairs, INO types, drug associations, disease associations
   - Complexity: Low

5. **Register route in `App.jsx`**
   - Add `/enrichment` route pointing to Enrichment component
   - Add navigation link in Header component
   - Complexity: Low

6. **Update `api.js`**
   - Add `enrichmentAnalyze()` method
   - Complexity: Low

**Files Modified**:
- `frontend/src/pages/Enrichment.jsx` (new file)
- `frontend/src/App.jsx` (add route)
- `frontend/src/components/Header.jsx` (add nav link)
- `frontend/src/api.js` (add API method)

**Dependencies**: Phase 1 API must be functional

---

### Phase 3: Polish and Edge Cases (Priority: Medium)

**Goal**: Handle edge cases, improve UX, and optimize performance.

**Tasks**:

1. **Gene list parsing edge cases**
   - Handle mixed delimiters (comma + newline)
   - Strip whitespace and empty entries
   - Deduplicate gene symbols
   - Show count of unique genes after parsing
   - Complexity: Low

2. **Empty state handling**
   - No interactions found: display informative message
   - No drug/disease associations: hide those sections gracefully
   - Complexity: Low

3. **Large gene list optimization**
   - Progress indicator for large lists (200+ genes)
   - Consider server-sent events or polling for very large analyses
   - Complexity: Medium (optional, can defer)

4. **Tag cloud interactivity**
   - Click on a drug/disease tag to show evidence sentences
   - Modal or expandable section with matching PMIDs and sentences
   - Complexity: Medium (can defer to follow-up SPEC)

**Files Modified**:
- `frontend/src/pages/Enrichment.jsx`
- `api/routes/enrichment.py`

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Pairwise query slow for 500 genes (124K pairs) | Medium | High | Use indexed IN-clause with chunking; pre-aggregate common gene sets; Redis caching |
| `biosummary25_Host` PMID lookup slow for large PMID sets | Medium | Medium | Chunk PMID IN-clauses; limit to top 1000 PMIDs by score |
| Gene symbol case mismatch | High | Low | Normalize to uppercase on both server and client |
| Duplicate gene pairs (A-B and B-A) | High | Low | Use LEAST/GREATEST ordering in GROUP BY |
| Very large response payload | Low | Medium | Limit edges to top 1000 by score; paginate if needed |

## Technical Approach

### Query Strategy for Pairwise Interactions

```sql
SELECT
  LEAST(geneSymbol1, geneSymbol2) AS gene1,
  GREATEST(geneSymbol1, geneSymbol2) AS gene2,
  COUNT(*) AS count,
  COUNT(DISTINCT PMID) AS unique_pmids,
  MAX(score) AS max_score
FROM t_sentence_hit_gene2gene_Host
WHERE geneSymbol1 IN (:genes) AND geneSymbol2 IN (:genes)
GROUP BY gene1, gene2
ORDER BY count DESC
```

This handles bidirectional pairs by using LEAST/GREATEST normalization.

### CSS-Only Bar Chart

Each bar is a `<div>` with:
- Width set to `${(count / maxCount) * 100}%`
- Background color by INO category
- Label text inside the bar

No chart library dependency required.

### Tag Cloud Sizing

Font size scaled logarithmically:
```
fontSize = 12 + Math.log2(count) * 4  // range: ~12px to ~32px
```

## File Change Summary

| File | Action | Description |
|------|--------|-------------|
| `api/routes/enrichment.py` | Create | Enrichment API endpoint |
| `api/app.py` (or equivalent) | Modify | Register enrichment blueprint |
| `frontend/src/pages/Enrichment.jsx` | Create | Enrichment page component |
| `frontend/src/App.jsx` | Modify | Add /enrichment route |
| `frontend/src/components/Header.jsx` | Modify | Add Enrichment nav link |
| `frontend/src/api.js` | Modify | Add enrichmentAnalyze method |
