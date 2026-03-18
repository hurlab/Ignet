---
id: SPEC-NET-001
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
author: "MoAI"
priority: high
issue_number: 0
tags: [network, dignet, cytoscape, INO, centrality, visualization]
---

# SPEC-NET-001: Context-Aware Network Builder

## Environment

- **Platform**: Ignet 2.0 bioinformatics literature-mining platform
- **Frontend**: React 19 SPA with Cytoscape.js for network visualization
- **Backend**: Flask REST API on port 9637, MariaDB
- **Key Tables**:
  - `t_sentence_hit_gene2gene_Host` (~15.8M rows): geneSymbol1, geneSymbol2, PMID, sentenceID, sentence, score, hasVaccine
  - `ino_host25` (~7.3M rows): sentence_id, matching_phrase (800+ INO interaction types)
  - `t_centrality_score_dignet` (~48K rows): genesymbol, score_type (d/p/c/b), score
- **Existing Endpoints**:
  - `POST /api/v1/dignet/search` -- returns gene pairs from PubMed query
  - `GET /api/v1/dignet/<query_id>` -- returns Cytoscape.js elements (nodes + edges)
- **Existing Frontend**: `Dignet.jsx` renders network graph via `NetworkGraph` component; edges currently have no INO or interaction-type data

## Assumptions

- The `ino_host25` table can be joined to `t_sentence_hit_gene2gene_Host` via `sentence_id = sentenceID`
- INO interaction types can be categorized into broad classes: positive regulation, inhibition, binding, and unknown/other
- The `t_centrality_score_dignet` table contains precomputed centrality scores (degree/pagerank/closeness/betweenness) that do not need real-time recalculation
- PMID-to-year mapping can be derived from the PMID itself (PMIDs are roughly chronological) or from a lookup table; a PMID-year reference table may need to be created or fetched from NCBI
- The current `NetworkGraph` Cytoscape component supports custom stylesheet overrides for edge/node coloring

## Requirements

### R1: INO Edge Color-Coding

**When** user runs a Dignet search, the system **shall** display INO interaction types on graph edges, color-coded as follows:
- Green (#38A169): positive regulation (e.g., "activation", "positive regulation", "upregulation")
- Red (#E53E3E): inhibition (e.g., "inhibition", "negative regulation", "downregulation")
- Blue (#3182CE): binding (e.g., "binding", "association", "interaction")
- Gray (#A0AEC0): unknown or unclassified interaction types

### R2: Centrality-Based Node Coloring

**When** user runs a Dignet search, the system **shall** color-code nodes by their centrality score from `t_centrality_score_dignet`, using a continuous color scale from light blue (low centrality) to dark navy (high centrality). Node size **shall** also scale with centrality.

### R3: Publication Year Time Filter

**When** user enables the time filter, the system **shall** filter network edges by publication year range. The filter **shall** be a dual-handle range slider with min/max bounds derived from the dataset.

### R4: Edge Hover Tooltip

**When** user hovers over an edge, the system **shall** show a tooltip containing:
- The INO interaction type label
- The evidence count (number of sentences supporting this edge)
- The top matching phrase from `ino_host25`

### R5: Vaccine-Only Toggle

**When** user clicks the "Vaccine Only" toggle, the system **shall** filter the network to display only edges where `hasVaccine = 1`. The toggle **shall** be a clearly labeled on/off switch in the filter panel.

### R6: Performance Constraint

The system **shall** return the enhanced Dignet graph (with INO and centrality data) within 5 seconds for networks containing up to 500 edges.

### R7: Backward Compatibility

The system **shall not** break existing Dignet search functionality. The current `/api/v1/dignet/search` and `/api/v1/dignet/<query_id>` responses **shall** continue to work for clients that do not request enhanced data.

## Specifications

### Backend Changes

#### S1: Enhanced `/api/v1/dignet/<query_id>` Endpoint

Modify the existing `network_graph()` function in `api/routes/dignet.py` to:

1. **JOIN `ino_host25`** on `sentence_id = sentenceID` to retrieve the `matching_phrase` for each edge
2. **Aggregate INO types per edge**: For each (gene1, gene2) pair, collect all distinct INO matching phrases and their counts
3. **Classify INO types** into categories (positive_regulation, inhibition, binding, unknown) using a keyword-mapping dictionary
4. **JOIN `t_centrality_score_dignet`** to attach centrality scores to each node
5. Return enhanced edge data: `{ source, target, score, pmid, ino_type, ino_category, ino_count, evidence_count }`
6. Return enhanced node data: `{ id, label, centrality: { degree, pagerank, closeness, betweenness } }`

**Query parameters** (new, optional):
- `has_vaccine` (0 or 1): filter edges by hasVaccine column
- `year_min`, `year_max` (integer): filter edges by publication year range
- `include_ino` (boolean, default true): whether to include INO annotations

#### S2: INO Category Mapping

Create a utility module `api/utils/ino_classifier.py` with a dictionary mapping INO matching phrases to categories:
- `positive_regulation`: activation, positive regulation, upregulation, stimulation, enhancement, induction, promotion
- `inhibition`: inhibition, negative regulation, downregulation, suppression, repression, blocking
- `binding`: binding, association, interaction, complex formation, attachment
- `unknown`: everything else

#### S3: PMID-Year Extraction

Either:
- (a) Create a reference table `t_pmid_year` with (PMID, year) by batch-fetching from NCBI eSummary, OR
- (b) Use PMID range heuristics (less accurate but no external dependency)

Recommended approach: (a) with a background script that populates the table.

### Frontend Changes

#### S4: Cytoscape Edge Styling

Update the `NetworkGraph` component stylesheet to:
- Map `ino_category` to edge color (green/red/blue/gray)
- Apply edge width scaling based on `evidence_count`

#### S5: Node Color Scale

Apply a continuous color scale to nodes based on centrality score:
- Use the primary centrality metric (default: degree centrality)
- Scale: `#BEE3F8` (low) to `#1A365D` (high)
- Node size: 20px (low) to 60px (high)

#### S6: Time Range Slider

Add a range slider component to the Dignet filter panel:
- Two handles for min/max year
- Display selected range as text label
- On change, re-fetch graph data with `year_min` and `year_max` parameters

#### S7: Vaccine Toggle

Add a toggle switch to the filter panel:
- Label: "Vaccine Only"
- On toggle, re-fetch graph data with `has_vaccine=1` parameter

#### S8: Edge Tooltip

Implement an edge hover tooltip using Cytoscape `mouseover` event:
- Show: INO type, evidence count, top matching phrase
- Position: near cursor
- Dismiss: on `mouseout`

## Constraints

- No new npm dependencies for the range slider; use native HTML `<input type="range">` or a lightweight CSS-only approach
- INO classification must be server-side to avoid sending raw matching phrases to the client
- Centrality scores are precomputed; no real-time graph algorithm execution
- Must handle cases where INO data is missing for an edge (fall back to "unknown" category)
- Must handle cases where centrality data is missing for a node (use default styling)

## Traceability

- SPEC-NET-001 > R1 > S1, S2, S4
- SPEC-NET-001 > R2 > S1, S5
- SPEC-NET-001 > R3 > S1, S3, S6
- SPEC-NET-001 > R4 > S1, S8
- SPEC-NET-001 > R5 > S1, S7
- SPEC-NET-001 > R6 > S1
- SPEC-NET-001 > R7 > S1
