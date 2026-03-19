import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import NetworkGraph from '../components/NetworkGraph.jsx'
import ExportDropdown from '../components/ExportDropdown.jsx'
import EntitySidebar from '../components/EntitySidebar.jsx'

const LIMIT_OPTIONS = [50, 100, 200, 500]

function downloadCSV(pairs, query) {
  if (!pairs?.length) return
  const comment = `# Ignet Dignet Network for "${query}" - https://ignet.org/ignet/dignet\n`
  const header = 'Gene1,Gene2,Score,PMID,Sentence,INO_Category\n'
  const rows = pairs.map(p =>
    [p.geneSymbol1 || p.gene1, p.geneSymbol2 || p.gene2, p.score || '', p.PMID || p.pmid || '',
     `"${(p.sentence || '').replace(/"/g, '""')}"`, p.ino_category || ''].join(',')
  ).join('\n')
  const blob = new Blob([comment + header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ignet-dignet-${query.replace(/\s+/g, '_')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const MAX_GRAPH_EDGES = 500

// INO category fallback color for edges that have no ino_color from the backend
const INO_FALLBACK_COLOR = '#a0aec0'

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
        // INO fields from backend enrichment
        ino_category: p.ino_category ?? 'unknown',
        ino_color: p.ino_color ?? INO_FALLBACK_COLOR,
      },
    })
  })
  const degrees = {}
  edges.forEach(({ data: { source, target } }) => {
    degrees[source] = (degrees[source] ?? 0) + 1
    degrees[target] = (degrees[target] ?? 0) + 1
  })
  const maxDeg = Math.max(1, ...Object.values(degrees))

  // Build node centrality map from API response if available
  const centralityMap = {}
  if (result?.elements?.nodes) {
    result.elements.nodes.forEach((n) => {
      if (n.data?.id && n.data?.centrality) {
        centralityMap[n.data.id] = n.data.centrality
      }
    })
  }

  const nodes = [...genes].map((g) => ({
    data: {
      id: g,
      label: g,
      degree: degrees[g] ?? 1,
      highDegree: (degrees[g] ?? 1) > maxDeg * 0.6,
      // Degree centrality for node color mapping (0–1 range)
      centrality_d: centralityMap[g]?.d ?? 0,
    },
  }))
  return [...nodes, ...edges]
}

