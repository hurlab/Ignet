import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import NetworkGraph from '../components/NetworkGraph.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function GeneTagCloud({ genes, color, label }) {
  if (!genes.length) return <p className="text-sm text-gray-400 italic">None</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {genes.map((g) => (
        <Link
          key={g}
          to={`/gene?q=${encodeURIComponent(g)}`}
          className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity ${color}`}
          title={`View ${g} report card`}
        >
          {g}
        </Link>
      ))}
    </div>
  )
}

function buildSharedNetwork(sharedGenes, enrichmentData) {
  if (!enrichmentData?.interactions?.length) return []
  const nodes = []
  const edges = []
  const geneSet = new Set(sharedGenes)
  const degrees = {}

  enrichmentData.interactions.forEach((p, i) => {
    const g1 = p.gene1
    const g2 = p.gene2
    if (!geneSet.has(g1) || !geneSet.has(g2)) return
    degrees[g1] = (degrees[g1] || 0) + 1
    degrees[g2] = (degrees[g2] || 0) + 1
    edges.push({
      data: {
        id: `e${i}`,
        source: g1,
        target: g2,
        weight: p.evidence_count || 1,
        ino_color: '#a0aec0',
      },
    })
  })

  const genesInEdges = new Set()
  edges.forEach(({ data: { source, target } }) => {
    genesInEdges.add(source)
    genesInEdges.add(target)
  })

  genesInEdges.forEach((g) => {
    nodes.push({
      data: {
        id: g,
        label: g,
        degree: degrees[g] || 1,
        centrality_d: 0,
      },
    })
  })

  return [...nodes, ...edges]
}

function downloadCSV(data) {
  if (!data) return
  const rows = [['Category', 'Gene']]
  for (const g of data.shared_genes) rows.push(['Shared', g])
  for (const g of data.unique_a) rows.push([`Unique to ${data.query_a.keywords}`, g])
  for (const g of data.unique_b) rows.push([`Unique to ${data.query_b.keywords}`, g])
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `compare_${data.query_a.keywords}_vs_${data.query_b.keywords}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Compare() {
  const [queryA, setQueryA] = useState('')
  const [queryB, setQueryB] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [sharedNetwork, setSharedNetwork] = useState(null)
  const [networkLoading, setNetworkLoading] = useState(false)

  const handleCompare = useCallback(
    async (e) => {
      e.preventDefault()
      const a = queryA.trim()
      const b = queryB.trim()
      if (!a || !b) {
        setError('Please enter both queries.')
        return
      }
      setError('')
      setResult(null)
      setSharedNetwork(null)
      setLoading(true)
      try {
        const data = await api.dignetCompare(a, b)
        setResult(data)

        // Auto-fetch shared gene subnetwork if there are shared genes
        if (data.shared_genes?.length >= 2) {
          setNetworkLoading(true)
          try {
            const enrichment = await api.enrichment(data.shared_genes)
            setSharedNetwork(enrichment)
          } catch { /* non-fatal */ }
          setNetworkLoading(false)
        }
      } catch (err) {
        setError(err.message || 'Comparison failed.')
      } finally {
        setLoading(false)
      }
    },
    [queryA, queryB],
  )

  function sendToEnrichment(genes) {
    navigate(`/enrichment?genes=${encodeURIComponent(genes.join(','))}`)
  }

  const sharedElements = sharedNetwork ? buildSharedNetwork(result?.shared_genes || [], sharedNetwork) : []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Compare Networks</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter two PubMed search queries to compare gene interaction networks side by side.
      </p>

      {/* Search form */}
      <form onSubmit={handleCompare} className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-8">
        <div className="md:col-span-3">
          <label htmlFor="query-a" className="block text-xs font-medium text-gray-500 mb-1">
            Query A
          </label>
          <input
            id="query-a"
            type="text"
            value={queryA}
            onChange={(e) => setQueryA(e.target.value)}
            placeholder="e.g. influenza vaccine"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="md:col-span-3">
          <label htmlFor="query-b" className="block text-xs font-medium text-gray-500 mb-1">
            Query B
          </label>
          <input
            id="query-b"
            type="text"
            value={queryB}
            onChange={(e) => setQueryB(e.target.value)}
            placeholder="e.g. COVID-19 vaccine"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy hover:bg-navy-dark disabled:opacity-50 text-white font-semibold px-4 py-2 rounded text-sm transition-colors"
          >
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </div>
      </form>

      <ErrorMessage message={error} />
      {loading && <LoadingSpinner message="Running PubMed searches and comparing results..." />}

      {result && (
        <div className="space-y-8">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label={`Query A: ${result.query_a.keywords}`}
              value={result.query_a.gene_count}
              sub={`${result.query_a.pair_count} pairs / ${result.query_a.pmid_count} PMIDs`}
            />
            <StatCard
              label={`Query B: ${result.query_b.keywords}`}
              value={result.query_b.gene_count}
              sub={`${result.query_b.pair_count} pairs / ${result.query_b.pmid_count} PMIDs`}
            />
            <StatCard label="Shared Genes" value={result.overlap.shared} />
            <StatCard
              label="Jaccard Index"
              value={result.overlap.jaccard}
              sub={`${result.overlap.unique_a} unique A / ${result.overlap.unique_b} unique B`}
            />
          </div>

          {/* Venn diagram */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-4 text-center">Gene Overlap</h2>
            <div className="relative w-72 h-44 mx-auto">
              <div className="absolute left-2 top-4 w-36 h-36 rounded-full bg-blue-100 border-2 border-blue-400 opacity-70 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-700">{result.overlap.unique_a}</span>
              </div>
              <div className="absolute right-2 top-4 w-36 h-36 rounded-full bg-orange-100 border-2 border-orange-400 opacity-70 flex items-center justify-center">
                <span className="text-sm font-bold text-orange-700">{result.overlap.unique_b}</span>
              </div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <span className="text-base font-bold text-gray-700">{result.overlap.shared}</span>
              </div>
            </div>
            <div className="flex justify-center gap-8 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-300" />
                {result.query_a.keywords}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-orange-300" />
                {result.query_b.keywords}
              </span>
            </div>
          </div>

          {/* Gene lists: Unique A | Shared | Unique B (matches Venn layout) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-600">
                  Unique to A ({result.unique_a.length})
                </h3>
                {result.unique_a.length >= 2 && (
                  <button onClick={() => sendToEnrichment(result.unique_a)}
                    className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded hover:bg-blue-100">
                    Analyze
                  </button>
                )}
              </div>
              <GeneTagCloud genes={result.unique_a} color="bg-blue-100 text-blue-700" />
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-green-700">
                  Shared ({result.shared_genes.length})
                </h3>
                {result.shared_genes.length >= 2 && (
                  <button onClick={() => sendToEnrichment(result.shared_genes)}
                    className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded hover:bg-green-100">
                    Analyze
                  </button>
                )}
              </div>
              <GeneTagCloud genes={result.shared_genes} color="bg-green-100 text-green-700" />
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-orange-600">
                  Unique to B ({result.unique_b.length})
                </h3>
                {result.unique_b.length >= 2 && (
                  <button onClick={() => sendToEnrichment(result.unique_b)}
                    className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded hover:bg-orange-100">
                    Analyze
                  </button>
                )}
              </div>
              <GeneTagCloud genes={result.unique_b} color="bg-orange-100 text-orange-700" />
            </div>
          </div>

          {/* Shared gene subnetwork */}
          {networkLoading && <LoadingSpinner message="Building shared gene subnetwork..." />}
          {sharedElements.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-sm font-semibold text-gray-600 mb-1">
                Shared Gene Interaction Network ({sharedElements.filter(e => !e.data.source).length} genes, {sharedElements.filter(e => e.data.source).length} interactions)
              </h2>
              <p className="text-xs text-gray-400 mb-3">
                How the {result.shared_genes.length} shared genes interact with each other. Click a node to view its report card.
              </p>
              <div style={{ height: '400px' }}>
                <NetworkGraph
                  elements={sharedElements}
                  onNodeClick={(nodeData) => {
                    const gene = typeof nodeData === 'string' ? nodeData : nodeData?.id || nodeData
                    if (gene) navigate(`/gene?q=${encodeURIComponent(gene)}`)
                  }}
                />
              </div>
            </div>
          )}
          {result.shared_genes.length > 0 && !networkLoading && sharedElements.length === 0 && sharedNetwork && (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
              No direct interactions found among the {result.shared_genes.length} shared genes.
            </div>
          )}

          {/* Export */}
          <div className="text-center">
            <button
              onClick={() => downloadCSV(result)}
              className="inline-flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-medium text-sm px-4 py-2 rounded transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
