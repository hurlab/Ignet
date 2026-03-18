import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function Gene() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gene, setGene] = useState(null)
  const [neighbors, setNeighbors] = useState([])
  const navigate = useNavigate()

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
      setNeighbors(Array.isArray(data) ? data : (data?.neighbors ?? []))
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
        setNeighbors(Array.isArray(data) ? data : (data?.neighbors ?? []))
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
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. IFNG, TP53, BRCA1"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />
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

      {gene && neighbors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-navy">{gene}</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {neighbors.length} neighbors
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Rank</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Symbol</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Co-occurrences</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Score</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {neighbors.map((n, i) => {
                  const sym = n.symbol ?? n.gene ?? n
                  const count = n.count ?? n.cooccurrence ?? '—'
                  const score = typeof n.score === 'number' ? n.score.toFixed(4) : (n.score ?? '—')
                  return (
                    <tr key={i} className="hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-1.5 font-medium text-navy">{sym}</td>
                      <td className="px-3 py-1.5 text-right text-gray-600">{count}</td>
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
