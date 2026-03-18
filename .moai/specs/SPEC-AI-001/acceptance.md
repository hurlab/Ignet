---
id: SPEC-AI-001
type: acceptance
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
---

# Acceptance Criteria: SPEC-AI-001 — Smart Literature Assistant

## AC-AI-001: RAG Pipeline — Question to Evidence-Grounded Answer

**Requirement**: REQ-AI-E01

### Scenario 1: Successful question answering with gene identification

```gherkin
Given the database contains evidence sentences for gene "TNF"
When a POST request is sent to /api/v1/assistant/ask with:
  | question | "What is the role of TNF in vaccine adjuvants?" |
Then the response status code is 200
And "genes_identified" contains "TNF"
And "answer" is a non-empty string
And "citations" is a non-empty array
And each citation contains "pmid", "sentence", "gene1", "gene2", "score"
And every PMID in "citations" exists in the database
And "evidence_count" is greater than 0
```

### Scenario 2: Multi-gene question

```gherkin
Given the database contains interactions between "TNF" and "IL6"
When a POST request is sent to /api/v1/assistant/ask with:
  | question | "How do TNF and IL6 interact in inflammation?" |
Then "genes_identified" contains both "TNF" and "IL6"
And the citations include sentences mentioning both genes
```

### Scenario 3: Question with keyword context

```gherkin
Given the database contains vaccine-related sentences for "TNF"
When a POST request is sent to /api/v1/assistant/ask with:
  | question | "What is the role of TNF in vaccine adjuvants?" |
Then the evidence retrieval prioritizes sentences with hasVaccine = 1
And the answer references vaccine-related evidence
```

### Scenario 4: Confidence levels

```gherkin
Given the database contains 30+ relevant sentences for the query
When a POST request is sent to /api/v1/assistant/ask
Then "confidence" equals "high"

Given the database contains 8 relevant sentences for the query
When a POST request is sent to /api/v1/assistant/ask
Then "confidence" equals "medium"

Given the database contains 3 relevant sentences for the query
When a POST request is sent to /api/v1/assistant/ask
Then "confidence" equals "low"
```

---

## AC-AI-002: Follow-up Questions with Conversation History

**Requirement**: REQ-AI-E02

### Scenario 1: Successful follow-up

```gherkin
Given the user previously asked about "TNF in vaccine adjuvants"
When a POST request is sent to /api/v1/assistant/ask with:
  | question              | "What about its interaction with IL6?"            |
  | conversation_history  | [previous messages including TNF discussion]      |
Then the response references the prior context about TNF
And the answer addresses the TNF-IL6 interaction specifically
```

### Scenario 2: Conversation history limit

```gherkin
Given the conversation_history contains 21 messages
When a POST request is sent to /api/v1/assistant/ask
Then the response status code is 400
And the error message indicates conversation history exceeds the 20-message limit
```

---

## AC-AI-003: PMID Citation Interaction

**Requirement**: REQ-AI-E03

### Scenario 1: Click PMID to see evidence

```gherkin
Given the assistant response contains a citation [PMID:12345678]
When the user clicks on the PMID citation badge
Then an evidence panel expands below the answer
And the panel shows the full sentence for PMID 12345678
And the panel shows the gene pair and interaction score
And the PMID links to https://pubmed.ncbi.nlm.nih.gov/12345678
```

### Scenario 2: Multiple citations are browsable

```gherkin
Given the assistant response contains 5 PMID citations
When the user expands the evidence panel
Then all 5 cited sentences are listed
And sentences are grouped by PMID
And each entry shows the full sentence text, gene pair, and score
```

---

## AC-AI-004: Unrecognized Gene Handling

**Requirement**: REQ-AI-E04

### Scenario 1: Unknown gene symbol

```gherkin
Given "FAKEGENE" does not exist in t_gene_info
When a POST request is sent to /api/v1/assistant/ask with:
  | question | "What does FAKEGENE do?" |
Then the response includes a message that "FAKEGENE" was not recognized
And "genes_identified" is an empty array
And the system suggests similar gene symbols if partial matches exist
```

### Scenario 2: Partially recognized question

```gherkin
Given "TNF" exists but "UNKNOWNGENE" does not
When a POST request is sent to /api/v1/assistant/ask with:
  | question | "How do TNF and UNKNOWNGENE interact?" |
Then "genes_identified" contains "TNF"
And the response notes that "UNKNOWNGENE" was not recognized
And the answer is based on evidence for TNF alone
```

---

## AC-AI-005: Low Evidence Warning

**Requirement**: REQ-AI-E05

### Scenario 1: Fewer than 5 relevant sentences

