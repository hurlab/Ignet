---
id: SPEC-AI-001
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
author: "MoAI"
priority: high
issue_number: 0
---

# SPEC-AI-001: Smart Literature Assistant

## 1. Environment

- **Platform**: Ignet 2.0 — React 19 SPA + Flask REST API + MariaDB
- **Key Tables**:
  - `t_sentence_hit_gene2gene_Host` (15.8M rows): `geneSymbol1`, `geneSymbol2`, `PMID`, `sentenceID`, `sentence`, `score`, `hasVaccine` — primary evidence source
  - `t_gene_info` (~20K rows): `GeneID`, `Symbol`, `Synonyms`, `description`, `tax_id` — for gene symbol resolution
  - `biosummary25_Host` (~500K rows): `pmid`, `gene_symbols`, `drug_term`, `hdo_term` — entity enrichment
  - `ino_host25` (~7.3M rows): `sentence_id`, `matching_phrase` — interaction type context
- **Existing Services**:
  - BioSummarAI service at port 9636: GPT-4o integration for summarization with conversation history support
  - Existing `POST /api/v1/summarize` and `POST /api/v1/chat` endpoints proxy to BioSummarAI
  - BYOK (Bring Your Own Key) pattern for OpenAI API keys already implemented in `llm.py`
- **Existing Pages**: BioSummarAI page exists for gene-based summarization; no natural language Q&A interface exists

## 2. Assumptions

- The BioSummarAI service at port 9636 can accept a system prompt with evidence sentences and return a structured answer with citation references. The existing `/biobert/` endpoint or a new endpoint on the service can handle the RAG prompt format.
- Gene symbol extraction from natural language questions can be performed by matching against `t_gene_info.Symbol` and `t_gene_info.Synonyms`; no NLP model is needed for gene NER in the question (the existing BioBERT service can optionally enhance this).
- The `sentence` column in `t_sentence_hit_gene2gene_Host` contains sufficient text for GPT-4o to synthesize meaningful answers (sentences are extracted from PubMed abstracts).
- Full-text search on the `sentence` column (MATCH...AGAINST) is available or can be enabled for keyword-based retrieval.
- Conversation history is maintained client-side and sent with each request; the backend is stateless.
- The top 50 most relevant sentences provide sufficient context for GPT-4o without exceeding token limits (~4000 tokens of evidence context per query).

## 3. Requirements

### 3.1 Ubiquitous Requirements

- **[REQ-AI-U01]** The system shall ground all AI-generated answers in actual PubMed evidence: every factual claim in the response shall reference at least one PMID.
- **[REQ-AI-U02]** The system shall clearly distinguish between AI-synthesized text and direct evidence citations in the response.
- **[REQ-AI-U03]** The system shall enforce a maximum question length of 1000 characters.
- **[REQ-AI-U04]** The system shall enforce a maximum conversation history of 20 messages to prevent context window overflow.
- **[REQ-AI-U05]** The system shall use the BYOK OpenAI key pattern for authenticated users, falling back to the platform key for unauthenticated users.

### 3.2 Event-Driven Requirements

- **[REQ-AI-E01]** When a user submits a natural language question about gene interactions, the system shall:
  1. Extract gene symbols and keywords from the question
  2. Query `t_sentence_hit_gene2gene_Host` for relevant evidence sentences
  3. Rank and select the top 50 most relevant sentences
  4. Construct a GPT-4o prompt with the sentences as grounding context
  5. Return the AI answer with cited PMIDs and source sentences
- **[REQ-AI-E02]** When the user asks a follow-up question, the system shall include conversation history in the GPT-4o prompt to maintain context continuity.
- **[REQ-AI-E03]** When the user clicks a PMID citation in the AI response, the system shall display the full evidence sentence, gene pair, and score in an expandable panel.
- **[REQ-AI-E04]** When the user asks a question mentioning a gene not found in `t_gene_info`, the system shall notify the user that the gene was not recognized and suggest similar gene symbols.
- **[REQ-AI-E05]** When the RAG pipeline retrieves fewer than 5 relevant sentences, the system shall inform the user that limited evidence was found and the answer may be incomplete.
- **[REQ-AI-E06]** When the BioSummarAI service is unavailable, the system shall return a clear error message without exposing internal service details.

### 3.3 State-Driven Requirements

- **[REQ-AI-S01]** While the user has an active conversation (conversation_history is non-empty), the system shall maintain conversational context for follow-up questions.
- **[REQ-AI-S02]** While the user is not authenticated, the system shall use the platform OpenAI API key with rate limiting (max 10 queries per hour per IP).

### 3.4 Unwanted Behavior Requirements

- **[REQ-AI-N01]** The system shall not return AI-generated text without at least one supporting PMID reference.
- **[REQ-AI-N02]** The system shall not send more than 50 evidence sentences to GPT-4o per query to control costs and latency.
- **[REQ-AI-N03]** The system shall not expose raw OpenAI API errors to the user.
- **[REQ-AI-N04]** The system shall not fabricate PMIDs or citations not present in the database.

### 3.5 Optional Requirements

- **[REQ-AI-O01]** Where feasible, the system shall highlight which parts of the AI response correspond to which evidence sentences (citation mapping).
- **[REQ-AI-O02]** Where feasible, the system shall provide a "Related Questions" section suggesting follow-up queries based on the evidence retrieved.

