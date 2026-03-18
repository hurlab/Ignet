---
id: SPEC-PPI-001
type: acceptance
version: "1.0.0"
status: draft
created: "2026-03-18"
---

# SPEC-PPI-001: Acceptance Criteria - BioBERT Prediction Integration

## AC-1: BioBERT Confidence Display

**Given** a gene pair (e.g., TP53 and BRCA1) with scored sentences in the database
**When** user navigates to the GenePair page for TP53-BRCA1
**Then** each evidence sentence displays a confidence badge showing the BioBERT score as a percentage

**Given** a sentence with `score = NULL`
**When** the sentence is rendered in the list
**Then** the confidence badge displays "N/A" or a gray indicator

## AC-2: Overall Prediction Summary

**Given** the pair TP53-BRCA1 has 145 scored sentences with average confidence 0.82 and 23 unscored
**When** user views the GenePair page with `include_summary=true`
**Then** the summary card displays: "BioBERT predicts TP53-BRCA1 interaction with 82% average confidence based on 145 scored sentences"
**And** the card shows "23 sentences awaiting prediction"

**Given** a gene pair with zero scored sentences
**When** user views the GenePair page
**Then** the summary card displays: "No BioBERT predictions available" with a prompt to click Re-predict

## AC-3: Default Sort by Confidence

**Given** the GenePair page is loaded with default parameters
**When** the API response is rendered
**Then** sentences are sorted by BioBERT confidence score descending (highest first)
**And** sentences with NULL scores appear at the bottom

## AC-4: INO Interaction Type Tags

**Given** a sentence with `ino_term = "phosphorylation"` from ino_host25
**When** the sentence is displayed
**Then** a tag reading "phosphorylation" appears alongside the sentence

**Given** a sentence with no matching INO term
**When** the sentence is displayed
**Then** no INO tag is shown (no empty tag)

## AC-5: Re-Predict Unscored Sentences

**Given** the pair has 23 unscored sentences
**When** user clicks the "Re-predict" button
**Then** a POST request is sent to `/api/v1/pairs/TP53/BRCA1/predict`
**And** a progress indicator shows during the operation
**And** upon completion, the page refreshes with newly scored sentences
**And** the summary card updates to reflect the new counts

**Given** all sentences are already scored (unscored_count = 0)
**When** the page loads
**Then** the "Re-predict" button is hidden or disabled

## AC-6: High-Confidence Visual Indicator

**Given** a sentence with BioBERT score = 0.92
**When** rendered in the sentence list
**Then** the sentence row has a green confidence badge and/or green left border

**Given** a sentence with BioBERT score = 0.65
**When** rendered in the sentence list
**Then** the sentence row has a yellow confidence badge

**Given** a sentence with BioBERT score = 0.35
**When** rendered in the sentence list
**Then** the sentence row has a gray confidence badge

## AC-7: Error Handling

**Given** the BioBERT service at port 9635 is unreachable
**When** user clicks "Re-predict"
**Then** the system displays an error message: "BioBERT service is currently unavailable. Existing scores are still visible."
**And** no scores are overwritten or corrupted
**And** the page remains functional for browsing existing data

## AC-8: API Contract - GET /api/v1/pairs/<s1>/<s2>

**Given** `include_summary=true` parameter is set
**When** the endpoint responds
**Then** the response includes a `prediction_summary` object with keys: `avg_confidence`, `scored_count`, `unscored_count`, `high_confidence_count`

**Given** `include_summary` is not set or false
**When** the endpoint responds
**Then** the response format is unchanged from current behavior (backward compatible)

## AC-9: API Contract - POST /api/v1/pairs/<s1>/<s2>/predict

**Given** valid gene symbols and unscored sentences exist
**When** POST request is received
**Then** response returns `{"scored": N, "failed": 0, "avg_confidence": 0.XX}`

**Given** no unscored sentences exist for the pair
**When** POST request is received
**Then** response returns `{"scored": 0, "failed": 0, "avg_confidence": null, "message": "All sentences already scored"}`

## Quality Gates

- [ ] All existing pairs endpoint query parameters continue to work (backward compatibility)
- [ ] Summary aggregation query executes in < 500ms for gene pairs with 10K+ sentences
- [ ] Re-predict handles BioBERT timeout gracefully (30s per batch)
- [ ] No N+1 query patterns in the enhanced endpoint
- [ ] Frontend renders correctly with 0, 1, 50, and 200 sentences

## Definition of Done

- Backend: GET endpoint enhanced with summary; POST predict endpoint functional
- Frontend: Summary card, confidence badges, INO tags, sort toggle, re-predict button all working
- Error handling: BioBERT unavailability handled gracefully
- Backward compatibility: Existing API consumers unaffected
