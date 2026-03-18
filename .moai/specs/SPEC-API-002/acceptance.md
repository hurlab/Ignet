---
id: SPEC-API-002
type: acceptance
version: "1.0.0"
status: draft
created: "2026-03-18"
updated: "2026-03-18"
---

# Acceptance Criteria: SPEC-API-002 — REST API Documentation Portal

## AC-DOC-001: Documentation Page Accessibility

**Requirement**: REQ-DOC-U01

### Scenario 1: Page loads at correct route

```gherkin
Given the user navigates to /ignet/api-docs
When the page loads
Then the API documentation page is displayed
And the page title indicates "API Documentation"
And the sidebar navigation is visible with endpoint categories
```

### Scenario 2: Navigation link in header

```gherkin
Given the user is on any Ignet page
When the user looks at the main navigation header
Then an "API Docs" link is visible
And clicking it navigates to /ignet/api-docs
```

### Scenario 3: Page loads without API calls

```gherkin
Given the user navigates to /ignet/api-docs
When the page loads
Then no API calls are made to load documentation content
And all endpoint data is rendered from the embedded static data
```

---

## AC-DOC-002: Endpoint Documentation Display

**Requirement**: REQ-DOC-E01

### Scenario 1: Complete endpoint information

```gherkin
Given the user views the "GET /api/v1/genes/search" endpoint section
When the section is visible
Then a green "GET" method badge is displayed
Then the path "/api/v1/genes/search" is shown in monospace font
Then the description "Search genes by symbol, synonyms, or description" is displayed
Then a parameters table shows: q (string, required), species (string, optional), page (integer, optional, default 1), per_page (integer, optional, default 50)
Then an example request URL is shown
Then an example response JSON is shown with syntax highlighting
```

### Scenario 2: POST endpoint with request body

```gherkin
Given the user views the "POST /api/v1/dignet/search" endpoint section
When the section is visible
Then a blue "POST" method badge is displayed
Then the example request section shows a JSON body with "keywords" field
Then the parameters table describes the JSON body fields
```

### Scenario 3: All endpoints are documented

```gherkin
Given the user scrolls through the entire documentation page
When all sections are loaded
Then at least 12 API endpoints are documented
And endpoints are grouped under: Genes, Pairs, Network, AI/LLM, Statistics, Auth
```

---

## AC-DOC-003: Try It Interactive Form

**Requirement**: REQ-DOC-E02

### Scenario 1: Try It form for GET endpoint

```gherkin
Given the user expands "Try it" for "GET /api/v1/genes/search"
When the form is displayed
Then a text input for "q" is shown (marked as required)
Then optional inputs for "species", "page", "per_page" are shown with default values
Then a "Send Request" button is available
```

### Scenario 2: Try It form for POST endpoint

```gherkin
Given the user expands "Try it" for "POST /api/v1/dignet/search"
When the form is displayed
Then a JSON editor textarea is shown pre-filled with example request body
Then a "Send Request" button is available
```

### Scenario 3: Path parameter input

```gherkin
Given the user expands "Try it" for "GET /api/v1/genes/<symbol>/neighbors"
When the form is displayed
Then a text input for "symbol" is shown (labeled as path parameter)
Then the URL preview updates as the user types a gene symbol
```

---

## AC-DOC-004: Code Snippets

**Requirement**: REQ-DOC-E03

### Scenario 1: Python code snippet

```gherkin
Given the user views code snippets for "GET /api/v1/genes/search"
When the "Python" tab is selected
Then a Python code example using the requests library is displayed
And the code uses the correct endpoint URL and example parameters
And a "Copy" button is visible
```

### Scenario 2: R code snippet

```gherkin
Given the user views code snippets for "GET /api/v1/genes/search"
When the "R" tab is selected
Then an R code example using httr2 is displayed
And the code is syntactically correct and copy-ready
```

### Scenario 3: curl code snippet

```gherkin
Given the user views code snippets for "GET /api/v1/genes/search"
When the "curl" tab is selected
Then a curl command is displayed with correct URL and parameters
And the command includes "| jq" for JSON formatting
```

### Scenario 4: Copy to clipboard

```gherkin
Given the user views a code snippet
When the user clicks the "Copy" button
Then the code is copied to the clipboard
And visual feedback confirms the copy action (button text changes or checkmark appears)
```

---

## AC-DOC-005: Live API Request from Try It

**Requirement**: REQ-DOC-E04

### Scenario 1: Successful GET request

```gherkin
Given the user fills in "q" = "TNF" in the Try It form for genes/search
When the user clicks "Send Request"
Then a loading indicator is shown
Then the actual API response is displayed below the form
And the response includes a status code badge (200 = green)
And the response body is formatted JSON
And the response time in milliseconds is shown
```

### Scenario 2: Error response display

