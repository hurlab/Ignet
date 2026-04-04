import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import NetworkGraph from '../components/NetworkGraph.jsx'
import AddToSetButton from '../components/AddToSetButton.jsx'

function buildMiniNetwork(gene, neighbors, reportData) {
  if (!gene || !neighbors?.length) return []

  // Take top 20 neighbors for the mini network
  const topNeighbors = neighbors.slice(0, 20)

  // Center node (the searched gene) — set centrality_d to 1 so it renders darkest
  const nodes = [{
    data: {
      id: gene,
      label: gene,
      degree: topNeighbors.length,
      centrality_d: 1,
      isCenter: true,
    },
  }]

  // Neighbor nodes and edges
  const edges = []
  topNeighbors.forEach((n, i) => {
    const sym = n.neighbor ?? n.symbol ?? n.gene
    if (!sym) return
    nodes.push({
      data: {
        id: sym,
        label: sym,
        degree: 1,
        centrality_d: 0,
      },
    })
    edges.push({
      data: {
        id: `e${i}`,
        source: gene,
        target: sym,
        weight: n.count || 1,
        ino_color: '#a0aec0',
      },
    })
  })

  return [...nodes, ...edges]
}

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

// --- Report Card Sub-components ---

function GeneStatsCards({ centrality, rawCounts }) {
  const [mode, setMode] = useState('counts')
  const [centralityView, setCentralityView] = useState('largest')

  const countEntries = [
    { label: 'Neighbors', value: rawCounts?.neighbors ?? 0, fmt: (v) => v.toLocaleString() },
    { label: 'PMIDs', value: rawCounts?.pmids ?? 0, fmt: (v) => v.toLocaleString() },
    { label: 'Sentences', value: rawCounts?.sentences ?? 0, fmt: (v) => v.toLocaleString() },
  ]

  // centrality now has {largest: {d,p,c,b}, average: {d,p,c,b}, max: {d,p,c,b}}
  const cData = centrality?.[centralityView] || centrality?.largest || centrality || {}
  const centralityEntries = [
    { label: 'Degree', value: cData.d ?? 0 },
    { label: 'Eigenvector', value: cData.p ?? 0 },
    { label: 'Closeness', value: cData.c ?? 0 },
    { label: 'Betweenness', value: cData.b ?? 0 },
  ]

  const hasCentrality = centrality && (centrality.largest || centrality.average || centrality.max)
    ? centralityEntries.some((e) => e.value > 0)
    : Object.values(centrality || {}).some((v) => typeof v === 'number' && v > 0)

  const entries = mode === 'counts' ? countEntries : centralityEntries
  const maxVal = Math.max(...entries.map((e) => e.value), 0.001)

  const viewLabels = {
    largest: 'Largest Network',
    average: 'Average',
    max: 'Peak',
  }
  const viewDescriptions = {
    largest: 'Centrality in the broadest query network',
    average: 'Mean centrality across all query networks',
    max: 'Highest centrality achieved in any query network',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500">View:</span>
        <div className="inline-flex bg-gray-100 rounded-full p-0.5">
          <button
            onClick={() => setMode('counts')}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              mode === 'counts' ? 'bg-navy text-white font-semibold' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Raw Counts
          </button>
          {hasCentrality && (
            <button
              onClick={() => setMode('centrality')}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                mode === 'centrality' ? 'bg-navy text-white font-semibold' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Network Centrality
            </button>
          )}
        </div>
        {mode === 'centrality' && hasCentrality && (
          <div className="inline-flex bg-gray-50 border border-gray-200 rounded-full p-0.5">
            {['largest', 'average', 'max'].map((v) => (
              <button
                key={v}
                onClick={() => setCentralityView(v)}
                title={viewDescriptions[v]}
                className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                  centralityView === v ? 'bg-blue-600 text-white font-semibold' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {viewLabels[v]}
              </button>
            ))}
          </div>
        )}
      </div>
      {mode === 'centrality' && (
        <p className="text-[10px] text-gray-400">{viewDescriptions[centralityView]} (normalized 0–1)</p>
      )}
      <div className={`grid gap-3 ${mode === 'counts' ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
        {entries.map((e) => (
          <div key={e.label} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide mb-1">{e.label}</div>
            <div className="text-lg font-bold text-navy">
              {e.fmt ? e.fmt(e.value) : e.value.toFixed(4)}
            </div>
            <div className="mt-1.5 bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-navy rounded-full h-1.5 transition-all"
                style={{ width: `${Math.min((e.value / maxVal) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InoBreakdown({ distribution }) {
  if (!distribution?.length) return null
  const maxCount = Math.max(...distribution.map((d) => d.count), 1)
  const items = distribution.slice(0, 10)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-navy mb-3">INO Interaction Types</h3>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.term} className="flex items-center gap-2 text-xs">
            <span className="w-32 truncate text-gray-600" title={item.term}>{item.term}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-navy rounded-full h-2"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-gray-400 w-10 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TagCloud({ items, colorClass }) {
  if (!items?.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.term}
          className={`inline-block text-xs px-2 py-0.5 rounded-full ${colorClass}`}
          title={`${item.term} (${item.count})`}
        >
          {item.term} <span className="opacity-60">({item.count})</span>
        </span>
      ))}
    </div>
  )
}

function AiSummarySection({ gene }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  async function handleGenerate() {
    if (summary) {
      setOpen(!open)
      return
    }
    setOpen(true)
    setLoading(true)
    setError(null)
    try {
      const res = await api.summarize([gene])
      setSummary(res?.summary ?? res?.data ?? JSON.stringify(res))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <button
        onClick={handleGenerate}
        className="bg-navy hover:bg-navy-dark text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors"
      >
        {summary ? (open ? 'Hide AI Summary' : 'Show AI Summary') : 'Generate AI Summary'}
      </button>
      {open && (
        <div className="mt-3">
          {loading && <LoadingSpinner message="Generating AI summary..." />}
          {error && <ErrorMessage message={error} />}
          {summary && (
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {summary}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReportCard({ reportData, gene }) {
  if (!reportData) return null

  const info = reportData.gene_info

  return (
    <div className="space-y-4">
      {/* Gene Info Header */}
      {info && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-navy">{info.Symbol}</h2>
            {info.type_of_gene && (
              <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{info.type_of_gene}</span>
            )}
            {info.chromosome && (
              <span className="text-[11px] bg-blue-50 text-navy px-2 py-0.5 rounded">Chr {info.chromosome}</span>
            )}
          </div>
          {info.description && (
            <p className="text-sm text-gray-600 mt-1">{info.description}</p>
          )}
          {info.Synonyms && (
            <p className="text-xs text-gray-400 mt-1">Synonyms: {info.Synonyms}</p>
          )}
        </div>
      )}

      {/* Quick-action links to related pages */}
      {gene && (
        <div className="flex flex-wrap gap-2 mt-2">
          <a href={`/ignet/genepair?gene1=${encodeURIComponent(gene)}`} target="_blank" rel="noopener noreferrer"
            className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
            Compare with another gene
          </a>
          <a href={`/ignet/enrichment?genes=${encodeURIComponent(gene)}`} target="_blank" rel="noopener noreferrer"
            className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 transition-colors">
            Analyze gene set
          </a>
          <a href={`/ignet/dignet?q=${encodeURIComponent(gene)}`} target="_blank" rel="noopener noreferrer"
            className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors">
            Search network
          </a>
          <AddToSetButton gene={gene} />
        </div>
      )}

      {/* Gene Stats: Raw Counts / Network Centrality toggle */}
      <GeneStatsCards centrality={reportData.centrality} rawCounts={reportData.raw_counts} />

      {/* INO Breakdown */}
      <InoBreakdown distribution={reportData.ino_distribution} />

      {/* Drug Associations */}
      {reportData.drugs?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-navy mb-2">Drug Associations</h3>
          <TagCloud items={reportData.drugs} colorClass="bg-blue-50 text-blue-700" />
        </div>
      )}

      {/* Disease Associations */}
      {reportData.diseases?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-navy mb-2">Disease Associations</h3>
          <TagCloud items={reportData.diseases} colorClass="bg-red-50 text-red-700" />
        </div>
      )}

      {/* AI Summary */}
      <AiSummarySection gene={gene} />
    </div>
  )
}

// --- Main Component ---

export default function Gene() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gene, setGene] = useState(null)
  const [neighbors, setNeighbors] = useState([])
  const [reportData, setReportData] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside() { setShowDropdown(false) }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  async function fetchGeneData(sym) {
    setLoading(true)
    setError(null)
    setGene(null)
    setNeighbors([])
    setReportData(null)
    try {
      const [neighborsRes, reportRes] = await Promise.all([
        api.geneNeighbors(sym),
        api.geneReport(sym).catch(() => null),
      ])
      setGene(sym)
      setNeighbors(neighborsRes?.data ?? (Array.isArray(neighborsRes) ? neighborsRes : (neighborsRes?.neighbors ?? [])))
      setReportData(reportRes)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-search if query param provided
  useEffect(() => {
    if (searchParams.get('q')) {
      const sym = searchParams.get('q').trim().toUpperCase()
      if (sym) {
        setQuery(sym)
        fetchGeneData(sym)
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
    await fetchGeneData(sym)
  }

  function searchGene(sym) {
    setQuery(sym)
    fetchGeneData(sym)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy mb-1">Gene Search</h1>
        <p className="text-gray-500 text-xs">
          Search for a gene symbol to view its report card and interaction partners.
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

      {loading && <LoadingSpinner message="Fetching gene data..." />}

      {!gene && !loading && !error && (
        <div className="text-center py-12 space-y-4">
          <p className="text-gray-400 text-sm">Search for a gene symbol to see its report card and interaction partners.</p>
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

      {/* Report Card Section */}
      {gene && <ReportCard reportData={reportData} gene={gene} />}

      {/* Mini Network Visualization */}
      {gene && neighbors.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-navy text-sm mb-2">
            Interaction Network — Top {Math.min(20, neighbors.length)} Partners
          </h3>
          <p className="text-xs text-gray-400 mb-2">
            Click a node to search that gene. The center node is {gene}.
          </p>
          <NetworkGraph
            elements={buildMiniNetwork(gene, neighbors, reportData)}
            onNodeClick={(nodeData) => {
              const nodeId = typeof nodeData === 'string' ? nodeData : nodeData?.id
              if (nodeId && nodeId !== gene) {
                setQuery(nodeId)
                fetchGeneData(nodeId)
              }
            }}
          />
        </section>
      )}

      {/* Neighbors Table */}
      {gene && neighbors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-navy">Interaction Partners</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {neighbors.length} neighbors
            </span>
            <button
              onClick={() => downloadCSV(neighbors, gene)}
              className="bg-navy hover:bg-navy-dark text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
            >
              Download CSV
            </button>
            <AddToSetButton genes={neighbors.map(n => n.neighbor ?? n.symbol ?? n.gene)} label="Add all to set" />
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
                  <th className="px-2 py-2 w-8"></th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {neighbors.map((n, i) => {
                  const sym = n.neighbor ?? n.symbol ?? n.gene ?? n
                  const count = n.count ?? n.cooccurrence ?? '\u2014'
                  const score = typeof n.score === 'number' ? n.score.toFixed(4) : (n.score ?? '\u2014')
                  return (
                    <tr key={i} className="hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-1.5 font-medium text-navy">{sym}</td>
                      <td className="px-3 py-1.5 text-right text-gray-600">{count}</td>
                      {neighbors.some((nb) => nb.unique_pmids != null) && (
                        <td className="px-3 py-1.5 text-right text-gray-600">{n.unique_pmids ?? '\u2014'}</td>
                      )}
                      <td className="px-3 py-1.5 text-right text-gray-600">{score}</td>
                      <td className="px-2 py-1.5 text-center">
                        <AddToSetButton gene={sym} />
                      </td>
                      <td className="px-3 py-1.5 flex gap-2">
                        <button
                          onClick={() => searchGene(sym)}
                          className="text-blue-600 hover:underline text-[11px]"
                        >
                          View
                        </button>
                        <a
                          href={`/ignet/genepair?gene1=${encodeURIComponent(gene)}&gene2=${encodeURIComponent(sym)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline text-[11px]"
                        >
                          Pair
                        </a>
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
