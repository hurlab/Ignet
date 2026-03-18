---
id: SPEC-ENR-001
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
author: "MoAI"
priority: high
issue_number: 0
tags: [enrichment, gene-set, subnetwork, INO, biosummary]
---

# SPEC-ENR-001: Gene Set Enrichment

## Environment

- **Platform**: Ignet 2.0 bioinformatics literature-mining platform
- **Frontend**: React 19 SPA with Cytoscape.js
- **Backend**: Flask REST API on port 9637, MariaDB
- **Key Tables**:
  - `t_sentence_hit_gene2gene_Host` (~15.8M rows): geneSymbol1, geneSymbol2, PMID, sentenceID, sentence, score, hasVaccine
  - `ino_host25` (~7.3M rows): sentence_id, matching_phrase
  - `biosummary25_Host` (~500K rows): pmid, gene_symbols, drug_term, hdo_term
  - `t_gene_info` (~20K rows): GeneID, Symbol, description, tax_id
- **Existing Endpoints**: No enrichment endpoint exists; gene search and neighbor queries are available
- **Existing Frontend**: No enrichment page exists

## Assumptions

- Users will paste gene lists from external tools (e.g., DEG analysis, pathway tools) as newline or comma-separated symbols
- Gene symbols will be matched case-insensitively against `geneSymbol1` and `geneSymbol2` in the interaction table
- The `biosummary25_Host` table's `gene_symbols` field contains comma-separated gene symbols that can be matched against the input gene list
- Pairwise query of N genes against the 15.8M row table is feasible with indexed lookups; for N=500, the worst case is 124,750 pairs but SQL IN-clause optimization makes this tractable
- The Cytoscape.js component from SPEC-NET-001 can be reused for subnetwork visualization

## Requirements

### R1: Gene List Input

**When** user pastes a gene list into the enrichment input, the system **shall** parse the list (supporting comma, newline, space, and tab delimiters), validate each symbol against `t_gene_info`, and report recognized vs. unrecognized genes.

### R2: Subnetwork Construction

**When** user submits a validated gene list, the system **shall** query all pairwise interactions among those genes from `t_sentence_hit_gene2gene_Host` and build a subnetwork.

### R3: Interaction Statistics

**When** the subnetwork is built, the system **shall** display:
- Total interaction pairs found
- Coverage percentage (genes with at least one interaction / total input genes)
- Total evidence sentences
- Total unique PMIDs

### R4: INO Interaction Type Distribution

**When** the subnetwork is built, the system **shall** show the top INO interaction types with counts, aggregated from `ino_host25` for the matching sentence IDs. Display as a horizontal bar chart.

### R5: Associated Drugs and Diseases

**When** the subnetwork is built, the system **shall** query `biosummary25_Host` for PMIDs matching the subnetwork edges and extract:
- Associated drug terms with frequency counts
- Associated disease terms (HDO terms) with frequency counts

Display as clickable tag clouds.

### R6: Subnetwork Visualization

**When** user clicks "Visualize", the system **shall** render the subnetwork as a Cytoscape.js graph with:
- Nodes representing input genes (colored by whether they have interactions)
- Edges representing pairwise interactions (width by evidence count)
- Isolated input genes shown as unconnected nodes

### R7: Gene List Size Limit

The system **shall** support gene lists up to 500 genes. **If** the user submits more than 500 genes, **then** the system **shall** reject the input with a clear error message.

### R8: CSV Export

**When** user clicks "Export CSV", the system **shall** export the enrichment results (gene pairs, INO types, drug/disease associations) as a downloadable CSV file.

## Specifications

### Backend

#### S1: New Endpoint `POST /api/v1/enrichment/analyze`

**Request body**:
```json
{
  "genes": ["TNF", "IL6", "IFNG", "TP53", ...],
  "include_ino": true,
  "include_biosummary": true
}
```

