# Ignet Changelog

All notable changes to the Ignet platform are documented here.

## [Unreleased]

### 2026-06-16 — Dignet: PMID-list upload + CoV-protein overlay

Two new Dignet capabilities:

- **PMID-list upload mode.** Build a network from a user-supplied list of PMIDs
  (paste or file upload, up to 50,000) instead of a keyword search. New endpoint
  `POST /api/v1/dignet/search-pmids` (no NCBI call); gene pairs are aggregated
  server-side into weighted edges (evidence = supporting-PMID count) so large
  lists stay tractable. The UI shows a PMID-coverage stat (how many of the
  uploaded PMIDs are in the Ignet corpus).
- **CoV-protein overlay.** A toggle that overlays coronavirus viral proteins
  (spike, nucleocapsid, RdRp, nsp1–16, ORFs) on the gene network as a distinct
  node type (teal pentagons), sourced from `t_cooccurrence_cov_gene`
  (`GET /api/v1/dignet/<id>/cov-genes`). This visually distinguishes host genes
  from CoV proteins.

Also: footer now shows a "Site updated" date distinct from the database data date;
Disclaimer "Last updated" date refreshed.

**Known limitation documented (future work):** gene/protein identification has no
species disambiguation — a few pathogen protein names that collide with human gene
symbols/aliases (e.g., "SARS", viral NSP1/NSP2/NSP3) are misattributed to human
genes. See `docs/KNOWN_LIMITATIONS.md`.

### 2026-05-28 — Revert hurlab.med.und.edu HTTPS downgrade

TLS on `hurlab.med.und.edu` is restored (UND wildcard `*.med.und.edu`,
GlobalSign, valid through 2026-10-10). Reverted the 2026-05-06 mitigation:
outbound links in About and Contact pages restored from
`http://hurlab.med.und.edu` to `https://hurlab.med.und.edu`. Applied to both
React source (`frontend/src/pages/About.jsx`, `Contact.jsx`) and the
currently-served compiled bundles in `dist-react/assets/`. The Vignet sister
repo received the same revert in the same session. `TEMP_HTTPS_DOWNGRADE.md`
removed.

### 2026-05-06 — Temporary mitigation: hurlab.med.und.edu HTTPS → HTTP

Outbound links from About and Contact pages downgraded from
`https://hurlab.med.und.edu` to `http://hurlab.med.und.edu` while TLS on the
hurlab server is offline. **Reverted 2026-05-28** (see entry above).

The Vignet sister repo received the same mitigation in the same session.

### 2026-05-06 — Header legacy-link label

Header link to `/ignet_legacy/` relabeled from `v2.1` to `v1.0` so the label
reflects the legacy site's actual major version.

### 2026-05-06 — Clean dist-react rebuild

Stale Vite bundles from prior incremental builds removed; `dist-react/assets/`
now contains only the chunks referenced by the current `index.html`.

## [2.1.0] — 2026-04-05

### Daily Update Pipeline
- Automated daily PubMed update pipeline with BioBERT scoring
- Loop-until-caught-up strategy: processes all pending files in a single run
- Safety assertions: tracking advance check + post-write verification
- Sentence ID continuity with DB-backed persistence
- Output archival to `archive/<date_tag>/` after each file
- Processed 18 daily update files (pubmed26n1386–1404), adding 135K+ gene pairs

### Navigation
- Reorganized top menu into 3 dropdown groups: Explore, Analyze, AI Tools
- Hover-to-open dropdowns with smooth transitions
- Each menu item includes a short description

### Network Visualization
- Fullscreen toggle for network graphs (Esc to exit)
- Edge deduplication: one edge per gene pair, thickness = PMID count
- Export to Cytoscape JSON (.cyjs) for Cytoscape desktop import
- Export to XGMML (.xgmml) standard network format
- Increased graph display limit to 2,000 edges
- Limit options expanded: 50, 100, 200, 500, 1000, 2000, 5000

### Report & AI Tools
- Fixed Report page timeouts (60–90s for heavy API calls)
- AI summary now renders markdown (bold, numbered lists, paragraphs)
- Fixed AI summary response parsing for BioSummarAI format

### Data & Database
- Database updated daily from PubMed (footer shows last update date)
- Renamed biosummary25_Host to t_biosummary for schema consistency
- Created read-only VIEWs for legacy site compatibility
- Legacy site fully isolated: writes go to legacy-only tables

### User Experience
- Fixed Gene page network pane overflow (350px wrapper removed)
- Fixed PubMed search box: works from any page, re-searches correctly
- Added User Manual page (/ignet/manual) with rendered markdown
- Added data currency indicator in footer
- Added cache refresh button for Dignet cached results

### Infrastructure
- BioSummarAI service restarted with updated table references
- API server updated for data_last_updated stats endpoint

## [2.0.0] — 2026-03-31

### Public Release
- Complete React 19 SPA with Vite 8 and Tailwind CSS
- 11 interactive tools: Dignet, Gene, GenePair, Enrichment, Compare, BioSummarAI, Analyze Text, Explore, INO Explorer, Assistant, Report
- BioBERT deep learning for gene interaction prediction
- GPT-4o powered AI summarization via BioSummarAI
- MCP (Model Context Protocol) endpoint with 8 tools for AI assistants
- REST API with 19 endpoints
- pubmed26n database: 5.1M gene pairs, 1.9M sentences, 42M+ INO annotations
- User authentication with API keys
- Rate limiting for anonymous users (20 AI requests/day)
- User manual, README, LICENSE (MIT)
- Security cleanup: removed dev files, secrets from git history

## [1.0.0] — 2024

### Legacy Version
- PHP/jQuery-based interface
- SciMiner NLP pipeline for gene extraction
- Gene pair network visualization
- BioSummarAI literature summarization
- Dignet PubMed search with network graphs
- Available at /ignet_legacy/
