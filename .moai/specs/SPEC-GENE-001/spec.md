---
id: SPEC-GENE-001
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
author: "MoAI"
priority: high
issue_number: 0
tags: [gene, report-card, centrality, INO, biosummary, AI-summary]
---

# SPEC-GENE-001: Interactive Gene Report Card

## Environment

- **Platform**: Ignet 2.0 bioinformatics literature-mining platform
- **Frontend**: React 19 SPA with Cytoscape.js
- **Backend**: Flask REST API on port 9637, MariaDB
- **Key Tables**:
  - `t_gene_info` (~20K rows): GeneID, Symbol, Synonyms, description, tax_id, type_of_gene, chromosome
  - `t_centrality_score_dignet` (~48K rows): genesymbol, score_type (d/p/c/b), score
  - `t_sentence_hit_gene2gene_Host` (~15.8M rows): geneSymbol1, geneSymbol2, PMID, sentenceID, sentence, score, hasVaccine
  - `ino_host25` (~7.3M rows): sentence_id, matching_phrase
  - `biosummary25_Host` (~500K rows): pmid, gene_symbols, drug_term, hdo_term
- **Existing Endpoints**:
  - `GET /api/v1/genes/<symbol>/neighbors` -- returns top neighbors with co-occurrence counts
  - `GET /api/v1/genes/search` -- searches genes by symbol/name
  - `POST /api/v1/summarize` -- BioSummarAI summarization (existing)
- **Existing Frontend**: `Gene.jsx` shows a search box and neighbor table; no report card layout, no centrality display, no INO breakdown, no drug/disease associations

## Assumptions

- The existing `/api/v1/genes/<symbol>/neighbors` endpoint can be extended or a new report endpoint can aggregate all data
- BioSummarAI (`/api/v1/summarize`) accepts a gene list and returns an AI-generated summary; it can be called with a single gene to summarize that gene's role
- The `biosummary25_Host` table's `gene_symbols` field can be filtered by a single gene symbol using LIKE or FIND_IN_SET
- CSS-only bar charts are sufficient for the INO breakdown; no charting library needed
- The Cytoscape mini-network can reuse the existing `NetworkGraph` component with a smaller container

## Requirements

### R1: Comprehensive Report Card

**When** user views a gene page, the system **shall** display a comprehensive report card containing all of the following sections.

### R2: Gene Metadata Section

The report card **shall** include a gene metadata header showing: Symbol, full description, GeneID, Synonyms, type_of_gene, chromosome, and tax_id (from `t_gene_info`).

### R3: Centrality Scores Section

The report card **shall** display all 4 centrality scores from `t_centrality_score_dignet`:
- Degree centrality (score_type = 'd')
- PageRank (score_type = 'p')
- Closeness centrality (score_type = 'c')
- Betweenness centrality (score_type = 'b')

Each score **shall** be displayed as a labeled metric card with a visual indicator (e.g., horizontal bar showing percentile relative to all genes).

### R4: Top Neighbors Section

The report card **shall** display the top 20 interaction partners (from existing neighbor query), shown as a ranked list with co-occurrence count and link to each neighbor's report card.

### R5: INO Interaction Type Breakdown

The report card **shall** show the distribution of INO interaction types for this gene's interactions, displayed as a horizontal bar chart (CSS-only). The breakdown **shall** aggregate all INO matching phrases from `ino_host25` for sentences involving this gene.

### R6: Associated Drugs and Diseases

The report card **shall** display associated drug terms and disease terms (HDO terms) from `biosummary25_Host` for PMIDs involving this gene. Display as clickable tag clouds.

### R7: AI Summary Button

**When** user clicks "AI Summary", the system **shall** generate a summary of the gene's biological role by calling the existing BioSummarAI endpoint with the gene symbol. The summary **shall** be displayed in a collapsible panel below the button.

### R8: Mini Network Visualization

The report card **shall** show a mini network visualization of the gene and its top 20 neighbors, rendered using the existing `NetworkGraph` component in a compact container (400x300px).

### R9: Evidence Sentence Drill-Down

**When** user clicks a drug or disease tag, the system **shall** display the supporting evidence sentences from the database in an expandable panel.

## Specifications

### Backend

#### S1: New Endpoint `GET /api/v1/genes/<symbol>/report`

**Response**:
```json
{
  "data": {
    "gene_info": {
      "GeneID": 7124,
      "Symbol": "TNF",
      "description": "tumor necrosis factor",
      "Synonyms": "DIF, TNF-alpha, TNFA, TNFSF2",
      "type_of_gene": "protein-coding",
      "chromosome": "6",
      "tax_id": 9606
    },
    "centrality_scores": {
      "degree": { "score": 0.85, "percentile": 97.2 },
      "pagerank": { "score": 0.0012, "percentile": 95.1 },
      "closeness": { "score": 0.72, "percentile": 93.8 },
      "betweenness": { "score": 0.045, "percentile": 91.5 }
    },
    "top_neighbors": [
      { "neighbor": "IL6", "count": 5420, "unique_pmids": 1230, "score": 0.98 },
      ...
    ],
    "ino_distribution": [
      { "type": "positive regulation", "count": 1240 },
      { "type": "binding", "count": 890 },
      ...
    ],
    "drug_associations": [
      { "term": "infliximab", "count": 234 },
      { "term": "adalimumab", "count": 189 },
      ...
    ],
    "disease_associations": [
      { "term": "rheumatoid arthritis", "count": 567 },
      { "term": "Crohn's disease", "count": 234 },
      ...
    ]
  }
}
```

