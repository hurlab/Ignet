import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import NetworkGraph from '../components/NetworkGraph.jsx'
import ExportDropdown from '../components/ExportDropdown.jsx'
import EntitySidebar from '../components/EntitySidebar.jsx'

const LIMIT_OPTIONS = [50, 100, 200, 500, 1000, 2000, 5000]

function YearRangeSlider({ min, max, valueMin, valueMax, onChangeMin, onChangeMax }) {
  const range = max - min || 1
  const leftPct = ((valueMin - min) / range) * 100
  const widthPct = ((valueMax - valueMin) / range) * 100

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-8">{valueMin}</span>
      <div className="relative flex-1 h-6">
        {/* Track background */}
        <div className="absolute top-2.5 left-0 right-0 h-1 bg-gray-200 rounded-full" />
        {/* Active range */}
        <div className="absolute top-2.5 h-1 bg-navy rounded-full"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }} />
        {/* Min thumb */}
        <input type="range" min={min} max={max} value={valueMin}
          onChange={e => { const v = +e.target.value; if (v <= valueMax) onChangeMin(v) }}
          className="absolute w-full top-0 h-6 appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-navy [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-navy [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:cursor-pointer" />
        {/* Max thumb */}
        <input type="range" min={min} max={max} value={valueMax}
          onChange={e => { const v = +e.target.value; if (v >= valueMin) onChangeMax(v) }}
          className="absolute w-full top-0 h-6 appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:cursor-pointer" />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{valueMax}</span>
    </div>
  )
}