```gherkin
Given a query matches only 3 sentences in the database
When a POST request is sent to /api/v1/assistant/ask
Then "confidence" equals "low"
And the answer includes a caveat that limited evidence was found
And "evidence_count" equals 3
```

---

## AC-AI-006: Evidence Grounding Enforcement

**Requirement**: REQ-AI-U01

### Scenario 1: All claims have citations

```gherkin
Given a successful assistant response is returned
When the response "answer" text is analyzed
Then every factual claim is followed by a [PMID:...] citation
And every cited PMID exists in the "citations" array
And every PMID in the "citations" array exists in the evidence database
```

### Scenario 2: Fabricated PMIDs are removed

```gherkin
Given GPT-4o returns a response citing PMID 99999999 (not in evidence set)
When the response processor validates citations
Then PMID 99999999 is removed from the final response
And only PMIDs from the evidence retrieval set are included
```

---

## AC-AI-007: Rate Limiting for Unauthenticated Users

**Requirement**: REQ-AI-S02

### Scenario 1: Under rate limit

```gherkin
Given an unauthenticated user has made 5 requests this hour
When a POST request is sent to /api/v1/assistant/ask
Then the response status code is 200
And the request is processed normally
```

### Scenario 2: Rate limit exceeded

```gherkin
Given an unauthenticated user has made 10 requests this hour
When a POST request is sent to /api/v1/assistant/ask
Then the response status code is 429
And the response contains "Retry-After" header
And the error message indicates rate limit exceeded
```

### Scenario 3: Authenticated users bypass rate limit

```gherkin
Given an authenticated user with a valid BYOK key has made 20 requests this hour
When a POST request is sent to /api/v1/assistant/ask with valid auth token
Then the response status code is 200
And the request is processed normally
```

---

## AC-AI-008: Input Validation

**Requirement**: REQ-AI-U03, REQ-AI-U04

### Scenario 1: Question too long

```gherkin
Given a question exceeds 1000 characters
When a POST request is sent to /api/v1/assistant/ask
Then the response status code is 400
And the error message indicates the question exceeds the character limit
```

### Scenario 2: Empty question

```gherkin
Given the question field is empty or missing
When a POST request is sent to /api/v1/assistant/ask
Then the response status code is 400
And the error message indicates the question is required
```

### Scenario 3: Invalid JSON body

```gherkin
Given the request body is not valid JSON
When a POST request is sent to /api/v1/assistant/ask
Then the response status code is 400
And the error follows the standard error format
```

---

## AC-AI-009: Service Unavailability

**Requirement**: REQ-AI-E06

### Scenario 1: BioSummarAI service timeout

```gherkin
Given the BioSummarAI service does not respond within 120 seconds
When a POST request is sent to /api/v1/assistant/ask
Then the response status code is 504
And the error message indicates the AI service timed out
And no internal service details are exposed
```

### Scenario 2: BioSummarAI service unreachable

```gherkin
Given the BioSummarAI service at port 9636 is not running
When a POST request is sent to /api/v1/assistant/ask
Then the response status code is 503
And the error message indicates the AI service is unavailable
```

---

## Quality Gate Criteria

### Performance

- Evidence retrieval from database: < 3 seconds
- Total end-to-end response time: < 20 seconds (including GPT-4o latency)
- Frontend chat message rendering: < 500ms after response received
- Evidence panel expansion: < 200ms

### Security

- All user inputs sanitized against SQL injection
- Conversation history validated for size limits
- No raw OpenAI API errors or keys exposed in responses
- BYOK keys are never logged or stored in plaintext responses
- Rate limiting enforced for unauthenticated users

### Scientific Integrity

- Every PMID citation in the response is validated against the evidence database
- Fabricated PMIDs are removed before returning to the user
- Low-evidence responses are clearly labeled
- No AI hallucination passes through without evidence grounding

### Backwards Compatibility

- Existing `/api/v1/summarize` and `/api/v1/chat` endpoints are unchanged
- Existing BioSummarAI page functionality is not affected
- No changes to existing authentication flow

## Definition of Done

- [ ] RAG pipeline correctly extracts genes, retrieves evidence, and constructs prompts
- [ ] `POST /api/v1/assistant/ask` returns evidence-grounded answers with validated PMIDs
- [ ] Follow-up questions maintain conversation context
- [ ] Frontend chat interface renders messages, citations, and evidence panel
- [ ] Rate limiting enforced for unauthenticated users (10/hour/IP)
- [ ] All cited PMIDs are validated against the evidence database
- [ ] Input validation rejects oversized questions and conversation histories
- [ ] BioSummarAI service errors are handled gracefully
- [ ] All acceptance scenarios pass manual or automated testing