**Processing steps**:
1. Query `t_gene_info` WHERE Symbol = :symbol (case-insensitive)
2. Query `t_centrality_score_dignet` WHERE genesymbol = :symbol, pivot by score_type
3. Compute percentile for each centrality score (rank / total * 100)
4. Query top 20 neighbors (reuse existing neighbor logic with limit=20)
5. Query INO distribution: JOIN `t_sentence_hit_gene2gene_Host` with `ino_host25` WHERE (geneSymbol1 = :symbol OR geneSymbol2 = :symbol), aggregate matching_phrase counts
6. Query drug/disease associations: collect PMIDs involving this gene, query `biosummary25_Host`, aggregate drug_term and hdo_term

#### S2: Evidence Sentences Endpoint

Create `GET /api/v1/genes/<symbol>/evidence?entity=<term>&entity_type=drug|disease&page=1&per_page=20`

Returns matching sentences from `t_sentence_hit_gene2gene_Host` JOINed with `biosummary25_Host` where the specified drug or disease term appears.

#### S3: Caching

Cache the report response in Redis with key `ignet:gene_report:{symbol}` and TTL of 24 hours. Invalidate on database update (manual flush).

### Frontend

#### S4: Redesign `Gene.jsx` as Report Card

Transform the existing `Gene.jsx` page from a simple search+table layout to a comprehensive report card layout:

**Layout structure**:
```
+------------------------------------------+
| Gene Symbol + Description (Hero Header)  |
| GeneID | Type | Chromosome | Tax ID      |
+------------------------------------------+
| Centrality Scores (4 metric cards)       |
| [Degree] [PageRank] [Closeness] [Betw.]  |
+------------------------------------------+
| Top 20 Neighbors        | Mini Network   |
| (ranked list)            | (Cytoscape)   |
+------------------------------------------+
| INO Interaction Breakdown (bar chart)    |
+------------------------------------------+
| Drugs (tag cloud)  | Diseases (tag cloud)|
+------------------------------------------+
| [Generate AI Summary] button             |
| Collapsible summary panel                |
+------------------------------------------+
```

#### S5: Centrality Metric Cards

Each card shows:
- Score type label (e.g., "Degree Centrality")
- Raw score value
- Percentile bar (CSS width = percentile%)
- Percentile text (e.g., "Top 3%")

#### S6: INO Bar Chart

Horizontal CSS-only bars:
- Each bar: `<div>` with width proportional to count
- Color by INO category (reuse SPEC-NET-001 color scheme)
- Label with type name and count

#### S7: Drug/Disease Tag Clouds

- Tags sized by frequency (logarithmic scaling)
- Clickable: on click, fetch evidence sentences via S2 endpoint
- Display evidence in expandable panel below the tag cloud

#### S8: Mini Network

- Reuse `NetworkGraph` component
- Container: 400x300px
- Show the gene as center node (highlighted) with top 20 neighbors
- Clicking a neighbor node navigates to that gene's report card

#### S9: AI Summary Integration

- "Generate AI Summary" button
- On click, call existing `api.summarize([symbol])`
- Display result in a collapsible panel with loading state
- Cache the summary in component state to avoid re-fetching

#### S10: Update `api.js`

Add:
```javascript
geneReport: (symbol) => request(`/genes/${encodeURIComponent(symbol)}/report`),
geneEvidence: (symbol, entity, entityType, page) =>
  request(`/genes/${encodeURIComponent(symbol)}/evidence?entity=${encodeURIComponent(entity)}&entity_type=${entityType}&page=${page}`),
```

## Constraints

- No new npm dependencies; all charts are CSS-only
- The report card page must maintain the existing gene search functionality (search bar at top)
- AI Summary calls BioSummarAI which may take 5-10 seconds; show clear loading indicator
- Drug/disease associations are displayed as-is from `biosummary25_Host` without normalization
- Must handle genes that have no centrality data, no INO data, or no biosummary data gracefully (show "N/A" or hide section)
- The mini network component must not interfere with the main page scroll

## Traceability

- SPEC-GENE-001 > R1 > S1, S4
- SPEC-GENE-001 > R2 > S1 (gene_info), S4 (header)
- SPEC-GENE-001 > R3 > S1 (centrality_scores), S5
- SPEC-GENE-001 > R4 > S1 (top_neighbors), S4
- SPEC-GENE-001 > R5 > S1 (ino_distribution), S6
- SPEC-GENE-001 > R6 > S1 (drug/disease), S7
- SPEC-GENE-001 > R7 > S9
- SPEC-GENE-001 > R8 > S8
- SPEC-GENE-001 > R9 > S2, S7
