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
  genePair: (s1, s2) => request(`/pairs/${encodeURIComponent(s1)}/${encodeURIComponent(s2)}?include_summary=true`),
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

  dignetYearRange: () => request('/dignet/year-range'),
  dignetEntities: (queryId) => request(`/dignet/${queryId}/entities`),

  dignetCompare: (queryA, queryB) =>
    request('/dignet/compare', {
      method: 'POST',
      body: JSON.stringify({ query_a: queryA, query_b: queryB }),
    }),

  enrichment: (genes) => request('/enrichment/analyze', { method: 'POST', body: JSON.stringify({ genes }), timeout: 60000 }),

  summarize: (genes) => request('/summarize', {
    method: 'POST',
    body: JSON.stringify({ genes }),
    timeout: 90000,
  }),

  chat: (conversation_history, prompt) => request('/chat', {
    method: 'POST',
    body: JSON.stringify({ conversation_history, prompt }),
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
  }),
}

export { getToken, setToken, removeToken }
