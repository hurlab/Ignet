---
id: SPEC-INO-001
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
author: "MoAI"
priority: high
issue_number: 0
---

# SPEC-INO-001: INO Interaction Type Explorer

## 1. Environment

- **Platform**: Ignet 2.0 — React 19 SPA + Flask REST API + MariaDB
- **Key Tables**:
  - `ino_host25` (~7.3M rows): `sentence_id` (INT), `matching_phrase` (VARCHAR) — contains 800+ INO interaction type annotations
  - `t_sentence_hit_gene2gene_Host` (15.8M rows): `geneSymbol1`, `geneSymbol2`, `PMID`, `sentenceID`, `sentence`, `score`, `hasVaccine`
  - `t_gene_info` (~20K rows): `GeneID`, `Symbol`, `description`, `tax_id`
- **Existing Endpoints**:
  - `GET /api/v1/genes/<symbol>/neighbors` — gene neighbor lookup with filters
  - `GET /api/v1/pairs/<sym1>/<sym2>` — gene pair evidence sentences (already LEFT JOINs `ino_host25`)
- **Frontend Pages**: Explore, Gene, GenePair pages exist but have no INO-specific views or filters
- **Caching**: Redis is available for expensive aggregation queries (24h TTL pattern established)

## 2. Assumptions

- The `matching_phrase` column in `ino_host25` contains standardized INO term strings (e.g., "phosphorylation", "inhibition", "activation") suitable for direct grouping without further normalization.
- The `sentence_id` column in `ino_host25` maps to `sentenceID` in `t_sentence_hit_gene2gene_Host` via integer equality join.
- Hierarchical INO term browsing (parent/child ontology tree) is a secondary goal; the ontology structure may not be present in the current database schema. If an INO ontology hierarchy table does not exist, the feature degrades gracefully to a flat term list.
- The top INO terms by frequency are cacheable for 24 hours without significant staleness concerns, consistent with the existing Redis caching pattern.
- The `ino_host25` table has an index on `sentence_id`; if not, one must be created before deployment.

## 3. Requirements

### 3.1 Ubiquitous Requirements

- **[REQ-INO-U01]** The system shall sanitize all user-supplied INO term inputs against injection before use in SQL queries.
- **[REQ-INO-U02]** The system shall return paginated results for all INO term queries using the established `page`/`per_page` pattern (default 50, max 200).
- **[REQ-INO-U03]** The system shall return consistent JSON error responses following the existing `{"error": "...", "message": "..."}` format.

### 3.2 Event-Driven Requirements

- **[REQ-INO-E01]** When a user requests the INO term directory (`GET /api/v1/ino/terms`), the system shall return the top INO interaction types ranked by sentence count, including `term`, `sentence_count`, and `gene_pair_count` for each entry.
- **[REQ-INO-E02]** When a user selects a specific INO term (`GET /api/v1/ino/terms/<term>/genes`), the system shall return all gene pairs associated with that interaction type, including `gene1`, `gene2`, `pair_count`, `unique_pmids`, and `max_score`.
- **[REQ-INO-E03]** When a user views an INO term detail page, the system shall display: term name, total sentence count, top 10 gene pairs by frequency, and up to 5 example sentences with PMID links.
- **[REQ-INO-E04]** When a user applies an INO term filter on the Gene page (`GET /api/v1/genes/<symbol>/neighbors?ino_term=...`), the system shall restrict neighbor results to only those interactions annotated with the specified INO term.
- **[REQ-INO-E05]** When a user applies an INO term filter on the GenePair page (`GET /api/v1/pairs/<sym1>/<sym2>?ino_term=...`), the system shall restrict evidence sentences to only those annotated with the specified INO term.
- **[REQ-INO-E06]** When a user navigates to the Explore page, the system shall display an INO term cloud showing the 50 most frequent interaction types, with font size proportional to sentence count.

### 3.3 State-Driven Requirements

- **[REQ-INO-S01]** While the Redis cache contains valid INO term aggregation data (TTL 24h), the system shall serve term directory requests from cache without querying the database.
- **[REQ-INO-S02]** While the INO ontology hierarchy table is not available in the database, the system shall display terms in a flat ranked list and omit parent/child navigation controls.

### 3.4 Unwanted Behavior Requirements

