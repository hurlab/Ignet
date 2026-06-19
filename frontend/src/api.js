const BASE_URL = '/api/v1'

function getToken() {
  return localStorage.getItem('ignet_token')
}

function setToken(token) {
  localStorage.setItem('ignet_token', token)
}

function removeToken() {
  localStorage.removeItem('ignet_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }

  const controller = new AbortController()
  const timeoutMs = options.timeout ?? 30000
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message || `HTTP ${res.status}`)
    }

    return res.json()
  } catch (e) {
    clearTimeout(timeoutId)
    if (e.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.')
    }
    throw e
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),

  health: () => request('/health'),
  stats: () => request('/stats'),

  searchGenes: (q) => request(`/genes/search?q=${encodeURIComponent(q)}`),
  autocompleteGenes: (q, limit = 10) => request(`/genes/autocomplete?q=${encodeURIComponent(q)}&limit=${limit}`),
  geneNeighbors: (sym) => request(`/genes/${encodeURIComponent(sym)}/neighbors`),
  geneReport: (sym) => request(`/genes/${encodeURIComponent(sym)}/report`, { timeout: 60000 }),
  geneTrends: (sym) => request(`/genes/${encodeURIComponent(sym)}/trends`),
  genePair: (s1, s2) => request(`/pairs/${encodeURIComponent(s1)}/${encodeURIComponent(s2)}?include_summary=true`),
  pairTrends: (s1, s2) => request(`/pairs/${encodeURIComponent(s1)}/${encodeURIComponent(s2)}/trends`),
  predictPair: (s1, s2) => request(`/pairs/${encodeURIComponent(s1)}/${encodeURIComponent(s2)}/predict`, { method: 'POST' }),

  // filters: { ino_type?: string, has_vaccine?: boolean, year_min?: number, year_max?: number }
  dignetSearch: (keywords, limit, filters = {}, useCache = true) => {
    const params = new URLSearchParams()
    if (filters.ino_type) params.set('ino_type', filters.ino_type)
    if (filters.has_vaccine) params.set('has_vaccine', 'true')
    if (filters.year_min != null) params.set('year_min', String(filters.year_min))
    if (filters.year_max != null) params.set('year_max', String(filters.year_max))
    const qs = params.toString()
    return request(`/dignet/search${qs ? `?${qs}` : ''}`, {
      method: 'POST',
      body: JSON.stringify({ keywords, use_cache: useCache }),
      timeout: 60000,
    })
  },

  // opts: { min_evidence?, top_n?, has_vaccine?, year_min?, year_max?, label? }
  dignetSearchPmids: (pmids, opts = {}) => request('/dignet/search-pmids', {
    method: 'POST',
    body: JSON.stringify({
      pmids,
      ...(opts.min_evidence != null ? { min_evidence: opts.min_evidence } : {}),
      ...(opts.top_n != null ? { top_n: opts.top_n } : {}),
      ...(opts.has_vaccine ? { has_vaccine: true } : {}),
      ...(opts.year_min != null ? { year_min: opts.year_min } : {}),
      ...(opts.year_max != null ? { year_max: opts.year_max } : {}),
      ...(opts.label ? { label: opts.label } : {}),
    }),
    timeout: 120000,
  }),

  dignetYearRange: () => request('/dignet/year-range'),
  dignetEntities: (queryId) => request(`/dignet/${queryId}/entities`),
  dignetCovGenes: (queryId, minShared) =>
    request(`/dignet/${queryId}/cov-genes${minShared != null ? `?min_shared=${minShared}` : ''}`),

  dignetCompare: (queryA, queryB) =>
    request('/dignet/compare', {
      method: 'POST',
      body: JSON.stringify({ query_a: queryA, query_b: queryB }),
    }),

  enrichment: (genes) => request('/enrichment/analyze', { method: 'POST', body: JSON.stringify({ genes }), timeout: 120000 }),
  pathwaysAnalyze: (genes, libraries) => request('/pathways/analyze', {
    method: 'POST',
    body: JSON.stringify(libraries ? { genes, libraries } : { genes }),
    timeout: 60000,
  }),
  functionalClasses: (genes) => request('/genes/functional-classes', {
    method: 'POST',
    body: JSON.stringify({ genes }),
    timeout: 30000,
  }),

  summarize: (genes) => request('/summarize', {
    method: 'POST',
    body: JSON.stringify({ genes }),
    timeout: 90000,
  }),

  chat: (conversation_history, prompt) => request('/chat', {
    method: 'POST',
    body: JSON.stringify({ conversation_history, prompt }),
    timeout: 150000,
  }),

  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  register: (username, email, password) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  }),

  profile: () => request('/user/profile'),

  inoTerms: (limit = 50) => request(`/ino/terms?limit=${limit}`),
  inoTermGenes: (term, page = 1) => request(`/ino/terms/${encodeURIComponent(term)}/genes?page=${page}`),

  assistantAsk: (question, history = []) => request('/assistant/ask', {
    method: 'POST',
    body: JSON.stringify({ question, conversation_history: history }),
    timeout: 150000,
  }),
}

/**
 * @MX:ANCHOR: [AUTO] Streaming enrichment entry point — called by Enrichment.jsx on every analysis run
 * @MX:REASON: fan_in >= 3 (runAnalysis, fallback path, future callers); NDJSON chunk buffering is non-trivial
 *
 * POSTs to /api/v1/enrichment/analyze/stream and calls onEvent(obj) for each parsed NDJSON line.
 * Chunks do NOT align to line boundaries: we maintain a string buffer, split on '\n',
 * process all complete lines, and keep any trailing partial line for the next chunk.
 * Throws if the response is not ok or ReadableStream is unavailable, so callers can fall back.
 */
export async function enrichmentStream(genes, { onEvent, signal } = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${BASE_URL}/enrichment/analyze/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ genes }),
    signal,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }

  if (!res.body) {
    throw new Error('ReadableStream not supported in this browser')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      // Process any remaining buffered text after the stream ends
      const remaining = buffer.trim()
      if (remaining) {
        try { onEvent?.(JSON.parse(remaining)) } catch { /* skip malformed */ }
      }
      break
    }

    buffer += decoder.decode(value, { stream: true })

    // Split on newlines; the last element may be a partial line — keep it in the buffer
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try { onEvent?.(JSON.parse(trimmed)) } catch { /* skip malformed */ }
    }
  }
}

export { getToken, setToken, removeToken }
