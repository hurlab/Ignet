---
id: SPEC-API-002
type: plan
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
---

# Implementation Plan: SPEC-API-002 — REST API Documentation Portal

## Overview

Build an interactive API documentation page within the React SPA that catalogs all Ignet 2.0 REST API endpoints with descriptions, parameter tables, code snippets (Python, R, curl), and a live "Try it" interface. This is a frontend-only feature with no backend changes required.

## Milestone 1: Documentation Page Structure and Content (Priority High)

### 1.1 Endpoint Data Module

**Files to create:**
- `frontend/src/data/apiEndpoints.js` — Static data file containing all endpoint definitions

**Structure:**
```javascript
export const API_ENDPOINTS = [
  {
    id: "genes-search",
    category: "Genes",
    method: "GET",
    path: "/api/v1/genes/search",
    description: "Search genes by symbol, synonyms, or description.",
    auth: "public",
    parameters: [
      { name: "q", type: "string", required: true, default: null, description: "Search term" },
      { name: "species", type: "string", required: false, default: null, description: "Species filter (tax_id)" },
      { name: "page", type: "integer", required: false, default: 1, description: "Page number" },
      { name: "per_page", type: "integer", required: false, default: 50, description: "Results per page (max 200)" }
    ],
    exampleRequest: { url: "/api/v1/genes/search?q=TNF&per_page=10" },
    exampleResponse: { /* static JSON */ },
    codeSnippets: { python: "...", r: "...", curl: "..." }
  },
  // ... all endpoints
];
```

This data-driven approach enables easy maintenance and future auto-generation.

### 1.2 Main ApiDocs Page

**Files to create:**
- `frontend/src/pages/ApiDocs.jsx` — Main documentation page component

**Features:**
- Sidebar navigation with category groupings (sticky on scroll)
- Smooth scrolling to endpoint sections on sidebar click
- Responsive layout: sidebar collapses to dropdown on mobile
- Category headers with endpoint count badges

### 1.3 Endpoint Card Component

**Files to create:**
- `frontend/src/components/docs/EndpointCard.jsx` — Individual endpoint documentation card

**Features:**
- Method badge (color-coded: GET=green, POST=blue)
- Path with highlighted path parameters
- Description text
- Auth badge ("Public" or "Auth Required")
- Parameters table with type, required, default, description columns
- Collapsible example request/response with JSON syntax highlighting
- Code snippet tabs

### 1.4 Code Snippet Component

**Files to create:**
- `frontend/src/components/docs/CodeSnippet.jsx` — Tabbed code viewer with copy button

**Features:**
- Tabs: Python, R, curl
- Syntax highlighting using `<pre><code>` with Tailwind typography
- "Copy" button with clipboard API and visual feedback
- Code content sourced from `apiEndpoints.js`

### 1.5 Route Registration

**Files to modify:**
- `frontend/src/App.jsx` — Add route for `/ignet/api-docs`
- `frontend/src/components/Header.jsx` — Add "API Docs" navigation link

### Technical Approach

- All endpoint data is embedded in a static JS module — no API calls needed for the docs page
- JSON syntax highlighting via simple CSS class-based approach (no heavy library)
- Sidebar uses IntersectionObserver to highlight the active section during scroll
- Lazy load the ApiDocs page to avoid increasing the main bundle size

---

## Milestone 2: "Try It" Interactive Interface (Priority High)

### 2.1 Try It Component

**Files to create:**
- `frontend/src/components/docs/TryItPanel.jsx` — Interactive API testing form

**Features:**
- Auto-generates form fields from the endpoint's `parameters` definition
- Path parameters: Text inputs that replace `<param>` in the URL
- Query parameters: Text inputs with type hints and default values
- Body parameters: JSON textarea with example pre-filled
- Submit button sends actual `fetch()` request to the API
- Loading state during request
- Response display: status code badge + formatted JSON body + response time
- Copy response button

### 2.2 Response Display Component

**Files to create:**
- `frontend/src/components/docs/ResponseDisplay.jsx` — API response viewer

