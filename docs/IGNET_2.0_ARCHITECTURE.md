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
| **Pipeline** | IgnetSciMiner (Perl/Python/Shell) | IgnetSciMiner enhanced + PMC pipeline | Dual-corpus, 5-filter ontology mining |
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
  entity_service.py       # Entity extraction (SciMiner 5-filter NER)
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

#### PubMed Baseline vs Update File Strategy

NCBI releases an **annual baseline** (complete PubMed corpus) in December, then **daily update files** continuing from the baseline's last file number.

```
2026 Baseline (released Dec 2025):
  pubmed26n0001.xml through pubmed26n1334.xml  (all 40M+ citations)

2026 Daily Updates (started Jan 30, 2026):
  pubmed26n1335.xml (first update) through pubmed26n1384.xml (latest, Mar 15)
  One file per day, ~20-80MB each
  Contains: new, revised, and deleted citations
```

**Current state:**
- Existing DB has 15.8M gene pairs from prior baseline processing
- Pipeline was configured for `pubmed25n` (2025 baseline)
- The `pubmed25n` files have been absorbed into the `pubmed26n` baseline
- NCBI only serves `pubmed26n*` files now

**Activation plan:**
1. Change `PUBMED_FILE_PREFIX` from `"pubmed25n"` → `"pubmed26n"` in `config.env`
2. Set `last_processed_number.txt` to `1334` (baseline end; next download = 1335)
3. Set `DB_ENABLED="yes"` in `config.env`
4. Ensure `~/.my.cnf` exists with DB credentials (already created)
5. **Catch-up:** Process ~50 files (1335-1384) sequentially over several days
6. **Daily cron:** `0 2 * * *` runs `--download` mode for ongoing updates
7. The pipeline's delete-then-insert strategy handles revised/corrected articles

**Enhancements for 2.0:**
- Add abbreviation resolution (Ab3P or similar)
- Add negation detection (NegEx or transformer-based)
- Parallelize across multiple XML files for catch-up processing
- Update ontology dictionaries (especially INO from 2016, HUGO/HGNC from ~2018)

### 6.3 PMC Open Access Pipeline (Future — Separate Server)

> **Note:** PMCOA processing is resource-intensive and will run on a **separate server**
> on the same network. The current Ignet server has limited disk/compute for full-text
> processing. A portable folder (`IgnetSciMiner-PMCOA/`) will be created for deployment
> to the processing server, which ships results back via rsync/scp for DB loading.

```
[Separate Processing Server]
PMC OA Bulk Download (ftp.ncbi.nlm.nih.gov/pub/pmc/oa_bulk/)
  → XML/JATS Parse (full text sections)
  → Section-aware sentence splitting (Methods, Results, Discussion)
  → Entity extraction (enhanced with section context)
  → Relation extraction (full-text context improves precision)
  → Output: TSV mining results (same format as PubMed pipeline)
  → rsync/scp → Ignet server
  → DB load into: t_sentence_hit_gene2gene_Host_PMCOA
```

**Key Differences from Abstract Pipeline:**
- Full text provides richer context → better relation extraction
- Section awareness allows weighting (Results > Methods > Introduction)
- Larger corpus per article → more compute, need batch processing
- PMC OA updates weekly (not daily like PubMed)
- **Runs on separate server** — only DB loading happens on Ignet server

### 6.4 Pipeline Scheduling

| Pipeline | Frequency | Trigger | Estimated Duration |
|----------|-----------|---------|-------------------|
| PubMed abstracts | Daily (2 AM CDT) | Cron + `--download` | 1-2 hours/file |
| PMC OA full-text | Weekly (Sunday 2 AM) | Cron + bulk download | 8-12 hours |
| Ontology dictionary refresh | Quarterly | Manual | 1-2 hours |
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
  │   ├─ SciMiner 5-filter NER (Host genes, VO, INO, HDO, DrugBank)
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
     ├─ Gene/protein recognition (SciMiner Host filter — 25,256 HUGO genes)
     ├─ Drug recognition (SciMiner DrugBank filter — 153K terms)
     ├─ Disease recognition (SciMiner HDO filter — 11,840 DOID terms)
     ├─ Vaccine recognition (SciMiner VO filter — 3,454 terms)
     ├─ Interaction typing (SciMiner INO filter — 1,051 terms)
     └─ Abbreviation expansion (future enhancement)
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

### 10.2 LLM Access Strategy — Tiered Model

Users get LLM access through a flexible, tiered approach that minimizes cost
to the project while maximizing availability.

```
┌──────────────────────────────────────────────────────────────────┐
│                      LLM Access Tiers                            │
├──────────────┬──────────────┬──────────────┬─────────────────────┤
│  Tier 1      │  Tier 2      │  Tier 3      │  Tier 4             │
│  Free/Default│  Registered  │  BYOK        │  Admin/Internal     │
│              │  Users       │  (Bring Your │                     │
│              │              │  Own Key)    │                     │
├──────────────┼──────────────┼──────────────┼─────────────────────┤
│ Institutional│ Free open-   │ User's own   │ Project-funded      │
│ open-weight  │ weight model │ API key      │ GPT-4o key          │
│ LLM (DGX    │ via Open-    │ (OpenAI,     │ (unlimited for      │
│ Spark or     │ Router free  │ Anthropic,   │ admin + research)   │
│ similar)     │ tier models  │ OpenRouter)  │                     │
├──────────────┼──────────────┼──────────────┼─────────────────────┤
│ ~120B param  │ Varies       │ User choice  │ GPT-4o              │
│ No API key   │ Free models  │ Best quality │ Best quality        │
│ needed       │ on OpenRouter│ User pays    │ Project pays        │
│ Rate limited │ Account req. │ Their limits │ No limits           │
└──────────────┴──────────────┴──────────────┴─────────────────────┘
```

