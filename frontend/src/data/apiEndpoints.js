export const API_CATEGORIES = [
  { id: 'genes', label: 'Genes', description: 'Gene search, autocomplete, and neighbor interactions' },
  { id: 'pairs', label: 'Gene Pairs', description: 'Pairwise interaction evidence with BioBERT scores' },
  { id: 'dignet', label: 'Dignet', description: 'PubMed-driven network search and visualization' },
  { id: 'ino', label: 'INO', description: 'Browse Interaction Network Ontology terms' },
  { id: 'llm', label: 'AI / LLM', description: 'BioSummarAI summarization and chat' },
  { id: 'auth', label: 'Authentication', description: 'User registration, login, and API key management' },
  { id: 'admin', label: 'Admin', description: 'Platform statistics (admin only)' },
]

export const API_ENDPOINTS = [
  {
    id: 'health', category: 'admin', method: 'GET', path: '/api/v1/health',
    description: 'Health check. Returns service status.',
    auth: false,
    params: [],
    example: { response: '{"status": "ok", "service": "ignet-api"}' },
    snippets: {
      curl: "curl https://ignet.org/api/v1/health",
      python: "import requests\nr = requests.get('https://ignet.org/api/v1/health')\nprint(r.json())",
      r: 'library(httr)\nr <- GET("https://ignet.org/api/v1/health")\ncontent(r)',
    }
  },
  {
    id: 'stats', category: 'admin', method: 'GET', path: '/api/v1/stats',
    description: 'Database statistics: gene count, interaction count, PMID count, sentence count.',
    auth: false, params: [],
    example: { response: '{"total_genes": 11817, "total_interactions": 573167, "total_pmids": 219004, "total_sentences": 360283}' },
    snippets: { curl: "curl https://ignet.org/api/v1/stats", python: "requests.get('https://ignet.org/api/v1/stats').json()", r: 'content(GET("https://ignet.org/api/v1/stats"))' }
  },
  {
    id: 'genes-search', category: 'genes', method: 'GET', path: '/api/v1/genes/search',
    description: 'Search genes by symbol or description. Returns matching gene metadata.',
    auth: false,
    params: [
      { name: 'q', type: 'string', required: true, desc: 'Search term (min 2 chars)' },
      { name: 'page', type: 'int', required: false, desc: 'Page number (default 1)' },
      { name: 'per_page', type: 'int', required: false, desc: 'Results per page (default 50, max 200)' },
    ],
    example: { request: '/api/v1/genes/search?q=BRCA1', response: '{"data": [{"GeneID": 672, "Symbol": "BRCA1", "description": "..."}], "total": 1}' },
    snippets: { curl: "curl 'https://ignet.org/api/v1/genes/search?q=TNF'", python: "requests.get('https://ignet.org/api/v1/genes/search', params={'q': 'TNF'}).json()", r: 'content(GET("https://ignet.org/api/v1/genes/search", query=list(q="TNF")))' }
  },
  {
    id: 'genes-autocomplete', category: 'genes', method: 'GET', path: '/api/v1/genes/autocomplete',
    description: 'Prefix-based autocomplete for gene symbols. Returns up to 20 matches.',
    auth: false,
    params: [
      { name: 'q', type: 'string', required: true, desc: 'Prefix to search (min 2 chars)' },
      { name: 'limit', type: 'int', required: false, desc: 'Max results (default 10, max 20)' },
    ],
    example: { request: '/api/v1/genes/autocomplete?q=BRC', response: '{"data": [{"gene_id": 672, "symbol": "BRCA1", "description": "breast cancer 1"}], "total": 7}' },
    snippets: { curl: "curl 'https://ignet.org/api/v1/genes/autocomplete?q=BRC'", python: "requests.get('https://ignet.org/api/v1/genes/autocomplete', params={'q': 'BRC'}).json()", r: 'content(GET("https://ignet.org/api/v1/genes/autocomplete", query=list(q="BRC")))' }
  },
  {
    id: 'genes-neighbors', category: 'genes', method: 'GET', path: '/api/v1/genes/:symbol/neighbors',
    description: 'Get interaction neighbors for a gene. Returns aggregated co-occurrence counts.',
    auth: false,
    params: [
      { name: 'symbol', type: 'path', required: true, desc: 'Gene symbol (e.g., TNF)' },
      { name: 'page', type: 'int', required: false, desc: 'Page number' },
      { name: 'per_page', type: 'int', required: false, desc: 'Results per page (max 200)' },
      { name: 'sort_by', type: 'string', required: false, desc: 'Sort column: count, score, neighbor, unique_pmids' },
    ],
    example: { request: '/api/v1/genes/TNF/neighbors?per_page=5', response: '{"gene": "TNF", "data": [{"neighbor": "IL6", "count": 47322, "unique_pmids": 36021}], "total": 6136}' },
    snippets: { curl: "curl 'https://ignet.org/api/v1/genes/TNF/neighbors?per_page=10'", python: "requests.get('https://ignet.org/api/v1/genes/TNF/neighbors', params={'per_page': 10}).json()", r: 'content(GET("https://ignet.org/api/v1/genes/TNF/neighbors", query=list(per_page=10)))' }
  },
  {
    id: 'genes-top', category: 'genes', method: 'GET', path: '/api/v1/genes/top',
    description: 'Top genes ranked by interaction partner count.',
    auth: false,
    params: [{ name: 'limit', type: 'int', required: false, desc: 'Number of genes (default 50)' }],
    example: { request: '/api/v1/genes/top?limit=5', response: '{"data": [{"gene": "TNF", "pair_count": 6136}]}' },
    snippets: { curl: "curl 'https://ignet.org/api/v1/genes/top?limit=10'", python: "requests.get('https://ignet.org/api/v1/genes/top', params={'limit': 10}).json()", r: 'content(GET("https://ignet.org/api/v1/genes/top", query=list(limit=10)))' }
  },
  {
    id: 'pairs', category: 'pairs', method: 'GET', path: '/api/v1/pairs/:sym1/:sym2',
    description: 'Evidence sentences for a gene pair with BioBERT scores and INO annotations.',
    auth: false,
    params: [
      { name: 'sym1', type: 'path', required: true, desc: 'First gene symbol' },
      { name: 'sym2', type: 'path', required: true, desc: 'Second gene symbol' },
      { name: 'page', type: 'int', required: false, desc: 'Page number' },
      { name: 'per_page', type: 'int', required: false, desc: 'Results per page' },
    ],
    example: { request: '/api/v1/pairs/TNF/IL6', response: '{"data": {...}, "interactions": [...], "total": 47322}' },
    snippets: { curl: "curl 'https://ignet.org/api/v1/pairs/TNF/IL6?per_page=5'", python: "requests.get('https://ignet.org/api/v1/pairs/TNF/IL6').json()", r: 'content(GET("https://ignet.org/api/v1/pairs/TNF/IL6"))' }
  },
  {
    id: 'dignet-search', category: 'dignet', method: 'POST', path: '/api/v1/dignet/search',
    description: 'Search PubMed and build gene interaction network. Results cached for 7 days.',
    auth: false,
    params: [{ name: 'keywords', type: 'string', required: true, desc: 'PubMed search keywords' }],
    example: { request: '{"keywords": "vaccine IFNG"}', response: '{"data": {"query_id": 61, "gene_pairs": [...], "total_pairs": 2029, "pmid_count": 1000}}' },
    snippets: { curl: "curl -X POST 'https://ignet.org/api/v1/dignet/search' -H 'Content-Type: application/json' -d '{\"keywords\": \"vaccine IFNG\"}'", python: "requests.post('https://ignet.org/api/v1/dignet/search', json={'keywords': 'vaccine IFNG'}).json()", r: 'content(POST("https://ignet.org/api/v1/dignet/search", body=list(keywords="vaccine IFNG"), encode="json"))' }
  },
  {
    id: 'summarize', category: 'llm', method: 'POST', path: '/api/v1/summarize',
    description: 'Generate AI summary of gene interactions using GPT-4o. Returns summary text + entity lists.',
    auth: false,
    params: [{ name: 'genes', type: 'array', required: true, desc: 'Array of gene symbols' }],
    example: { request: '{"genes": ["TNF", "IL6", "IFNG"]}', response: '{"reply": "Summary text...", "conversation_history": [...], "entities": {"genes": [...], "drugs": [...], "diseases": [...]}}' },
    snippets: { curl: "curl -X POST 'https://ignet.org/api/v1/summarize' -H 'Content-Type: application/json' -d '{\"genes\": [\"TNF\", \"IL6\"]}'", python: "requests.post('https://ignet.org/api/v1/summarize', json={'genes': ['TNF', 'IL6']}).json()", r: 'content(POST("https://ignet.org/api/v1/summarize", body=list(genes=list("TNF", "IL6")), encode="json"))' }
  },
  {
    id: 'genes-report', category: 'genes', method: 'GET', path: '/api/v1/genes/:symbol/report',
    description: 'Comprehensive gene report card with centrality scores, INO distribution, drug/disease associations.',
    auth: false,
    params: [{ name: 'symbol', type: 'path', required: true, desc: 'Gene symbol (e.g., TNF)' }],
    example: { request: '/api/v1/genes/TNF/report', response: '{"gene_info": {...}, "centrality": {...}, "top_neighbors": [...], "ino_distribution": [...], "drugs": [...], "diseases": [...]}' },
    snippets: { curl: "curl 'https://ignet.org/api/v1/genes/TNF/report'", python: "requests.get('https://ignet.org/api/v1/genes/TNF/report').json()", r: 'content(GET("https://ignet.org/api/v1/genes/TNF/report"))' }
  },
  {
    id: 'pairs-predict', category: 'pairs', method: 'POST', path: '/api/v1/pairs/:sym1/:sym2/predict',
    description: 'Run BioBERT prediction on unscored sentences for a gene pair. Stores results in database.',
    auth: false,
    params: [
      { name: 'sym1', type: 'path', required: true, desc: 'First gene symbol' },
      { name: 'sym2', type: 'path', required: true, desc: 'Second gene symbol' },
    ],
    example: { request: '/api/v1/pairs/TNF/IL6/predict', response: '{"scored_count": 50, "avg_confidence": 0.72, "message": "Scored 50 sentences"}' },
    snippets: { curl: "curl -X POST 'https://ignet.org/api/v1/pairs/TNF/IL6/predict'", python: "requests.post('https://ignet.org/api/v1/pairs/TNF/IL6/predict').json()", r: 'content(POST("https://ignet.org/api/v1/pairs/TNF/IL6/predict"))' }
  },
  {
    id: 'dignet-compare', category: 'dignet', method: 'POST', path: '/api/v1/dignet/compare',
    description: 'Compare two PubMed-driven gene networks. Returns shared/unique genes and overlap statistics.',
    auth: false,
    params: [
      { name: 'query_a', type: 'string', required: true, desc: 'First PubMed search query' },
      { name: 'query_b', type: 'string', required: true, desc: 'Second PubMed search query' },
    ],
    example: { request: '{"query_a": "vaccine IFNG", "query_b": "cancer IFNG"}', response: '{"shared_genes": [...], "unique_a": [...], "unique_b": [...], "overlap": {"shared": 45, "jaccard": 0.32}}' },
    snippets: { curl: "curl -X POST 'https://ignet.org/api/v1/dignet/compare' -H 'Content-Type: application/json' -d '{\"query_a\": \"vaccine IFNG\", \"query_b\": \"cancer IFNG\"}'", python: "requests.post('https://ignet.org/api/v1/dignet/compare', json={'query_a': 'vaccine IFNG', 'query_b': 'cancer IFNG'}).json()", r: 'content(POST("https://ignet.org/api/v1/dignet/compare", body=list(query_a="vaccine IFNG", query_b="cancer IFNG"), encode="json"))' }
  },
  {
    id: 'enrichment', category: 'genes', method: 'POST', path: '/api/v1/enrichment/analyze',
    description: 'Analyze a gene set: find pairwise interactions, INO distribution, drug/disease associations.',
    auth: false,
    params: [{ name: 'genes', type: 'array', required: true, desc: 'Array of gene symbols (2-500)' }],
    example: { request: '{"genes": ["TNF", "IL6", "IFNG", "IL1B"]}', response: '{"coverage": 4, "coverage_pct": 100, "interactions": [...], "ino_distribution": [...], "drugs": [...], "diseases": [...]}' },
    snippets: { curl: "curl -X POST 'https://ignet.org/api/v1/enrichment/analyze' -H 'Content-Type: application/json' -d '{\"genes\": [\"TNF\", \"IL6\", \"IFNG\"]}'", python: "requests.post('https://ignet.org/api/v1/enrichment/analyze', json={'genes': ['TNF', 'IL6', 'IFNG']}).json()", r: 'content(POST("https://ignet.org/api/v1/enrichment/analyze", body=list(genes=list("TNF", "IL6")), encode="json"))' }
  },
  {
    id: 'ino-terms', category: 'genes', method: 'GET', path: '/api/v1/ino/terms',
    description: 'List top INO (Interaction Network Ontology) terms with occurrence counts.',
    auth: false,
    params: [{ name: 'limit', type: 'int', required: false, desc: 'Number of terms (default 50, max 100)' }],
    example: { request: '/api/v1/ino/terms?limit=5', response: '{"data": [{"term": "increase", "count": 523000}], "total": 5}' },
    snippets: { curl: "curl 'https://ignet.org/api/v1/ino/terms?limit=10'", python: "requests.get('https://ignet.org/api/v1/ino/terms', params={'limit': 10}).json()", r: 'content(GET("https://ignet.org/api/v1/ino/terms", query=list(limit=10)))' }
  },
  {
    id: 'ino-term-genes', category: 'genes', method: 'GET', path: '/api/v1/ino/terms/:term/genes',
    description: 'Get gene pairs associated with a specific INO interaction type.',
    auth: false,
    params: [
      { name: 'term', type: 'path', required: true, desc: 'INO term (e.g., increase, inhibit)' },
      { name: 'page', type: 'int', required: false, desc: 'Page number' },
      { name: 'per_page', type: 'int', required: false, desc: 'Results per page (max 200)' },
    ],
    example: { request: '/api/v1/ino/terms/increase/genes?per_page=5', response: '{"term": "increase", "data": [{"gene1": "TNF", "gene2": "IL6", "evidence_count": 1234}], "total": 5000}' },
    snippets: { curl: "curl 'https://ignet.org/api/v1/ino/terms/increase/genes?per_page=5'", python: "requests.get('https://ignet.org/api/v1/ino/terms/increase/genes', params={'per_page': 5}).json()", r: 'content(GET("https://ignet.org/api/v1/ino/terms/increase/genes", query=list(per_page=5)))' }
  },
  {
    id: 'assistant-ask', category: 'llm', method: 'POST', path: '/api/v1/assistant/ask',
    description: 'Ask a question about gene interactions. RAG-powered: retrieves PubMed evidence and answers with citations.',
    auth: false,
    params: [
      { name: 'question', type: 'string', required: true, desc: 'Natural language question' },
      { name: 'conversation_history', type: 'array', required: false, desc: 'Previous messages for follow-up' },
    ],
    example: { request: '{"question": "What is the role of TNF in vaccine adjuvants?"}', response: '{"answer": "TNF plays...", "cited_pmids": ["12345678"], "evidence_count": 30}' },
    snippets: { curl: "curl -X POST 'https://ignet.org/api/v1/assistant/ask' -H 'Content-Type: application/json' -d '{\"question\": \"What is the role of TNF in vaccine adjuvants?\"}'", python: "requests.post('https://ignet.org/api/v1/assistant/ask', json={'question': 'What is the role of TNF?'}).json()", r: 'content(POST("https://ignet.org/api/v1/assistant/ask", body=list(question="What is the role of TNF?"), encode="json"))' }
  },
  {
    id: 'auth-register', category: 'auth', method: 'POST', path: '/api/v1/auth/register',
    description: 'Create a new user account. Returns JWT token.',
    auth: false,
    params: [
      { name: 'email', type: 'string', required: true, desc: 'Email address' },
      { name: 'password', type: 'string', required: true, desc: 'Password (min 8 chars)' },
      { name: 'username', type: 'string', required: false, desc: 'Display name' },
    ],
    example: { request: '{"email": "user@example.com", "password": "secret123", "username": "John"}', response: '{"token": "eyJ...", "user": {"id": 1, "email": "user@example.com"}}' },
    snippets: { curl: "curl -X POST 'https://ignet.org/api/v1/auth/register' -H 'Content-Type: application/json' -d '{\"email\": \"user@example.com\", \"password\": \"secret123\"}'", python: "requests.post('https://ignet.org/api/v1/auth/register', json={'email': 'user@example.com', 'password': 'secret123'}).json()", r: 'content(POST("https://ignet.org/api/v1/auth/register", body=list(email="user@example.com", password="secret123"), encode="json"))' }
  },
  {
    id: 'auth-login', category: 'auth', method: 'POST', path: '/api/v1/auth/login',
    description: 'Authenticate and receive JWT token.',
    auth: false,
    params: [
      { name: 'email', type: 'string', required: true, desc: 'Email address' },
      { name: 'password', type: 'string', required: true, desc: 'Password' },
    ],
    example: { request: '{"email": "user@example.com", "password": "secret123"}', response: '{"token": "eyJ...", "user": {"id": 1, "email": "user@example.com", "role": "user"}}' },
    snippets: { curl: "curl -X POST 'https://ignet.org/api/v1/auth/login' -H 'Content-Type: application/json' -d '{\"email\": \"user@example.com\", \"password\": \"secret123\"}'", python: "requests.post('https://ignet.org/api/v1/auth/login', json={'email': 'user@example.com', 'password': 'secret123'}).json()", r: 'content(POST("https://ignet.org/api/v1/auth/login", body=list(email="user@example.com", password="secret123"), encode="json"))' }
  },
]
