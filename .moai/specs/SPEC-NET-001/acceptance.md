---
id: SPEC-NET-001
type: acceptance
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
tags: [network, dignet, cytoscape, INO, centrality]
---

# SPEC-NET-001: Acceptance Criteria -- Context-Aware Network Builder

## AC-1: INO Edge Color-Coding

### Scenario 1.1: Edges display correct INO colors

**Given** a Dignet search result with gene pairs that have INO annotations in `ino_host25`
**When** the network graph renders
**Then** edges with positive regulation INO types are colored green (#38A169)
**And** edges with inhibition INO types are colored red (#E53E3E)
**And** edges with binding INO types are colored blue (#3182CE)
**And** edges with unknown/unclassified INO types are colored gray (#A0AEC0)

### Scenario 1.2: Edges without INO data default to gray

**Given** a Dignet search result where some gene pairs have no matching entries in `ino_host25`
**When** the network graph renders
**Then** those edges are displayed in gray (#A0AEC0) with category "unknown"

### Scenario 1.3: Edge width reflects evidence count

**Given** a Dignet search result with varying evidence counts per edge
**When** the network graph renders
**Then** edge width scales proportionally to the evidence count (minimum 1px, maximum 6px)

---

## AC-2: Centrality-Based Node Coloring

### Scenario 2.1: Nodes colored by centrality score

**Given** a network with genes that have centrality scores in `t_centrality_score_dignet`
**When** the network graph renders
**Then** node color follows a continuous scale from light blue (#BEE3F8) for low centrality to dark navy (#1A365D) for high centrality

### Scenario 2.2: Node size reflects centrality

**Given** a network with genes that have centrality scores
**When** the network graph renders
**Then** node diameter scales from 20px (lowest centrality) to 60px (highest centrality)

### Scenario 2.3: Nodes without centrality data use default styling

**Given** a network where some genes do not have entries in `t_centrality_score_dignet`
**When** the network graph renders
**Then** those nodes display with medium blue color and 30px default size

---

## AC-3: Publication Year Time Filter

### Scenario 3.1: Time filter restricts visible edges

**Given** a Dignet search result with the time filter enabled
**When** user sets the range to 2020-2025
**Then** only edges derived from PMIDs published between 2020 and 2025 are displayed
**And** the node set updates to reflect only genes connected by visible edges

### Scenario 3.2: Time filter slider shows correct bounds

**Given** a Dignet search result
**When** the time filter slider renders
**Then** the minimum value is the earliest publication year in the dataset
**And** the maximum value is the latest publication year in the dataset

### Scenario 3.3: Time filter triggers API re-fetch

**Given** user changes the time filter range
**When** the slider handles are released
**Then** the system sends a new request to `/api/v1/dignet/<query_id>?year_min=X&year_max=Y`
**And** the graph updates with filtered results

---

## AC-4: Edge Hover Tooltip

### Scenario 4.1: Tooltip displays on edge hover

**Given** a rendered network graph with INO-annotated edges
**When** user hovers over an edge
**Then** a tooltip appears showing:
  - INO interaction type label (e.g., "Positive Regulation")
  - Evidence count (e.g., "12 sentences")
  - Top matching phrase (e.g., "activation of gene expression")

### Scenario 4.2: Tooltip dismisses on mouse out

**Given** a tooltip is currently displayed
**When** user moves the cursor away from the edge
**Then** the tooltip disappears

### Scenario 4.3: Tooltip for edge without INO data

**Given** an edge with no INO annotations
**When** user hovers over the edge
**Then** the tooltip shows "Unknown interaction type" and the co-occurrence count

---

## AC-5: Vaccine-Only Toggle

### Scenario 5.1: Toggle filters to vaccine edges

**Given** a Dignet search result with both vaccine and non-vaccine edges
**When** user clicks the "Vaccine Only" toggle ON
**Then** only edges where `hasVaccine = 1` are displayed
**And** the node set updates to reflect only genes connected by vaccine edges

### Scenario 5.2: Toggle restores all edges

**Given** the "Vaccine Only" toggle is ON
**When** user clicks the toggle OFF
**Then** all edges (vaccine and non-vaccine) are restored

### Scenario 5.3: Vaccine toggle with no vaccine edges

**Given** a Dignet search result where no edges have `hasVaccine = 1`
**When** user clicks the "Vaccine Only" toggle ON
**Then** the graph displays an empty state message: "No vaccine-related interactions found for this query"

---

## AC-6: Performance

### Scenario 6.1: Response time for enriched graph

**Given** a Dignet query that produces up to 500 edges
**When** the enhanced graph data is requested (with INO and centrality)
**Then** the API responds within 5 seconds

### Scenario 6.2: Large network degradation

**Given** a Dignet query that produces more than 500 edges
**When** the graph renders
**Then** only the first 500 edges are displayed (existing behavior)
**And** a warning message indicates the total edge count and suggests exporting GraphML

---

## AC-7: Backward Compatibility

### Scenario 7.1: Existing API contract preserved

**Given** an API client that calls `GET /api/v1/dignet/<query_id>` without new parameters
**When** the response is received
**Then** the response contains all existing fields (`query_id`, `keywords`, `elements.nodes`, `elements.edges`, `stats`)
**And** new fields (`ino_category`, `centrality`) are additive and do not break existing clients

### Scenario 7.2: Frontend without filters works

**Given** a user who does not interact with any filter controls
**When** they perform a standard Dignet search
**Then** the graph renders with INO colors and centrality sizing by default (enhanced view is the new default)

---

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Gene pair appears in both directions (A-B and B-A) | Merge into single undirected edge with combined INO data |
| Multiple INO types for the same edge | Use the most frequent INO category for edge color; show all types in tooltip |
| Centrality score_type has multiple entries per gene | Use degree centrality as default; provide selector for other types |
| PMID has no year mapping | Exclude from year filter; include in unfiltered view |
| Network has 0 edges after filtering | Display "No interactions match your filters" message |
| INO matching_phrase is empty string or NULL | Classify as "unknown" |

## Performance Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| API response time (500 edges, with INO+centrality) | < 5 seconds | Server-side timing |
| Frontend render time (500 nodes + edges) | < 2 seconds | Browser performance profiling |
| INO classification accuracy | > 90% of known phrases correctly classified | Manual spot-check of 100 random phrases |

## Definition of Done

- [ ] Backend: Enhanced `/api/v1/dignet/<query_id>` returns INO and centrality data
- [ ] Backend: Filter parameters (`has_vaccine`, `year_min`, `year_max`) work correctly
- [ ] Backend: INO classifier handles all major interaction categories
- [ ] Frontend: Edges are color-coded by INO category
- [ ] Frontend: Nodes are colored and sized by centrality
- [ ] Frontend: Time range slider filters edges by publication year
- [ ] Frontend: Vaccine-only toggle works correctly
- [ ] Frontend: Edge hover tooltip displays INO information
- [ ] Frontend: Graph legend updated to reflect new color scheme
- [ ] Performance: API response within 5 seconds for 500-edge networks
- [ ] Backward compatibility: Existing API clients unaffected
