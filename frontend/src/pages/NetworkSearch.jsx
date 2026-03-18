import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import NetworkGraph from '../components/NetworkGraph.jsx'

const LIMIT_OPTIONS = [50, 100, 200, 500]

function downloadCSV(pairs, query) {
  if (!pairs?.length) return
  const header = 'Gene1,Gene2,Score,PMID,Sentence\n'
  const rows = pairs.map(p =>
    [p.geneSymbol1 || p.gene1, p.geneSymbol2 || p.gene2, p.score || '', p.PMID || p.pmid || '',
     `"${(p.sentence || '').replace(/"/g, '""')}"`].join(',')
  ).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ignet-network-${query.replace(/\s+/g, '_')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const MAX_GRAPH_EDGES = 500

function buildElements(result) {
  const pairs = result?.gene_pairs
  if (!pairs || pairs.length === 0) return []
  const limitedPairs = pairs.slice(0, MAX_GRAPH_EDGES)
  const genes = new Set()
  const edges = []
  limitedPairs.forEach((p, i) => {
    const g1 = p.gene1
    const g2 = p.gene2
    if (!g1 || !g2) return
    genes.add(g1)
    genes.add(g2)
    edges.push({
      data: {
        id: `e${i}`,
        source: g1,
        target: g2,
        weight: p.score ?? 1,
      },
    })
  })
  const degrees = {}
  edges.forEach(({ data: { source, target } }) => {
    degrees[source] = (degrees[source] ?? 0) + 1
    degrees[target] = (degrees[target] ?? 0) + 1
  })
  const maxDeg = Math.max(1, ...Object.values(degrees))
  const nodes = [...genes].map((g) => ({
    data: {
      id: g,
      label: g,
      degree: degrees[g] ?? 1,
      highDegree: (degrees[g] ?? 1) > maxDeg * 0.6,
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
  const didAutoSearch = useRef(false)

  async function runSearch(searchQuery, searchLimit) {
    const q = (searchQuery ?? query).trim()
    if (!q) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSelectedNode(null)
    try {
      const data = await api.networkSearch(q, searchLimit ?? limit)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e) {
    e?.preventDefault()
    await runSearch()
  }

  // Auto-search on mount if URL contains ?q=
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && !didAutoSearch.current) {
      didAutoSearch.current = true
      setQuery(q)
      runSearch(q, limit)
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

      {!result && !loading && !error && (
        <div className="text-center py-8 space-y-4">
          <p className="text-gray-400 text-sm">Enter PubMed keywords to build a gene interaction network.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['vaccine immunity', 'BRCA1 breast cancer', 'IFNG tuberculosis', 'COVID-19 cytokine'].map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); runSearch(q, limit) }}
                className="bg-blue-50 text-navy text-xs font-medium px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex gap-4 flex-wrap">
            {[
              { label: 'PMIDs', value: result.pmid_count?.toLocaleString() },
              { label: 'Nodes', value: nodeCount },
              { label: 'Edges', value: edgeCount },
              { label: 'Cached', value: result.cached ? 'Yes' : 'No' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-200 rounded px-3 py-1.5">
                <span className="text-xs text-gray-500 mr-1">{label}:</span>
                <span className="text-xs font-semibold text-navy">{value}</span>
              </div>
            ))}
          </div>

          {result.total_pairs > MAX_GRAPH_EDGES && (
            <div className="bg-yellow-50 border border-yellow-200 rounded px-3 py-1.5 text-xs text-yellow-700">
              Showing {MAX_GRAPH_EDGES} of {result.total_pairs.toLocaleString()} gene pairs in the graph. Export GraphML for the full dataset.
            </div>
          )}

          {/* Export buttons */}
          <div className="flex flex-wrap gap-2">
            {result.query_id && (
              <a
                href={`/api/v1/network/${result.query_id}/export/graphml`}
                download
                className="inline-flex items-center gap-1 bg-white border border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 text-xs font-medium px-3 py-1.5 rounded transition-colors"
              >
                Export GraphML
              </a>
            )}
            <button
              onClick={() => downloadCSV(result.gene_pairs, query)}
              className="bg-navy hover:bg-navy-dark text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
            >
              Download CSV
            </button>
          </div>

          <div className="flex gap-4 flex-wrap lg:flex-nowrap">
            {/* Graph */}
            <div className="flex-1 min-w-0">
              <NetworkGraph elements={elements} onNodeClick={setSelectedNode} />
              <p className="text-[11px] text-gray-400 mt-1">Click a node to view details</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#2b6cb0]"></span>
                  Gene node (size = connections)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#ed8936]"></span>
                  Selected node
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-6 h-0.5 bg-[#a0aec0]"></span>
                  Co-occurrence (width = frequency)
                </span>
              </div>
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
