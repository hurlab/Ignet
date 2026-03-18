---
id: SPEC-CMP-001
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
author: "MoAI"
priority: high
issue_number: 0
---

# SPEC-CMP-001: Comparative Network Analysis

## Environment

- **Platform**: Ignet 2.0 bioinformatics literature-mining platform
- **Frontend**: React 19 SPA (Vite, Tailwind CSS, React Router, Cytoscape.js)
- **Backend**: Flask REST API (port 9637)
- **Database**: MariaDB
- **Cache**: Redis (used by existing Dignet search for query caching)
- **Key Tables**:
  - `t_sentence_hit_gene2gene_Host` (~15.8M rows): geneSymbol1, geneSymbol2, PMID, sentenceID, score
  - `t_gene_info` (~20K rows): GeneID, Symbol, description, tax_id
  - `t_centrality_score_dignet` (~48K rows): genesymbol, score_type (d/p/c/b), score
- **Existing Endpoints**:
  - `POST /api/v1/dignet/search` searches PubMed, retrieves PMIDs, fetches gene pairs from DB, returns Cytoscape.js graph
  - `GET /api/v1/dignet/<query_id>` retrieves cached graph for a query
  - Redis caching with 7-day TTL on Dignet queries

## Assumptions

- Both comparison queries use the same Dignet search pipeline (PubMed query -> PMIDs -> gene pairs -> graph)
- Redis caching for individual queries is reused; the comparison endpoint orchestrates two queries
- Gene overlap is computed on gene symbol strings (case-insensitive match after sanitization)
- Each query returns a graph with nodes (genes) and edges (interactions); comparison operates on these result sets
- Cytoscape.js can render two independent graph instances side-by-side in the browser

## Requirements

### R1: Dual Query Input (Event-Driven)

**WHEN** user navigates to the Compare page and enters two PubMed queries, **THEN** the system **SHALL** execute both queries and display the resulting networks side-by-side.

### R2: Set Operations Display (Event-Driven)

**WHEN** both networks are loaded, **THEN** the system **SHALL** compute and display: shared genes (intersection), unique genes per network (set difference), and differential edges.

### R3: Venn Diagram Visualization (Event-Driven)

**WHEN** comparison results are available, **THEN** the system **SHALL** display a Venn diagram showing gene overlap between the two networks.

### R4: Cross-Network Gene Highlighting (Event-Driven)

**WHEN** user clicks a shared gene in the comparison results, **THEN** the system **SHALL** highlight that gene node in both network visualizations simultaneously.

### R5: CSV Export of Comparison (Event-Driven)

**WHEN** user clicks "Export CSV", **THEN** the system **SHALL** generate a downloadable CSV file containing three sections: shared genes, genes unique to query A, and genes unique to query B, with gene symbol, description, and centrality scores.

### R6: Cache Reuse (State-Driven)

**IF** either query has been previously executed and cached in Redis, **THEN** the system **SHALL** reuse the cached result instead of re-querying PubMed and the database.

### R7: Comparison Statistics (Event-Driven)

**WHEN** comparison is complete, **THEN** the system **SHALL** display: total genes per network, overlap count, overlap percentage (Jaccard index), total edges per network, and shared edges count.

### R8: Input Validation (Unwanted)

The system **SHALL NOT** allow comparison of a query with itself; it **SHALL** display a validation error if both queries are identical.

## Specifications

### Backend

#### S1: New POST /api/v1/dignet/compare

- Request body:
  ```json
  {
    "query_a": "cancer AND TP53",
    "query_b": "diabetes AND insulin"
  }
  ```
- Logic:
  1. Validate both queries are non-empty and distinct
  2. Execute each query through the existing Dignet search pipeline (reuse `_run_dignet_search()` or equivalent internal function)
  3. Extract gene lists from each result's node set
  4. Compute set operations:
     - `shared_genes`: intersection of gene sets A and B
     - `unique_a`: genes in A not in B
     - `unique_b`: genes in B not in A
     - `shared_edges`: edges present in both networks (same gene1-gene2 pair)
  5. For each gene, fetch description from `t_gene_info` and centrality scores from `t_centrality_score_dignet`
  6. Compute Jaccard index: `|intersection| / |union|`
- Response:
  ```json
  {
    "network_a": { "query_id": 123, "gene_count": 45, "edge_count": 89 },
    "network_b": { "query_id": 456, "gene_count": 52, "edge_count": 102 },
    "shared_genes": [
      { "symbol": "TP53", "description": "tumor protein p53", "centrality": {...} }
    ],
    "unique_a": [...],
    "unique_b": [...],
    "shared_edges": [{ "gene1": "TP53", "gene2": "BRCA1" }],
    "overlap_stats": {
      "shared_count": 12,
      "jaccard_index": 0.15,
      "total_union": 85
    }
  }
  ```
- Each sub-query leverages existing Redis caching (7-day TTL)

### Frontend

#### S2: New Compare Page

- **Route**: `/compare`
- **Layout**:
  - Top: Two search input fields with "Compare" button
  - Middle: Side-by-side Cytoscape.js graph panels (50/50 split)
  - Below graphs: Venn diagram (SVG-based, two overlapping circles with counts)
  - Bottom: Three tables (Shared Genes, Unique to A, Unique to B) with gene symbol, description, centrality scores
- **Export**: CSV download button generating a file with all three gene lists
- **Interaction**: Clicking a shared gene highlights it in both Cytoscape instances (yellow ring or pulse animation)

#### S3: Navigation Integration

- Add "Compare" link to the main navigation header
- Add "Compare with..." context action from existing Dignet search results page

## Constraints

- Both queries run through the same PubMed/Dignet pipeline; no special bypass
- Maximum of 1000 PMIDs per query (existing NCBI limit)
- Comparison computation must complete in < 5 seconds after both queries are cached
- Venn diagram is SVG-based (no external charting library required)
- Side-by-side Cytoscape graphs must be independently pannable and zoomable

## Traceability

- SPEC-CMP-001 > R1-R8 > S1-S3
- Depends on: Existing Dignet search pipeline in `api/routes/dignet.py`
- Related: SPEC-EXP-001 (comparison results should be exportable)
