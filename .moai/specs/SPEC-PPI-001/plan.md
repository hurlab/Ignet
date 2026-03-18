---
id: SPEC-PPI-001
type: plan
version: "1.0.0"
status: draft
created: "2026-03-18"
---

# SPEC-PPI-001: Implementation Plan - BioBERT Prediction Integration

## Overview

Enhance the GenePair page to surface BioBERT confidence scores, INO interaction types, and enable on-demand re-prediction of unscored sentences.

## Technical Approach

### Architecture

```
GenePair Page (React)
  |
  +-- GET /api/v1/pairs/<s1>/<s2>?include_summary=true
  |     |-- t_sentence_hit_gene2gene_Host (scores, sentences)
  |     |-- ino_host25 (INO terms via LEFT JOIN)
  |     +-- Computes prediction_summary aggregate
  |
  +-- POST /api/v1/pairs/<s1>/<s2>/predict
        |-- Queries unscored sentences
        |-- Batches to BioBERT (localhost:9635)
        +-- Stores scores back to DB
```

### Key Design Decisions

1. **Summary computation in SQL**: Use `AVG(score)`, `COUNT(CASE WHEN score IS NOT NULL)`, `COUNT(CASE WHEN score > 0.8)` in a single aggregation query rather than computing in Python, since the table has 15.8M rows.
2. **Batch prediction**: BioBERT requests capped at 100 sentences per batch to prevent timeouts on the BioBERT service.
3. **No new tables**: All score data stored in existing `score` column of `t_sentence_hit_gene2gene_Host`.
4. **INO terms already joined**: The existing `pairs.py` endpoint already LEFT JOINs `ino_host25`; no additional backend work needed for INO display.

## Milestones

### Primary Goal: Backend Enhancement

**Files**: `api/routes/pairs.py`

- Add `include_summary` query parameter logic to `get_pair_interactions()`
- Add summary aggregation SQL (separate lightweight query)
- Create `POST /api/v1/pairs/<sym1>/<sym2>/predict` endpoint
- Implement BioBERT client helper function with batch logic
- Add error handling for BioBERT unavailability
- Add per-gene-pair rate limiting (in-memory lock or Redis)

### Secondary Goal: Frontend GenePair Enhancements

**Files**: `frontend/src/pages/GenePair.jsx`, `frontend/src/api.js`

- Add `PredictionSummary` component (card above sentence list)
- Add confidence badge per sentence row (color-coded)
- Display INO term tag per sentence (data already in API response)
- Add sort toggle (Confidence vs PMID)
- Add "Re-predict" button with loading state
- Wire up POST predict API call in `api.js`

### Final Goal: Integration Testing and Edge Cases

- Test with gene pairs that have zero scored sentences
- Test with BioBERT service down (error path)
- Test with large gene pairs (1000+ sentences)
- Verify pagination still works with new sort/summary features

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| BioBERT service unavailable | Re-predict fails | Graceful timeout with user-friendly error; existing scores still displayed |
| Large gene pairs (thousands of unscored sentences) | Slow re-prediction | Batch processing with progress feedback; cap at 100 per batch |
| Summary aggregation slow on 15.8M rows | Slow page load | Summary query uses indexed pair columns; executed only when `include_summary=true` |
| Concurrent re-predict requests for same pair | Race condition on score writes | In-memory lock per gene pair key |

## Dependencies

- BioBERT service running at localhost:9635
- Existing `score` column in `t_sentence_hit_gene2gene_Host` (FLOAT, nullable)
- Existing `ino_host25` LEFT JOIN in pairs endpoint
- SPEC-EXP-001 depends on this SPEC for BioBERT scores in exports

## Files to Modify

| File | Change Type |
|------|------------|
| `api/routes/pairs.py` | Enhance existing endpoint, add predict endpoint |
| `frontend/src/pages/GenePair.jsx` | Major UI enhancements |
| `frontend/src/api.js` | Add predict API call |
