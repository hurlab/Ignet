---
id: SPEC-API-002
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
author: "MoAI"
priority: high
issue_number: 0
---

# SPEC-API-002: REST API Documentation Portal

## 1. Environment

- **Platform**: Ignet 2.0 — React 19 SPA + Flask REST API + MariaDB
- **Existing API Endpoints** (organized by blueprint):
  - **Genes** (`genes.py`): `GET /api/v1/genes/search`, `GET /api/v1/genes/autocomplete`, `GET /api/v1/genes/top`, `GET /api/v1/genes/<symbol>/neighbors`
  - **Pairs** (`pairs.py`): `GET /api/v1/pairs/<sym1>/<sym2>`
  - **Dignet** (`dignet.py`): `POST /api/v1/dignet/search`, `GET /api/v1/dignet/<query_id>`, `GET /api/v1/dignet/<query_id>/export/graphml`
  - **LLM** (`llm.py`): `POST /api/v1/summarize`, `POST /api/v1/chat`, `POST /api/v1/predict`
  - **Stats** (`stats.py`): `GET /api/v1/stats`
  - **Auth** (`auth.py`): Authentication endpoints
  - **Admin** (`admin.py`): Administration endpoints
- **Frontend Stack**: React 19, Vite, Tailwind CSS
- **Base URL**: `https://hurlab.org/ignet/api/v1/`

## 2. Assumptions

- The API documentation page will be part of the React SPA, not a separate Swagger UI deployment. This keeps the documentation integrated with the platform and avoids additional infrastructure.
- API endpoint signatures and parameters are documented in the Python docstrings of each route function. These can be extracted manually for the initial version.
- The "Try it" interface can use the browser's existing authentication state (cookies/tokens) for authenticated endpoints.
- Code snippets in Python and R are static examples that cover the most common use cases; they do not need to be dynamically generated.
- The documentation will initially be manually maintained. Auto-generation from Flask route definitions is a future enhancement (v2).

## 3. Requirements

### 3.1 Ubiquitous Requirements

- **[REQ-DOC-U01]** The system shall provide an interactive API documentation page accessible at `/ignet/api-docs`.
- **[REQ-DOC-U02]** The system shall organize API endpoints by functional category: Genes, Pairs, Network (Dignet), AI/LLM, Statistics, and Authentication.
- **[REQ-DOC-U03]** The system shall display consistent styling matching the Ignet 2.0 design system (Tailwind CSS).

### 3.2 Event-Driven Requirements

- **[REQ-DOC-E01]** When a user views an endpoint entry, the system shall display: HTTP method badge, path, description, parameters table (name, type, required/optional, default, description), and example request/response JSON.
- **[REQ-DOC-E02]** When a user clicks "Try it" on an endpoint, the system shall present a form with input fields for each parameter, a submit button, and a response display area showing status code, headers, and body.
- **[REQ-DOC-E03]** When a user selects a code snippet tab (Python, R, curl), the system shall display a copy-ready code example for the selected endpoint in the chosen language.
- **[REQ-DOC-E04]** When a user submits a "Try it" request, the system shall send an actual API request to the backend and display the live response.
- **[REQ-DOC-E05]** When a user clicks on an endpoint in the sidebar navigation, the system shall scroll to and highlight the corresponding endpoint section.

### 3.3 State-Driven Requirements

- **[REQ-DOC-S01]** While the user is not authenticated, the system shall show "Try it" for public endpoints only and display a login prompt for authenticated endpoints.
- **[REQ-DOC-S02]** While the "Try it" request is in progress, the system shall display a loading indicator and disable the submit button.

### 3.4 Unwanted Behavior Requirements

- **[REQ-DOC-N01]** The system shall not execute "Try it" requests to destructive endpoints (DELETE, PUT) without a confirmation dialog.
- **[REQ-DOC-N02]** The system shall not display internal implementation details (database table names, internal service URLs) in the public documentation.

### 3.5 Optional Requirements

- **[REQ-DOC-O01]** Where feasible, the system shall auto-generate documentation from Flask route definitions and docstrings.
- **[REQ-DOC-O02]** Where feasible, the system shall provide a downloadable OpenAPI/Swagger JSON specification file.

## 4. Specifications

### 4.1 Page Structure

The API documentation page is organized as a single-page layout with sidebar navigation:

```
+------------------+------------------------------------------------+
| Sidebar          | Main Content                                   |
|                  |                                                |
| [Genes]          | # Genes API                                    |
|   - Search       |                                                |
|   - Autocomplete | ## GET /api/v1/genes/search                    |
|   - Top Genes    | Description: Search genes by symbol...         |
|   - Neighbors    | Parameters: [table]                            |
|                  | Example Request / Response                     |
| [Pairs]          | Code Snippets: [Python] [R] [curl]             |
|   - Evidence     | [Try it] button + form                         |
|                  |                                                |
| [Network]        | ---                                            |
|   - Search       |                                                |
|   - Graph        | ## GET /api/v1/genes/autocomplete              |
|   - Export       | ...                                            |
|                  |                                                |
| [AI/LLM]        |                                                |
|   - Summarize    |                                                |
|   - Chat         |                                                |
|   - Predict      |                                                |
|                  |                                                |
| [Statistics]     |                                                |
| [Auth]           |                                                |
+------------------+------------------------------------------------+
```

