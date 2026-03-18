---
id: SPEC-CMP-001
type: plan
version: "1.0.0"
status: draft
created: "2026-03-18"
---

# SPEC-CMP-001: Implementation Plan - Comparative Network Analysis

## Overview

Add a Compare feature that runs two independent PubMed/Dignet queries and presents their gene networks side-by-side with overlap analysis, Venn diagram, and CSV export.

## Technical Approach

### Architecture

```
Compare Page (React)
  |
  +-- POST /api/v1/dignet/compare
  |     |-- Runs query_a through existing Dignet pipeline (with Redis cache)
  |     |-- Runs query_b through existing Dignet pipeline (with Redis cache)
  |     |-- Computes set operations on gene lists
  |     |-- Enriches with t_gene_info descriptions
  |     +-- Enriches with t_centrality_score_dignet scores
  |
  +-- GET /api/v1/dignet/<query_id> (x2, for full graph data)
        |-- Fetches Cytoscape.js graph for each network
        +-- Rendered in two independent Cytoscape instances
```

### Key Design Decisions

1. **Reuse existing Dignet pipeline**: The compare endpoint calls the same internal functions as `POST /api/v1/dignet/search`, avoiding code duplication. Both queries benefit from existing Redis caching.
2. **Two-phase loading**: Phase 1 runs the compare endpoint for overlap stats; Phase 2 fetches full graph data for Cytoscape rendering via existing `GET /api/v1/dignet/<id>` endpoints.
3. **SVG Venn diagram**: Simple two-circle SVG with calculated overlap area. No external charting library needed (keeps bundle size small).
4. **Cytoscape.js dual instance**: Two independent `cytoscape()` instances share a stylesheet but have separate containers, enabling independent pan/zoom.

## Milestones

### Primary Goal: Backend Compare Endpoint

**Files**: `api/routes/dignet.py`

- Extract the core Dignet search logic into a reusable internal function (if not already factored)
- Implement `POST /api/v1/dignet/compare` endpoint
- Validate input (non-empty, distinct queries)
- Execute both queries (sequentially to respect NCBI rate limits, or in parallel if cached)
- Compute gene set intersection, difference, and edge overlap
- Enrich shared/unique gene lists with descriptions and centrality scores
- Compute Jaccard index and overlap statistics
- Return structured comparison response

### Secondary Goal: Frontend Compare Page

**Files**: `frontend/src/pages/Compare.jsx` (new), `frontend/src/App.jsx`, `frontend/src/api.js`, `frontend/src/components/Header.jsx`

- Create `Compare.jsx` page component with:
  - Two search input fields with autocomplete (reuse gene/query autocomplete patterns)
  - "Compare" button triggering the compare API
  - Loading states for both queries
- Add two Cytoscape.js graph containers (side-by-side, responsive)
- Implement SVG Venn diagram component with dynamic circle sizing based on gene counts
- Build three data tables (Shared, Unique-A, Unique-B) with sorting
- Implement cross-network gene highlighting (click shared gene -> highlight in both graphs)
- Add CSV export function for comparison results
- Add route in `App.jsx` and navigation link in `Header.jsx`

### Final Goal: Polish and Edge Cases

- Handle queries that return zero results
- Handle queries with 100% overlap (identical gene sets from different PMIDs)
- Handle queries with 0% overlap
- Add "Compare with..." action from existing Dignet search results
- Responsive layout for smaller screens (stack graphs vertically)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Both queries uncached -> slow NCBI fetching | 10-30s wait | Show progress per query; sequential NCBI calls respecting rate limits |
| Very large networks (500+ genes each) | Slow set computation and rendering | Gene set operations are O(n) with sets; Cytoscape handles 500 nodes well |
| Cytoscape dual instance memory | High browser memory | Lazy-load second graph; limit nodes displayed to top-N by centrality |
| NCBI rate limiting (3 req/s) | Delayed responses | Existing sleep logic in Dignet; cached queries skip NCBI entirely |

## Dependencies

- Existing Dignet search pipeline (`api/routes/dignet.py`)
- Redis for query caching
- `t_gene_info` for gene descriptions
- `t_centrality_score_dignet` for centrality scores
- Cytoscape.js (already used in Explore/NetworkSearch pages)

## Files to Modify/Create

| File | Change Type |
|------|------------|
| `api/routes/dignet.py` | Add compare endpoint; refactor internal search function |
| `frontend/src/pages/Compare.jsx` | **New file** |
| `frontend/src/App.jsx` | Add route for /compare |
| `frontend/src/api.js` | Add compareNetworks() method |
| `frontend/src/components/Header.jsx` | Add Compare nav link |
| `frontend/src/components/VennDiagram.jsx` | **New file** (SVG component) |