**Features:**
- Status code with color (2xx=green, 4xx=orange, 5xx=red)
- Response time in milliseconds
- JSON body with indentation and syntax highlighting
- Expandable/collapsible for large responses
- "Copy Response" button

### Technical Approach

- Form fields are dynamically generated from the endpoint parameter definitions
- Requests use `fetch()` with the browser's existing auth cookies
- Response timing measured with `performance.now()`
- For POST endpoints, provide a pre-filled JSON editor with the example request body
- AbortController for request cancellation if user navigates away

---

## Milestone 3: Polish and Accessibility (Priority Medium)

### 3.1 Search and Filter

**Enhancement to ApiDocs.jsx:**
- Add search input at the top of the sidebar
- Filter endpoints by name, path, or description as user types
- Highlight matching text in filtered results

### 3.2 Auth-Aware UI

**Enhancement to TryItPanel.jsx:**
- Check authentication state from AuthContext
- For authenticated endpoints: Show "Login required" message if not authenticated
- For BYOK endpoints: Show note about API key requirement

### 3.3 Responsive Design

**Enhancement to ApiDocs.jsx:**
- Mobile: Sidebar becomes a collapsible drawer or top dropdown
- Tablet: Sidebar narrows, content expands
- Desktop: Full sidebar + content layout
- All code snippets horizontally scrollable on small screens

### 3.4 Deep Linking

**Enhancement to ApiDocs.jsx:**
- URL hash updates when scrolling to an endpoint section: `#genes-search`
- Direct navigation to `https://hurlab.org/ignet/api-docs#genes-search` scrolls to that endpoint
- Share individual endpoint links

---

## Architecture Design Direction

```
frontend/src/
  data/
    apiEndpoints.js         <-- Static endpoint catalog (single source of truth)
  pages/
    ApiDocs.jsx             <-- Main documentation page
  components/
    docs/
      EndpointCard.jsx      <-- Individual endpoint documentation
      CodeSnippet.jsx       <-- Tabbed code viewer with copy
      TryItPanel.jsx        <-- Interactive API testing form
      ResponseDisplay.jsx   <-- API response viewer
```

Data flows one-way: `apiEndpoints.js` -> `ApiDocs.jsx` -> `EndpointCard.jsx` -> `TryItPanel.jsx`

## File Change Summary

| Action | File | Description |
|--------|------|-------------|
| CREATE | `frontend/src/data/apiEndpoints.js` | Static endpoint catalog data |
| CREATE | `frontend/src/pages/ApiDocs.jsx` | Main API docs page |
| CREATE | `frontend/src/components/docs/EndpointCard.jsx` | Endpoint documentation card |
| CREATE | `frontend/src/components/docs/CodeSnippet.jsx` | Code snippet tabs with copy |
| CREATE | `frontend/src/components/docs/TryItPanel.jsx` | Interactive Try It form |
| CREATE | `frontend/src/components/docs/ResponseDisplay.jsx` | Response viewer component |
| MODIFY | `frontend/src/App.jsx` | Add `/ignet/api-docs` route |
| MODIFY | `frontend/src/components/Header.jsx` | Add "API Docs" nav link |

## Dependencies

- No external library dependencies required
- Uses existing Tailwind CSS for styling
- Uses existing auth context for authentication-aware UI
- All endpoint data is manually curated from the Flask route docstrings

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Endpoint data becomes stale | Docs show wrong info | Keep `apiEndpoints.js` as single source; update alongside API changes |
| "Try it" CORS issues | Requests fail from docs page | Same-origin requests (SPA and API share domain); no CORS needed |
| Large page size with all endpoints | Slow initial render | Lazy load page; use virtualization if needed for many endpoints |
| Code snippets have errors | User frustration | Test all code snippets against live API before publishing |

## Maintenance Strategy

- When a new API endpoint is added: Add entry to `apiEndpoints.js`
- When an endpoint changes: Update the corresponding entry in `apiEndpoints.js`
- When an endpoint is removed: Remove from `apiEndpoints.js` or mark as deprecated
- Future v2: Auto-generate `apiEndpoints.js` from Flask route introspection
