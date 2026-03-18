---
id: SPEC-AI-001
type: plan
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
---

# Implementation Plan: SPEC-AI-001 — Smart Literature Assistant

## Overview

Build a natural language Q&A interface powered by RAG (Retrieval-Augmented Generation) that enables researchers to ask questions about gene interactions and receive evidence-grounded answers with PubMed citations. The system leverages the existing 15.8M sentence database and the BioSummarAI GPT-4o service.

## Milestone 1: RAG Pipeline Backend (Priority High)

### 1.1 Question Analysis Module

**Files to create:**
- `api/services/question_analyzer.py` — Gene symbol extraction and keyword parsing

**Implementation:**
- Load gene symbol set from `t_gene_info` into memory at startup (20K symbols + synonyms, ~2MB)
- Tokenize question into words
- Match tokens against symbol set (case-insensitive exact match)
- Resolve synonyms to canonical symbols using `Synonyms` column
- Extract remaining significant words as keywords (exclude common stop words)
- Detect context signals: "vaccine" triggers `hasVaccine` filter

### 1.2 Evidence Retrieval Module

**Files to create:**
- `api/services/evidence_retriever.py` — Database query and sentence retrieval

**Implementation:**
- Build dynamic SQL based on extracted genes and keywords:
  - Gene filter: `(geneSymbol1 IN (%s,...) OR geneSymbol2 IN (%s,...))`
  - Keyword filter: `MATCH(sentence) AGAINST (%s IN BOOLEAN MODE)` (if keywords present)
  - Vaccine filter: `hasVaccine = 1` (if triggered)
- Retrieve up to 200 candidate sentences with: `sentenceID`, `geneSymbol1`, `geneSymbol2`, `PMID`, `sentence`, `score`, `hasVaccine`
- Rank candidates by composite score:
  - Gene relevance: 2.0 if both query genes match, 1.0 if one matches
  - Keyword overlap: Count of query keywords appearing in sentence / total keywords
  - Database score: Normalized `score` column value
  - Composite = (gene_relevance * 3) + (keyword_overlap * 2) + (db_score * 1)
- Return top 50 sentences sorted by composite score

### 1.3 Prompt Construction and GPT-4o Integration

**Files to create:**
- `api/services/rag_prompt_builder.py` — Constructs the GPT-4o prompt with evidence context

**Implementation:**
- System prompt: Instruct GPT-4o to answer using only provided evidence, cite PMIDs in `[PMID:...]` format
- Evidence block: Format top 50 sentences as numbered list with PMID tags
- Token budget: ~4000 tokens for evidence, ~500 for system prompt, ~500 for question + history
- Pass to BioSummarAI service via existing proxy pattern

### 1.4 Response Processing

**Files to create:**
- `api/services/response_processor.py` — Parse and validate GPT-4o response

**Implementation:**
- Extract `[PMID:...]` citations from response text using regex
- Validate each cited PMID against the evidence set sent to GPT-4o
- Remove fabricated citations (PMIDs not in evidence set)
- Structure response: `answer`, `citations` (with full sentence details), `genes_identified`, `evidence_count`, `confidence`

### 1.5 API Endpoint

**Files to create:**
- `api/routes/assistant.py` — New blueprint with `POST /api/v1/assistant/ask`

**Files to modify:**
- `api/routes/__init__.py` or main app file — Register `assistant_bp` blueprint

**Implementation:**
- Validate request: `question` required, max 1000 chars; `conversation_history` optional, max 20 messages
- Call question_analyzer -> evidence_retriever -> rag_prompt_builder -> BioSummarAI service -> response_processor
- Reuse `_get_user_openai_key()` from `llm.py` for BYOK support
- Return structured JSON response

### Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gene symbol extraction misses aliases | Poor evidence retrieval | Pre-load Synonyms column; use fuzzy matching for unresolved terms |
| 15.8M row query too slow | High latency | Use MATCH...AGAINST full-text index; limit to 200 candidates |
| GPT-4o fabricates PMIDs | Scientific credibility loss | Post-process validation against evidence set; strip invalid citations |
| BioSummarAI service timeout | User frustration | 120s timeout with clear error message; retry once |
| Token limit exceeded | Truncated response | Cap at 50 sentences; estimate tokens before sending |

---

## Milestone 2: Frontend Chat Interface (Priority High)

### 2.1 Assistant Page

**Files to create:**
- `frontend/src/pages/Assistant.jsx` — Chat interface page