## 4. Specifications

### 4.1 Backend API Specifications

#### New Endpoint

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/assistant/ask` | Submit a question, receive RAG-grounded AI response |

#### `POST /api/v1/assistant/ask`

**Request Body**:
```json
{
  "question": "What is the role of TNF in vaccine adjuvants?",
  "conversation_history": [
    {"role": "user", "content": "Tell me about TNF interactions"},
    {"role": "assistant", "content": "TNF (Tumor Necrosis Factor)..."}
  ]
}
```

**Response Body**:
```json
{
  "answer": "TNF plays a significant role in vaccine adjuvant activity...",
  "citations": [
    {
      "pmid": 12345678,
      "sentence": "TNF-alpha enhances the adjuvant effect of...",
      "gene1": "TNF",
      "gene2": "IL6",
      "score": 0.89
    }
  ],
  "genes_identified": ["TNF"],
  "evidence_count": 42,
  "confidence": "high"
}
```

**Confidence Levels**:
- `high`: 20+ relevant sentences found
- `medium`: 5-19 relevant sentences found
- `low`: fewer than 5 relevant sentences found

### 4.2 RAG Pipeline Specification

The RAG (Retrieval-Augmented Generation) pipeline operates in 5 stages:

**Stage 1: Question Analysis**
- Extract gene symbols by matching words against `t_gene_info.Symbol` and `t_gene_info.Synonyms`
- Extract contextual keywords (remaining significant words after removing stop words and gene symbols)
- Resolve gene aliases using `Synonyms` column

**Stage 2: Evidence Retrieval**
- Primary query: Match on extracted gene symbols in `geneSymbol1`/`geneSymbol2`
- Secondary filter: Apply keyword MATCH...AGAINST on `sentence` column if keywords are present
- Context filter: If question mentions "vaccine", add `hasVaccine = 1` filter
- Limit: Retrieve up to 200 candidate sentences

**Stage 3: Relevance Ranking**
- Score each candidate sentence by:
  - Gene match score (both genes mentioned = 2.0, one gene = 1.0)
  - Keyword overlap score (count of question keywords found in sentence)
  - Database score (`score` column value)
  - Recency bonus (higher PMID numbers indicate newer publications)
- Select top 50 sentences by composite score

**Stage 4: Prompt Construction**
- System prompt: "You are a biomedical research assistant. Answer the question using ONLY the provided evidence sentences. Cite PMIDs in square brackets [PMID:12345678] for every claim."
- Evidence block: Numbered list of top 50 sentences with PMIDs
- User question: The original question
- Conversation history: Prior messages (if follow-up)

**Stage 5: Response Processing**
- Parse GPT-4o response for PMID citations
- Validate cited PMIDs against the evidence sentences sent
- Remove any fabricated citations not in the evidence set
- Structure response with answer text, validated citations, and metadata

### 4.3 Frontend Specifications

#### New Page: Assistant (`/ignet/assistant`)

**Layout**:
- Chat interface with message history (left/right aligned bubbles)
- Each assistant message includes:
  - AI answer rendered as Markdown
  - Citation badges: Clickable `[PMID:12345678]` links
  - Expandable "Evidence Sources" panel below the answer
- Input area: Text input with submit button and character counter (max 1000)
- Conversation controls: "New Conversation" button to clear history

**Evidence Sources Panel**:
- Collapsible section below each AI response
- Lists all cited sentences with: PMID (linked to PubMed), gene pair, score, full sentence text
- Grouped by PMID for readability

**Conversation State**:
- Maintained in React state (useState or context)
- Sent as `conversation_history` with each request
- Cleared on "New Conversation" action
- Persisted to sessionStorage for tab refresh resilience

### 4.4 Integration with Existing Services

- The RAG pipeline calls the existing BioSummarAI service endpoint with a modified prompt format
- The existing BYOK key resolution in `llm.py` (`_get_user_openai_key()`) is reused
- The existing entity enrichment pattern from `/summarize` (drugs, diseases, genes from `biosummary25_Host`) can optionally enrich the assistant response

## 5. Constraints

- GPT-4o API call latency: expect 5-15 seconds per response; the UI must show a loading state
- Evidence retrieval from 15.8M row table must complete within 3 seconds
- Maximum 50 sentences sent to GPT-4o (approximately 4000 tokens of evidence context)
- Rate limiting for unauthenticated users: 10 queries/hour/IP
- All responses must include at least one PMID citation (hard requirement for scientific credibility)

## 6. Traceability

| Requirement | Plan Reference | Acceptance Reference |
|-------------|---------------|---------------------|
| REQ-AI-E01 | Milestone 1: RAG Pipeline | AC-AI-001 |
| REQ-AI-E02 | Milestone 1: RAG Pipeline | AC-AI-002 |
| REQ-AI-E03 | Milestone 2: Frontend Chat | AC-AI-003 |
| REQ-AI-E04 | Milestone 1: RAG Pipeline | AC-AI-004 |
| REQ-AI-E05 | Milestone 1: RAG Pipeline | AC-AI-005 |
| REQ-AI-U01 | Milestone 1: RAG Pipeline | AC-AI-006 |
| REQ-AI-S02 | Milestone 3: Rate Limiting | AC-AI-007 |
