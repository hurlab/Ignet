import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { api, enrichmentStream } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import NetworkGraph from '../components/NetworkGraph.jsx'
import { useGeneSet } from '../GeneSetContext.jsx'

const EXAMPLE_GENES = 'TNF, IL6, IFNG, IL1B, IL10'

// Ordered stage definitions — matches the server's "stages" array
const STAGE_DEFS = [
  { key: 'interactions',    label: 'Interactions' },
  { key: 'ino_distribution', label: 'Interaction types (INO)' },
  { key: 'drugs',           label: 'Drugs' },
  { key: 'diseases',        label: 'Diseases' },
]

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

/**
 * Compact 4-step progress indicator for the streaming enrichment flow.
 * Each step is: pending → loading (in-flight) → done.
 *
 * stageStatus: Record<stageKey, 'pending' | 'loading' | 'done'>
 */
function StreamProgress({ stageStatus }) {
  return (
    // role="status" + aria-live="polite" so screen readers announce progress without interrupting
    <div role="status" aria-live="polite" aria-label="Analysis progress" className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Loading results…</p>
      <ol className="flex flex-wrap gap-3" aria-label="Analysis stages">
        {STAGE_DEFS.map(({ key, label }) => {
          const status = stageStatus[key] ?? 'pending'
          return (
            <li key={key} className="flex items-center gap-1.5 text-xs">
              {status === 'done' && (
                <span
                  aria-label={`${label} complete`}
                  className="flex-shrink-0 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                >
                  {/* checkmark */}
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              {status === 'loading' && (
                <span
                  aria-label={`${label} loading`}
                  className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"
                  aria-hidden="false"
                />
              )}
              {status === 'pending' && (
                <span
                  aria-label={`${label} pending`}
                  className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-gray-300 bg-gray-50"
                  aria-hidden="false"
                />
              )}
              <span className={
                status === 'done'    ? 'text-green-700 font-medium' :
                status === 'loading' ? 'text-blue-700 font-medium' :
                'text-gray-400'
              }>
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** Muted placeholder shown while a section is still pending during streaming */
function SectionPending({ label }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">{label}</h3>
      <div className="text-xs text-gray-300 italic">…</div>
    </div>
  )
}

// Initial per-section state used when starting a new analysis run
const EMPTY_SECTIONS = { interactions: null, ino_distribution: null, drugs: null, diseases: null }
const EMPTY_META = { coverage: 0, coverage_pct: 0, total_interactions: 0, input_genes: [] }
const ALL_PENDING = Object.fromEntries(STAGE_DEFS.map(({ key }) => [key, 'pending']))

export default function Enrichment() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [input, setInput] = useState('')

  // Streaming state
  const [streaming, setStreaming]     = useState(false)   // true while stream is in-flight
  const [stageStatus, setStageStatus] = useState({})      // per-stage 'pending'|'loading'|'done'
  const [sections, setSections]       = useState(EMPTY_SECTIONS)
  const [meta, setMeta]               = useState(EMPTY_META)   // coverage data from interactions.meta
  const [inputGenes, setInputGenes]   = useState([])      // from 'start' event

  // Legacy / fallback state
  const [error, setError]   = useState(null)
  const [data, setData]     = useState(null)  // populated only by the fallback non-stream path

  const abortRef = useRef(null)
  const didAutoAnalyze = useRef(false)
  const geneSet = useGeneSet()

  // Cancel any in-flight stream on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

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
      setTimeout(() => {
        const genes = parseGeneInput(geneText)
        if (genes.length >= 2) {
          runAnalysis(genes)
        }
      }, 0)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // @MX:ANCHOR: [AUTO] Core analysis entry point — called by example button, auto-analyze effect, and handleAnalyze
  // @MX:REASON: fan_in >= 3; streaming/fallback branching logic must remain stable across callers
  const runAnalysis = useCallback(async (genes) => {
    // Cancel any previous in-flight stream
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // Reset all state for a fresh run
    setError(null)
    setData(null)
    setSections(EMPTY_SECTIONS)
    setMeta(EMPTY_META)
    setInputGenes([])
    setStageStatus(ALL_PENDING)
    setStreaming(true)

    let gotAnySection = false

    try {
      // Track which stage is "next expected" so we can mark it 'loading'
      const stageOrder = STAGE_DEFS.map(({ key }) => key)
      let nextStageIdx = 0

      const markNextLoading = () => {
        if (nextStageIdx < stageOrder.length) {
          const key = stageOrder[nextStageIdx]
          setStageStatus((prev) => ({ ...prev, [key]: 'loading' }))
        }
      }

      await enrichmentStream(genes, {
        signal: controller.signal,
        onEvent(evt) {
          if (evt.type === 'start') {
            setInputGenes(evt.input_genes ?? [])
            // Mark the first stage as loading immediately
            markNextLoading()
            return
          }

          if (evt.type === 'section') {
            gotAnySection = true
            const key = evt.name

            // Advance stage pointer: mark this stage done, next stage loading
            setStageStatus((prev) => ({ ...prev, [key]: 'done' }))
            nextStageIdx = stageOrder.indexOf(key) + 1
            markNextLoading()

            setSections((prev) => ({ ...prev, [key]: evt.data }))

            // Extract coverage meta from interactions section
            if (key === 'interactions' && evt.meta) {
              setMeta({
                coverage:           evt.meta.coverage          ?? 0,
                coverage_pct:       evt.meta.coverage_pct      ?? 0,
                total_interactions: evt.meta.total_interactions ?? 0,
              })
            }
            return
          }

          if (evt.type === 'done') {
            // Mark any remaining stages as done (handles cached fast-path)
            setStageStatus(Object.fromEntries(STAGE_DEFS.map(({ key }) => [key, 'done'])))
            setStreaming(false)
            return
          }

          if (evt.type === 'error') {
            setError(evt.message ?? 'Stream error')
            setStreaming(false)
          }
        },
      })

      // Stream finished cleanly without a 'done' event (should not happen, but guard)
      setStreaming(false)
    } catch (err) {
      // AbortError from our own cancel — silently ignore
      if (err.name === 'AbortError') {
        setStreaming(false)
        return
      }

      // Streaming threw before any section arrived → fall back to non-stream endpoint
      if (!gotAnySection) {
        try {
          const result = await api.enrichment(genes)
          setData(result)
        } catch (fallbackErr) {
          setError(fallbackErr.message)
        }
      } else {
        // At least some data already rendered — just surface the error
        setError(err.message)
      }
      setStreaming(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    runAnalysis(genes)
  }

  // Determine whether any result is available to show (stream or fallback)
  const hasStreamResult = sections.interactions !== null || sections.ino_distribution !== null ||
    sections.drugs !== null || sections.diseases !== null
  const hasFallbackResult = Boolean(data)
  const hasAnyResult = hasStreamResult || hasFallbackResult

  // Build a unified data-shape for CoverageCard / CSV / graph:
  // stream path assembles from sections + meta; fallback path uses raw data
  const unifiedData = hasFallbackResult ? data : (hasStreamResult ? {
    input_genes:        inputGenes,
    coverage:           meta.coverage,
    coverage_pct:       meta.coverage_pct,
    total_interactions: meta.total_interactions,
    interactions:       sections.interactions ?? [],
    ino_distribution:   sections.ino_distribution ?? [],
    drugs:              sections.drugs ?? [],
    diseases:           sections.diseases ?? [],
  } : null)

  const cyElements = sections.interactions ? buildCytoscapeElements(sections.interactions)
    : hasFallbackResult ? buildCytoscapeElements(data.interactions)
    : []

  const showProgress = streaming && !hasFallbackResult

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
            disabled={streaming || !input.trim()}
            className="bg-navy hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {streaming ? 'Analyzing...' : 'Analyze'}
          </button>
          <button
            onClick={() => { setInput(EXAMPLE_GENES); runAnalysis(parseGeneInput(EXAMPLE_GENES)) }}
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
          {hasAnyResult && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => downloadCSV(unifiedData)}
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

      {/* Fallback loading spinner — only shown when stream helper is unavailable and
          the page fell back to the non-streaming call */}
      {!streaming && !hasStreamResult && !hasFallbackResult && !error && null}

      {/* Streaming progress indicator */}
      {showProgress && <StreamProgress stageStatus={stageStatus} />}

      {/* Results — rendered progressively as sections arrive */}
      {hasAnyResult && (
        <div className="space-y-6">
          {/* Coverage — shown as soon as interactions section arrives (meta is populated then) */}
          {(sections.interactions !== null || hasFallbackResult) && (
            <CoverageCard data={unifiedData} />
          )}

          {/* Network graph — available once interactions section is ready */}
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

          {/* INO distribution — streaming: show placeholder until data arrives */}
          {sections.ino_distribution !== null ? (
            <InoDistribution distribution={sections.ino_distribution} />
          ) : hasFallbackResult ? (
            <InoDistribution distribution={data.ino_distribution} />
          ) : streaming ? (
            <SectionPending label="INO Interaction Types" />
          ) : null}

          {/* Drug associations */}
          {sections.drugs !== null ? (
            sections.drugs?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-navy mb-3">Drug Associations</h3>
                <TagList items={sections.drugs} color="blue" />
              </div>
            )
          ) : hasFallbackResult ? (
            data.drugs?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-navy mb-3">Drug Associations</h3>
                <TagList items={data.drugs} color="blue" />
              </div>
            )
          ) : streaming ? (
            <SectionPending label="Drug Associations" />
          ) : null}

          {/* Disease associations */}
          {sections.diseases !== null ? (
            sections.diseases?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-navy mb-3">Disease Associations</h3>
                <TagList items={sections.diseases} color="red" />
              </div>
            )
          ) : hasFallbackResult ? (
            data.diseases?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-navy mb-3">Disease Associations</h3>
                <TagList items={data.diseases} color="red" />
              </div>
            )
          ) : streaming ? (
            <SectionPending label="Disease Associations" />
          ) : null}

          {/* Gene list with links — shown once inputGenes is known (from 'start' event or fallback) */}
          {((inputGenes.length > 0) || hasFallbackResult) && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-navy mb-3">Input Genes</h3>
              <div className="flex flex-wrap gap-1.5">
                {(hasFallbackResult ? data.input_genes : inputGenes).map((gene) => (
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
