---
id: SPEC-NET-001
type: plan
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
tags: [network, dignet, cytoscape, INO, centrality]
---

# SPEC-NET-001: Implementation Plan -- Context-Aware Network Builder

## Overview

Enhance the existing Dignet network visualization to display INO interaction types on edges, centrality-based node coloring, time-based filtering, vaccine toggle, and edge hover tooltips. This builds on the existing `dignet.py` API and `Dignet.jsx` / `NetworkGraph.jsx` frontend.

## Implementation Phases

### Phase 1: Backend -- INO Classification and Data Enrichment (Priority: High)

**Goal**: Enrich the `/api/v1/dignet/<query_id>` response with INO interaction data and centrality scores.

**Tasks**:

1. **Create `api/utils/ino_classifier.py`**
   - Define INO category mapping dictionary (positive_regulation, inhibition, binding, unknown)
   - Implement `classify_ino(matching_phrase: str) -> str` function
   - Implement `get_ino_summary(phrases: list[str]) -> dict` aggregation function
   - Complexity: Low

2. **Modify `_fetch_gene_pairs()` in `api/routes/dignet.py`**
   - Add LEFT JOIN to `ino_host25` on `sentence_id = sentenceID`
   - Retrieve `matching_phrase` per row
   - Aggregate INO types per (gene1, gene2) pair
   - Classify each phrase using `ino_classifier`
   - Return `ino_category`, `ino_count`, `evidence_count` per edge
   - Complexity: Medium (JOIN on 15.8M x 7.3M tables requires index verification)

3. **Add centrality data to node response in `network_graph()`**
   - Query `t_centrality_score_dignet` for all genes in the network
   - Pivot score_type (d/p/c/b) into a dict per gene
   - Attach centrality dict to each node's data
   - Complexity: Low

4. **Add filter parameters to `network_graph()`**
   - Parse `has_vaccine`, `year_min`, `year_max`, `include_ino` query params
   - Apply WHERE clauses to the gene pair query
   - Complexity: Low

**Files Modified**:
- `api/routes/dignet.py` (modify `_fetch_gene_pairs`, `network_graph`)
- `api/utils/ino_classifier.py` (new file)

**Dependencies**: Verify index on `ino_host25.sentence_id` and `t_centrality_score_dignet.genesymbol`

---

### Phase 2: Backend -- PMID-Year Mapping (Priority: Medium)

**Goal**: Enable year-based filtering of network edges.

**Tasks**:

1. **Create PMID-year reference approach**
   - Option A (recommended): Create `t_pmid_year` table and a one-time batch script to populate from NCBI eSummary
   - Option B (fallback): Use PMID range heuristics for approximate year estimation
   - Complexity: Medium (Option A requires batch NCBI API calls)

2. **Integrate year filter into `_fetch_gene_pairs()`**
   - JOIN or subquery against PMID-year data
   - Filter by `year_min` and `year_max` parameters
   - Complexity: Low

**Files Modified**:
- `api/routes/dignet.py`
- `scripts/populate_pmid_year.py` (new script, if Option A)

**Dependencies**: Phase 1 must be complete (filter params already added)

---

### Phase 3: Frontend -- Edge and Node Styling (Priority: High)

**Goal**: Visually represent INO types and centrality on the network graph.

**Tasks**:

1. **Update `NetworkGraph.jsx` stylesheet**
   - Add edge color mapping: `ino_category` to hex color
   - Add edge width scaling based on `evidence_count`
   - Add node color scale based on centrality (degree by default)
   - Add node size scale based on centrality
   - Complexity: Medium

2. **Update `buildElements()` in `Dignet.jsx`**
   - Pass INO category and evidence count into edge data
   - Pass centrality scores into node data
   - Calculate color/size scales from data ranges
   - Complexity: Low

3. **Update graph legend**
   - Replace current static legend with dynamic legend showing INO colors
   - Add centrality scale indicator
   - Complexity: Low

**Files Modified**:
- `frontend/src/components/NetworkGraph.jsx`
- `frontend/src/pages/Dignet.jsx`

**Dependencies**: Phase 1 API changes must be deployed

---

### Phase 4: Frontend -- Filters and Tooltips (Priority: High)

**Goal**: Add interactive filtering controls and edge tooltips.

**Tasks**:

1. **Add filter panel to `Dignet.jsx`**
   - Year range slider (two `<input type="range">` elements)
   - Vaccine-only toggle (`<input type="checkbox">` styled as switch)
   - Filter state management and API re-fetch on change
   - Complexity: Medium

2. **Implement edge hover tooltip**
   - Listen to Cytoscape `mouseover`/`mouseout` on edges
   - Render tooltip div with INO type, evidence count, top phrase
   - Position tooltip near cursor
   - Complexity: Medium

3. **Update `api.js`**
   - Add parameters to dignet API calls: `has_vaccine`, `year_min`, `year_max`
   - Complexity: Low

**Files Modified**:
- `frontend/src/pages/Dignet.jsx`
- `frontend/src/components/NetworkGraph.jsx`
- `frontend/src/api.js`

**Dependencies**: Phase 1 and Phase 3 must be complete

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| JOIN performance on ino_host25 (7.3M rows) | Medium | High | Verify index on sentence_id; use LIMIT + pagination; consider pre-aggregated materialized view |
| Missing INO data for some edges | High | Low | Default to "unknown" category with gray color |
| Missing centrality data for some nodes | Medium | Low | Default styling for unscored nodes |
| PMID-year batch script takes too long | Medium | Medium | Use PMID range heuristic as fallback; run batch script asynchronously |
| Cytoscape performance with many styled edges | Low | Medium | Limit visible edges to 500 (existing cap); aggregate edges by gene pair |

## Technical Approach

### Database Indexing Requirements

Before implementation, verify these indexes exist:
- `ino_host25(sentence_id)` -- required for the JOIN
- `t_centrality_score_dignet(genesymbol)` -- required for node enrichment
- `t_sentence_hit_gene2gene_Host(PMID)` -- already used by existing queries

### Caching Strategy

- Cache the INO classification mapping in memory (Python dict, loaded once at startup)
- Cache centrality scores per query_id in Redis (same TTL as existing cache: 24h)
- Do NOT cache filtered results (too many parameter combinations)

### API Response Backward Compatibility

The enhanced response extends the existing structure:
- Existing fields (`source`, `target`, `score`, `pmid`) remain unchanged
- New fields (`ino_category`, `ino_count`, `evidence_count`, `centrality`) are additive
- The `include_ino=false` parameter allows clients to skip INO enrichment

## File Change Summary

| File | Action | Description |
|------|--------|-------------|
| `api/utils/ino_classifier.py` | Create | INO phrase-to-category mapping |
| `api/routes/dignet.py` | Modify | Enhanced queries with INO + centrality |
| `scripts/populate_pmid_year.py` | Create | PMID-year batch population script |
| `frontend/src/pages/Dignet.jsx` | Modify | Filter panel, element building |
| `frontend/src/components/NetworkGraph.jsx` | Modify | Edge/node styling, tooltips |
| `frontend/src/api.js` | Modify | Add filter params to dignet calls |
