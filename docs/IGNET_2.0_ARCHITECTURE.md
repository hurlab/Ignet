# Ignet 2.0 — System Architecture & Vision Document

**Version:** 1.0
**Date:** 2026-03-15
**Author:** Claude Opus 4.6 (Senior System Architect) + Junguk Hur (PI)
**Status:** Draft for Review

---

## Table of Contents

1. [Vision & Mission](#1-vision--mission)
2. [Current State Assessment](#2-current-state-assessment)
3. [System Architecture Overview](#3-system-architecture-overview)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Data Pipeline & Ingestion](#6-data-pipeline--ingestion)
7. [Database Architecture & Performance](#7-database-architecture--performance)
8. [Core Feature: Dignet 2.0 (Dynamic Ignet)](#8-core-feature-dignet-20-dynamic-ignet)
9. [User-Supplied Text Analysis](#9-user-supplied-text-analysis)
10. [LLM Integration Strategy](#10-llm-integration-strategy)
11. [Ontology Framework](#11-ontology-framework)
12. [Entity Extraction & Relation Mining](#12-entity-extraction--relation-mining)
13. [User Management & Access Control](#13-user-management--access-control)
14. [Usage Tracking & Analytics](#14-usage-tracking--analytics)
15. [Vignet: Vaccine Ignet (Sister Platform)](#15-vignet-vaccine-ignet-sister-platform)
16. [Frontend Modernization Plan](#16-frontend-modernization-plan)
17. [Backend Modernization Plan](#17-backend-modernization-plan)
18. [Implementation Roadmap](#18-implementation-roadmap)
19. [Risk Assessment](#19-risk-assessment)

---

## 1. Vision & Mission

### Vision

Ignet 2.0 will be the premier open-access platform for biomedical literature-driven interaction network discovery, enabling researchers worldwide to explore, construct, and interpret context-specific gene/protein interaction networks using the full breadth of PubMed and PMC Open Access literature — augmented by AI-powered interpretation, ontology-grounded entity extraction, and user-contributed data.

### Mission

- **Democratize biomedical network analysis** — No bioinformatics expertise required
- **Bridge literature and discovery** — Transform unstructured text into structured, queryable interaction networks
- **Enable context-specific research** — Users define their biological context; Ignet builds the network
- **AI-augmented interpretation** — LLMs summarize, interpret, and suggest hypotheses from network data
- **Community-driven expansion** — Users contribute texts, validate interactions, and extend the knowledge base

### Key Differentiators from Existing Tools

| Feature | STRING | GeneMANIA | PubTator | **Ignet 2.0** |
|---------|--------|-----------|----------|---------------|
| Literature-derived networks | Partial | No | No | **Full (PubMed + PMC OA)** |
| Dynamic context-specific networks | No | No | No | **Yes (Dignet)** |
| User-supplied text analysis | No | No | Partial | **Full pipeline** |
| Ontology-grounded extraction | No | No | Partial | **Deep (INO, VO, HDO, OAE)** |
| AI-powered interpretation | No | No | No | **GPT-4o + fine-tuned models** |
| Vaccine-specific sister platform | No | No | No | **Vignet** |
| Two baseline corpora | N/A | N/A | N/A | **PubMed abstracts + PMC OA full-text** |

### Target User Communities

1. **Biomedical researchers** — Gene function, pathway discovery, hypothesis generation
2. **Immunologists & vaccinologists** — Vaccine target identification, adjuvant discovery (via Vignet)
3. **Computational biologists** — Network analysis, data integration, benchmarking
4. **Drug discovery scientists** — Drug-gene-disease relationship mining
5. **Ontology researchers** — Ontology-informed entity extraction and relation validation
6. **Students & educators** — Literature-based learning and exploration

---

## 2. Current State Assessment

### What Works Well (Ignet 1.x)

- **Dignet** — Dynamic PubMed-driven network construction via E-utilities
- **Gene/GenePair modules** — Robust querying of pre-mined interaction data
- **BioSummarAI** — GPT-4o powered summarization with chat interface
- **SciMiner pipeline** — 5-filter parallel mining (Host genes, VO, INO, HDO, DrugBank)
- **Ontology integration** — INO interaction terms, VO vaccine terms, HDO disease terms
- **Centrality analysis** — Degree, betweenness, closeness, eigenvector, LexRank
- **BioBERT scoring** — ML-based interaction confidence prediction

### Current Limitations

| Area | Limitation | Impact |
|------|-----------|--------|
| **Data scope** | PubMed abstracts only | Misses full-text evidence in 8M+ PMC OA articles |
| **Entity extraction** | Dictionary-based matching | Misses novel entities, aliases, abbreviations |
| **Relation extraction** | Co-occurrence + keyword-based | High false-positive rate; limited relation typing |
| **Frontend** | 2008-era design (table layouts, Dreamweaver templates) | Poor usability, no mobile support |
| **Database** | No query optimization, no indexing strategy | Slow on large result sets |
| **User management** | No user accounts | No personalization, no saved queries |
| **API** | No public API | Cannot integrate with external tools |
| **Deployment** | Manual service management | No containerization, no CI/CD |
| **Data updates** | Semi-automated pipeline | Not yet running daily in production |

---

## 3. System Architecture Overview

### High-Level Architecture (Ignet 2.0)

```
                                    +-----------------------+
                                    |    CDN / Cloudflare   |
                                    +-----------+-----------+
                                                |
                                    +-----------v-----------+
                                    |   Nginx Reverse Proxy  |
                                    |   (SSL, rate limiting) |
                                    +-----------+-----------+
                                                |
                     +------------------+-------+--------+------------------+
                     |                  |                |                  |
          +----------v--------+ +------v------+ +-------v-------+ +-------v-------+
          | Frontend (SPA)    | | REST API    | | WebSocket     | | Admin Panel   |
          | React + Cytoscape | | Flask/Fast  | | (Live updates)| | (Dashboard)   |
          +-------------------+ +------+------+ +-------+-------+ +---------------+
                                       |                |
                              +--------v--------+       |
                              |  Service Layer   |<------+
                              |  (Python 3.12)   |
                              +--------+---------+
                                       |
           +-------------+-------------+-------------+-------------+
           |             |             |             |             |
    +------v-----+ +----v-----+ +----v------+ +----v-----+ +----v------+
    | Network    | | Entity   | | LLM       | | Ontology | | User      |
    | Analysis   | | Extract  | | Service   | | Service  | | Service   |
    | Service    | | Service  | | (GPT-4o + | | (INO,VO, | | (Auth,    |
    | (NetworkX) | | (PubTator| | Llama 3.2)| | HDO,OAE) | | Profiles) |
    +------+-----+ | +NER)    | +----+------+ +----+-----+ +----+------+
           |       +----+-----+      |             |             |
           |            |            |             |             |
           +------------+------------+-------------+-------------+
                                       |
                              +--------v---------+
                              |   Data Layer      |
                              | MySQL + Redis     |
                              | (Read replicas)   |
                              +--------+---------+
                                       |
                              +--------v---------+
                              | Data Pipeline     |
                              | (IgnetSciMiner)   |
                              | Cron: daily       |
                              +-------------------+
                                       |
                        +--------------+---------------+
                        |                              |
               +--------v--------+           +---------v--------+
               | PubMed Abstracts|           | PMC Open Access  |
               | (36M+ articles) |           | (8M+ full-text)  |
               +-----------------+           +------------------+
```

### Technology Stack (Ignet 2.0)

| Layer | Current (1.x) | Target (2.0) | Rationale |
|-------|--------------|--------------|-----------|
| **Frontend** | PHP templates, jQuery, Dojo, table layouts | React 18 + Tailwind CSS + Cytoscape.js | Modern SPA, responsive, accessible |
| **API** | PHP (embedded in pages) | Python Flask/FastAPI REST API | Unified, testable, documented API |
| **Backend services** | PHP + 2 Python services | Python microservices (Flask + Waitress) | Consistent stack, easier to maintain |
| **Database** | MySQL (single instance, no optimization) | MySQL with read replicas + Redis cache | Performance at scale |
| **Search** | SQL MATCH/AGAINST | Elasticsearch (optional) | Full-text search at scale |
| **Pipeline** | IgnetSciMiner (Perl/Python/Shell) | IgnetSciMiner + PubTator API + PMC pipeline | Dual-corpus, enhanced NER |
| **LLM** | GPT-4o only | GPT-4o + Llama 3.2 (fine-tuned) | Cost reduction + domain specialization |
| **Deployment** | Manual Apache + systemd | Docker Compose + Nginx | Reproducible, portable |
| **Monitoring** | None | Prometheus + Grafana | Observability |

---

## 4. Backend Architecture

### 4.1 API Layer (New)

Create a unified REST API that all frontends (web, mobile, third-party) consume.

**Endpoints (draft):**

```
# Network Operations
POST   /api/v1/network/search          # Keyword-based PubMed network search
POST   /api/v1/network/build           # Build network from PMIDs or text
GET    /api/v1/network/{id}            # Retrieve cached network
GET    /api/v1/network/{id}/centrality # Centrality scores
GET    /api/v1/network/{id}/export     # Export (GraphML, CSV, JSON)

# Gene Operations
GET    /api/v1/genes                   # List all genes
GET    /api/v1/genes/{symbol}          # Gene details + neighbors
GET    /api/v1/genes/{sym1}/pairs/{sym2}  # Gene pair interactions

# Entity Extraction
POST   /api/v1/extract                 # Extract entities from user text
POST   /api/v1/extract/expand          # Expand with Ignet context data

# LLM Operations
POST   /api/v1/summarize               # Summarize sentences/network
POST   /api/v1/chat                    # Chat about results
POST   /api/v1/interpret               # Interpret network structure

# Ontology
GET    /api/v1/ontology/ino/{term}     # INO term details
GET    /api/v1/ontology/vo/{term}      # VO term details
GET    /api/v1/ontology/hdo/{term}     # HDO term details

# User Operations
POST   /api/v1/auth/login              # Authentication
POST   /api/v1/auth/register           # Registration
GET    /api/v1/user/queries            # Saved queries
POST   /api/v1/user/queries            # Save a query
GET    /api/v1/user/networks           # Saved networks

# Admin
GET    /api/v1/admin/stats             # Usage statistics
GET    /api/v1/admin/pipeline          # Pipeline status
POST   /api/v1/admin/pipeline/trigger  # Manual pipeline run
```

### 4.2 Service Architecture

```
services/
  api_gateway.py          # Flask app, route registration, auth middleware
  network_service.py      # Network construction, centrality, export
  entity_service.py       # Entity extraction (PubTator + local NER)
  llm_service.py          # LLM routing (GPT-4o, Llama 3.2)
  ontology_service.py     # Ontology lookup, term expansion
  user_service.py         # Auth, profiles, saved queries
  pipeline_service.py     # IgnetSciMiner status, trigger
  cache_service.py        # Redis caching layer
```

### 4.3 Background Task Processing

Use **Celery** with Redis as broker for long-running tasks:
- PubMed searches (can take 30+ seconds)
- Network construction from large datasets
- LLM summarization (10-60 second latency)
- Full-text PMC processing

Client polls via WebSocket or SSE for progress updates.

---

## 5. Frontend Architecture

### 5.1 Design Philosophy

- **Clean, modern, scientific** — Think: NCBI Datasets, STRING DB, UniProt redesign
- **Mobile-responsive** — Researchers use tablets at conferences
- **Accessible** — WCAG 2.1 AA compliance
- **Fast** — Skeleton screens, progressive loading, caching

### 5.2 Technology Choice

| Option | Pros | Cons | **Decision** |
|--------|------|------|-------------|
| React 18 | Huge ecosystem, Cytoscape React wrapper exists | Learning curve if team is PHP-only | **Recommended** |
| Vue 3 | Simpler learning curve, good for PHP teams | Smaller ecosystem than React | Alternative |
| HTMX + Tailwind | Minimal JS, works with existing PHP | Limited interactivity for network viz | Not suitable |

**Recommendation: React 18 + Tailwind CSS + Cytoscape.js React wrapper**

### 5.3 Page Structure

```
/                          Landing page (project overview, quick search)
/search                    Unified search (genes, keywords, PMIDs)
/network/:id               Network viewer (Cytoscape canvas + panel)
/network/:id/interpret     AI interpretation panel
/gene/:symbol              Gene profile page
/pair/:gene1/:gene2        Gene pair detail page
/analyze                   User text analysis (paste/upload)
/explore                   Browse pre-built networks by topic
/admin                     Admin dashboard (auth required)
/user/dashboard            User dashboard (saved queries, history)
```

### 5.4 Network Visualization (Core UX)

The network viewer is the centerpiece of Ignet 2.0.

**Features:**
- Interactive Cytoscape.js canvas with multiple layout algorithms
- Node coloring by: entity type, centrality score, ontology class, community
- Edge styling by: interaction type (INO), confidence score (BioBERT), evidence count
- Side panel: node/edge details, linked publications, ontology annotations
- Toolbar: layout switch, filter panel, export (PNG, SVG, GraphML, CSV)
- AI interpretation panel: "Explain this network" button triggers LLM analysis
- Mini-map for large networks
- Right-click context menu: expand node, show publications, find paths

**Layout Options:**
- Force-directed (default, for exploration)
- Hierarchical (for pathway-like views)
- Circular (for community detection)
- Grid (for large networks)
- Manual positioning (drag-and-drop)

---

## 6. Data Pipeline & Ingestion

### 6.1 Dual-Corpus Architecture

Ignet 2.0 will maintain **two baseline corpora** that users can choose between or combine:

| Corpus | Source | Coverage | Depth | Use Case |
|--------|--------|----------|-------|----------|
| **PubMed Abstracts** | NCBI PubMed XML | 36M+ articles | Title + Abstract | Broad coverage, fast queries |
| **PMC Open Access** | PMC OA Bulk Download | 8M+ articles | Full text (Methods, Results, Discussion) | Deep evidence, higher precision |

### 6.2 PubMed Abstract Pipeline (Existing — IgnetSciMiner)

```
NCBI FTP → XML Download → Stream Parse → Sentence Split
  → 5 Parallel Mining Filters (Host, VO, INO, HDO, DrugBank)
  → 7-Table UPSERT → MySQL
```

**Status:** Built, tested with sample data. Needs: live NCBI download test, daily cron setup.

**Enhancements for 2.0:**
- Add PubTator API integration for enhanced NER (see Section 12)
- Add abbreviation resolution (Ab3P or similar)
- Add negation detection (NegEx or transformer-based)
- Parallelize across multiple XML files (currently sequential)

### 6.3 PMC Open Access Pipeline (New)

```
PMC OA Bulk Download (ftp.ncbi.nlm.nih.gov/pub/pmc/oa_bulk/)
  → XML/JATS Parse (full text sections)
  → Section-aware sentence splitting (Methods, Results, Discussion)
  → Entity extraction (enhanced with section context)
  → Relation extraction (full-text context improves precision)
  → Separate table set: t_sentence_hit_gene2gene_Host_PMCOA
  → MySQL
```

**Key Differences from Abstract Pipeline:**
- Full text provides richer context → better relation extraction
- Section awareness allows weighting (Results > Methods > Introduction)
- Larger corpus per article → more compute, need batch processing
- PMC OA updates weekly (not daily like PubMed)

### 6.4 Pipeline Scheduling

| Pipeline | Frequency | Trigger | Estimated Duration |
|----------|-----------|---------|-------------------|
| PubMed abstracts | Daily (2 AM CDT) | Cron + `--download` | 1-2 hours/file |
| PMC OA full-text | Weekly (Sunday 2 AM) | Cron + bulk download | 8-12 hours |
| PubTator refresh | Monthly | Manual/cron | 4-6 hours |
| Ontology updates | Quarterly | Manual | 30 minutes |

---

## 7. Database Architecture & Performance

### 7.1 Current Pain Points

- No indexing strategy → full table scans on queries
- No query plan analysis → suboptimal joins
- Single MySQL instance → no read scaling
- No caching → repeated identical queries hit DB
- FULLTEXT indexing may be suboptimal for the query patterns

### 7.2 Optimization Plan

#### Phase 1: Index Optimization (Week 1)

```sql
-- Core interaction table (most queried)
ALTER TABLE t_sentence_hit_gene2gene_Host
  ADD INDEX idx_gene1 (geneSymbol1),
  ADD INDEX idx_gene2 (geneSymbol2),
  ADD INDEX idx_gene_pair (geneSymbol1, geneSymbol2),
  ADD INDEX idx_pmid (PMID),
  ADD INDEX idx_score (score),
  ADD INDEX idx_vaccine (hasVaccine);

-- Sentence tables
ALTER TABLE sentences25_genepair
  ADD INDEX idx_pmid (PMID);

-- Ontology tables
ALTER TABLE ino_host25
  ADD INDEX idx_sentence_id (sentence_id);

ALTER TABLE vo_host25
  ADD INDEX idx_pmid (pmid);

ALTER TABLE hdo_host
  ADD INDEX idx_pmid (pmid);

-- Query cache table
ALTER TABLE t_pubmed_query
  ADD INDEX idx_query_ts (c_query_ts);

-- BioSummarAI table
ALTER TABLE biosummary25_Host
  ADD INDEX idx_gene_symbols (gene_symbols(100)),
  ADD INDEX idx_pmid (pmid);
```

#### Phase 2: Query Optimization (Week 1)

- Run `EXPLAIN` on all major queries
- Convert subqueries to JOINs where beneficial
- Add `LIMIT` to all unbounded queries
- Implement cursor-based pagination (replace OFFSET-based)
- Pre-compute common aggregations (gene neighbor counts, interaction counts)

#### Phase 3: Caching Layer (Week 2)

```
Redis Cache Strategy:
  - Gene neighbor lists: 24-hour TTL
  - Network centrality scores: 7-day TTL (matches query cache)
  - Ontology term lookups: 30-day TTL
  - LLM response cache: 7-day TTL (keyed on input hash)
  - Session data: 1-hour TTL
```

#### Phase 4: Table Partitioning (Week 2)

For tables with tens of millions of rows:

```sql
-- Partition by PMID range for efficient pruning
ALTER TABLE t_sentence_hit_gene2gene_Host
  PARTITION BY RANGE (PMID) (
    PARTITION p_before_2010 VALUES LESS THAN (20000000),
    PARTITION p_2010_2015 VALUES LESS THAN (27000000),
    PARTITION p_2015_2020 VALUES LESS THAN (33000000),
    PARTITION p_2020_2023 VALUES LESS THAN (37000000),
    PARTITION p_2023_plus VALUES LESS THAN MAXVALUE
  );
```

#### Phase 5: Read Replica (Optional, if needed)

- MySQL replication: primary (writes) + replica (reads)
- API reads from replica, writes to primary
- Minimal config change: connection pooling with read/write split

### 7.3 New Tables for Ignet 2.0

```sql
-- User management
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

-- Saved queries / networks
CREATE TABLE saved_queries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,           -- NULL = anonymous
  query_type ENUM('keyword', 'gene', 'pair', 'text', 'network'),
  query_params JSON,
  network_data JSON,          -- Cached network graph
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Usage analytics
CREATE TABLE usage_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50),     -- 'search', 'network_view', 'export', 'llm_query'
  user_id INT NULL,
  session_id VARCHAR(64),
  ip_address VARCHAR(45),
  params JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type (event_type),
  INDEX idx_created (created_at)
);

-- PMC OA parallel tables (mirror structure of abstract tables)
CREATE TABLE t_sentence_hit_gene2gene_Host_PMCOA (
  -- Same schema as t_sentence_hit_gene2gene_Host
  -- But populated from PMC Open Access full-text
);

CREATE TABLE sentences25_genepair_PMCOA (
  -- Same schema as sentences25_genepair
);

-- User-submitted text analysis results
CREATE TABLE user_analyses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  input_text TEXT,
  extracted_entities JSON,
  network_data JSON,
  llm_interpretation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. Core Feature: Dignet 2.0 (Dynamic Ignet)

Dignet is the crown jewel of Ignet — the ability to create **context-specific** interaction networks from literature on-the-fly.

### 8.1 Current Dignet Flow

```
User enters keywords → PubMed E-utilities search → Get PMIDs
  → Match PMIDs against pre-mined gene pairs → Build network
  → Calculate centrality → Visualize in Cytoscape
```

### 8.2 Dignet 2.0 Enhanced Flow

```
User enters keywords/genes/custom text
  │
  ├─ Source Selection: [PubMed Abstracts] [PMC Full-Text] [Both] [Custom Text]
  │
  ├─ Entity Extraction (enhanced):
  │   ├─ PubTator API (genes, chemicals, diseases, species, mutations)
  │   ├─ Local NER (INO, VO, HDO, OAE terms)
  │   ├─ Abbreviation resolution (Ab3P)
  │   └─ Negation filtering (NegEx)
  │
  ├─ Relation Extraction (enhanced):
  │   ├─ Co-occurrence (baseline)
  │   ├─ BioBERT confidence scoring
  │   ├─ INO interaction type classification
  │   └─ Dependency parse-based extraction (new)
  │
  ├─ Network Construction:
  │   ├─ Nodes: genes, proteins, drugs, diseases, vaccines
  │   ├─ Edges: typed by INO, weighted by evidence + confidence
  │   └─ Metadata: PMIDs, sentences, ontology annotations
  │
  ├─ Network Analysis:
  │   ├─ Centrality metrics (degree, betweenness, closeness, eigenvector)
  │   ├─ Community detection (Louvain, label propagation)
  │   ├─ Path analysis (shortest paths between nodes)
  │   └─ Motif detection (feed-forward loops, etc.)
  │
  ├─ Context Expansion (NEW):
  │   ├─ User clicks "Expand" on a node
  │   ├─ System queries Ignet's pre-mined data for that gene's interactions
  │   ├─ Adds new nodes/edges from the broader Ignet database
  │   └─ Highlights expanded vs. original context
  │
  └─ AI Interpretation (NEW):
      ├─ "Summarize this network" → LLM generates narrative
      ├─ "What are the key hubs?" → Centrality + LLM explanation
      ├─ "Suggest hypotheses" → LLM proposes testable predictions
      └─ "Compare with known pathways" → Cross-reference KEGG/Reactome
```

### 8.3 Dual-Context Mode

Users can build networks from two baseline corpora and compare:

```
┌──────────────────────────────┐  ┌──────────────────────────────┐
│   PubMed Abstract Network    │  │   PMC Full-Text Network      │
│   (Broad, 36M articles)      │  │   (Deep, 8M articles)        │
│                              │  │                              │
│   Nodes: 45                  │  │   Nodes: 78                  │
│   Edges: 120                 │  │   Edges: 245                 │
│   Unique to this: 12 edges   │  │   Unique to this: 137 edges  │
│   Shared: 108 edges          │  │   Shared: 108 edges          │
└──────────────────────────────┘  └──────────────────────────────┘
                    ↓ Merge ↓
        ┌──────────────────────────────┐
        │   Combined Network           │
        │   Nodes: 89                  │
        │   Edges: 257                 │
        │   Evidence: abstract + full  │
        └──────────────────────────────┘
```

---

## 9. User-Supplied Text Analysis

### 9.1 Workflow

A major new feature: users paste or upload their own biomedical text, and Ignet processes it through the full pipeline.

```
User Input:
  ├─ Paste text (abstract, manuscript section, grant text)
  ├─ Upload file (TXT, PDF, DOCX)
  └─ Enter PubMed IDs (fetch abstracts automatically)
         │
         ▼
   Entity Extraction:
     ├─ Gene/protein recognition (PubTator + BioBERT NER)
     ├─ Chemical/drug recognition
     ├─ Disease recognition (HDO)
     ├─ Species recognition
     ├─ Ontology term matching (INO, VO, OAE)
     └─ Abbreviation expansion
         │
         ▼
   Network Construction:
     ├─ Build interaction network from user's text
     ├─ Score interactions with BioBERT
     ├─ Type interactions with INO
     └─ Generate initial visualization
         │
         ▼
   Context Expansion:
     ├─ For each identified gene pair, query Ignet's database
     ├─ Retrieve additional evidence from PubMed/PMC corpus
     ├─ Add supporting literature nodes
     └─ Highlight: [User's text] vs [Ignet expansion]
         │
         ▼
   AI Interpretation:
     ├─ Summarize findings
     ├─ Compare user's network with known pathways
     ├─ Identify novel connections not in user's text
     └─ Suggest related literature for further reading
```

### 9.2 Use Cases

1. **Manuscript review** — Paste a manuscript draft, Ignet identifies all gene interactions mentioned, cross-references with existing literature, highlights connections the author may have missed
2. **Grant writing** — Upload grant aims, Ignet maps the proposed interaction network, identifies gaps in evidence, suggests supporting literature
3. **Lab notebook analysis** — Paste experimental notes, Ignet structures the biological entities and interactions described

---

## 10. LLM Integration Strategy

### 10.1 Multi-Model Architecture

```
                    ┌─────────────────────────┐
                    │     LLM Router          │
                    │ (selects model by task)  │
                    └────────┬────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────v──────┐ ┌────v─────┐ ┌──────v──────┐
     │   GPT-4o      │ │ Llama 3.2│ │ BioBERT     │
     │ (Cloud API)   │ │ (Local)  │ │ (Local)     │
     │               │ │          │ │             │
     │ Tasks:        │ │ Tasks:   │ │ Tasks:      │
     │ - Summary     │ │ - Batch  │ │ - Interact. │
     │ - Interpret   │ │   NER    │ │   scoring   │
     │ - Chat        │ │ - Vaccine│ │ - PPI pred. │
     │ - Hypothesis  │ │   cand.  │ │             │
     │   generation  │ │ - Cheap  │ │             │
     │               │ │   summar.│ │             │
     └───────────────┘ └──────────┘ └─────────────┘
```

### 10.2 GPT-4o (Cloud) — Complex Reasoning

- Network interpretation and hypothesis generation
- Interactive chat about results
- Comparison with known biology
- Cost: ~$2.50/1M input tokens, $10/1M output tokens
- Rate limit: Managed via queue

### 10.3 Llama 3.2 (Local) — Batch Processing & Domain Tasks

- **Fine-tuned variants:**
  - `ignet-llama-3.2-ner` — Biomedical NER (trained on PubTator + manual annotations)
  - `ignet-llama-3.2-re` — Relation extraction (trained on interaction data)
  - `vignet-llama-3.2-vaccine` — Vaccine candidate prediction (trained on VIOLIN)
- **Benefits:** No API costs for batch processing, data stays on-premises
- **Hardware:** CPU inference (quantized 8B model fits in 16GB RAM)

### 10.4 BioBERT (Local) — Interaction Scoring

- Existing `metalrt/ignet-biobert` model for PPI prediction
- Already deployed on port 9635
- Enhancement: retrain with newer data, add multi-class output (interaction type)

### 10.5 Prompt Engineering Templates

```python
NETWORK_INTERPRETATION_PROMPT = """
You are a biomedical network analyst. Given the following gene interaction
network derived from {source} literature:

Nodes ({node_count}): {top_nodes_by_centrality}
Key interactions: {top_edges_by_confidence}
Central hubs: {hub_genes}
Communities detected: {community_count}
Ontology annotations: {ino_terms}, {vo_terms}, {hdo_terms}

Provide:
1. A concise summary of the network's biological significance
2. The most important hub genes and why they are central
3. Any novel or unexpected interactions
4. Testable hypotheses suggested by the network structure
5. Relevant pathways (KEGG/Reactome) that overlap with this network
"""
```

---

## 11. Ontology Framework

### 11.1 Current Ontology Integration

| Ontology | Abbreviation | Current Use | Coverage |
|----------|-------------|-------------|----------|
| Interaction Network Ontology | INO | Interaction type classification | 800+ terms |
| Vaccine Ontology | VO | Vaccine mention detection | Binary flag |
| Human Disease Ontology | HDO | Disease term extraction | Full HDO |
| Ontology of Adverse Events | OAE | Dev module only | Limited |
| Information Artifact Ontology | IAO | Referenced in dev | Not active |

### 11.2 Enhanced Ontology Strategy for 2.0

**Goal:** Deep, systematic ontology integration across all modules.

#### INO (Interaction Network Ontology) — Expanded Role

Currently: keyword matching for interaction type detection.
**2.0:** Full INO hierarchy for typed edges in networks.

```
Example: "BRCA1 phosphorylates BARD1"
  → Edge type: INO:0000123 (phosphorylation)
  → Parent: INO:0000100 (post-translational modification)
  → Grandparent: INO:0000001 (interaction)
```

**Implementation:**
- Load full INO OWL into lookup table
- Classify each extracted interaction by INO subclass
- Display interaction types as edge labels in network
- Allow filtering by interaction type (e.g., "show only phosphorylation edges")

#### VO (Vaccine Ontology) — Enhanced for Vignet

Currently: binary `hasVaccine` flag.
**2.0:** Full VO term extraction with hierarchy.

```
Example: "BCG vaccine protects against tuberculosis"
  → VO:0000731 (BCG vaccine)
  → Disease: tuberculosis
  → Mechanism: protection
```

#### HDO (Human Disease Ontology) — Contextual Disease Mapping

Expand from simple term extraction to **disease-gene association scoring** using network centrality within disease-specific sub-networks.

#### OAE (Ontology of Adverse Events) — New Integration

- Extract adverse event mentions from vaccine literature
- Link to VO terms for vaccine-AE associations
- Critical for Vignet (vaccine safety analysis)

#### Gene Ontology (GO) — New Integration

- Annotate extracted genes with GO terms (biological process, molecular function, cellular component)
- Enable GO enrichment analysis on extracted networks
- Source: GOA (Gene Ontology Annotation) database

### 11.3 Ontology Service Architecture

```python
class OntologyService:
    """Unified ontology lookup and annotation service."""

    def __init__(self):
        self.ino = load_ontology('INO')    # ~800 terms
        self.vo = load_ontology('VO')      # ~10,000 terms
        self.hdo = load_ontology('HDO')    # ~12,000 terms
        self.oae = load_ontology('OAE')    # ~4,000 terms
        self.go = load_ontology('GO')      # ~45,000 terms

    def annotate_interaction(self, sentence, gene1, gene2):
        """Classify interaction type using INO hierarchy."""
        ...

    def annotate_genes(self, gene_list):
        """Add GO annotations to genes."""
        ...

    def annotate_diseases(self, text):
        """Extract HDO terms from text."""
        ...

    def get_term_hierarchy(self, ontology, term_id):
        """Return parent chain for a term."""
        ...
```

---

## 12. Entity Extraction & Relation Mining

### 12.1 Current Approach (SciMiner)

- **Dictionary-based** matching with pre-compiled term lists
- **Co-occurrence** within sentences → gene-gene interactions
- **Keyword-based** interaction type detection (INO terms)

**Limitations:**
- Misses novel gene names/aliases
- No abbreviation resolution
- No negation detection ("BRCA1 does NOT interact with...")
- High false-positive rate for co-occurrence

### 12.2 Enhanced Extraction Pipeline (2.0)

```
Input Text
  │
  ├─ Step 1: PubTator API (NCBI) ──────────── Pre-annotated entities
  │   Returns: genes, chemicals, diseases,      for PubMed articles
  │            species, mutations, cell lines    (instant, no compute)
  │
  ├─ Step 2: Local NER (supplement PubTator) ── For user text &
  │   ├─ Abbreviation resolution (Ab3P)          PMC full-text
  │   ├─ Ontology term matching (INO, VO, OAE)
  │   └─ Custom BioBERT NER (domain entities)
  │
  ├─ Step 3: Negation Detection ─────────────── Filter false positives
  │   ├─ NegEx algorithm (rule-based, fast)
  │   └─ Transformer-based (optional, higher accuracy)
  │
  ├─ Step 4: Relation Extraction ────────────── Beyond co-occurrence
  │   ├─ Co-occurrence baseline (existing)
  │   ├─ BioBERT PPI prediction (existing)
  │   ├─ Dependency parse patterns (new)        e.g., "X activates Y"
  │   ├─ INO-guided classification (new)        Interaction type
  │   └─ Cross-sentence coreference (new)       "It" → BRCA1
  │
  └─ Step 5: Confidence Scoring ─────────────── Prioritize results
      ├─ BioBERT score (0-1)
      ├─ Evidence count (# supporting sentences)
      ├─ Source weight (PMC full-text > abstract)
      └─ Section weight (Results > Methods > Intro)
```

### 12.3 PubTator Integration

[PubTator](https://www.ncbi.nlm.nih.gov/research/pubtator3/) provides pre-annotated biomedical entities for PubMed articles.

**API Integration:**

```python
import requests

def get_pubtator_annotations(pmids):
    """Fetch PubTator3 annotations for a list of PMIDs."""
    url = "https://www.ncbi.nlm.nih.gov/research/pubtator3-api/publications/export/biocjson"
    params = {"pmids": ",".join(map(str, pmids))}
    response = requests.get(url, params=params)
    return response.json()
    # Returns: genes, chemicals, diseases, species, mutations, cell lines
    # with offsets, normalized IDs (NCBI Gene, MeSH, etc.)
```

**Benefits:**
- Zero compute cost (NCBI provides pre-annotations)
- High-quality NER (trained on manually curated data)
- Normalized entity IDs (NCBI Gene ID, MeSH ID)
- Covers 36M+ PubMed articles

**Strategy:** Use PubTator as the primary NER layer for PubMed articles. Supplement with local NER for user-supplied text and PMC full-text (PubTator coverage is lower for PMC).

---

## 13. User Management & Access Control

### 13.1 Access Tiers

| Tier | Authentication | Features | Rate Limits |
|------|---------------|----------|-------------|
| **Public** | None required | Gene search, network view, basic export | 100 queries/day per IP |
| **Registered** | Email + password | Save queries, network history, expanded LLM chat (20 msgs), API access | 500 queries/day |
| **Admin** | Email + password + role | Pipeline management, usage analytics, user management, data management | Unlimited |

### 13.2 Authentication

- **Standard auth:** bcrypt password hashing, session-based (PHP) or JWT (API)
- **OAuth (future):** ORCID integration (researchers already have ORCID IDs)
- **No auth required** for core functionality — public access is paramount

### 13.3 Admin Features

- Dashboard: query volume, popular genes, error rates, pipeline status
- User management: view, ban, promote
- Pipeline controls: trigger manual run, view logs, check last update
- Data management: table sizes, index health, cache hit rates
- Content moderation: review user-submitted analyses (if public)

---

## 14. Usage Tracking & Analytics

### 14.1 Events to Track

```python
TRACKED_EVENTS = {
    'search': {
        'gene_search': 'Gene(s) searched',
        'keyword_search': 'Keyword Dignet search',
        'text_analysis': 'User text submitted',
    },
    'network': {
        'network_view': 'Network visualized',
        'network_export': 'Network exported (format)',
        'node_expand': 'Node expanded in network',
    },
    'llm': {
        'summary_request': 'LLM summary requested',
        'chat_message': 'Chat message sent',
        'interpretation': 'Network interpretation requested',
    },
    'user': {
        'login': 'User logged in',
        'register': 'User registered',
        'query_saved': 'Query saved',
    }
}
```

### 14.2 Analytics Dashboard (Admin)

- **Real-time:** Active users, queries/minute, error rate
- **Daily:** Top searched genes, popular networks, LLM usage
- **Monthly:** User growth, feature adoption, corpus coverage
- **Research metrics:** Citations, unique institutions, geographic distribution

### 14.3 Implementation

- **Server-side:** Log to `usage_events` table (see Section 7.3)
- **Client-side:** Optional anonymous analytics (Plausible or Matomo — privacy-respecting)
- **API metrics:** Response times, error rates (Prometheus + Grafana)

---

## 15. Vignet: Vaccine Ignet (Sister Platform)

### 15.1 Vision

Vignet is a specialized sister platform focused on **vaccine research**, leveraging Ignet's infrastructure with vaccine-specific enhancements.

**URL:** `vignet.org` or `vignet.ignet.org`

### 15.2 Unique Features (Beyond Ignet)

| Feature | Description | Technology |
|---------|-------------|------------|
| **Vaccine-Gene Networks** | Networks centered on vaccine antigens, adjuvants, immune responses | VO-enhanced extraction |
| **Protective Antigen Discovery** | Identify potential protective antigens from literature | Fine-tuned Llama 3.2 + VIOLIN |
| **Adjuvant Analysis** | Map adjuvant-immune response interactions | VO + INO cross-referencing |
| **Vaccine Candidate Scoring** | ML-based scoring of novel vaccine candidates | VIOLIN-trained model |
| **Adverse Event Mapping** | Vaccine-AE networks from literature | OAE integration |
| **Pathogen-Host Interaction** | Map pathogen virulence factors to host immune genes | Dual-organism gene extraction |
| **Vaccine Ontology Browser** | Visual VO hierarchy with linked literature | VO OWL + D3.js tree |

### 15.3 VIOLIN Integration

[VIOLIN](http://www.violinet.org/) (Vaccine Investigation and Online Information Network) is the largest vaccine database.

**Integration Plan:**
1. Import VIOLIN vaccine entries as seed data
2. Fine-tune Llama 3.2 on VIOLIN data for vaccine-specific tasks:
   - Vaccine candidate identification from text
   - Protective antigen prediction
   - Adjuvant mechanism classification
3. Cross-reference Ignet gene networks with VIOLIN vaccine entries
4. Enable queries like: "Show me all genes interacting with BCG vaccine components in tuberculosis research"

### 15.4 Fine-Tuned LLM for Vignet

```
Base Model: Llama 3.2 8B (quantized for CPU inference)

Training Data:
  ├─ VIOLIN vaccine database entries (~8,000 vaccines)
  ├─ VO ontology term definitions + relationships
  ├─ Vaccine-related PubMed abstracts (filtered by VO terms)
  ├─ Known protective antigens + evidence sentences
  └─ Vaccine adverse event reports + literature

Tasks:
  1. "Given this pathogen genome, predict potential protective antigens"
  2. "Given this immune response network, suggest adjuvant candidates"
  3. "Classify this text: does it describe a vaccine candidate? [yes/no/maybe]"
  4. "Extract vaccine-related entities from this text"
  5. "Summarize the vaccine development status for [pathogen]"
```

### 15.5 Vignet Architecture

Vignet shares Ignet's core infrastructure but adds:

```
Shared with Ignet:
  ├─ Database engine (MySQL)
  ├─ API framework (Flask)
  ├─ Frontend framework (React + Cytoscape.js)
  ├─ LLM infrastructure
  └─ SciMiner pipeline

Vignet-specific:
  ├─ VO-enhanced entity extraction filter
  ├─ OAE adverse event extraction filter
  ├─ VIOLIN data import + cross-reference service
  ├─ Fine-tuned vignet-llama model
  ├─ Vaccine-specific network layouts
  ├─ Pathogen-host dual-organism mode
  └─ Vignet-branded frontend theme
```

---

## 16. Frontend Modernization Plan

### 16.1 Current State

- HTML table layouts from ~2008
- Dreamweaver templates (`main.dwt.php`)
- Mixed jQuery/Dojo/vanilla JS
- No responsive design
- Inline styles throughout
- No component reuse

### 16.2 Migration Strategy

**Phase 1: CSS Modernization (Quick Win — Week 1)**
- Replace table layouts with CSS Grid/Flexbox
- Apply Tailwind CSS utility classes
- Make responsive (mobile-friendly)
- Keep PHP backend, just modernize presentation
- Result: Same functionality, modern look

**Phase 2: Component Library (Week 2)**
- Create reusable React components:
  - `<GeneSearch />` — Multi-select gene picker
  - `<NetworkViewer />` — Cytoscape.js wrapper
  - `<ResultsTable />` — Sortable, filterable table
  - `<ChatPanel />` — LLM chat interface
  - `<OntologyBrowser />` — Tree view for ontology terms
  - `<CentralityChart />` — Bar/radar chart for scores

**Phase 3: SPA Migration (Weeks 3-4)**
- React Router for client-side navigation
- API calls replace PHP page loads
- Preserve URLs for backward compatibility
- Progressive migration (page by page)

### 16.3 Design System

**Color Palette:**
```
Primary:    #1a365d (Navy — trust, science)
Secondary:  #2b6cb0 (Blue — interactive elements)
Accent:     #ed8936 (Orange — calls to action)
Success:    #38a169 (Green — positive results)
Warning:    #d69e2e (Yellow — cautions)
Error:      #e53e3e (Red — errors)
Background: #f7fafc (Light gray — clean, minimal)
Text:       #1a202c (Near-black — readable)
```

**Typography:**
- Headings: Inter (clean, modern, scientific)
- Body: Inter or system fonts
- Code/Data: JetBrains Mono

**Design Principles:**
1. **Data density** — Show information efficiently (researchers want data, not whitespace)
2. **Progressive disclosure** — Simple view first, details on demand
3. **Consistent patterns** — Same search, filter, export patterns across modules
4. **Accessibility** — High contrast, keyboard navigation, screen reader support

---

## 17. Backend Modernization Plan

### 17.1 Phase 1: API Layer (Week 1)

- Create `api/` directory with Flask application
- Implement core endpoints (search, network, gene, pair)
- Database access via SQLAlchemy (connection pooling, query optimization)
- JSON responses with consistent error handling
- API documentation via Swagger/OpenAPI

### 17.2 Phase 2: Service Extraction (Week 2)

- Extract network analysis into standalone service
- Extract entity extraction into standalone service
- Extract LLM operations into standalone service with model routing
- Each service independently deployable, testable

### 17.3 Phase 3: Infrastructure (Week 2)

- Docker Compose for local development
- Nginx reverse proxy (replace Apache's direct PHP handling)
- Redis for caching and session management
- Celery for background task processing
- Health check endpoints for monitoring

### 17.4 Phase 4: Testing & CI (Ongoing)

- Unit tests for all API endpoints (pytest)
- Integration tests for database operations
- End-to-end tests with Playwright
- GitHub Actions CI pipeline: lint → test → build → deploy

---

## 18. Implementation Roadmap

### Sprint 1: Foundation (Days 1-5)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|-------------|
| Database index optimization | P0 | 2 hours | None |
| Daily PubMed pipeline (cron) | P0 | 4 hours | IgnetSciMiner tested |
| API scaffolding (Flask) | P0 | 1 day | None |
| Core API endpoints (search, gene, pair) | P0 | 2 days | API scaffolding |
| Redis cache layer | P1 | 4 hours | Redis installed |
| Frontend CSS modernization | P1 | 2 days | None |

### Sprint 2: Enhanced Features (Days 6-10)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|-------------|
| PubTator API integration | P0 | 1 day | API layer |
| Dignet 2.0 (dual-corpus mode) | P0 | 2 days | PMC pipeline started |
| User text analysis endpoint | P1 | 2 days | Entity extraction |
| LLM network interpretation | P1 | 1 day | API layer + LLM service |
| React component library | P1 | 2 days | Design system |
| User authentication | P2 | 1 day | API layer |

### Sprint 3: Advanced Features (Days 11-15)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|-------------|
| PMC OA pipeline | P0 | 3 days | SciMiner adapted |
| Context expansion feature | P1 | 2 days | Dignet 2.0 |
| Ontology service (INO/VO/HDO) | P1 | 2 days | Ontology data loaded |
| Network comparison mode | P2 | 1 day | Dual-corpus |
| Usage analytics | P2 | 1 day | Database + API |
| SPA migration (key pages) | P2 | 2 days | React components |

### Future Sprints

| Feature | Timeline | Dependencies |
|---------|----------|-------------|
| Vignet MVP | Weeks 3-4 | VO enhancement, VIOLIN import |
| Llama 3.2 fine-tuning | Weeks 4-6 | Training data prepared |
| Community features (registered users) | Week 4 | User auth |
| GO enrichment analysis | Week 5 | GO data loaded |
| Docker deployment | Week 6 | All services stable |
| Public API documentation | Week 6 | API finalized |

---

## 19. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Database performance at scale (10M+ rows) | High | High | Index optimization first; partitioning if needed; Redis cache |
| PMC OA pipeline complexity (full-text parsing) | Medium | High | Start with structured XML sections; skip poorly formatted articles |
| LLM cost (GPT-4o at scale) | Medium | Medium | Cache responses; use Llama 3.2 for batch tasks; rate limiting |
| Frontend migration breaks existing users | Low | High | Progressive migration; keep old URLs working; redirect map |
| PubTator API rate limits | Medium | Medium | Cache annotations; batch requests; fallback to local NER |
| Fine-tuning Llama 3.2 quality | Medium | Medium | Start with GPT-4o; fine-tune iteratively; human evaluation |
| Team bandwidth (2-week timeline) | High | High | Prioritize ruthlessly; P0 items first; defer P2+ |
| Server resources (CPU inference for Llama) | Medium | Medium | Quantize model (GGUF 4-bit); test on current hardware first |

---

## Appendix A: Reference Tools & Databases

| Tool/Database | URL | Relevance to Ignet 2.0 |
|--------------|-----|----------------------|
| PubTator3 | ncbi.nlm.nih.gov/research/pubtator3/ | Entity annotation API |
| STRING | string-db.org | Protein interaction reference |
| GeneMANIA | genemania.org | Gene function prediction reference |
| VIOLIN | violinet.org | Vaccine database (Vignet) |
| INO | ontobee.org/ontology/INO | Interaction Network Ontology |
| VO | violinet.org/vaccineontology | Vaccine Ontology |
| HDO | disease-ontology.org | Human Disease Ontology |
| OAE | ontobee.org/ontology/OAE | Adverse Event Ontology |
| Gene Ontology | geneontology.org | Gene annotation |
| KEGG | genome.jp/kegg/ | Pathway reference |
| Reactome | reactome.org | Pathway reference |
| Ab3P | ncbi.nlm.nih.gov/research/bionlp/Tools/Ab3P | Abbreviation resolution |
| NegEx | github.com/chapmanbe/negex | Negation detection |

## Appendix B: Existing Infrastructure

| Resource | Details |
|----------|---------|
| Server | RHEL 9, 244G disk, no GPU |
| Python | 3.12.12 (Flask + Waitress) |
| PHP | 8.x (PHP-FPM) |
| MySQL/MariaDB | Production instance (ignet database) |
| Apache | HTTPS (Let's Encrypt), PrivateTmp |
| Domain | ignet.org (active) |
| GitHub | github.com/hurlab/Ignet (4 commits on main) |
| SciMiner | /home/juhur/IgnetSciMiner/ (tested, not yet in daily production) |
| BioBERT | Port 9635 (Flask + Waitress, Python 3.12) |
| BioSummarAI | Port 9636 (Flask + Waitress, Python 3.12) |

---

*This document will be updated as architecture decisions are finalized and implementation progresses.*
