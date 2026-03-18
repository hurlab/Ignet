import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function downloadCSV(neighbors, geneSymbol) {
  if (!neighbors?.length) return
  const hasUniquePmids = neighbors.some((n) => n.unique_pmids != null)
  const header = hasUniquePmids
    ? 'Rank,Gene,CoOccurrences,PMIDs,Score\n'
    : 'Rank,Gene,CoOccurrences,Score\n'
  const rows = neighbors.map((n, i) => {
    const sym = n.neighbor ?? n.symbol ?? n.gene ?? n
    const count = n.count ?? n.cooccurrence ?? ''
    const pmids = n.unique_pmids ?? ''
    const score = typeof n.score === 'number' ? n.score : (n.score ?? '')
    return hasUniquePmids
      ? [i + 1, sym, count, pmids, score].join(',')
      : [i + 1, sym, count, score].join(',')
  }).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ignet-gene-${geneSymbol}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Gene() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gene, setGene] = useState(null)
  const [neighbors, setNeighbors] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside() { setShowDropdown(false) }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Auto-search if query param provided
  useEffect(() => {
    if (searchParams.get('q')) {
      const sym = searchParams.get('q').trim().toUpperCase()
      if (sym) {
        setQuery(sym)
        setLoading(true)
        api.geneNeighbors(sym)
          .then((data) => {
            setGene(sym)
            setNeighbors(data?.data ?? (Array.isArray(data) ? data : (data?.neighbors ?? [])))
          })
          .catch((err) => setError(err.message))
          .finally(() => setLoading(false))
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleInputChange(e) {
    const val = e.target.value
    setQuery(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await api.autocompleteGenes(val.trim())
          setSuggestions(res.data || res || [])
          setShowDropdown(true)
        } catch { setSuggestions([]) }
      }, 300)
    } else {
      setSuggestions([])
      setShowDropdown(false)
    }
  }

  async function handleSearch(e) {
    e?.preventDefault()
    const sym = query.trim().toUpperCase()
    if (!sym) return
    setLoading(true)
    setError(null)
    setGene(null)
    setNeighbors([])
    try {
      const data = await api.geneNeighbors(sym)
      setGene(sym)
      setNeighbors(data?.data ?? (Array.isArray(data) ? data : (data?.neighbors ?? [])))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function searchGene(sym) {
    setQuery(sym)
    setGene(null)
    setNeighbors([])
    setError(null)
    // Trigger search immediately
    setLoading(true)
    api.geneNeighbors(sym)
      .then((data) => {
        setGene(sym)
        setNeighbors(data?.data ?? (Array.isArray(data) ? data : (data?.neighbors ?? [])))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy mb-1">Gene Search</h1>
        <p className="text-gray-500 text-xs">
          Search for a gene symbol to view its top interacting partners.
        </p>
      </div>

      <form onSubmit={handleSearch} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Gene Symbol</label>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={(e) => { if (e.key === 'Escape') setShowDropdown(false) }}
              placeholder="e.g. IFNG, TP53, BRCA1"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            />
            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                {suggestions.map((s) => (
                  <li
                    key={s.symbol || s.gene_id}
                    onClick={() => { setQuery(s.symbol); setShowDropdown(false); searchGene(s.symbol) }}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                  >
                    <span className="font-medium text-navy">{s.symbol}</span>
                    {s.description && <span className="text-gray-400 text-xs ml-2 truncate">{s.description}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-navy hover:bg-navy-dark disabled:opacity-50 text-white font-semibold px-5 py-1.5 rounded text-sm transition-colors"
        >
          Search
        </button>
      </form>

      <ErrorMessage message={error} />

      {loading && <LoadingSpinner message="Fetching gene interactions..." />}

      {!gene && !loading && !error && (
        <div className="text-center py-12 space-y-4">
          <p className="text-gray-400 text-sm">Search for a gene symbol to see its interaction partners.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['BRCA1', 'TP53', 'IFNG', 'TNF', 'IL6'].map((g) => (
              <button
                key={g}
                onClick={() => { setQuery(g); searchGene(g) }}
                className="bg-blue-50 text-navy text-xs font-medium px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {gene && neighbors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-navy">{gene}</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {neighbors.length} neighbors
            </span>
            <button
              onClick={() => downloadCSV(neighbors, gene)}
              className="bg-navy hover:bg-navy-dark text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
            >
              Download CSV
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Rank</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Symbol</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Co-occurrences</th>
                  {neighbors.some((n) => n.unique_pmids != null) && (
                    <th className="text-right px-3 py-2 font-medium text-gray-600">PMIDs</th>
                  )}
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Score</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {neighbors.map((n, i) => {
                  const sym = n.neighbor ?? n.symbol ?? n.gene ?? n
                  const count = n.count ?? n.cooccurrence ?? '—'
                  const score = typeof n.score === 'number' ? n.score.toFixed(4) : (n.score ?? '—')
                  return (
                    <tr key={i} className="hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-1.5 font-medium text-navy">{sym}</td>
                      <td className="px-3 py-1.5 text-right text-gray-600">{count}</td>
                      {neighbors.some((nb) => nb.unique_pmids != null) && (
                        <td className="px-3 py-1.5 text-right text-gray-600">{n.unique_pmids ?? '—'}</td>
                      )}
                      <td className="px-3 py-1.5 text-right text-gray-600">{score}</td>
                      <td className="px-3 py-1.5">
                        <button
                          onClick={() => searchGene(sym)}
                          className="text-blue-600 hover:underline text-[11px]"
                        >
                          Search
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {gene && neighbors.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No neighbors found for <strong>{gene}</strong>.
        </div>
      )}
    </div>
  )
}