**Tier 1 — Project-Funded LLM (Default for all users):**
- **Current:** OpenAI GPT-4.1-nano (fast, cheap, good for summarization and chat)
  - Same API key pattern as BioSummarAI (`.env` with `OPENAI_API_KEY`)
  - Cost-effective for high volume (~$0.10/1M input tokens)
- **Future:** Institutional open-weight LLM on DGX Spark (e.g., Llama 3.3 70B)
  when GPU infrastructure becomes available — eliminates API costs entirely
- Rate limited per IP/session to prevent abuse
- Suitable for: summarization, network interpretation, basic chat

**Tier 2 — Free Models via OpenRouter (Registered users):**
- Registered users can connect to [OpenRouter](https://openrouter.ai/) free-tier models
- We provide instructions for: sign up, get free API key, select free models
- Free models on OpenRouter include: Llama, Mistral, Gemma variants (changes over time)
- User stores their OpenRouter key in their Ignet profile (encrypted in DB)

**Tier 3 — Bring Your Own Key (BYOK — Registered users):**
- Power users who want premium models (GPT-4o, Claude, etc.) can enter their own API keys
- Supported providers: OpenAI, Anthropic, OpenRouter (any model), or any OpenAI-compatible API
- Key stored encrypted in user profile; transmitted only to the selected provider
- User bears the cost; Ignet just routes the request
- Guidance provided: "We recommend OpenRouter for flexibility and free model access"

**Tier 4 — Admin/Internal (Project-funded):**
- Project's own GPT-4o API key for: admin operations, pipeline summarization, research use
- Not exposed to public users
- Budget-controlled with spending alerts

### 10.3 LLM Router Architecture

```python
class LLMRouter:
    """Routes LLM requests to the appropriate provider based on user tier."""

    def route(self, user, prompt, task_type):
        # Priority: user's BYOK > user's OpenRouter > institutional LLM > fallback
        if user.has_byok_key():
            return self.call_byok(user.api_key, user.provider, prompt)
        elif user.has_openrouter_key():
            return self.call_openrouter(user.openrouter_key, prompt)
        else:
            return self.call_institutional_llm(prompt)  # Free, rate-limited

    def call_institutional_llm(self, prompt):
        """Call the on-network open-weight LLM (DGX Spark or similar)."""
        # OpenAI-compatible API endpoint
        url = INSTITUTIONAL_LLM_ENDPOINT  # e.g., http://dgx-spark.local:8080/v1
        ...

    def call_byok(self, api_key, provider, prompt):
        """Call user's own API (OpenAI, Anthropic, OpenRouter, etc.)."""
        ...

    def call_openrouter(self, key, prompt):
        """Call OpenRouter with user's free-tier key."""
        url = "https://openrouter.ai/api/v1/chat/completions"
        ...
```

### 10.4 BioBERT (Local) — Interaction Scoring

- Existing `metalrt/ignet-biobert` model for PPI prediction
- Already deployed on port 9635
- Enhancement: retrain with newer data, add multi-class output (interaction type)
- Not an LLM — specialized ML model, always available, no API key needed

### 10.5 Llama 3.2 Fine-Tuned Variants (Future — Deferred)

When GPU resources become available (DGX Spark or cloud):
- `ignet-llama-3.2-ner` — Biomedical NER (trained on SciMiner output + manual annotations)
- `ignet-llama-3.2-re` — Relation extraction (trained on interaction data)
- `vignet-llama-3.2-vaccine` — Vaccine candidate prediction (trained on VIOLIN)
- These would supplement/replace the institutional general-purpose LLM for domain-specific tasks

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

### 11.1 Current Ontology & Dictionary Integration (SciMiner Pipeline)

The daily processing pipeline (IgnetSciMiner) runs **5 parallel mining filters**, each backed by curated ontology dictionaries. These are the actual resources in production:

| Filter | Ontology/Database | Dictionary File | Terms | DB Table | DB Rows |
|--------|------------------|----------------|-------|----------|---------|
| **Host Genes** | HUGO Gene Nomenclature (HGNC) | `HUGO_trimmed_final_default` | 25,256 genes | `t_sentence_hit_gene2gene_Host` | 15.8M |
| **INO** | Interaction Network Ontology | `INO_Unique_Terms_IDs_only_20160224.txt` | 1,051 interaction terms | `ino_host25` | 7.4M |
| **VO** | Vaccine Ontology | `VO_term_updated_250403.txt` + hierarchy | 3,454 vaccines + 120 pathogen strains | `vo_host25` | (active) |
| **HDO** | Human Disease Ontology | `HDO_Unique_Terms_20250307.txt` | 11,840 disease terms (DOID) | `hdo_host` | (active) |
| **DrugBank** | DrugBank Database (v5.1) | `drugbank_name_to_ID_v5.1.txt` | 153,055 drug names/synonyms | `drug_host` | (active) |

**Supporting resources in Host gene filter:**
- `HUGO_2_external_default` — 25,254 gene entries with Ensembl, UniProt, GO, KEGG, Reactome cross-references
- `ENGDICTIONARY_default` — 134,996 English words (ignore list to filter common words from gene symbols)
- `DUPLICATENAME_default` — 932 ambiguous gene name mappings
- `PARTNAMEMIDDLE_default`, `UNIQUESYMBOL_default`, `EXCLUDE_additional` — Additional filtering rules

**Supporting resources in VO filter:**
- `VO_hierarchy_updated_250328.txt` — Parent-child hierarchy for vaccine classification
- `Strains_fullnames_250403.txt` — 120 pathogen strain full names
- `Synonyms.txt` — Vaccine name synonyms
- `VO_terms_to_ignore_190510.txt` — False-positive exclusion list

**Supporting resources in DrugBank filter:**
- `drugbank_IGNORE.txt` — 1,230 common terms to ignore (glucose, sucrose, thrombin, etc.)

### 11.2 How Each Filter Works in the Pipeline

```
For each sentence in the PubMed article:
  │
  ├─ Host Gene Filter:
  │   Match against 25,256 HUGO gene symbols + synonyms
  │   Filter out English dictionary words (134K terms)
  │   Resolve duplicate/ambiguous names (932 entries)
  │   If 2+ genes found in same sentence → record as gene-gene interaction
  │   Output: gene pairs with sentence IDs and PMIDs
  │
  ├─ INO Filter:
  │   Match against 1,051 interaction terms (e.g., "phosphorylation",
  │   "binding", "activation", "inhibition")
  │   Record: sentence_id, PMID, INO term ID, matching phrase
  │   Used to TYPE gene-gene interactions (what kind of interaction)
  │
  ├─ VO Filter:
  │   Match against 3,454 vaccine terms with hierarchy
  │   Also matches 120 pathogen strain names
  │   Record: sentence_id, PMID, VO term ID, matching phrase
  │   Used to flag vaccine-relevant sentences
  │
  ├─ HDO Filter:
  │   Match against 11,840 human disease terms (DOID identifiers)
  │   Record: PMID, HDO term ID, disease term
  │   Used for disease context in gene networks
  │
  └─ DrugBank Filter:
      Match against 153,055 drug names/synonyms
      Filter out 1,230 common false-positive terms
      Record: PMID, DrugBank ID, drug term
      Used for drug context in gene networks
```

### 11.3 Enhanced Ontology Strategy for 2.0

**Goal:** Deeper, more systematic ontology integration across all modules — moving from simple dictionary matching to hierarchical, relationship-aware ontology use.

#### INO (Interaction Network Ontology) — From Keywords to Typed Edges

**Current:** 1,051 terms matched as keywords, stored in `ino_host25`.
**2.0 Enhancement:**
- Load full INO OWL hierarchy into lookup table
- Classify each gene-gene interaction by INO subclass
- Display interaction types as **edge labels** in network visualization
- Allow filtering by interaction type (e.g., "show only phosphorylation edges")
- Dictionary update: INO terms file is from 2016 — update to latest INO release

```
Example: "BRCA1 phosphorylates BARD1"
  → Edge type: INO:0000123 (phosphorylation)
  → Parent: INO:0000100 (post-translational modification)
  → Grandparent: INO:0000001 (interaction)
  → Network display: BRCA1 --[phosphorylation]--> BARD1
```

#### VO (Vaccine Ontology) — Full Hierarchy for Vignet

**Current:** 3,454 vaccine terms + 120 pathogen strains + hierarchy.
**2.0 Enhancement:**
- Expose VO hierarchy in web UI (tree browser)
- Link vaccine terms to gene networks (which genes are discussed alongside each vaccine)
- Cross-reference VO terms with INO interaction types for vaccine mechanism networks
- Core resource for Vignet sister platform

#### HDO (Human Disease Ontology) — Disease-Centric Network Views

**Current:** 11,840 disease terms with DOID identifiers.
**2.0 Enhancement:**
- Enable **disease-centric network views**: "Show me the gene network for [disease]"
- Disease-gene association scoring using network centrality within disease-specific sub-networks
- Cross-reference with VO for vaccine-disease connections
- Enable multi-disease comparison networks

#### DrugBank — Drug-Gene-Disease Triangulation

**Current:** 153,055 drug name/synonym entries with DrugBank IDs.
**2.0 Enhancement:**
- Link drug mentions to gene networks for drug-gene interaction views
- Cross-reference DrugBank IDs with external databases (ChEBI, PubChem)
- Enable drug repurposing queries: "What genes targeted by [drug] appear in [disease] networks?"
- Drug-gene-disease triangulation: combine all three entity types in network visualization

#### OAE (Ontology of Adverse Events) — New Integration

- Extract adverse event mentions from vaccine/drug literature
- Link to VO terms for vaccine-AE associations
- Link to DrugBank terms for drug-AE associations
- Critical for Vignet (vaccine safety analysis)
- Currently in `dev/` modules only — promote to production filter

#### Gene Ontology (GO) — New Integration

- The HUGO external dictionary already contains GO annotations for each gene
- Expose GO terms in gene profile pages (biological process, molecular function, cellular component)
- Enable GO enrichment analysis on extracted networks
- Group network nodes by GO biological process for pathway-level views

### 11.4 Dictionary Update Strategy

| Dictionary | Current Version | Update Frequency | Source |
|-----------|----------------|-----------------|--------|
| HUGO/HGNC | ~2018 (25,256 genes) | Quarterly | genenames.org |
| INO | 2016-02-24 (1,051 terms) | **Needs update** | ontobee.org/ontology/INO |
| VO | 2025-04-03 (3,454 terms) | Recent/current | violinet.org/vaccineontology |
| HDO | 2025-03-07 (11,840 terms) | Recent/current | disease-ontology.org |
| DrugBank | v5.1 (153,055 entries) | Annually | drugbank.com |

**Priority updates needed:**
1. **INO** — 10 years old, likely missing many newer interaction terms
2. **HUGO/HGNC** — ~8 years old, missing recently approved gene symbols
3. **DrugBank** — v5.1 may be outdated; check for latest version

### 11.5 Ontology Service Architecture (2.0)

```python
class OntologyService:
    """Unified ontology lookup and annotation service."""

    def __init__(self):
        self.ino = load_ontology('INO')        # 1,051 terms (to update)
        self.vo = load_ontology('VO')          # 3,454 vaccines + hierarchy
        self.hdo = load_ontology('HDO')        # 11,840 disease terms
        self.drugbank = load_ontology('DrugBank')  # 153,055 drug entries
        self.hugo = load_ontology('HUGO')      # 25,256 genes + GO/KEGG
        self.oae = load_ontology('OAE')        # Future: adverse events
        self.go = load_ontology('GO')          # Via HUGO cross-references

    def annotate_interaction(self, sentence, gene1, gene2):
        """Classify interaction type using INO hierarchy."""
        ...

    def annotate_genes(self, gene_list):
        """Add GO, pathway, and disease annotations to genes."""
        ...

    def annotate_diseases(self, text):
        """Extract HDO terms from text with DOID identifiers."""
        ...

    def annotate_drugs(self, text):
        """Extract DrugBank terms from text with DB identifiers."""
        ...

    def annotate_vaccines(self, text):
        """Extract VO terms with hierarchy classification."""
        ...

    def get_term_hierarchy(self, ontology, term_id):
        """Return parent chain for a term (VO, INO, HDO)."""
        ...

    def cross_reference(self, entity_type, entity_id, target_ontology):
        """Cross-reference between ontologies (e.g., drug → gene → disease)."""
        ...
```

---

## 12. Entity Extraction & Relation Mining

### 12.1 Current Approach (SciMiner Pipeline)

- **Dictionary-based** matching with 5 curated ontology/database dictionaries (see Section 11.1)
- **Co-occurrence** within sentences → gene-gene interactions (2+ genes per sentence)
- **Keyword-based** interaction type detection (INO terms)

**Limitations:**
- Misses novel gene names/aliases
- No abbreviation resolution
- No negation detection ("BRCA1 does NOT interact with...")
- High false-positive rate for co-occurrence

### 12.2 Enhanced Extraction Pipeline (2.0)

```
Input Text (PubMed XML, PMC full-text, or user-supplied)
  │
  ├─ Step 1: SciMiner 5-Filter NER ─────────── Core entity extraction
  │   ├─ Host gene filter (25,256 HUGO genes + synonyms)
  │   ├─ VO filter (3,454 vaccine terms + hierarchy)
  │   ├─ INO filter (1,051 interaction types)
  │   ├─ HDO filter (11,840 disease terms with DOID)
  │   └─ DrugBank filter (153,055 drug names/synonyms)
  │
  ├─ Step 2: Enhancement Layer (new) ────────── Improve recall & precision
  │   ├─ Abbreviation resolution (Ab3P or similar)
  │   ├─ Negation detection (NegEx — filter "does NOT interact")
  │   └─ Updated dictionaries (INO from 2016 → latest, HUGO refresh)
  │
  ├─ Step 3: Relation Extraction ────────────── Beyond co-occurrence
  │   ├─ Co-occurrence baseline (existing SciMiner)
  │   ├─ BioBERT PPI prediction (existing, port 9635)
  │   ├─ INO-guided classification (new) — type the interaction
  │   ├─ Dependency parse patterns (new) — e.g., "X activates Y"
  │   └─ Cross-sentence coreference (future) — "It" → BRCA1
  │
  └─ Step 4: Confidence Scoring ─────────────── Prioritize results
      ├─ BioBERT score (0-1)
      ├─ Evidence count (# supporting sentences)
      ├─ Source weight (PMC full-text > abstract, if dual-corpus)
      └─ Section weight (Results > Methods > Intro, if full-text)
```

### 12.3 Reference: PubTator (Inspiration, Not Dependency)

[PubTator3](https://www.ncbi.nlm.nih.gov/research/pubtator3/) is NCBI's entity annotation tool for biomedical literature. SciMiner already performs comparable entity recognition with our own ontology dictionaries. PubTator is referenced here as a **benchmark and inspiration** — not as an integration dependency.

**Features worth studying from PubTator:**
- Entity normalization to standard IDs (NCBI Gene ID, MeSH) — we could adopt similar normalization for our SciMiner output
- Mutation entity detection — not currently in SciMiner's 5 filters
- Cell line entity detection — not currently in SciMiner's 5 filters
- Relation extraction between tagged entities — PubTator uses ML-based relation extraction

**Possible future adoption (if gaps identified):**
- If SciMiner misses entity types that PubTator covers (mutations, cell lines), consider adding new SciMiner filters rather than API dependency
- PubTator API could serve as a validation/benchmarking tool to measure SciMiner's recall/precision
- No hard dependency on PubTator is planned — SciMiner is the authoritative NER layer

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

### 16.3 Responsibility & Execution Plan

| Phase | Who | What | Timeline |
|-------|-----|------|----------|
| **Phase 1: CSS Modernization** | Claude Code | Replace table layouts with Tailwind CSS, responsive design, modern typography/colors. Keep existing PHP pages — just reskin. | 1-2 days |
| **Phase 2: React SPA Build** | Claude Code + Team review | Build React components (NetworkViewer, GeneSearch, ResultsTable, ChatPanel). Team reviews via screenshots and iterates on UI/UX. | 3-5 days |
| **Phase 3: Visual Polish** | Team (designer or template) | Fine-tune colors, spacing, visual hierarchy. Could use a science/research-oriented React template as starting point. | 1-2 days |

**Phase 1** is a quick win that immediately modernizes the look without changing any backend code. It can be done independently and rolled back easily.

**Phase 2** is the structural migration to React SPA. Each page migrated one at a time, with the old PHP page as fallback until the React version is verified.

**Phase 3** is iterative — the team reviews screenshots and provides feedback on visual design. A UI designer or Figma template can accelerate this.

### 16.4 Design System

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

## 18. Implementation Roadmap — Consolidated Execution Plan

### Overview

The plan is organized into **5 workstreams** that can run partly in parallel.
Items marked [PREP] require setup before Claude Code implementation sessions.
Items marked [DEFER] are parked for later and do not block the core 2.0 launch.

```
Week 1                    Week 2                    Week 3+
─────────────────────────────────────────────────────────────
WS1: Data Pipeline ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░
WS2: Database      ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
WS3: Backend API   ░░░░████████████████░░░░░░░░░░░░░░░░░░░░░
WS4: Frontend      ░░░░░░░░████████████████████░░░░░░░░░░░░░
WS5: User & LLM    ░░░░░░░░░░░░░░░░████████████░░░░░░░░░░░░
─────────────────────────────────────────────────────────────
Deferred:          PMCOA pipeline | Fine-tuned LLM | Vignet
```

---

### Workstream 1: Data Pipeline (Get daily updates running)

**Goal:** Ignet database receives daily PubMed updates automatically.

| # | Task | Who | Effort | Depends On | Status |
|---|------|-----|--------|-----------|--------|
| 1.1 | [PREP] Install Redis | Admin (sudo) | 10 min | — | Not started |
| 1.2 | Update `config.env`: prefix `pubmed26n`, `DB_ENABLED=yes`, file 1334 | Claude Code | 5 min | — | Not started |
| 1.3 | Test one file end-to-end: download `pubmed26n1335` → preprocess → mine → DB load | Claude Code + verify | 2 hours | 1.2 | Not started |
| 1.4 | Catch-up: process files 1336-1384 (~50 files) | Automated (sequential) | ~50-100 hrs | 1.3 passes | Not started |
| 1.5 | Set up daily cron (`0 2 * * *`) | Claude Code | 10 min | 1.3 passes | Not started |
| 1.6 | Create systemd service files for BioBERT + BioSummarAI | Claude Code | 30 min | — | Not started |
| 1.7 | Update SciMiner dictionaries (INO 2016→latest, HUGO refresh) | Manual + Claude Code | 1 day | Dictionary sources | Not started |

**Catch-up strategy for 1.4:** Run overnight/weekend. The pipeline processes one file at a time (~1-2 hours each). Can script a loop:
```bash
for i in $(seq 1336 1384); do
  bash single_xml_pipeline.sh /path/pubmed26n${i}.xml.gz 1
done
```

---

### Workstream 2: Database Optimization

**Goal:** Fast queries on 15.8M+ rows, ready for growth to 20M+.

| # | Task | Who | Effort | Depends On | Status |
|---|------|-----|--------|-----------|--------|
| 2.1 | Add indexes to core tables (gene pairs, sentences, ontology) | Claude Code | 1 hour | — | Not started |
| 2.2 | Run EXPLAIN on top 10 slowest queries, optimize | Claude Code | 2 hours | 2.1 | Not started |
| 2.3 | [PREP] Install Redis; implement cache layer for repeated queries | Claude Code | 4 hours | 1.1 (Redis) | Not started |
| 2.4 | Add cursor-based pagination (replace OFFSET) | Claude Code | 2 hours | — | Not started |
| 2.5 | Consider table partitioning if queries still slow after 2.1-2.4 | Claude Code | 2 hours | 2.2 results | Not started |

---

### Workstream 3: Backend API Layer

**Goal:** Unified REST API serving all frontend requests (replaces direct PHP-to-DB).

| # | Task | Who | Effort | Depends On | Status |
|---|------|-----|--------|-----------|--------|
| 3.1 | Flask API scaffolding (app structure, config, error handling) | Claude Code | 4 hours | — | Not started |
| 3.2 | Core endpoints: `/api/v1/genes`, `/api/v1/genes/{sym}/neighbors`, `/api/v1/pairs/{g1}/{g2}` | Claude Code | 1 day | 3.1 | Not started |
| 3.3 | Network endpoints: `/api/v1/network/search`, `/api/v1/network/{id}/centrality` | Claude Code | 1 day | 3.1 | Not started |
| 3.4 | LLM endpoints: `/api/v1/summarize`, `/api/v1/chat`, `/api/v1/interpret` | Claude Code | 1 day | 3.1 + LLM router | Not started |
| 3.5 | LLM router (institutional LLM → OpenRouter → BYOK fallback) | Claude Code | 4 hours | 3.1 | Not started |
| 3.6 | User text analysis: `/api/v1/extract` (run SciMiner on user text) | Claude Code | 1 day | 3.1 + SciMiner integration | Not started |
| 3.7 | Celery async workers for long-running tasks (LLM, network analysis) | Claude Code | 4 hours | 1.1 (Redis) | Not started |
| 3.8 | API documentation (OpenAPI/Swagger) | Claude Code | 2 hours | 3.2-3.6 done | Not started |

---

### Workstream 4: Frontend Modernization

**Goal:** Modern, responsive UI that researchers actually enjoy using.

| # | Task | Who | Effort | Depends On | Status |
|---|------|-----|--------|-----------|--------|
| 4.1 | **Phase 1: CSS Modernization** — Tailwind on existing PHP pages | Claude Code | 1-2 days | — | Not started |
| 4.2 | **Phase 2: React Components** — GeneSearch, NetworkViewer, ResultsTable, ChatPanel | Claude Code | 3-5 days | 3.2-3.4 (API) | Not started |
| 4.3 | **Phase 2: SPA routing** — React Router, page-by-page migration | Claude Code | 2 days | 4.2 | Not started |
| 4.4 | **Phase 3: Visual Polish** — Team feedback, design refinement | Team + Claude Code | 1-2 days | 4.2 | Not started |
| 4.5 | Cytoscape.js network viewer (interactive, multi-layout, typed edges) | Claude Code | 2 days | 4.2 | Not started |
| 4.6 | Mobile responsiveness testing & fixes | Claude Code (Playwright) | 4 hours | 4.1+ | Not started |

---

### Workstream 5: User Management, LLM & Analytics

**Goal:** User accounts, flexible LLM access, usage tracking.

| # | Task | Who | Effort | Depends On | Status |
|---|------|-----|--------|-----------|--------|
| 5.1 | User DB tables (users, saved_queries, usage_events) | Claude Code | 2 hours | — | Not started |
| 5.2 | Auth system (register, login, JWT for API) | Claude Code | 1 day | 5.1 + 3.1 | Not started |
| 5.3 | Admin dashboard (pipeline status, usage stats, user management) | Claude Code | 1 day | 5.1 + 5.2 | Not started |
| 5.4 | LLM settings page (BYOK key entry, provider selection) | Claude Code | 4 hours | 5.2 + 3.5 | Not started |
| 5.5 | [PREP] Institutional LLM endpoint configured (DGX Spark URL) | Admin | — | Hardware available | Not started |
| 5.6 | Usage event tracking (search, network view, LLM query) | Claude Code | 4 hours | 5.1 | Not started |

---

### Deferred (Not in Initial 2.0 Scope)

| Item | Reason Deferred | Revisit When |
|------|----------------|-------------|
| PMC OA full-text pipeline | Needs separate server + significant compute | Server provisioned |
| Fine-tuned Llama 3.2 (domain models) | Needs GPU + training data curation | DGX Spark available |
| Vignet (Vaccine Ignet) sister site | Depends on VO enhancements + VIOLIN import | Core Ignet 2.0 stable |
| CSRF protection | Low risk (no destructive user actions yet) | User auth implemented |
| Docker containerization | Nice-to-have, not blocking | All services stable |
| Elasticsearch | Only if MySQL FULLTEXT is a bottleneck | DB optimization results |
| GO enrichment analysis | Requires GO data loading + analysis UI | API + frontend stable |

---

### Pre-Implementation Checklist

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | **Redis installed** | DONE (installed 2026-03-15) | Needs: `sudo systemctl enable --now redis` to start |
| 2 | **systemd services** for BioBERT + BioSummarAI | To create during WS1 | Claude Code will create .service files |
| 3 | **Disk space** >30GB free | OK (~52GB free) | Monitor during pipeline catch-up |
| 4 | **LLM endpoint** | Use OpenAI GPT-4.1-nano for now | Same pattern as BioSummarAI (.env with OPENAI_API_KEY). Institutional LLM (DGX Spark) deferred. |
| 5 | **Frontend design direction** | Claude Code leads (Option B) | Phase 1: CSS reskin. Phase 2: React SPA. Phase 3: Team visual polish. |
| 6 | **PubMed pipeline strategy** | Keep pubmed25n series | See details below. HOLD on actual processing until system is stable. |

#### PubMed Pipeline Strategy (Resolved)

**Decision:** Continue using the `pubmed25n` series. Do NOT switch to `pubmed26n` yet.

**Current state:**
- Database has 15.8M gene pairs from 2.65M unique PMIDs (PMID range: 31 to 40,478,615)
- Last processed file: `pubmed25n1654`
- NCBI no longer hosts `pubmed25n` files (replaced by `pubmed26n` baseline in Jan 2026)
- The `pubmed26n` baseline (files 0001-1334) contains ALL prior data including what we missed
- The `pubmed26n` daily updates (files 1335-1384) contain only NEW articles since Jan 30, 2026

**What we missed:** Files `pubmed25n1655` through the end of the 25n series (~150 files). This data is now folded into the `pubmed26n` baseline.

**Plan (HOLD — do not execute until system is stable):**
1. Keep current DB data intact (15.8M gene pairs from prior processing)
2. When ready, start processing `pubmed26n` daily updates (1335 onwards) for new articles
3. The ~150 missed pubmed25n files' data is in the 26n baseline — we can optionally reprocess the baseline later for completeness, but it's not urgent since the core data is already in the DB
4. Update `config.env` to `PUBMED_FILE_PREFIX="pubmed26n"` and `last_processed_number.txt` to `1334` when ready to go live
5. Daily cron setup happens AFTER system is stable and tested

---

## 19. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Database performance at scale (15M+ rows) | High | High | Index optimization first (WS2); Redis cache; partitioning if needed |
| Pipeline catch-up takes too long (50 files) | Medium | Medium | Run overnight/weekend; parallelize if server load permits |
| LLM cost if institutional LLM unavailable | Medium | Medium | Tiered access (BYOK, OpenRouter free); cache LLM responses in Redis |
| Frontend migration breaks existing users | Low | High | Phase 1 CSS-only is reversible; React migration is page-by-page |
| SciMiner dictionary staleness (INO 2016) | Medium | Medium | Update dictionaries in WS1 before daily pipeline goes live |
| Server resources (4 cores, 16GB RAM) | Medium | High | Monitor during pipeline + services; defer local LLM if constrained |
| 52GB disk space runs low | Medium | High | Clean old data; monitor during catch-up; alert at 80% |

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

## Appendix B: Current Infrastructure Inventory

| Resource | Version/Details | Status |
|----------|----------------|--------|
| **OS** | RHEL 9.7 (kernel 5.14) | Active |
| **CPU** | 4 cores | Limited for heavy compute |
| **RAM** | 16GB (11GB available) | Adequate for current load |
| **Disk** | 244GB total, **52GB free** | Tight — needs monitoring |
| **Swap** | 5GB | Active |
| **GPU** | None | No local ML training |
| **Apache** | 2.4.62 (HTTPS, Let's Encrypt, PrivateTmp) | Active |
| **PHP** | 8.0.30 (PHP-FPM) | Active |
| **MariaDB** | 10.5.29 | Active (ignet DB: 15.8M gene pairs) |
| **Python** | 3.12.12 + 3.9.25 | Active (3.12 for services) |
| **Perl** | 5.32.1 | Active (SciMiner pipeline) |
| **Java** | OpenJDK 11.0.25 | Active (SciMiner sentence splitter) |
| **Node.js** | 24.9.0 (via conda) | Available |
| **npm** | Available (via conda) | Available |
| **Redis** | **NOT INSTALLED** | Needed for 2.0 |
| **Nginx** | **NOT INSTALLED** | Optional (Apache works) |
| **Docker** | **NOT INSTALLED** | Optional for 2.0 |
| **Celery** | **NOT INSTALLED** | Needed for async tasks |
| **Domain** | ignet.org | Active |
| **GitHub** | github.com/hurlab/Ignet | Active (6 commits) |
| **SciMiner** | /home/juhur/IgnetSciMiner/ | Built, not yet daily |
| **BioBERT** | Port 9635 (Flask + Waitress) | Running |
| **BioSummarAI** | Port 9636 (Flask + Waitress) | Running |

---

## Appendix C: Infrastructure Requirements for Ignet 2.0

### What Needs to Be Installed/Provisioned BEFORE Implementation

#### Required (Must-Have)

| # | Component | Purpose | Install Method | Notes |
|---|-----------|---------|---------------|-------|
| 1 | **Redis** | Caching layer (query cache, LLM response cache, session data, Celery broker) | `sudo dnf install redis` | ~5MB, minimal resource use. Runs as systemd service. Critical for DB performance at scale. |
| 2 | **Celery** (Python) | Async task processing (LLM calls, network analysis, PubMed searches) | `pip install celery[redis]` in service venvs | Uses Redis as message broker. Prevents blocking web requests on 10-60s LLM calls. |
| 3 | **Disk space cleanup** | Current 52GB free is tight for catch-up processing (50 XML files ~3GB) + future growth | Clean old data, or expand volume | Monitor with `df -h`. SciMiner temp files can be large during processing. |
| 4 | **Daily cron** for SciMiner | Automated PubMed updates | `crontab -e` | No install needed — just configuration. |

#### Recommended (High Value)

| # | Component | Purpose | Install Method | Notes |
|---|-----------|---------|---------------|-------|
| 5 | **Nginx** (reverse proxy) | Unified entry point for Apache + Flask services, WebSocket support, rate limiting | `sudo dnf install nginx` | Can proxy to Apache (:80/443) + BioBERT (:9635) + BioSummarAI (:9636) + future API. Or keep Apache and use it as reverse proxy (also works). |
| 6 | **Additional RAM** | Llama 3.2 8B quantized needs ~8GB RAM for inference; current 16GB shared with DB + services | Hardware upgrade or use smaller model | Only needed if running local LLM. GPT-4o cloud requires no local RAM. |
| 7 | **systemd service files** | Auto-restart BioBERT + BioSummarAI on reboot | Create .service files | No install needed — just configuration. Currently services die on reboot. |
| 8 | **Prometheus + Grafana** | Monitoring (API response times, DB query latency, pipeline status) | `sudo dnf install` or Docker | Nice-to-have for production observability. |

#### For PMCOA Processing (Separate Server)

| # | Component | Purpose | Notes |
|---|-----------|---------|-------|
| 9 | **Separate server** | PMC OA full-text processing (compute-intensive) | On same network. Needs: Python 3.12, Perl, Java, 100GB+ disk, 4+ cores |
| 10 | **rsync/scp access** | Ship PMCOA results back to Ignet server for DB loading | SSH key setup between servers |

#### For Frontend Modernization

| # | Component | Purpose | Notes |
|---|-----------|---------|-------|
| 11 | **Node.js + npm** | React build toolchain (already available via conda) | Already installed: Node 24.9.0 |
| 12 | **React + Tailwind + Cytoscape.js** | Frontend stack | Installed via npm during build. No server-side install needed. |

#### Optional (Future)

| # | Component | Purpose | Notes |
|---|-----------|---------|-------|
| 13 | **Docker + Docker Compose** | Containerized deployment for reproducibility | Nice-to-have. Not required for initial 2.0 launch. |
| 14 | **Elasticsearch** | Full-text search at scale (alternative to MySQL FULLTEXT) | Only if MySQL FULLTEXT becomes a bottleneck. |
| 15 | **GPU server** | ML model training (BioBERT fine-tuning, Llama fine-tuning) | Only for training, not inference. Could use cloud GPU (Lambda, RunPod). |

### Installation Quick-Start (Run Before Implementation)

```bash
# 1. Install Redis
sudo dnf install redis -y
sudo systemctl enable --now redis
redis-cli ping   # Should return PONG

# 2. Install Celery in both Python service venvs
/data/var/www/html/ignet/genepair/bert_files/ignet_cpu/bin/pip install celery[redis]
/data/var/www/html/ignet/biosummarAI/venv312/bin/pip install celery[redis]

# 3. Create systemd service files for Python services
sudo tee /etc/systemd/system/ignet-biobert.service <<'EOF'
[Unit]
Description=Ignet BioBERT Prediction Service
After=network.target

[Service]
Type=simple
User=apache
Group=webapps
WorkingDirectory=/data/var/www/html/ignet/genepair/bert_files
ExecStart=/data/var/www/html/ignet/genepair/bert_files/ignet_cpu/bin/python biobert_prediction.py
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/ignet-biosummarai.service <<'EOF'
[Unit]
Description=Ignet BioSummarAI Service
After=network.target

[Service]
Type=simple
User=apache
Group=webapps
WorkingDirectory=/data/var/www/html/ignet/biosummarAI
ExecStart=/data/var/www/html/ignet/biosummarAI/venv312/bin/python api_biosummary.py
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ignet-biobert ignet-biosummarai

# 4. Verify disk space
df -h /
# If <30GB free, consider cleaning old data or expanding volume

# 5. Configure SciMiner daily cron (after testing one file manually)
# crontab -e
# 0 2 * * * /home/juhur/IgnetSciMiner/automation_scripts/single_xml_pipeline.sh --download >> /home/juhur/IgnetSciMiner/automation_scripts/logs_single/cron.log 2>&1
```

### Resource Budget Estimate

| Component | RAM | Disk | CPU | Network |
|-----------|-----|------|-----|---------|
| Apache + PHP-FPM | 500MB | — | 0.5 core | — |
| MariaDB | 2-4GB | 20GB+ (data) | 1 core | — |
| BioBERT (torch CPU) | 2GB | 1.2GB (venv + model) | 1 core (burst) | — |
| BioSummarAI | 500MB | 300MB (venv) | 0.2 core | OpenAI API |
| Redis | 100MB | 50MB | 0.1 core | — |
| Celery workers (x2) | 500MB | — | 0.5 core | — |
| SciMiner pipeline (when running) | 2-4GB | 3-5GB temp | 4 cores | NCBI FTP |
| **Total (steady state)** | **~8GB** | **~25GB** | **~3 cores** | — |
| **Total (pipeline running)** | **~12GB** | **~30GB** | **4 cores** | — |

Current server has 16GB RAM and 4 cores — **adequate for everything except simultaneous pipeline + local LLM inference**. Llama 3.2 (if used locally) would need RAM upgrade or a dedicated inference server.

---

*This document will be updated as architecture decisions are finalized and implementation progresses.*
