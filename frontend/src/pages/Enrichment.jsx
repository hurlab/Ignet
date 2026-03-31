import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import NetworkGraph from '../components/NetworkGraph.jsx'
import { useGeneSet } from '../GeneSetContext.jsx'

const EXAMPLE_GENES = 'TNF, IL6, IFNG, IL1B, IL10'

function parseGeneInput(text) {
  return text
    .split(/[\n,\t ]+/)
    .map((g) => g.trim().toUpperCase())
    .filter((g) => g.length > 0)
}

function downloadCSV(data) {
  if (!data) return
  const lines = ['gene1,gene2,evidence_count,unique_pmids,max_score']
  for (const row of data.interactions ?? []) {
    lines.push(
      [row.gene1, row.gene2, row.evidence_count, row.unique_pmids, row.max_score].join(',')
    )
  }
  lines.push('')
  lines.push('INO Term,Count')
  for (const row of data.ino_distribution ?? []) {
    lines.push(`"${row.term}",${row.cnt}`)
  }
  lines.push('')
  lines.push('Drug,Count')
  for (const row of data.drugs ?? []) {
    lines.push(`"${row.term}",${row.cnt}`)
  }
  lines.push('')
  lines.push('Disease,Count')
  for (const row of data.diseases ?? []) {
    lines.push(`"${row.term}",${row.cnt}`)
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ignet-enrichment.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function buildCytoscapeElements(interactions) {
  if (!interactions?.length) return []
  const nodeSet = new Set()
  const elements = []
  for (const edge of interactions) {
    nodeSet.add(edge.gene1)
    nodeSet.add(edge.gene2)
  }
  const degrees = {}
  for (const edge of interactions) {
    degrees[edge.gene1] = (degrees[edge.gene1] || 0) + 1
    degrees[edge.gene2] = (degrees[edge.gene2] || 0) + 1
  }
  const maxDeg = Math.max(...Object.values(degrees), 1)
  for (const gene of nodeSet) {
    elements.push({
      data: {
        id: gene,
        label: gene,
        degree: degrees[gene] || 1,
        centrality_d: (degrees[gene] || 1) / maxDeg,
      },
    })
  }
  for (const edge of interactions) {
    elements.push({
      data: {
        id: `${edge.gene1}-${edge.gene2}`,
        source: edge.gene1,
        target: edge.gene2,
        weight: edge.evidence_count || 1,
        ino_color: '#6b7280',
        ino_category: `${edge.evidence_count} evidence`,
      },
    })
  }
  return elements
}

function CoverageCard({ data }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: 'Input Genes', value: data.input_genes?.length ?? 0 },
        { label: 'Genes Found', value: data.coverage ?? 0 },
        { label: 'Coverage', value: `${data.coverage_pct ?? 0}%` },
        { label: 'Interactions', value: data.total_interactions ?? 0 },
      ].map(({ label, value }) => (
        <div key={label} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-navy">{value.toLocaleString?.() ?? value}</div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      ))}
    </div>
  )
}

function InoDistribution({ distribution }) {
  if (!distribution?.length) return null
  const maxCount = Math.max(...distribution.map((d) => d.cnt), 1)
  const items = distribution.slice(0, 10)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-navy mb-3">INO Interaction Types</h3>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.term} className="flex items-center gap-2 text-xs">
            <span className="w-32 truncate text-gray-600" title={item.term}>
              {item.term}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-navy rounded-full h-2 transition-all"
                style={{ width: `${(item.cnt / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-gray-500 font-medium">{item.cnt}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TagList({ items, color }) {
  if (!items?.length) return null
  const bgMap = { blue: 'bg-blue-100 text-blue-800', red: 'bg-red-100 text-red-800' }
  const cls = bgMap[color] ?? 'bg-gray-100 text-gray-800'

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.term}
          className={`${cls} text-xs px-2 py-0.5 rounded-full font-medium`}
          title={`${item.term}: ${item.cnt} occurrences`}
        >
          {item.term}
          <span className="ml-1 opacity-60">{item.cnt}</span>
        </span>
      ))}
    </div>
  )
}

export default function Enrichment() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const didAutoAnalyze = useRef(false)
  const geneSet = useGeneSet()

  // Load genes transferred from the Gene Set page
  useEffect(() => {
    const transferred = localStorage.getItem('ignet_geneset_transfer')
    if (searchParams.get('from') === 'geneset' && transferred) {
      setInput(transferred.replace(/,/g, '\n'))
      localStorage.removeItem('ignet_geneset_transfer')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-analyze if ?genes= URL param is provided (from Compare page)
  useEffect(() => {
    const genesParam = searchParams.get('genes')
    if (genesParam && !didAutoAnalyze.current) {
      didAutoAnalyze.current = true
      const geneText = genesParam.replace(/,/g, ', ')
      setInput(geneText)
      // Trigger analysis after state update
      setTimeout(() => {
        const genes = parseGeneInput(geneText)
        if (genes.length >= 2) {
          runAnalysis(genes)
        }
      }, 0)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function runAnalysis(genes) {
    setError(null)
    setData(null)
    setLoading(true)
    try {
      const result = await api.enrichment(genes)
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAnalyze() {
    setError(null)
    const genes = parseGeneInput(input)
    if (genes.length < 2) {
      setError('Please enter at least 2 gene symbols.')
      return
    }
    if (genes.length > 500) {
      setError('Maximum 500 genes allowed.')
      return
    }
    setLoading(true)
    try {
      const result = await api.enrichment(genes)
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cyElements = data ? buildCytoscapeElements(data.interactions) : []

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy mb-1">Gene Set Enrichment</h1>
        <p className="text-gray-500 text-xs">
          Enter a set of genes to discover pairwise interactions, interaction types, drug
          associations, and disease associations from the Ignet database.
        </p>
      </div>

      {/* Input area */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <label className="block text-sm font-medium text-gray-700" htmlFor="gene-input">
          Gene Symbols
          <span className="text-gray-400 font-normal ml-1">(one per line, or comma / tab / space separated)</span>
        </label>
        <textarea
          id="gene-input"
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="TNF&#10;IL6&#10;IFNG&#10;IL1B&#10;IL10"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="bg-navy hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
          <button
            onClick={() => setInput(EXAMPLE_GENES)}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Example: TNF, IL6, IFNG, IL1B, IL10
          </button>
          {geneSet?.genes?.length > 0 && (
            <button
              type="button"
              onClick={() => setInput(geneSet.genes.join('\n'))}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Load from Gene Set ({geneSet.genes.length})
            </button>
          )}
          {data && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => downloadCSV(data)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={() => navigate('/compare')}
                className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
              >
                Compare with another gene set
              </button>
            </div>
          )}
        </div>
      </div>

      <ErrorMessage message={error} />
      {loading && <LoadingSpinner message="Analyzing gene set..." />}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-6">
          {/* Coverage */}
          <CoverageCard data={data} />

          {/* Network graph */}
          {cyElements.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Subnetwork</h2>
              <NetworkGraph
                elements={cyElements}
                onNodeClick={(node) => {
                  window.open(`/ignet/gene?q=${encodeURIComponent(node.label)}`, '_blank')
                }}
              />
            </div>
          )}

          {/* INO distribution */}
          <InoDistribution distribution={data.ino_distribution} />

          {/* Drug associations */}
          {data.drugs?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-navy mb-3">Drug Associations</h3>
              <TagList items={data.drugs} color="blue" />
            </div>
          )}

          {/* Disease associations */}
          {data.diseases?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-navy mb-3">Disease Associations</h3>
              <TagList items={data.diseases} color="red" />
            </div>
          )}

          {/* Gene list with links */}
          {data.input_genes?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-navy mb-3">Input Genes</h3>
              <div className="flex flex-wrap gap-1.5">
                {data.input_genes.map((gene) => (
                  <Link
                    key={gene}
                    to={`/gene?q=${encodeURIComponent(gene)}`}
                    className="text-xs bg-gray-100 text-navy px-2 py-0.5 rounded hover:bg-blue-100 transition-colors font-medium"
                  >
                    {gene}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
