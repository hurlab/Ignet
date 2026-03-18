---
id: SPEC-PPI-001
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
author: "MoAI"
priority: high
issue_number: 0
---

# SPEC-PPI-001: BioBERT Prediction Integration in GenePair

## Environment

- **Platform**: Ignet 2.0 bioinformatics literature-mining platform
- **Frontend**: React 19 SPA (Vite, Tailwind CSS, React Router)
- **Backend**: Flask REST API (port 9637)
- **Database**: MariaDB
- **External Service**: BioBERT service at port 9635
- **Key Tables**:
  - `t_sentence_hit_gene2gene_Host` (~15.8M rows): geneSymbol1, geneSymbol2, PMID, sentenceID, sentence, score, hasVaccine
  - `ino_host25` (~7.3M rows): sentence_id, matching_phrase (800+ INO interaction ontology types)
  - `sentences25_genepair`: sentenceID, sentence (full sentence text)
- **Existing Endpoints**:
  - `GET /api/v1/pairs/<sym1>/<sym2>` already joins with `ino_host25` and returns `ino_term` per sentence
  - BioBERT service accepts sentences and returns `Labels` (0/1), `ConfidenceScore` (0-1), `Interaction_words`

## Assumptions

- The `score` column in `t_sentence_hit_gene2gene_Host` stores BioBERT confidence scores (0.0-1.0); NULL means unscored
- The BioBERT service at port 9635 is available on localhost and responds within 30 seconds per batch
- BioBERT accepts POST requests with a JSON array of sentence strings and returns per-sentence predictions
- Existing pagination and filtering in `GET /api/v1/pairs/<sym1>/<sym2>` must be preserved
- INO terms are already joined via `ino_host25.sentence_id` in the existing pairs endpoint

## Requirements

### R1: BioBERT Confidence Display (Event-Driven)

**WHEN** user views a gene pair page, **THEN** the system **SHALL** display the BioBERT confidence score from the `score` column alongside each evidence sentence.

### R2: Overall Prediction Summary (Event-Driven)

**WHEN** BioBERT scores are available for at least one sentence in the pair, **THEN** the system **SHALL** display an overall prediction summary card: "BioBERT predicts [Gene1]-[Gene2] interaction with N% average confidence based on M scored sentences".

### R3: Confidence-Based Default Sort (State-Driven)

**WHEN** evidence sentences are displayed on the GenePair page, **THEN** the system **SHALL** sort sentences by BioBERT confidence score (highest first) by default.

### R4: INO Interaction Type Display (Event-Driven)

**WHEN** evidence sentences are displayed, **THEN** the system **SHALL** show the INO interaction type from `ino_host25` as a tag/badge for each sentence that has a matching phrase.

### R5: Re-Predict Unscored Sentences (Event-Driven)

**WHEN** user clicks "Re-predict" button, **THEN** the system **SHALL** send all unscored sentences (score IS NULL) to the BioBERT service (port 9635), store the returned scores in `t_sentence_hit_gene2gene_Host.score`, and refresh the display.

### R6: High-Confidence Visual Indicator (State-Driven)

**IF** a sentence has a BioBERT confidence score > 0.8, **THEN** the system **SHALL** highlight it with a distinct visual indicator (colored border or badge).

### R7: Prediction Status Feedback (Event-Driven)

**WHEN** the "Re-predict" operation is in progress, **THEN** the system **SHALL** display a progress indicator showing how many sentences have been scored out of the total unscored count.

### R8: Error Handling for BioBERT (Unwanted)

The system **SHALL NOT** crash or hang if the BioBERT service is unreachable; it **SHALL** display a user-friendly error message and allow continued browsing of existing scores.

## Specifications

### Backend

#### S1: Enhance GET /api/v1/pairs/<sym1>/<sym2>

- Add `include_summary=true` query parameter that triggers an additional summary calculation
- When `include_summary=true`, return an additional `prediction_summary` object:
  ```json
  {
    "avg_confidence": 0.82,
    "scored_count": 145,
    "unscored_count": 23,
    "high_confidence_count": 98
  }
  ```
- Preserve all existing query parameters (score, has_vaccine, keywords, page, per_page, sort_by, order)
- Default sort_by remains `score DESC` (already the case)

#### S2: New POST /api/v1/pairs/<sym1>/<sym2>/predict

- Request body: `{}` (empty; the endpoint determines unscored sentences internally)
- Logic:
  1. Query `t_sentence_hit_gene2gene_Host` for rows where `score IS NULL` for this gene pair
  2. Batch sentences (max 100 per request) to BioBERT at `http://localhost:9635`
  3. Parse BioBERT response: extract `ConfidenceScore` per sentence
  4. UPDATE `t_sentence_hit_gene2gene_Host SET score = %s WHERE sentenceID = %s`
  5. Return summary of scored results
- Response:
  ```json
  {
    "scored": 23,
    "failed": 0,
    "avg_confidence": 0.76
  }
  ```
- Timeout: 30 seconds per BioBERT batch; abort and return partial results on timeout

### Frontend

#### S3: GenePair Page Enhancements

- **Prediction Summary Card**: Displayed above the sentence list; shows average confidence, scored/unscored counts
- **Confidence Badge**: Per-sentence badge showing score as percentage (e.g., "87%")
  - Green for score > 0.8
  - Yellow for 0.5-0.8
  - Gray for < 0.5 or NULL
- **INO Type Tag**: Per-sentence tag showing `ino_term` value (already returned by API)
- **Sort Toggle**: Allow toggling between "Confidence (High-Low)" and "PMID"
- **Re-Predict Button**: Visible when `unscored_count > 0`; triggers POST predict endpoint; shows progress spinner during operation

## Constraints

- BioBERT batching must not exceed 100 sentences per request to avoid service overload
- The predict endpoint must be rate-limited to 1 concurrent request per gene pair
- No schema changes to `t_sentence_hit_gene2gene_Host` (score column already exists as FLOAT)
- Frontend must gracefully handle gene pairs with zero scored sentences

## Traceability

- SPEC-PPI-001 > R1-R8 > S1-S3
- Related: SPEC-EXP-001 (export must include BioBERT scores)