**Processing steps**:
1. Validate gene symbols against `t_gene_info` -- return `recognized` and `unrecognized` lists
2. Query all pairwise interactions: `WHERE (geneSymbol1 IN (...) AND geneSymbol2 IN (...))`
3. Aggregate by (gene1, gene2): count, unique PMIDs, max score
4. If `include_ino`: JOIN `ino_host25` on sentence_id, aggregate INO matching phrases
5. If `include_biosummary`: query `biosummary25_Host` WHERE pmid IN (edge PMIDs), aggregate drug_term and hdo_term
6. Compute coverage stats

**Response**:
```json
{
  "data": {
    "recognized_genes": [...],
    "unrecognized_genes": [...],
    "edges": [
      {
        "gene1": "TNF",
        "gene2": "IL6",
        "count": 245,
        "unique_pmids": 89,
        "max_score": 0.95,
        "ino_types": [{"type": "positive regulation", "count": 120}, ...]
      }
    ],
    "stats": {
      "total_pairs": 42,
      "coverage_pct": 85.7,
      "total_sentences": 1230,
      "total_pmids": 456
    },
    "ino_distribution": [
      {"type": "positive regulation", "count": 320},
      {"type": "binding", "count": 180},
      ...
    ],
    "drug_associations": [
      {"term": "dexamethasone", "count": 45},
      ...
    ],
    "disease_associations": [
      {"term": "rheumatoid arthritis", "count": 67},
      ...
    ]
  }
}
```

#### S2: Query Optimization

- Use a single query with IN-clauses for both geneSymbol1 and geneSymbol2
- Chunk processing for gene lists > 100 genes (chunk into groups for IN-clause)
- Cache results in Redis with key `ignet:enrichment:{hash_of_sorted_genes}` and TTL of 1 hour

#### S3: New Blueprint File

Create `api/routes/enrichment.py` with the `enrichment_bp` Blueprint. Register in the main app.

### Frontend

#### S4: New Enrichment Page

Create `frontend/src/pages/Enrichment.jsx`:

1. **Input section**: Large textarea for gene list paste, with delimiter auto-detection
2. **Validation display**: Show recognized (green badges) and unrecognized (red badges) genes
3. **Results section** (after analysis):
   - Statistics cards (total pairs, coverage %, sentences, PMIDs)
   - INO distribution horizontal bar chart (CSS-only, no chart library)
   - Drug tag cloud (tags sized by frequency)
   - Disease tag cloud (tags sized by frequency)
4. **Visualize button**: Renders subnetwork using existing `NetworkGraph` component
5. **Export CSV button**: Client-side CSV generation from results

#### S5: Route Registration

Add `/enrichment` route to `App.jsx` with the new Enrichment page component.

#### S6: API Client Update

Add to `api.js`:
```javascript
enrichmentAnalyze: (genes, options) => request('/enrichment/analyze', {
  method: 'POST',
  body: JSON.stringify({ genes, ...options }),
})
```

## Constraints

- No new npm dependencies; bar chart and tag clouds are CSS-only
- Gene symbol validation must be case-insensitive
- The 500-gene limit is enforced server-side with a 400 response for violations
- Query must handle the bidirectional nature of gene pairs (A-B and B-A)
- Drug and disease terms from `biosummary25_Host` may contain duplicates/variants; display raw counts without normalization in v1

## Traceability

- SPEC-ENR-001 > R1 > S1 (validation), S4 (input section)
- SPEC-ENR-001 > R2 > S1, S2
- SPEC-ENR-001 > R3 > S1 (stats), S4 (stats cards)
- SPEC-ENR-001 > R4 > S1 (ino_distribution), S4 (bar chart)
- SPEC-ENR-001 > R5 > S1 (drug/disease), S4 (tag clouds)
- SPEC-ENR-001 > R6 > S4 (visualize button + NetworkGraph)
- SPEC-ENR-001 > R7 > S1 (validation)
- SPEC-ENR-001 > R8 > S4 (export CSV)
