import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { COHORT_COLORS, mergeCohortEdges, buildCohortDiffElements, mergeCohorts, buildNCohortElements, sharedCountColor } from '../cohortDiff.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import NetworkGraph from '../components/NetworkGraph.jsx'
import ExportDropdown from '../components/ExportDropdown.jsx'
import EntitySidebar from '../components/EntitySidebar.jsx'
import EvidencePopup from '../components/EvidencePopup.jsx'

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

function downloadAggregatedCSV(edges, label) {
  if (!edges?.length) return
  const comment = `# Ignet Dignet PMID-list network "${label}" - https://ignet.org/ignet/dignet\n`
  const header = 'Gene1,Gene2,Evidence_PMID_count,Best_score\n'
  const rows = edges.map(e =>
    [e.gene1, e.gene2, e.evidence_count ?? '', e.best_score ?? ''].join(',')
  ).join('\n')
  const blob = new Blob([comment + header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ignet-dignet-${(label || 'pmid-list').replace(/[^\w]+/g, '_')}.csv`
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

// Build elements from a server-aggregated PMID-upload network. The backend
// already collapsed pairs into weighted edges (evidence_count = supporting
// PMIDs), so there is no second-pass aggregation here. Nodes are sized by
// in-graph degree (no precomputed centrality exists for uploaded lists).
function buildAggregatedElements(result) {
  const aggEdges = result?.aggregated_edges
  if (!aggEdges || aggEdges.length === 0) return []
  const genes = new Set()
  const edges = aggEdges.map((e) => {
    genes.add(e.gene1)
    genes.add(e.gene2)
    const key = e.gene1 < e.gene2 ? `${e.gene1}|${e.gene2}` : `${e.gene2}|${e.gene1}`
    return {
      data: {
        id: `e_${key}`,
        source: e.gene1,
        target: e.gene2,
        weight: e.evidence_count ?? 1,
        score: e.best_score ?? null,
        ino_category: 'unknown',
        ino_color: INO_FALLBACK_COLOR,
      },
    }
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
      centrality_d: 0,
    },
  }))
  return [...nodes, ...edges]
}

// CSV for an N-cohort (>2) differential: one weight column per cohort + shared count.
function downloadNCohortCSV(diffEdges, cohortNames) {
  if (!diffEdges?.length) return
  const safe = (s, i) => (s || `C${i + 1}`).replace(/[^\w]+/g, '_')
  const header = 'Gene1,Gene2,Shared_count,' + cohortNames.map((nm, i) => `Weight_${safe(nm, i)}`).join(',') + '\n'
  const rows = diffEdges.map((e) => [e.gene1, e.gene2, e.sharedCount, ...e.weights].join(',')).join('\n')
  const comment = `# Ignet ${cohortNames.length}-cohort comparison - https://ignet.org/ignet/dignet\n`
  const blob = new Blob([comment + header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ignet-cohort-compare.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function downloadCohortCSV(diffEdges, nameA, nameB) {
  if (!diffEdges?.length) return
  const header = 'Gene1,Gene2,Membership,Weight_A,Weight_B\n'
  const rows = diffEdges.map((e) =>
    [e.gene1, e.gene2, e.membership, e.weightA, e.weightB].join(',')).join('\n')
  const comment = `# Ignet cohort comparison: A="${nameA}" vs B="${nameB}" - https://ignet.org/ignet/dignet\n`
  const blob = new Blob([comment + header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ignet-cohort-compare.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// Parse a free-form PMID list (whitespace/comma/semicolon separated). Returns
// a deduped array of valid integer PMIDs. Run on submit only (one-shot), not
// per keystroke.
function parsePmids(rawText) {
  if (!rawText) return []
  const set = new Set()
  for (const tok of rawText.split(/[\s,;]+/)) {
    if (!tok) continue
    const n = parseInt(tok, 10)
    if (Number.isInteger(n) && n >= 1 && n <= 99999999) set.add(n)
  }
  return [...set]
}

const MAX_UPLOAD_PMIDS = 50000
const MAX_PMID_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

// Build a shareable query string for a keyword search; only non-default filters
// are included so a plain search stays a clean ?q=... permalink.
function dignetUrlParams(q, lim, filters) {
  const p = { q }
  if (lim && lim !== 100) p.limit = String(lim)
  if (filters?.ino_type) p.ino = filters.ino_type
  if (filters?.has_vaccine) p.vaccine = '1'
  if (filters?.year_min && filters.year_min !== 1975) p.ymin = String(filters.year_min)
  if (filters?.year_max && filters.year_max !== 2026) p.ymax = String(filters.year_max)
  return p
}

export default function Dignet() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [inputMode, setInputMode] = useState('keywords') // 'keywords' | 'pmids'
  const [pmidText, setPmidText] = useState('')
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
  // INO defaults off and loads on demand (its aggregation is ~250x costlier
  // per PMID chunk than the other categories), following the CoV pattern.
  // ontology defaults ON: drug/disease nodes link to genes by real per-paper
  // co-occurrence. The toggle stays so a user can revert to the decorative
  // (top-degree) layout. INO/CoV stay off (expensive / niche).
  const [visibleCategories, setVisibleCategories] = useState({ drugs: true, diseases: true, vaccines: true, ino: false, cov: false, ontology: true })
  const [covData, setCovData] = useState(null)
  const [covLoading, setCovLoading] = useState(false)
  const [inoData, setInoData] = useState(null)
  const [inoLoading, setInoLoading] = useState(false)
  const [entnetData, setEntnetData] = useState(null)
  const [entnetLoading, setEntnetLoading] = useState(false)
  const [evidencePair, setEvidencePair] = useState(null)
  const [colorScheme, setColorScheme] = useState('none') // node color scheme (SPEC-COHORT-002)
  // Two-cohort differential mode (SPEC-COHORT-003)
  // 2..5 cohorts (SPEC-COHORT-004)
  const [cohorts, setCohorts] = useState([
    { name: 'Cohort A', text: '' },
    { name: 'Cohort B', text: '' },
  ])
  const cyInstanceRef = useRef(null)
  const didAutoSearch = useRef(false)
  const abortRef = useRef(null)
  const yearDebounceRef = useRef(null)
  // Latest filter state, read when syncing the URL (avoids stale closures in
  // runSearch without widening its dependency list).
  const filterStateRef = useRef({})
  filterStateRef.current = { limit, inoFilter, vaccineOnly, yearMin, yearMax }

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
      setCovData(null)
      setInoData(null)
      setEntnetData(null)
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

      // Reflect this keyword search in the URL so it is shareable/bookmarkable
      // (replace: filter tweaks refine the same search, not new history entries).
      const fs = filterStateRef.current
      const urlFilters = {
        ino_type: activeFilters.ino_type ?? fs.inoFilter,
        has_vaccine: activeFilters.has_vaccine ?? fs.vaccineOnly,
        year_min: activeFilters.year_min ?? fs.yearMin,
        year_max: activeFilters.year_max ?? fs.yearMax,
      }
      didAutoSearch.current = q // keep the auto-search guard in sync with the URL
      setSearchParams(dignetUrlParams(q, searchLimit ?? fs.limit, urlFilters), { replace: true })

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
  }, [query, limit, inoFilter, vaccineOnly, setSearchParams])

  const runPmidSearch = useCallback(async () => {
    const pmids = parsePmids(pmidText)
    if (!pmids.length) {
      setError('No valid PMIDs found. Paste numeric PubMed IDs separated by spaces, commas, or new lines.')
      return
    }
    if (pmids.length > MAX_UPLOAD_PMIDS) {
      setError(`Too many PMIDs (${pmids.length.toLocaleString()}). The maximum is ${MAX_UPLOAD_PMIDS.toLocaleString()}.`)
      return
    }
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    setResult(null)
    setSelectedNode(null)
    setEntities(null)
    setCovData(null)
    setInoData(null)
    setEntnetData(null)
    setActiveHighlight(null)
    setHighlightType(null)
    try {
      const raw = await api.dignetSearchPmids(pmids, { has_vaccine: vaccineOnly })
      if (controller.signal.aborted) return
      const data = raw?.data ?? raw
      setResult(data)
      const queryId = data.query_id
      if (queryId) {
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
  }, [pmidText, vaccineOnly])

  function updateCohort(idx, field, value) {
    setCohorts(cs => cs.map((c, i) => (i === idx ? { ...c, [field]: value } : c)))
  }
  function addCohort() {
    setCohorts(cs => (cs.length >= 5 ? cs : [...cs, { name: `Cohort ${String.fromCharCode(65 + cs.length)}`, text: '' }]))
  }
  function removeCohort(idx) {
    setCohorts(cs => (cs.length <= 2 ? cs : cs.filter((_, i) => i !== idx)))
  }

  async function runCohortCompare() {
    const parsed = cohorts.map(c => parsePmids(c.text))
    if (parsed.some(p => p.length === 0)) {
      setError('Provide PMIDs for every cohort before comparing.')
      return
    }
    if (parsed.some(p => p.length > MAX_UPLOAD_PMIDS)) {
      setError(`Each cohort is capped at ${MAX_UPLOAD_PMIDS.toLocaleString()} PMIDs.`)
      return
    }
    if (abortRef.current) abortRef.current.abort()
    setLoading(true)
    setError(null)
    setResult(null)
    setSelectedNode(null)
    setEntities(null)
    setCovData(null)
    setInoData(null)
    setEntnetData(null)
    try {
      // Reuse the existing aggregation endpoint once per cohort (no new backend).
      const raws = await Promise.all(parsed.map(pmids => api.dignetSearchPmids(pmids, { has_vaccine: vaccineOnly })))
      const datas = raws.map(r => r?.data ?? r)
      const n = datas.length
      const cohortStats = datas.map((d, i) => ({
        name: cohorts[i].name || `Cohort ${i + 1}`,
        submitted: d.pmid_count, in_db: d.pmid_count_in_db, coverage_pct: d.coverage_pct,
      }))
      let diff
      let counts = null
      if (n === 2) {
        // N=2 keeps the SPEC-COHORT-003 A-only/B-only/shared tri-color view.
        diff = mergeCohortEdges(datas[0].aggregated_edges, datas[1].aggregated_edges)
        counts = {
          aOnly: diff.filter(e => e.membership === 'A-only').length,
          bOnly: diff.filter(e => e.membership === 'B-only').length,
          shared: diff.filter(e => e.membership === 'shared').length,
        }
      } else {
        diff = mergeCohorts(datas.map(d => d.aggregated_edges))
      }
      setResult({ mode: 'compare', n, diff_edges: diff, cohorts: cohortStats, counts })
    } catch (err) {
      setError(err.message || 'Cohort comparison failed.')
    } finally {
      setLoading(false)
    }
  }

  function handleCohortFile(idx) {
    return (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.size > MAX_PMID_FILE_BYTES) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`)
        e.target.value = ''
        return
      }
      const reader = new FileReader()
      reader.onload = () => updateCohort(idx, 'text', String(reader.result || ''))
      reader.onerror = () => setError('Failed to read the file.')
      reader.readAsText(file)
      e.target.value = ''
    }
  }

  async function handleSearch(e) {
    e?.preventDefault()
    if (inputMode === 'pmids') {
      await runPmidSearch()
    } else if (inputMode === 'compare') {
      await runCohortCompare()
    } else {
      await runSearch()
    }
  }

  function handlePmidFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_PMID_FILE_BYTES) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`)
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPmidText(String(reader.result || ''))
    reader.onerror = () => setError('Failed to read the file.')
    reader.readAsText(file)
    e.target.value = ''
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

  // Auto-search when URL contains ?q= (on mount, shared link, or back/forward),
  // restoring any persisted filters so a shared URL reproduces the same view.
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && q !== didAutoSearch.current) {
      didAutoSearch.current = q
      const lim = Number(searchParams.get('limit')) || 100
      const ino = searchParams.get('ino') || ''
      const vac = searchParams.get('vaccine') === '1'
      const ymin = Number(searchParams.get('ymin')) || 1975
      const ymax = Number(searchParams.get('ymax')) || 2026
      setQuery(q)
      setLimit(lim)
      setInoFilter(ino)
      setVaccineOnly(vac)
      setYearMin(ymin)
      setYearMax(ymax)
      runSearch(q, lim, { ino_type: ino, has_vaccine: vac, year_min: ymin, year_max: ymax })
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  // Lazily fetch the CoV-protein overlay the first time it is toggled on.
  useEffect(() => {
    const qid = result?.query_id
    if (visibleCategories.cov && qid && !covData && !covLoading) {
      setCovLoading(true)
      api.dignetCovGenes(qid)
        .then((d) => setCovData(d || { cov_nodes: [], cov_edges: [] }))
        .catch(() => setCovData({ cov_nodes: [], cov_edges: [] }))
        .finally(() => setCovLoading(false))
    }
  }, [visibleCategories.cov, result]) // eslint-disable-line react-hooks/exhaustive-deps

  // Lazily fetch INO the first time it is toggled on — same pattern as CoV.
  // Aggregating t_ino costs ~503ms per 500-PMID chunk (vs ~2ms for the other
  // categories), so it is never paid unless the user asks for it.
  useEffect(() => {
    const qid = result?.query_id
    if (visibleCategories.ino && qid && !inoData && !inoLoading) {
      setInoLoading(true)
      api.dignetEntitiesIno(qid)
        .then((d) => setInoData(d || { ino_distribution: [] }))
        .catch(() => setInoData({ ino_distribution: [] }))
        .finally(() => setInoLoading(false))
    }
  }, [visibleCategories.ino, result]) // eslint-disable-line react-hooks/exhaustive-deps

  // Lazily fetch the gene<->ontology network the first time it is toggled on.
  useEffect(() => {
    const qid = result?.query_id
    if (visibleCategories.ontology && qid && !entnetData && !entnetLoading) {
      setEntnetLoading(true)
      api.dignetEntityNetwork(qid)
        .then((d) => setEntnetData(d || { edges: [], terms: [] }))
        .catch(() => setEntnetData({ edges: [], terms: [] }))
        .finally(() => setEntnetLoading(false))
    }
  }, [visibleCategories.ontology, result]) // eslint-disable-line react-hooks/exhaustive-deps

  const parsedPmidCount = useMemo(() => parsePmids(pmidText).length, [pmidText])

  const geneElements = useMemo(
    () => {
      if (!result) return []
      if (result.mode === 'compare') {
        return result.n === 2
          ? buildCohortDiffElements(result.diff_edges)
          : buildNCohortElements(result.diff_edges, result.n)
      }
      return result.mode === 'pmids' ? buildAggregatedElements(result) : buildElements(result)
    },
    [result]
  )

  // Build entity nodes and edges based on visible categories
  const entityElements = useMemo(() => {
    if (!result) return []
    const extra = []

    // Gene<->ontology model: real per-cohort co-occurrence edges. When on (the
    // default) this REPLACES the decorative drug/disease nodes below (guarded by
    // !ontologyMode), whose edges attach terms to the top-degree genes
    // regardless of co-occurrence. INO and CoV overlays still coexist further
    // down. While ontology is on but entnetData is still loading, neither this
    // nor the decorative blocks draw, so the misleading edges never flash in.
    const ontologyMode = visibleCategories.ontology
    if (ontologyMode && entnetData?.edges?.length) {
      const geneIds = new Set(geneElements.filter(e => !e.data.source).map(e => e.data.id))
      // Disease and drug only: the API emits no vaccine edges, because the
      // VO-annotated and gene-annotated corpora are near-disjoint per paper.
      const kindsOn = new Set([
        ...(visibleCategories.diseases ? ['disease'] : []),
        ...(visibleCategories.drugs ? ['drug'] : []),
      ])
      const termNodes = new Map() // termId -> node object, mutated in place to accumulate weight
      entnetData.edges.forEach((ed) => {
        if (!kindsOn.has(ed.kind) || !geneIds.has(ed.gene)) return
        const termId = `${ed.kind}_ont_${ed.term}`
        let termNode = termNodes.get(termId)
        if (!termNode) {
          termNode = {
            data: {
              id: termId, label: ed.term,
              nodeType: ed.kind, // 'disease' | 'drug' | 'vaccine'
              degree: 0, centrality_d: 0,
            }
          }
          termNodes.set(termId, termNode)
          extra.push(termNode)
        }
        // Aggregate the term's total co-mentioning papers across all its gene
        // edges, so node size can reflect real evidence strength (see
        // NetworkGraph's drug/disease size mapping) instead of a flat placeholder.
        termNode.data.degree += ed.papers
        extra.push({
          data: {
            id: `oe_${termId}_${ed.gene}`,
            source: termId, target: ed.gene,
            weight: ed.papers, papers: ed.papers,
            edgeType: 'entity', ino_color: '#cbd5e0',
          }
        })
      })
    }

    if (!ontologyMode && visibleCategories.drugs && entities?.drugs?.length) {
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

    if (!ontologyMode && visibleCategories.diseases && entities?.diseases?.length) {
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

    if (!ontologyMode && visibleCategories.vaccines && entities?.vaccines?.length) {
      entities.vaccines.slice(0, 10).forEach((vac, i) => {
        const vacId = `vaccine_${i}`
        extra.push({
          data: { id: vacId, label: vac.term, nodeType: 'vaccine', degree: 1, centrality_d: 0 }
        })
        const topGenes = geneElements
          .filter(e => !e.data.source)
          .sort((a, b) => (b.data.degree || 0) - (a.data.degree || 0))
          .slice(0, 3)
        topGenes.forEach(g => {
          extra.push({
            data: { id: `de_${vacId}_${g.data.id}`, source: vacId, target: g.data.id, weight: 1, edgeType: 'entity', ino_color: '#cbd5e0' }
          })
        })
      })
    }

    if (visibleCategories.ino && inoData?.ino_distribution?.length) {
      inoData.ino_distribution.slice(0, 8).forEach((ino, i) => {
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

    // CoV viral-protein overlay: connect each CoV protein to the host genes it
    // co-occurs with that are actually present in the current network.
    if (visibleCategories.cov && covData?.cov_nodes?.length) {
      const geneIds = new Set(geneElements.filter(e => !e.data.source).map(e => e.data.id))
      covData.cov_nodes.forEach((c) => {
        const covNodeId = `cov_${c.cov_id}`
        const matching = (covData.cov_edges || []).filter(
          ed => ed.cov_id === c.cov_id && geneIds.has(ed.gene)
        )
        if (!matching.length) return
        extra.push({
          data: { id: covNodeId, label: c.label, nodeType: 'cov', degree: 1, centrality_d: 0 }
        })
        matching.forEach(ed => {
          extra.push({
            data: {
              id: `ce_${covNodeId}_${ed.gene}`,
              source: covNodeId, target: ed.gene,
              weight: 1, edgeType: 'entity', ino_color: '#cbd5e0',
            }
          })
        })
      })
    }

    return extra
  }, [result, geneElements, entities, visibleCategories, covData, inoData, entnetData])

  const elements = useMemo(() => [...geneElements, ...entityElements], [geneElements, entityElements])
  const geneNodeCount = geneElements.filter(e => !e.data.source).length
  const entityNodeCount = entityElements.filter(e => !e.data.source).length
  const nodeCount = geneNodeCount + entityNodeCount
  const edgeCount = elements.filter(e => e.data.source).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy mb-1">Dignet</h1>
        <p className="text-gray-500 text-xs">
          Build a gene co-occurrence network from PubMed — search by keywords, or paste/upload your own list of PMIDs. Toggle the CoV-protein overlay to see SARS-CoV-2 viral proteins connected to human host genes (two different organisms in one view).
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap gap-3 items-end">
        {/* Input mode toggle */}
        <div className="w-full">
          <div className="inline-flex text-xs border border-gray-200 rounded overflow-hidden">
            {['keywords', 'pmids', 'compare'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setInputMode(m)}
                className={`px-3 py-1 transition-colors ${
                  inputMode === m ? 'bg-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {m === 'keywords' ? 'Keywords' : m === 'pmids' ? 'PMID list' : 'Compare cohorts'}
              </button>
            ))}
          </div>
        </div>

        {inputMode === 'keywords' ? (
          <>
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
          </>
        ) : inputMode === 'pmids' ? (
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              PMID list <span className="text-gray-400 font-normal">— paste or upload, separated by spaces/commas/new lines (max 50,000)</span>
            </label>
            <textarea
              value={pmidText}
              onChange={(e) => setPmidText(e.target.value)}
              rows={3}
              placeholder="e.g. 32887946, 32296168, 32275812 ..."
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500 resize-y"
            />
            <div className="flex items-center gap-3 mt-1">
              <label className="text-xs text-blue-600 hover:underline cursor-pointer">
                Upload file
                <input type="file" accept=".txt,.csv,.tsv" onChange={handlePmidFile} className="hidden" />
              </label>
              {pmidText.trim() && (
                <span className="text-[11px] text-gray-400">{parsedPmidCount.toLocaleString()} valid PMIDs detected</span>
              )}
              {pmidText && (
                <button type="button" onClick={() => setPmidText('')} className="text-[11px] text-gray-400 hover:text-gray-600 underline">Clear</button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full space-y-2">
            <div className="grid md:grid-cols-2 gap-3">
              {cohorts.map((c, idx) => (
                <div key={idx} className="border border-gray-200 rounded p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateCohort(idx, 'name', e.target.value)}
                      aria-label={`Cohort ${idx + 1} name`}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs font-semibold text-navy focus:outline-none focus:border-blue-500"
                    />
                    {cohorts.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeCohort(idx)}
                        aria-label={`Remove ${c.name || `cohort ${idx + 1}`}`}
                        className="text-[11px] text-gray-400 hover:text-red-600 px-1"
                        title="Remove cohort"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    value={c.text}
                    onChange={(e) => updateCohort(idx, 'text', e.target.value)}
                    rows={3}
                    placeholder="PMIDs — paste or upload (max 50,000)"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-blue-500 resize-y"
                  />
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-blue-600 hover:underline cursor-pointer">
                      Upload file
                      <input type="file" accept=".txt,.csv,.tsv" onChange={handleCohortFile(idx)} className="hidden" />
                    </label>
                    {c.text.trim() && (
                      <span className="text-[11px] text-gray-400">{parsePmids(c.text).length.toLocaleString()} valid PMIDs</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {cohorts.length < 5 && (
              <button type="button" onClick={addCohort} className="text-xs text-blue-600 hover:underline">
                + Add cohort ({cohorts.length}/5)
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-navy hover:bg-navy-dark disabled:opacity-50 text-white font-semibold px-5 py-1.5 rounded text-sm transition-colors"
        >
          {loading ? 'Building…' : inputMode === 'compare' ? 'Compare' : 'Search'}
        </button>
      </form>

      <ErrorMessage message={error} />

      {loading && <LoadingSpinner message="Building network from PubMed data..." />}

      {!result && !loading && !error && (
        <div className="text-center py-8 space-y-4">
          <p className="text-gray-500 text-sm">Enter PubMed keywords to build a gene interaction network.</p>
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
          {/* N-cohort differential header: per-cohort coverage + edge legend + CSV */}
          {result.mode === 'compare' && (
            <div className="space-y-2">
              <div className="flex gap-3 flex-wrap">
                {result.cohorts.map((c, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded px-3 py-1.5 text-xs">
                    <span className="font-semibold text-navy">{c.name}</span>
                    <span className="text-gray-500 ml-2">
                      {(c.in_db ?? 0).toLocaleString()}/{(c.submitted ?? 0).toLocaleString()} PMIDs in corpus ({c.coverage_pct ?? 0}%)
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[11px] text-gray-600 bg-white border border-gray-200 rounded px-3 py-1.5">
                <span className="text-gray-500">Edges:</span>
                {result.n === 2 ? (
                  [['A-only', `${result.cohorts[0].name} only`, result.counts.aOnly], ['shared', 'Shared', result.counts.shared], ['B-only', `${result.cohorts[1].name} only`, result.counts.bOnly]].map(([key, label, count]) => (
                    <span key={key} className="inline-flex items-center gap-1">
                      <span className="inline-block w-4 h-[3px] rounded-sm" style={{ backgroundColor: COHORT_COLORS[key] }} aria-hidden="true" />
                      {label} ({count})
                    </span>
                  ))
                ) : (
                  Array.from({ length: result.n }, (_, i) => i + 1).map((cnt) => {
                    const num = result.diff_edges.filter(e => e.sharedCount === cnt).length
                    const label = cnt === 1 ? 'Unique to 1' : cnt === result.n ? `Shared by all ${result.n}` : `Shared by ${cnt}`
                    return (
                      <span key={cnt} className="inline-flex items-center gap-1">
                        <span className="inline-block w-4 h-[3px] rounded-sm" style={{ backgroundColor: sharedCountColor(cnt, result.n) }} aria-hidden="true" />
                        {label} ({num})
                      </span>
                    )
                  })
                )}
                <button
                  onClick={() => (result.n === 2
                    ? downloadCohortCSV(result.diff_edges, result.cohorts[0].name, result.cohorts[1].name)
                    : downloadNCohortCSV(result.diff_edges, result.cohorts.map(c => c.name)))}
                  className="ml-auto text-blue-600 hover:underline"
                >
                  Download CSV
                </button>
              </div>
            </div>
          )}
          {/* Stats */}
          {result.mode !== 'compare' && (
          <div className="flex gap-4 flex-wrap">
            {[
              { label: 'PMIDs', value: result.pmid_count?.toLocaleString() },
              result.mode === 'pmids'
                ? { label: 'PMID Coverage', value: `${(result.pmid_count_in_db ?? 0).toLocaleString()}/${(result.pmid_count ?? 0).toLocaleString()} (${result.coverage_pct ?? 0}%)` }
                : null,
              { label: 'Gene Nodes', value: geneNodeCount },
              entityNodeCount > 0 ? { label: 'Entity Nodes', value: entityNodeCount } : null,
              { label: 'Edges', value: edgeCount },
              result.mode === 'pmids' ? null : { label: 'Cached', value: result.cached ? 'Yes' : 'No' },
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
          )}

          {result.mode === 'pmids' ? (
            result.total_edges > result.returned_edges && (
              <div className="bg-yellow-50 border border-yellow-200 rounded px-3 py-1.5 text-xs text-yellow-700">
                Showing the top {result.returned_edges.toLocaleString()} of {result.total_edges.toLocaleString()} gene pairs (ranked by supporting-PMID count). Export CSV/GraphML for the full network.
              </div>
            )
          ) : (
            result.total_pairs > MAX_GRAPH_EDGES && (
              <div className="bg-yellow-50 border border-yellow-200 rounded px-3 py-1.5 text-xs text-yellow-700">
                Showing {MAX_GRAPH_EDGES} of {result.total_pairs.toLocaleString()} gene pairs in the graph. Export GraphML for the full dataset.
              </div>
            )
          )}

          {/* Export buttons */}
          <div className="flex flex-wrap gap-2">
            <ExportDropdown>
              <button
                onClick={() => result.mode === 'pmids'
                  ? downloadAggregatedCSV(result.aggregated_edges, result.label)
                  : downloadCSV(result.gene_pairs, query)}
                className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
              >CSV</button>
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
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="dignet-color-scheme" className="text-xs text-gray-500">Color nodes by</label>
                <select
                  id="dignet-color-scheme"
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="none">None (default)</option>
                  <option value="function">Functional class</option>
                  <option value="ino">INO interaction category</option>
                  <option value="degree">Connectivity (degree)</option>
                  <option value="species">Host vs pathogen</option>
                </select>
              </div>
              <NetworkGraph elements={elements} colorScheme={colorScheme} onNodeClick={setSelectedNode} onEdgeClick={setEvidencePair} onCyReady={(cy) => { cyInstanceRef.current = cy }} />
              {evidencePair && (
                <EvidencePopup
                  gene1={evidencePair.gene1}
                  gene2={evidencePair.gene2}
                  onClose={() => setEvidencePair(null)}
                />
              )}
              <p className="text-[11px] text-gray-400 mt-1">Click a node to view details. Click a gene–gene edge to view evidence sentences. Hover an edge to see interaction type.</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-[#38a169]"></span> Positive regulation</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-[#e53e3e]"></span> Negative regulation</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-[#3182ce]"></span> Binding</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-[#9f7aea]"></span> Phosphorylation</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-[#a0aec0]"></span> Other/Unknown</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-[#1e3a5f]"></span> High centrality</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-[#93c5fd]"></span> Low centrality</span>
              </div>
              {(visibleCategories.drugs || visibleCategories.diseases || visibleCategories.vaccines || visibleCategories.ino || visibleCategories.cov) && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                  {visibleCategories.drugs && <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-green-500 rotate-45"></span> Drug</span>}
                  {visibleCategories.diseases && <span className="flex items-center gap-1"><span className="inline-block w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-transparent border-b-red-500"></span> Disease</span>}
                  {visibleCategories.vaccines && <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-[#dd6b20]" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}></span> Vaccine</span>}
                  {visibleCategories.ino && <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-purple-500 rounded-sm"></span> INO Type</span>}
                  {visibleCategories.cov && (
                    <>
                      <span className="flex items-center gap-1">
                        <span
                          className="inline-block w-3 h-3"
                          style={{ backgroundColor: '#0694a2', clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}
                          aria-hidden="true"
                        />
                        SARS-CoV-2 protein (viral)
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-400 italic">Overlay mixes human (host) genes with viral proteins</span>
                    </>
                  )}
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
                    covCount={covData?.cov_nodes?.length || 0}
                    covLoading={covLoading}
                    inoItems={inoData?.ino_distribution || []}
                    inoLoading={inoLoading}
                    ontologyLoading={entnetLoading}
                    ontologyStats={entnetData}
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