- **[REQ-INO-N01]** The system shall not execute unindexed full-table scans on `ino_host25` for term aggregation queries; all aggregation queries must use appropriate indexes or cached results.
- **[REQ-INO-N02]** The system shall not return more than 200 results per page for any INO endpoint.

### 3.5 Optional Requirements

- **[REQ-INO-O01]** Where the INO ontology hierarchy is available, the system shall provide hierarchical term browsing with expandable parent/child navigation.
- **[REQ-INO-O02]** Where feasible, the INO term cloud component shall be reusable and embeddable on Gene detail pages to show interaction type distribution for a specific gene.

## 4. Specifications

### 4.1 Backend API Specifications

#### New Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/ino/terms` | List top INO terms with counts |
| GET | `/api/v1/ino/terms/<term>/genes` | Gene pairs for a specific INO term |
| GET | `/api/v1/ino/terms/<term>/sentences` | Example sentences for an INO term |

#### `GET /api/v1/ino/terms`

**Parameters**:
- `limit` (int, default 50, max 500): Number of terms to return
- `q` (string, optional): Filter terms by prefix search

**Response**:
```json
{
  "data": [
    {
      "term": "phosphorylation",
      "sentence_count": 234567,
      "gene_pair_count": 8901
    }
  ],
  "total": 812
}
```

#### `GET /api/v1/ino/terms/<term>/genes`

**Parameters**:
- `page`, `per_page`: Pagination (standard pattern)
- `sort_by`: `pair_count` | `unique_pmids` | `max_score` (default: `pair_count`)
- `order`: `ASC` | `DESC` (default: `DESC`)

**Response**:
```json
{
  "term": "phosphorylation",
  "data": [
    {
      "gene1": "MAPK1",
      "gene2": "ERK2",
      "pair_count": 456,
      "unique_pmids": 123,
      "max_score": 0.95
    }
  ],
  "total": 3456,
  "page": 1,
  "per_page": 50
}
```

#### Modified Existing Endpoints

- `GET /api/v1/genes/<symbol>/neighbors`: Add optional `ino_term` query parameter. When provided, JOIN with `ino_host25` to filter by matching_phrase.
- `GET /api/v1/pairs/<sym1>/<sym2>`: Add optional `ino_term` query parameter. When provided, filter the existing LEFT JOIN on `ino_host25.matching_phrase`.

### 4.2 Frontend Specifications

#### New Page: INO Explorer (`/ignet/ino`)

- Term list view: Paginated table of INO terms with sentence count bars
- Term detail view: Shows selected term's gene pairs, example sentences, and statistics
- Search bar: Filter terms by prefix

#### New Component: INO Term Cloud

- Renders top 50 INO terms as a word cloud
- Font size scaled by sentence count (logarithmic)
- Each term is clickable, navigating to `/ignet/ino/<term>`
- Embeddable on Explore page and optionally on Gene pages

#### Filter Integration

- Gene page: Add INO term dropdown filter to the existing filter bar
- GenePair page: Add INO term filter chips above the evidence sentences table

### 4.3 Database Considerations

- Verify index on `ino_host25.sentence_id` exists; create if missing: `CREATE INDEX idx_ino_sentence_id ON ino_host25(sentence_id)`
- Verify index on `ino_host25.matching_phrase` exists; create if missing: `CREATE INDEX idx_ino_matching_phrase ON ino_host25(matching_phrase)`
- Consider a materialized summary table or Redis cache for the term directory aggregation query (7.3M row GROUP BY is expensive)

## 5. Constraints

- All new endpoints must follow the existing Flask Blueprint pattern in `/api/routes/`
- Response time for cached term directory: < 200ms
- Response time for per-term gene pair query: < 2s
- The INO term cloud must not block initial page render (load asynchronously)

## 6. Traceability

| Requirement | Plan Reference | Acceptance Reference |
|-------------|---------------|---------------------|
| REQ-INO-E01 | Milestone 1: Backend API | AC-INO-001 |
| REQ-INO-E02 | Milestone 1: Backend API | AC-INO-002 |
| REQ-INO-E03 | Milestone 2: Frontend Pages | AC-INO-003 |
| REQ-INO-E04 | Milestone 3: Filter Integration | AC-INO-004 |
| REQ-INO-E05 | Milestone 3: Filter Integration | AC-INO-005 |
| REQ-INO-E06 | Milestone 2: Frontend Pages | AC-INO-006 |
| REQ-INO-S01 | Milestone 1: Backend API | AC-INO-007 |