**Features:**
- Message list: Scrollable container with user/assistant message bubbles
- User messages: Right-aligned, simple text
- Assistant messages: Left-aligned, Markdown-rendered answer with citation badges
- Loading state: Typing indicator animation during API call (5-15s expected)
- Error handling: Display error messages inline in the chat

### 2.2 Evidence Panel Component

**Files to create:**
- `frontend/src/components/EvidencePanel.jsx` — Expandable evidence sources

**Features:**
- Collapsible panel below each assistant message
- Lists cited sentences grouped by PMID
- Each entry: PMID (link to `https://pubmed.ncbi.nlm.nih.gov/{pmid}`), gene pair, score bar, sentence text
- Click a citation badge in the answer to scroll/highlight the corresponding evidence

### 2.3 Route Registration

**Files to modify:**
- `frontend/src/App.jsx` — Add route for `/ignet/assistant`
- `frontend/src/components/Header.jsx` — Add "Assistant" navigation link

### Technical Approach

- Conversation state in `useState` with `sessionStorage` persistence
- Use `fetch` with AbortController for cancellable requests
- Markdown rendering: Use a lightweight Markdown renderer (or the existing one if already in the project)
- Citation badges: Render `[PMID:12345678]` as styled, clickable spans

---

## Milestone 3: Rate Limiting and Security (Priority Medium)

### 3.1 Rate Limiting for Unauthenticated Users

**Files to modify:**
- `api/routes/assistant.py` — Add rate limiting logic

**Implementation:**
- Use Redis to track request counts per IP: `ignet:assistant:ratelimit:{ip}`
- Limit: 10 requests per hour for unauthenticated users
- Authenticated users: No rate limit (controlled by BYOK key costs)
- Return `429 Too Many Requests` with `Retry-After` header when limit exceeded

### 3.2 Input Validation

- Question: Max 1000 characters, strip HTML tags, sanitize against injection
- Conversation history: Max 20 messages, each max 2000 characters
- Gene symbols in extracted results: Pass through `sanitize_gene_symbol()` utility

---

## Milestone 4: Entity Enrichment (Priority Low)

### 4.1 Enrich Responses with biosummary25_Host Data

**Files to modify:**
- `api/routes/assistant.py` or `api/services/response_processor.py`

**Implementation:**
- After retrieving evidence PMIDs, query `biosummary25_Host` for related entities
- Append `entities.drugs`, `entities.diseases`, `entities.genes` to the response
- Reuse the enrichment pattern from the existing `/summarize` endpoint in `llm.py`

---

## Architecture Design Direction

```
User Question
     |
     v
[Question Analyzer] --> Extract gene symbols + keywords
     |
     v
[Evidence Retriever] --> Query t_sentence_hit_gene2gene_Host
     |                   (15.8M rows, full-text + gene filters)
     |                   --> Rank and select top 50 sentences
     v
[RAG Prompt Builder] --> Construct system prompt + evidence + question
     |
     v
[BioSummarAI Service] --> GPT-4o API call (port 9636)
     |
     v
[Response Processor] --> Validate citations, structure response
     |
     v
[POST /api/v1/assistant/ask] --> Return answer + citations + metadata
     |
     v
[Frontend Chat UI] --> Render Markdown answer + evidence panel
```

## File Change Summary

| Action | File | Description |
|--------|------|-------------|
| CREATE | `api/services/question_analyzer.py` | Gene/keyword extraction from questions |
| CREATE | `api/services/evidence_retriever.py` | Database evidence retrieval and ranking |
| CREATE | `api/services/rag_prompt_builder.py` | GPT-4o prompt construction |
| CREATE | `api/services/response_processor.py` | Response parsing and citation validation |
| CREATE | `api/routes/assistant.py` | New assistant API endpoint |
| CREATE | `frontend/src/pages/Assistant.jsx` | Chat interface page |
| CREATE | `frontend/src/components/EvidencePanel.jsx` | Evidence sources panel |
| MODIFY | `api/routes/__init__.py` or app registration | Register `assistant_bp` |
| MODIFY | `frontend/src/App.jsx` | Add assistant route |
| MODIFY | `frontend/src/components/Header.jsx` | Add navigation link |

## Dependencies

- Existing BioSummarAI service at port 9636 (GPT-4o integration)
- Existing BYOK key infrastructure in `llm.py`
- Redis for rate limiting
- Full-text index on `t_sentence_hit_gene2gene_Host.sentence` (verify existence)
- `api/services/` directory may need to be created
