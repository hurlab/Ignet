---
id: SPEC-INO-001
type: acceptance
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
---

# Acceptance Criteria: SPEC-INO-001 — INO Interaction Type Explorer

## AC-INO-001: INO Term Directory Endpoint

**Requirement**: REQ-INO-E01

### Scenario 1: Retrieve top INO terms successfully

```gherkin
Given the ino_host25 table contains interaction annotations
When a GET request is sent to /api/v1/ino/terms
Then the response status code is 200
And the response contains a "data" array of INO term objects
And each object includes "term", "sentence_count", and "gene_pair_count"
And the results are ordered by sentence_count descending
And the response includes a "total" field with the distinct term count
```

### Scenario 2: Retrieve terms with limit parameter

```gherkin
Given the ino_host25 table contains at least 100 distinct terms
When a GET request is sent to /api/v1/ino/terms?limit=10
Then the response contains exactly 10 items in the "data" array
```

### Scenario 3: Filter terms by prefix

```gherkin
Given the ino_host25 table contains terms starting with "phos"
When a GET request is sent to /api/v1/ino/terms?q=phos
Then all returned terms start with "phos" (case-insensitive)
```

### Scenario 4: Cached response

```gherkin
Given the Redis cache contains valid INO term data with TTL remaining
When a GET request is sent to /api/v1/ino/terms
Then the response is served from cache
And the response time is less than 200ms
```

---

## AC-INO-002: Gene Pairs for Specific INO Term

**Requirement**: REQ-INO-E02

### Scenario 1: Retrieve gene pairs for a valid INO term

```gherkin
Given the ino_host25 table contains annotations for "phosphorylation"
When a GET request is sent to /api/v1/ino/terms/phosphorylation/genes
Then the response status code is 200
And each item contains "gene1", "gene2", "pair_count", "unique_pmids", "max_score"
And the results are paginated with "total", "page", "per_page" fields
```

### Scenario 2: Pagination works correctly

```gherkin
Given "phosphorylation" has more than 50 gene pairs
When a GET request is sent to /api/v1/ino/terms/phosphorylation/genes?page=2&per_page=20
Then the response contains up to 20 items
And "page" equals 2
And "per_page" equals 20
```

### Scenario 3: Sort by unique_pmids ascending

```gherkin
Given "phosphorylation" has multiple gene pairs
When a GET request is sent to /api/v1/ino/terms/phosphorylation/genes?sort_by=unique_pmids&order=ASC
Then the results are ordered by unique_pmids ascending
```

### Scenario 4: Non-existent INO term returns empty results

```gherkin
Given "nonexistent_term_xyz" has no annotations
When a GET request is sent to /api/v1/ino/terms/nonexistent_term_xyz/genes
Then the response status code is 200
And the "data" array is empty
And "total" equals 0
```

---

## AC-INO-003: INO Term Detail View

**Requirement**: REQ-INO-E03

### Scenario 1: Display term detail information

```gherkin
Given the user navigates to /ignet/ino/phosphorylation
When the page loads
Then the page displays the term name "phosphorylation"
And the page displays the total sentence count
And the page displays the top 10 gene pairs by frequency
And each gene pair row shows gene1, gene2, pair count, and PMID count
```

### Scenario 2: Example sentences are shown

```gherkin
Given the user views the INO term detail for "phosphorylation"
When the page loads
Then up to 5 example sentences are displayed
And each sentence includes a clickable PMID link
And PMID links open the PubMed article in a new tab
```

---

## AC-INO-004: INO Filter on Gene Neighbors Page

**Requirement**: REQ-INO-E04

### Scenario 1: Filter neighbors by INO term via API

```gherkin
Given gene "TNF" has neighbors with various interaction types
When a GET request is sent to /api/v1/genes/TNF/neighbors?ino_term=inhibition
Then only neighbors connected via "inhibition" annotations are returned
And the count reflects filtered results, not total neighbors
```

### Scenario 2: Filter dropdown on Gene page UI

```gherkin
Given the user is on the Gene page for "TNF"
When the user selects "inhibition" from the INO term filter dropdown
Then the neighbor list updates to show only inhibition-type interactions
And a clear filter option is available to reset to all interaction types
```