function downloadCSV(pairs, query) {
  if (!pairs?.length) return
  const comment = `# Ignet Dignet Network for "${query}" - https://ignet.org/ignet/dignet\n`
  const header = 'Gene1,Gene2,Score,PMID,Sentence,INO_Category\n'
  const rows = pairs.map(p =>
    [p.geneSymbol1 || p.gene1, p.geneSymbol2 || p.gene2, p.score || '', p.pmid || p.pmid || '',
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

const MAX_GRAPH_EDGES = 2000

// INO category fallback color for edges that have no ino_color from the backend
const INO_FALLBACK_COLOR = '#a0aec0'

function buildElements(result) {
  const pairs = result?.gene_pairs
  if (!pairs || pairs.length === 0) return []
  const limitedPairs = pairs.slice(0, MAX_GRAPH_EDGES)
  const genes = new Set()

  // Aggregate: one edge per unique gene pair, weight = number of supporting PMIDs
  const edgeMap = new Map()
  limitedPairs.forEach((p) => {
    const g1 = p.gene1
    const g2 = p.gene2
    if (!g1 || !g2) return
    genes.add(g1)
    genes.add(g2)
    // Canonical key (sorted) so A-B and B-A merge
    const key = g1 < g2 ? `${g1}|${g2}` : `${g2}|${g1}`
    const existing = edgeMap.get(key)
    if (existing) {
      existing.pmid_count += 1
      if (p.score != null && (existing.best_score == null || p.score > existing.best_score)) {
        existing.best_score = p.score
      }
      if (p.ino_category && p.ino_category !== 'unknown') {
        existing.ino_category = p.ino_category
        existing.ino_color = p.ino_color
      }
    } else {
      edgeMap.set(key, {
        source: key.split('|')[0],
        target: key.split('|')[1],
        pmid_count: 1,
        best_score: p.score ?? null,
        ino_category: p.ino_category ?? 'unknown',
        ino_color: p.ino_color ?? INO_FALLBACK_COLOR,
      })
    }
  })

  const edges = [...edgeMap.entries()].map(([key, e]) => ({
    data: {
      id: `e_${key}`,
      source: e.source,
      target: e.target,
      weight: e.pmid_count,
      score: e.best_score,
      ino_category: e.ino_category,
      ino_color: e.ino_color,
    },
  }))
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
  const [highlightType, setHighlightType] = useState(null)
  const [visibleCategories, setVisibleCategories] = useState({ drugs: true, diseases: true, ino: true })
  const cyInstanceRef = useRef(null)
  const didAutoSearch = useRef(false)
  const abortRef = useRef(null)
  const yearDebounceRef = useRef(null)

  // Apply highlight/fade to Cytoscape graph when entity is selected
  useEffect(() => {
    const cy = cyInstanceRef.current
    if (!cy) return

    // Reset all nodes/edges to default
    cy.nodes().style({ opacity: 1 })
    cy.edges().style({ opacity: '' })

    if (!activeHighlight || !highlightType) return

    if (highlightType === 'ino') {
      // INO: highlight edges matching the term, fade non-matching
      const matchEdges = cy.edges().filter(e => {
        const cat = (e.data('ino_category') || '').replace(/_/g, ' ')
        return cat === activeHighlight || e.data('ino_category') === activeHighlight
      })
      const matchNodes = matchEdges.connectedNodes()
      cy.nodes().style({ opacity: 0.15 })
      cy.edges().style({ opacity: 0.05 })
      matchNodes.style({ opacity: 1 })
      matchEdges.style({ opacity: 0.9 })
    } else {
      // Drug/Disease: highlight genes that appear in the enrichment interactions
      // Since we don't have per-entity gene mapping, highlight all genes
      // that co-occur with the entity in the enrichment data
      // For now, flash all nodes briefly to indicate selection was registered
      // Full implementation needs a backend endpoint for gene-entity mapping
      cy.nodes().style({ opacity: 0.15 })
      cy.edges().style({ opacity: 0.05 })
      // Highlight nodes whose labels appear in interactions involving this entity
      // Use the enrichment data to find associated genes
      if (entities?.interactions) {
        const assocGenes = new Set()
        entities.interactions.forEach(p => { assocGenes.add(p.gene1); assocGenes.add(p.gene2) })
        cy.nodes().forEach(n => {
          if (assocGenes.has(n.id())) n.style({ opacity: 1 })
        })
        cy.edges().forEach(e => {
          if (assocGenes.has(e.data('source')) && assocGenes.has(e.data('target'))) {
            e.style({ opacity: 0.6 })
          }
        })
      }
    }
  }, [activeHighlight, highlightType, entities])

  useEffect(() => {
    api.dignetYearRange().then((data) => {
      if (data?.min_year != null && data?.max_year != null) {
        setYearRange(data)
        setYearMin(data.min_year)
        setYearMax(data.max_year)
      }
    }).catch(() => {})
  }, [])

  const runSearch = useCallback(async (searchQuery, searchLimit, filters, opts) => {
    const q = (searchQuery ?? query).trim()
    if (!q) return

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const isNewQuery = q !== (result?.keywords ?? '')
    setLoading(true)
    setError(null)
    setResult(null)
    setSelectedNode(null)
    if (isNewQuery) {
      setEntities(null)
      setActiveHighlight(null)
      setHighlightType(null)
    }
    try {
      const activeFilters = filters ?? { ino_type: inoFilter, has_vaccine: vaccineOnly }
      const useCache = opts?.useCache !== false
      const raw = await api.dignetSearch(q, searchLimit ?? limit, activeFilters, useCache)
      if (controller.signal.aborted) return // stale result
      const data = raw?.data ?? raw
      setResult(data)

      // Fetch entities only for new queries (not filter changes)
      const queryId = data.query_id
      if (queryId && isNewQuery) {
        setEntitiesLoading(true)
        api.dignetEntities(queryId)
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

  function handleYearChange(newMin, newMax) {
    setYearMin(newMin)
    setYearMax(newMax)
    if (yearDebounceRef.current) clearTimeout(yearDebounceRef.current)
    yearDebounceRef.current = setTimeout(() => {
      if (result) runSearch(query, limit, { ino_type: inoFilter, has_vaccine: vaccineOnly, year_min: newMin, year_max: newMax })
    }, 500)
  }

  // Re-fetch when filters change (only if a result already exists)
  useEffect(() => {
    if (result) {
      runSearch(query, limit, { ino_type: inoFilter, has_vaccine: vaccineOnly })
    }
  }, [inoFilter, vaccineOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-search when URL contains ?q= (on mount or when query param changes)
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && q !== didAutoSearch.current) {
      didAutoSearch.current = q
      setQuery(q)
      runSearch(q, limit, { ino_type: '', has_vaccine: false })
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const geneElements = result ? buildElements(result) : []

  // Build entity nodes and edges based on visible categories
  function buildEntityElements() {
    if (!entities || !result) return []
    const extra = []

    if (visibleCategories.drugs && entities.drugs?.length) {
      entities.drugs.slice(0, 10).forEach((drug, i) => {
        const drugId = `drug_${i}`
        extra.push({
          data: { id: drugId, label: drug.term, nodeType: 'drug', degree: 1, centrality_d: 0 }
        })
        const topGenes = geneElements
          .filter(e => !e.data.source)
          .sort((a, b) => (b.data.degree || 0) - (a.data.degree || 0))
          .slice(0, 3)
        topGenes.forEach(g => {
          extra.push({
            data: { id: `de_${drugId}_${g.data.id}`, source: drugId, target: g.data.id, weight: 1, edgeType: 'entity', ino_color: '#cbd5e0' }
          })
        })
      })
    }

    if (visibleCategories.diseases && entities.diseases?.length) {
      entities.diseases.slice(0, 10).forEach((disease, i) => {
        const diseaseId = `disease_${i}`
        extra.push({
          data: { id: diseaseId, label: disease.term, nodeType: 'disease', degree: 1, centrality_d: 0 }
        })
        const topGenes = geneElements
          .filter(e => !e.data.source)
          .sort((a, b) => (b.data.degree || 0) - (a.data.degree || 0))
          .slice(0, 3)
        topGenes.forEach(g => {
          extra.push({
            data: { id: `de_${diseaseId}_${g.data.id}`, source: diseaseId, target: g.data.id, weight: 1, edgeType: 'entity', ino_color: '#cbd5e0' }
          })
        })
      })
    }

    if (visibleCategories.ino && entities.ino_distribution?.length) {
      entities.ino_distribution.slice(0, 8).forEach((ino, i) => {
        const inoId = `ino_${i}`
        extra.push({
          data: { id: inoId, label: ino.term, nodeType: 'ino', degree: 1, centrality_d: 0 }
        })
        const matchingGenes = new Set()
        geneElements.filter(e => e.data.source).forEach(e => {
          const cat = (e.data.ino_category || '').replace(/_/g, ' ')
          if (cat === ino.term || e.data.ino_category === ino.term) {
            matchingGenes.add(e.data.source)
            matchingGenes.add(e.data.target)
          }
        })
        ;[...matchingGenes].slice(0, 5).forEach(g => {
          extra.push({
            data: { id: `de_${inoId}_${g}`, source: inoId, target: g, weight: 1, edgeType: 'entity', ino_color: '#cbd5e0' }
          })
        })
      })
    }

    return extra
  }

  const entityElements = buildEntityElements()
  const elements = [...geneElements, ...entityElements]
  const geneNodeCount = geneElements.filter(e => !e.data.source).length
  const entityNodeCount = entityElements.filter(e => !e.data.source).length
  const nodeCount = geneNodeCount + entityNodeCount
  const edgeCount = elements.filter(e => e.data.source).length

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
              { label: 'Gene Nodes', value: geneNodeCount },
              entityNodeCount > 0 ? { label: 'Entity Nodes', value: entityNodeCount } : null,
              { label: 'Edges', value: edgeCount },
              { label: 'Cached', value: result.cached ? 'Yes' : 'No' },
            ].filter(Boolean).map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-200 rounded px-3 py-1.5 flex items-center gap-1">
                <span className="text-xs text-gray-500 mr-1">{label}:</span>
                <span className="text-xs font-semibold text-navy">{value}</span>
                {label === 'Cached' && result.cached && (
                  <button
                    onClick={() => runSearch(query, limit, { ino_type: inoFilter, has_vaccine: vaccineOnly }, { useCache: false })}
                    className="ml-1 text-[10px] text-blue-500 hover:text-blue-700 underline"
                    title="Re-query PubMed for fresh results"
                  >
                    Refresh
                  </button>
                )}
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
              <div className="w-full mt-2">
                <label className="text-xs text-gray-500 mb-1 block">Publication Year Range</label>
                <YearRangeSlider
                  min={yearRange.min_year} max={yearRange.max_year}
                  valueMin={yearMin} valueMax={yearMax}
                  onChangeMin={v => handleYearChange(v, yearMax)}
                  onChangeMax={v => handleYearChange(yearMin, v)}
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 flex-wrap lg:flex-nowrap">
            {/* Graph */}
            <div className="flex-1 min-w-0">
              <NetworkGraph elements={elements} onNodeClick={setSelectedNode} onCyReady={(cy) => { cyInstanceRef.current = cy }} />
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
              {(visibleCategories.drugs || visibleCategories.diseases || visibleCategories.ino) && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                  {visibleCategories.drugs && <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-green-500 rotate-45"></span> Drug</span>}
                  {visibleCategories.diseases && <span className="flex items-center gap-1"><span className="inline-block w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-transparent border-b-red-500"></span> Disease</span>}
                  {visibleCategories.ino && <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-purple-500 rounded-sm"></span> INO Type</span>}
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-400">Dashed edges = entity associations</span>
                </div>
              )}
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
                    onHighlight={(type, term) => {
                      if (activeHighlight === term) {
                        setActiveHighlight(null)
                        setHighlightType(null)
                      } else {
                        setActiveHighlight(term)
                        setHighlightType(type)
                      }
                    }}
                    onClearHighlight={() => { setActiveHighlight(null); setHighlightType(null) }}
                    visibleCategories={visibleCategories}
                    onToggleCategory={(key) => setVisibleCategories(prev => ({ ...prev, [key]: !prev[key] }))}
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