export default function Dignet() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [limit, setLimit] = useState(100)
  const [inoFilter, setInoFilter] = useState('')
  const [vaccineOnly, setVaccineOnly] = useState(false)
  const [yearMin, setYearMin] = useState(1975)
  const [yearMax, setYearMax] = useState(2026)
  const [yearRange, setYearRange] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [entities, setEntities] = useState(null)
  const [entitiesLoading, setEntitiesLoading] = useState(false)
  const [activeHighlight, setActiveHighlight] = useState(null)
  const didAutoSearch = useRef(false)
  const abortRef = useRef(null)

  useEffect(() => {
    api.dignetYearRange().then((data) => {
      if (data?.min_year != null && data?.max_year != null) {
        setYearRange(data)
        setYearMin(data.min_year)
        setYearMax(data.max_year)
      }
    }).catch(() => {})
  }, [])

  const runSearch = useCallback(async (searchQuery, searchLimit, filters) => {
    const q = (searchQuery ?? query).trim()
    if (!q) return

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    setResult(null)
    setSelectedNode(null)
    setEntities(null)
    setActiveHighlight(null)
    try {
      const activeFilters = filters ?? { ino_type: inoFilter, has_vaccine: vaccineOnly }
      const raw = await api.dignetSearch(q, searchLimit ?? limit, activeFilters)
      if (controller.signal.aborted) return // stale result
      const data = raw?.data ?? raw
      setResult(data)

      // Non-blocking entity enrichment fetch
      const genes = [...new Set([
        ...(data.gene_pairs || []).map(p => p.gene1),
        ...(data.gene_pairs || []).map(p => p.gene2),
      ].filter(Boolean))]

      if (genes.length >= 2) {
        setEntitiesLoading(true)
        api.enrichment(genes.slice(0, 200))
          .then(setEntities)
          .catch(() => setEntities(null))
          .finally(() => setEntitiesLoading(false))
      }
    } catch (err) {
      if (controller.signal.aborted || err.name === 'AbortError') return
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [query, limit, inoFilter, vaccineOnly])

  async function handleSearch(e) {
    e?.preventDefault()
    await runSearch()
  }

  // Re-fetch when filters change (only if a result already exists)
  useEffect(() => {
    if (result) {
      runSearch(query, limit, { ino_type: inoFilter, has_vaccine: vaccineOnly })
    }
  }, [inoFilter, vaccineOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-search on mount if URL contains ?q=
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && !didAutoSearch.current) {
      didAutoSearch.current = true
      setQuery(q)
      runSearch(q, limit, { ino_type: '', has_vaccine: false })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const elements = result ? buildElements(result) : []
  const nodeCount = elements.filter((e) => !e.data.source).length
  const edgeCount = elements.filter((e) => e.data.source).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy mb-1">Dignet</h1>
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
            <ExportDropdown>
              <button onClick={() => downloadCSV(result.gene_pairs, query)} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50">CSV</button>
              <a href={`/api/v1/dignet/${result.query_id || result.data?.query_id}/export/graphml`} download className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50">GraphML</a>
            </ExportDropdown>
          </div>

          {/* Filter controls */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <label className="text-xs text-gray-500">Filter:</label>
            <select
              value={inoFilter}
              onChange={e => setInoFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="">All interaction types</option>
              <option value="positive_regulation">Positive regulation</option>
              <option value="negative_regulation">Negative regulation</option>
              <option value="binding">Binding</option>
              <option value="phosphorylation">Phosphorylation</option>
              <option value="other">Other</option>
            </select>
            <label className="flex items-center gap-1 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={vaccineOnly}
                onChange={e => setVaccineOnly(e.target.checked)}
              />
              Vaccine only
            </label>
            {yearRange && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Years:</label>
                <input type="number" value={yearMin} onChange={e => setYearMin(+e.target.value)}
                  min={yearRange.min_year} max={yearRange.max_year}
                  className="w-16 text-xs border border-gray-300 rounded px-1 py-1 text-center" />
                <span className="text-xs text-gray-400">&mdash;</span>
                <input type="number" value={yearMax} onChange={e => setYearMax(+e.target.value)}
                  min={yearRange.min_year} max={yearRange.max_year}
                  className="w-16 text-xs border border-gray-300 rounded px-1 py-1 text-center" />
                <button onClick={() => runSearch(query, limit, { ino_type: inoFilter, has_vaccine: vaccineOnly, year_min: yearMin, year_max: yearMax })}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
                  Apply
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4 flex-wrap lg:flex-nowrap">
            {/* Graph */}
            <div className="flex-1 min-w-0">
              <NetworkGraph elements={elements} onNodeClick={setSelectedNode} />
              <p className="text-[11px] text-gray-400 mt-1">Click a node to view details. Hover an edge to see interaction type.</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-[#38a169]"></span> Positive regulation</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-[#e53e3e]"></span> Negative regulation</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-[#3182ce]"></span> Binding</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-[#9f7aea]"></span> Phosphorylation</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-[#a0aec0]"></span> Other/Unknown</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-[#1e3a5f]"></span> High centrality</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-[#93c5fd]"></span> Low centrality</span>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg p-3 h-full overflow-y-auto max-h-[550px]">
                {selectedNode ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-[10px] text-gray-400 hover:text-gray-600 underline"
                    >
                      Back to overview
                    </button>
                    <h3 className="font-semibold text-navy text-sm">{selectedNode.label}</h3>
                    <a
                      href={`/ignet/gene?q=${encodeURIComponent(selectedNode.label)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs bg-navy text-white px-2 py-0.5 rounded hover:bg-navy-dark transition-colors mt-1"
                    >
                      Open Report Card
                    </a>
                    <div className="text-xs text-gray-500 mt-1">Connections: {selectedNode.degree}</div>
                    {selectedNode.neighbors?.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1">Top Neighbors</div>
                        <ul className="space-y-0.5">
                          {selectedNode.neighbors.slice(0, 10).map((n) => (
                            <li key={n}>
                              <a href={`/ignet/gene?q=${encodeURIComponent(n)}`} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline cursor-pointer">{n}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <EntitySidebar
                    entities={entities}
                    loading={entitiesLoading}
                    activeHighlight={activeHighlight}
                    onHighlight={(type, term) => setActiveHighlight(activeHighlight === term ? null : term)}
                    onClearHighlight={() => setActiveHighlight(null)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