### Scenario 3: No INO filter applied returns all neighbors

```gherkin
Given gene "TNF" has neighbors
When a GET request is sent to /api/v1/genes/TNF/neighbors (without ino_term)
Then all neighbors are returned regardless of interaction type
And the response structure is unchanged from the current behavior
```

---

## AC-INO-005: INO Filter on GenePair Page

**Requirement**: REQ-INO-E05

### Scenario 1: Filter pair evidence by INO term via API

```gherkin
Given the pair TNF-IL6 has evidence sentences with multiple interaction types
When a GET request is sent to /api/v1/pairs/TNF/IL6?ino_term=activation
Then only sentences annotated with "activation" are returned
```

### Scenario 2: Filter chips on GenePair page UI

```gherkin
Given the user is on the GenePair page for TNF-IL6
When the page loads
Then INO term filter chips appear above the evidence table
And clicking a chip filters the evidence to that interaction type
And clicking the active chip again removes the filter
```

---

## AC-INO-006: INO Term Cloud on Explore Page

**Requirement**: REQ-INO-E06

### Scenario 1: Term cloud renders on Explore page

```gherkin
Given the user navigates to the Explore page
When the page finishes loading
Then an INO term cloud is visible showing up to 50 interaction types
And more frequent terms appear in larger font sizes
And less frequent terms appear in smaller font sizes
```

### Scenario 2: Term cloud interaction

```gherkin
Given the term cloud is displayed on the Explore page
When the user clicks on "phosphorylation" in the term cloud
Then the user is navigated to /ignet/ino/phosphorylation
```

### Scenario 3: Term cloud loads asynchronously

```gherkin
Given the user navigates to the Explore page
When the page begins loading
Then the main Explore page content renders without waiting for the term cloud
And the term cloud area shows a loading placeholder until data arrives
```

---

## AC-INO-007: Redis Caching for INO Terms

**Requirement**: REQ-INO-S01

### Scenario 1: First request populates cache

```gherkin
Given no cached INO term data exists in Redis
When a GET request is sent to /api/v1/ino/terms
Then the database is queried for term aggregation
And the result is stored in Redis with a 24-hour TTL
And the response is returned to the client
```

### Scenario 2: Subsequent requests use cache

```gherkin
Given cached INO term data exists in Redis with valid TTL
When a GET request is sent to /api/v1/ino/terms
Then the database is NOT queried
And the cached result is returned
```

### Scenario 3: Cache miss after TTL expiry

```gherkin
Given cached INO term data existed but the 24-hour TTL has expired
When a GET request is sent to /api/v1/ino/terms
Then the database is queried again
And the new result replaces the expired cache entry
```

---

## Quality Gate Criteria

### Performance

- `GET /api/v1/ino/terms` (cached): < 200ms response time
- `GET /api/v1/ino/terms` (uncached): < 5s response time
- `GET /api/v1/ino/terms/<term>/genes`: < 2s response time
- INO term cloud render: < 1s after data arrives
- Gene/GenePair page with INO filter: No more than 500ms added latency vs. unfiltered

### Security

- All INO term inputs are sanitized against SQL injection
- No raw user input is interpolated into SQL strings
- INO endpoints follow the same authentication requirements as existing API endpoints

### Backwards Compatibility

- Existing `GET /api/v1/genes/<symbol>/neighbors` behavior is unchanged when `ino_term` is not provided
- Existing `GET /api/v1/pairs/<sym1>/<sym2>` behavior is unchanged when `ino_term` is not provided
- No breaking changes to existing API response structures

## Definition of Done

- [ ] All 3 new API endpoints are implemented and return correct responses
- [ ] `ino_term` filter is functional on both Gene neighbors and GenePair endpoints
- [ ] INO Explorer page renders term list and term detail views
- [ ] INO term cloud component renders on the Explore page
- [ ] Redis caching is active for term directory queries
- [ ] Database indexes on `ino_host25.sentence_id` and `matching_phrase` are verified
- [ ] All acceptance scenarios pass manual or automated testing
- [ ] No regression in existing Gene and GenePair page functionality