```gherkin
Given the user leaves "q" empty in the Try It form for genes/search
When the user clicks "Send Request"
Then the API returns a 400 error
And the status code badge shows "400" in orange
And the error message JSON is displayed
```

### Scenario 3: Loading state

```gherkin
Given the user clicks "Send Request"
When the request is in progress
Then the "Send Request" button is disabled
And a loading spinner or indicator is shown
And the button re-enables after the response arrives
```

---

## AC-DOC-006: Sidebar Navigation

**Requirement**: REQ-DOC-E05

### Scenario 1: Click to scroll

```gherkin
Given the user is on the API docs page
When the user clicks "Autocomplete" under the "Genes" category in the sidebar
Then the page scrolls smoothly to the genes/autocomplete endpoint section
And the sidebar item is highlighted as active
```

### Scenario 2: Scroll tracking

```gherkin
Given the user manually scrolls through the documentation
When the "Pairs" section enters the viewport
Then the "Pairs" category in the sidebar becomes highlighted
And the previously active category is un-highlighted
```

### Scenario 3: Deep linking

```gherkin
Given the user navigates to /ignet/api-docs#genes-search
When the page loads
Then the page scrolls to the genes/search endpoint section
And the sidebar highlights the corresponding item
```

---

## AC-DOC-007: Authentication-Aware UI

**Requirement**: REQ-DOC-S01

### Scenario 1: Public endpoints always available

```gherkin
Given the user is not authenticated
When viewing public endpoints (genes/search, stats, etc.)
Then the "Try it" form is fully functional
And no login prompt is shown
```

### Scenario 2: Auth-required endpoints show login prompt

```gherkin
Given the user is not authenticated
When viewing an endpoint that requires authentication
Then the "Try it" form shows a message: "Login required to test this endpoint"
And a link to the login page is provided
```

### Scenario 3: BYOK endpoints show key notice

```gherkin
Given the user views the "POST /api/v1/summarize" endpoint
When the Try It section is visible
Then a notice indicates that an OpenAI API key is needed for full functionality
And authenticated users with stored keys can proceed normally
```

---

## AC-DOC-008: Endpoint Categories and Organization

**Requirement**: REQ-DOC-U02

### Scenario 1: Category grouping

```gherkin
Given the user views the documentation page
When all content is loaded
Then endpoints are grouped under the following categories:
  | Category    | Endpoint Count |
  | Genes       | 4              |
  | Pairs       | 1              |
  | Network     | 3              |
  | AI/LLM      | 3              |
  | Statistics  | 1              |
  | Auth        | 1+             |
And each category has a header with the category name
```

### Scenario 2: Consistent ordering

```gherkin
Given the user views the documentation page
When scrolling from top to bottom
Then categories appear in this order: Genes, Pairs, Network, AI/LLM, Statistics, Auth
And endpoints within each category are ordered by most commonly used first
```

---

## AC-DOC-009: Responsive Design

### Scenario 1: Desktop layout

```gherkin
Given the user views the API docs on a desktop browser (width >= 1024px)
When the page loads
Then the sidebar is visible on the left (fixed/sticky)
And the main content fills the remaining width
```

### Scenario 2: Mobile layout

```gherkin
Given the user views the API docs on a mobile device (width < 768px)
When the page loads
Then the sidebar is collapsed into a dropdown or hamburger menu
And the main content takes full width
And code snippets are horizontally scrollable
```

---

## Quality Gate Criteria

### Performance

- Documentation page initial load: < 1 second
- "Try it" response display: < 500ms after API response received
- Sidebar scroll tracking: No perceptible lag
- Code snippet copy: < 100ms feedback

### Usability

- All code snippets are syntactically correct and executable as-is
- Example request/response data matches actual API behavior
- Parameter descriptions are clear enough for a user unfamiliar with the API
- "Try it" form inputs have appropriate type constraints (number inputs for integer params)

### Content Accuracy

- Every documented parameter matches the actual API implementation
- Example responses match the actual API response structure
- Required/optional designation is accurate for every parameter
- Default values match the actual API defaults

### Security

- No internal database table names appear in the documentation
- No internal service URLs or ports are exposed
- "Try it" requests do not bypass authentication requirements
- API keys are never displayed in responses or code snippets

## Definition of Done

- [ ] API documentation page loads at `/ignet/api-docs`
- [ ] All 12+ API endpoints are documented with method, path, parameters, and examples
- [ ] Sidebar navigation with category groupings and scroll tracking works
- [ ] Code snippets (Python, R, curl) are displayed with tabs and copy functionality
- [ ] "Try it" interface sends live requests and displays responses
- [ ] Authentication-aware UI shows appropriate messages for restricted endpoints
- [ ] Page is responsive across desktop, tablet, and mobile
- [ ] Deep linking with URL hash works for individual endpoints
- [ ] No internal implementation details are exposed in documentation
- [ ] All code snippets tested against the live API
