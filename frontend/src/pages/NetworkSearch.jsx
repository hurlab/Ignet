import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import NetworkGraph from '../components/NetworkGraph.jsx'

const LIMIT_OPTIONS = [50, 100, 200, 500]

function buildElements(networkData) {
  if (!networkData?.nodes || !networkData?.edges) return []
  const degrees = {}
  networkData.edges.forEach(({ source, target }) => {
    degrees[source] = (degrees[source] ?? 0) + 1
    degrees[target] = (degrees[target] ?? 0) + 1
  })
  const maxDeg = Math.max(1, ...Object.values(degrees))
  const nodes = networkData.nodes.map((n) => ({
    data: {
      id: n.id ?? n.symbol,
      label: n.symbol ?? n.id,
      degree: degrees[n.id ?? n.symbol] ?? 1,
      highDegree: (degrees[n.id ?? n.symbol] ?? 1) > maxDeg * 0.6,
    },
  }))
  const edges = networkData.edges.map((e, i) => ({
    data: {
      id: `e${i}`,
      source: e.source,
      target: e.target,
      weight: e.weight ?? e.count ?? 1,
    },
  }))
  return [...nodes, ...edges]
}

export default function NetworkSearch() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [limit, setLimit] = useState(100)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)

  async function handleSearch(e) {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSelectedNode(null)
    try {
      const data = await api.networkSearch(query.trim(), limit)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-search if query param provided
  useEffect(() => {
    if (searchParams.get('q')) {
      handleSearch()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const elements = result ? buildElements(result) : []
  const nodeCount = elements.filter((e) => !e.data.source).length
  const edgeCount = elements.filter((e) => e.data.source).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy mb-1">Network Search</h1>
        <p className="text-gray-500 text-xs">
          Enter a PubMed query to build a gene co-occurrence network from matching abstracts.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-gray-600 mb-1">PubMed Query</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g. "vaccine IFNG"'
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Limit</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-navy hover:bg-navy-dark disabled:opacity-50 text-white font-semibold px-5 py-1.5 rounded text-sm transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <ErrorMessage message={error} />

      {loading && <LoadingSpinner message="Building network from PubMed data..." />}

      {result && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex gap-4 flex-wrap">
            {[
              { label: 'Nodes', value: nodeCount },
              { label: 'Edges', value: edgeCount },
              { label: 'Query', value: query },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-200 rounded px-3 py-1.5">
                <span className="text-xs text-gray-500 mr-1">{label}:</span>
                <span className="text-xs font-semibold text-navy">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4 flex-wrap lg:flex-nowrap">
            {/* Graph */}
            <div className="flex-1 min-w-0">
              <NetworkGraph elements={elements} onNodeClick={setSelectedNode} />
              <p className="text-[11px] text-gray-400 mt-1">Click a node to view details</p>
            </div>

            {/* Node info panel */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg p-4 h-full">
                {selectedNode ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-navy text-sm">{selectedNode.label}</h3>
                    <div className="text-xs text-gray-500">Connections: {selectedNode.degree}</div>
                    {selectedNode.neighbors?.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1">Top Neighbors</div>
                        <ul className="space-y-0.5">
                          {selectedNode.neighbors.slice(0, 10).map((n) => (
                            <li key={n} className="text-xs text-blue-600 hover:underline cursor-pointer">
                              {n}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs text-center pt-8">
                    Select a node to view gene details
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
