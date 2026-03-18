---
id: SPEC-INO-001
type: plan
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
---

# Implementation Plan: SPEC-INO-001 — INO Interaction Type Explorer

## Overview

Add INO (Interaction Network Ontology) term browsing, filtering, and visualization to the Ignet 2.0 platform. This enables researchers to explore gene interactions by specific interaction types (e.g., phosphorylation, inhibition, activation) drawn from the 800+ INO terms annotated across 7.3M rows in `ino_host25`.

## Milestone 1: Database Preparation and Backend API (Priority High)

### 1.1 Database Index Verification and Creation

- Verify existence of index on `ino_host25.sentence_id`
- Verify existence of index on `ino_host25.matching_phrase`
- Create missing indexes if needed
- Benchmark the term aggregation query: `SELECT matching_phrase, COUNT(*) FROM ino_host25 GROUP BY matching_phrase ORDER BY COUNT(*) DESC`
- If aggregation exceeds 5s, implement a Redis-cached summary refreshed every 24h

### 1.2 New Flask Blueprint: `ino.py`

**Files to create:**
- `api/routes/ino.py` — New blueprint with 3 endpoints

**Endpoints:**
- `GET /api/v1/ino/terms` — Aggregates `ino_host25` by `matching_phrase`, returns term + counts. Uses Redis cache (24h TTL).
- `GET /api/v1/ino/terms/<term>/genes` — JOINs `ino_host25` with `t_sentence_hit_gene2gene_Host` on `sentence_id = sentenceID`, groups by gene pair, returns ranked gene pairs.
- `GET /api/v1/ino/terms/<term>/sentences` — Returns example sentences for a given INO term with PMID links.

**Files to modify:**
- `api/routes/__init__.py` or main app file — Register `ino_bp` blueprint

### 1.3 Modify Existing Endpoints

**Files to modify:**
- `api/routes/genes.py` — Add `ino_term` parameter to `gene_neighbors()`. When provided, add `INNER JOIN ino_host25 ino ON h.sentenceID = ino.sentence_id AND ino.matching_phrase = %s` to the neighbor query.
- `api/routes/pairs.py` — Add `ino_term` parameter to `get_pair_interactions()`. When provided, change the existing LEFT JOIN on `ino_host25` to include a `WHERE ino.matching_phrase = %s` filter.

### Technical Approach

The core SQL pattern for term-to-gene-pair mapping:

```sql
SELECT
    h.geneSymbol1 AS gene1,
    h.geneSymbol2 AS gene2,
    COUNT(*) AS pair_count,
    COUNT(DISTINCT h.PMID) AS unique_pmids,
    MAX(h.score) AS max_score
FROM ino_host25 ino
INNER JOIN t_sentence_hit_gene2gene_Host h
    ON ino.sentence_id = h.sentenceID
WHERE ino.matching_phrase = %s
GROUP BY h.geneSymbol1, h.geneSymbol2
ORDER BY pair_count DESC
LIMIT %s OFFSET %s
```

### Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 7.3M row aggregation is slow | Slow term directory load | Redis cache with 24h TTL; pre-warm on deployment |
| Missing index on `sentence_id` | JOIN performance degradation | Verify and create index before API deployment |
| `matching_phrase` values inconsistent (case, whitespace) | Fragmented term counts | Normalize with `LOWER(TRIM(matching_phrase))` in aggregation |

---

## Milestone 2: Frontend — INO Explorer Page and Term Cloud (Priority High)

### 2.1 New Page: INO Explorer

**Files to create:**
- `frontend/src/pages/InoExplorer.jsx` — Main INO explorer page with term list and term detail views

**Features:**
- Left panel: Searchable, paginated list of INO terms with sentence count bars
- Right panel: Term detail showing top gene pairs, example sentences, and statistics
- URL routing: `/ignet/ino` (term list), `/ignet/ino/<term>` (term detail)

### 2.2 New Component: INO Term Cloud

**Files to create:**
- `frontend/src/components/InoTermCloud.jsx` — Reusable word cloud component

