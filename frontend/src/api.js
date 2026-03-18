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

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),

  health: () => request('/health'),
  stats: () => request('/stats'),

  searchGenes: (q) => request(`/genes/search?q=${encodeURIComponent(q)}`),
  geneNeighbors: (sym) => request(`/genes/${encodeURIComponent(sym)}/neighbors`),
  genePair: (s1, s2) => request(`/pairs/${encodeURIComponent(s1)}/${encodeURIComponent(s2)}`),

  networkSearch: (keywords, limit) => request('/network/search', {
    method: 'POST',
    body: JSON.stringify({ keywords }),
  }),

  summarize: (genes) => request('/summarize', {
    method: 'POST',
    body: JSON.stringify({ genes }),
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
}

export { getToken, setToken, removeToken }