### 4.2 Endpoint Documentation Format

Each endpoint section includes:

1. **Method Badge**: Color-coded (GET=green, POST=blue, PUT=orange, DELETE=red)
2. **Path**: Monospaced, with path parameters highlighted
3. **Description**: Plain text explanation of the endpoint purpose
4. **Authentication**: Badge showing "Public" or "Auth Required"
5. **Parameters Table**:
   | Name | Type | Required | Default | Description |
   |------|------|----------|---------|-------------|
6. **Example Request**: JSON body (for POST) or URL with query params (for GET)
7. **Example Response**: Formatted JSON with syntax highlighting
8. **Code Snippets**: Tabbed view with Python (requests), R (httr2), and curl examples
9. **Try It Form**: Interactive form with parameter inputs and response display

### 4.3 Endpoint Catalog

#### Genes Category

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | GET | `/api/v1/genes/search` | Public | Search genes by symbol, synonyms, or description |
| 2 | GET | `/api/v1/genes/autocomplete` | Public | Fast prefix search on gene symbols |
| 3 | GET | `/api/v1/genes/top` | Public | Top connected genes by co-occurrence count |
| 4 | GET | `/api/v1/genes/<symbol>/neighbors` | Public | Gene interaction neighbors with filters |

#### Pairs Category

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 5 | GET | `/api/v1/pairs/<sym1>/<sym2>` | Public | Evidence sentences for a gene pair interaction |

#### Network (Dignet) Category

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 6 | POST | `/api/v1/dignet/search` | Public | Search PubMed and return matching gene pairs |
| 7 | GET | `/api/v1/dignet/<query_id>` | Public | Cytoscape.js graph for a query |
| 8 | GET | `/api/v1/dignet/<query_id>/export/graphml` | Public | Export network as GraphML file |

#### AI/LLM Category

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 9 | POST | `/api/v1/summarize` | Public (BYOK) | Gene interaction summarization via GPT-4o |
| 10 | POST | `/api/v1/chat` | Public (BYOK) | Conversation continuation with BioSummarAI |
| 11 | POST | `/api/v1/predict` | Public | BioBERT NER sentence prediction |

#### Statistics Category

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 12 | GET | `/api/v1/stats` | Public | Aggregate database statistics |

#### Authentication Category

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 13+ | Various | `/api/v1/auth/...` | Various | Login, register, token management |

### 4.4 Code Snippet Templates

**Python Example** (for `GET /api/v1/genes/search`):
```python
import requests

response = requests.get(
    "https://hurlab.org/ignet/api/v1/genes/search",
    params={"q": "TNF", "per_page": 10}
)
data = response.json()
for gene in data["data"]:
    print(f"{gene['Symbol']}: {gene['description']}")
```

**R Example** (for `GET /api/v1/genes/search`):
```r
library(httr2)
library(jsonlite)

resp <- request("https://hurlab.org/ignet/api/v1/genes/search") |>
  req_url_query(q = "TNF", per_page = 10) |>
  req_perform()

data <- resp_body_json(resp)
for (gene in data$data) {
  cat(gene$Symbol, ":", gene$description, "\n")
}
```

**curl Example**:
```bash
curl -s "https://hurlab.org/ignet/api/v1/genes/search?q=TNF&per_page=10" | jq
```

### 4.5 "Try It" Interface Specification

- Parameter inputs auto-populated with example values
- Path parameters rendered as text inputs replacing `<param>` placeholders
- Query parameters rendered as text inputs with type hints
- Body parameters rendered as a JSON editor textarea
- Submit button sends actual request via `fetch()`
- Response display: Status code badge + formatted JSON body
- Copy response button for easy data extraction

### 4.6 No Backend Changes Required

This SPEC is frontend-only. The documentation page is a static React component that hardcodes the endpoint catalog. No new Flask endpoints or OpenAPI specification file is needed for v1.

## 5. Constraints

- The documentation page must load without any additional API calls (endpoint data is embedded in the component)
- The page must be responsive and usable on tablet-sized screens
- Code snippets must be copy-ready (no placeholder values that would cause errors)
- "Try it" requests use the same authentication state as the main application
- Documentation content must not expose internal database schema, table names, or service ports

## 6. Traceability

| Requirement | Plan Reference | Acceptance Reference |
|-------------|---------------|---------------------|
| REQ-DOC-U01 | Milestone 1: Page Structure | AC-DOC-001 |
| REQ-DOC-E01 | Milestone 1: Endpoint Cards | AC-DOC-002 |
| REQ-DOC-E02 | Milestone 2: Try It Interface | AC-DOC-003 |
| REQ-DOC-E03 | Milestone 1: Code Snippets | AC-DOC-004 |
| REQ-DOC-E04 | Milestone 2: Try It Interface | AC-DOC-005 |
| REQ-DOC-E05 | Milestone 1: Sidebar Navigation | AC-DOC-006 |
| REQ-DOC-S01 | Milestone 2: Auth-Aware UI | AC-DOC-007 |