**Features:**
- Fetches top 50 INO terms from `GET /api/v1/ino/terms?limit=50`
- Renders terms with font size proportional to `log(sentence_count)`
- Each term links to `/ignet/ino/<term>`
- Asynchronous loading with skeleton placeholder

### 2.3 Route Registration

**Files to modify:**
- `frontend/src/App.jsx` — Add route for `/ignet/ino` and `/ignet/ino/:term`

### Technical Approach

- Use React lazy loading for the InoExplorer page to avoid increasing initial bundle size
- Term cloud renders using CSS flexbox with randomized ordering and scaled font sizes
- No external charting library needed for the cloud; use inline styles with `fontSize` computed from normalized counts

---

## Milestone 3: Filter Integration on Existing Pages (Priority Medium)

### 3.1 Gene Page INO Filter

**Files to modify:**
- `frontend/src/pages/Gene.jsx` — Add INO term dropdown filter
- Fetch available INO terms for the gene (derived from `GET /api/v1/genes/<symbol>/neighbors` response or a dedicated sub-query)
- Pass `ino_term` parameter to the neighbors API call when a term is selected

### 3.2 GenePair Page INO Filter

**Files to modify:**
- `frontend/src/pages/GenePair.jsx` — Add INO term filter chips
- Extract unique INO terms from the pair evidence response (already available via the `ino_term` field in the LEFT JOIN)
- Filter locally or re-fetch with `ino_term` parameter

### Technical Approach

- Gene page: Dropdown populated by a lightweight call to `GET /api/v1/ino/terms?limit=100` (or filtered by gene if a dedicated endpoint is built later)
- GenePair page: Chip-based filter using INO terms already present in the pair evidence response

---

## Milestone 4: Caching and Performance Optimization (Priority Medium)

### 4.1 Redis Cache Strategy

- Cache key: `ignet:ino:terms:{limit}` — Term directory results
- Cache key: `ignet:ino:term:{term}:genes:{page}:{per_page}` — Per-term gene pair results (optional, cache if query time > 2s)
- TTL: 24 hours, consistent with existing caching pattern
- Cache invalidation: Not needed (data changes only on pipeline re-run)

### 4.2 Query Optimization

- If the term aggregation query is still slow after indexing, consider a pre-computed summary table: `ino_term_summary(matching_phrase, sentence_count, gene_pair_count)` refreshed by a cron job or pipeline trigger

---

## Architecture Design Direction

```
Frontend                          Backend                         Database
---------                         -------                         --------
InoExplorer page  ---GET--->  /api/v1/ino/terms       ----->  ino_host25 (GROUP BY)
                  ---GET--->  /api/v1/ino/terms/<t>/genes -->  ino_host25 JOIN g2g_Host
InoTermCloud      ---GET--->  /api/v1/ino/terms?limit=50       (Redis cached)

Gene page         ---GET--->  /genes/<sym>/neighbors?ino_term=  ino_host25 JOIN g2g_Host
GenePair page     ---GET--->  /pairs/<s1>/<s2>?ino_term=        (existing JOIN filtered)
```

## File Change Summary

| Action | File | Description |
|--------|------|-------------|
| CREATE | `api/routes/ino.py` | New INO blueprint with 3 endpoints |
| MODIFY | `api/routes/__init__.py` or app registration | Register `ino_bp` |
| MODIFY | `api/routes/genes.py` | Add `ino_term` filter to `gene_neighbors()` |
| MODIFY | `api/routes/pairs.py` | Add `ino_term` filter to `get_pair_interactions()` |
| CREATE | `frontend/src/pages/InoExplorer.jsx` | INO explorer page |
| CREATE | `frontend/src/components/InoTermCloud.jsx` | Reusable term cloud component |
| MODIFY | `frontend/src/App.jsx` | Add INO routes |
| MODIFY | `frontend/src/pages/Gene.jsx` | Add INO term filter dropdown |
| MODIFY | `frontend/src/pages/GenePair.jsx` | Add INO term filter chips |

## Dependencies

- No external library dependencies required
- Depends on existing database tables (`ino_host25`, `t_sentence_hit_gene2gene_Host`)
- Depends on existing Redis infrastructure for caching
