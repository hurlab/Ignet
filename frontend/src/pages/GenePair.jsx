import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import GeneAutocomplete from '../components/GeneAutocomplete.jsx'
import TrendChart from '../components/TrendChart.jsx'
import NetworkGraph from '../components/NetworkGraph.jsx'
import EvidenceWorkbench from '../components/EvidenceWorkbench.jsx'
import WorkspaceControls from '../components/WorkspaceControls.jsx'
import { useWorkspace } from '../WorkspaceContext.jsx'

// A focused two-node graph for the queried pair: both genes plus a single edge
// whose thickness encodes the evidence count. Matches the element shape the
// other network views use so NetworkGraph styles it consistently.
function buildPairElements(g1, g2, total) {
  if (!g1 || !g2) return []
  return [
    { data: { id: g1, label: g1, degree: 1, centrality_d: 1, isCenter: true } },
    { data: { id: g2, label: g2, degree: 1, centrality_d: 1, isCenter: true } },
    { data: { id: `e-${g1}-${g2}`, source: g1, target: g2, weight: total || 1, ino_color: '#7c3aed' } },
  ]
}

export default function GenePair() {
  const [gene1, setGene1] = useState('')
  const [gene2, setGene2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pairData, setPairData] = useState(null)
  const [predicting, setPredicting] = useState(false)
  const [predictResult, setPredictResult] = useState(null)
  const [sortBy, setSortBy] = useState('score')
  const [loadingMore, setLoadingMore] = useState(false)
  const [pairTrends, setPairTrends] = useState(null)
  const [pairTrendsLoading, setPairTrendsLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { recipe, setRecipe, restoreToken } = useWorkspace()
  const generation = useRef(0)
  const restored = useRef(restoreToken)
  const entryRestoreToken = useRef(restoreToken)
  if (restored.current !== restoreToken) {
    restored.current = restoreToken
    generation.current += 1
  }

  function resetRequests() {
    generation.current += 1
    setLoading(false)
    setLoadingMore(false)
    setPredicting(false)
    setPairTrendsLoading(false)
    setError(null)
    setPredictResult(null)
    return generation.current
  }

  function flatten(raw, g1, g2) {
    return { ...raw?.data, gene1: g1, gene2: g2, page: raw?.data?.page ?? 1, interactions: raw?.interactions ?? [], total: raw?.total ?? 0, prediction_summary: raw?.prediction_summary ?? null, fetchedAt: new Date().toISOString() }
  }

  function fetchPairTrends(g1, g2, requestId) {
    setPairTrends(null)
    setPairTrendsLoading(true)
    api.pairTrends(g1, g2)
      .then(res => { if (generation.current === requestId) setPairTrends(res?.trends ?? []) })
      .catch(() => { if (generation.current === requestId) setPairTrends([]) })
      .finally(() => { if (generation.current === requestId) setPairTrendsLoading(false) })
  }

  async function runPair(g1, g2, orderBy = sortBy) {
    const requestId = resetRequests()
    setPairData(null)
    try {
      if (setRecipe({ pair: [g1, g2] }) === false) {
        setError('The pair could not be saved to the workspace. Check the workspace error and correct the gene symbols.')
        return
      }
    }
    catch (err) { setError(err.message); return }
    setLoading(true)
    setSearchParams({ gene1: g1, gene2: g2 }, { replace: true })
    fetchPairTrends(g1, g2, requestId)
    try {
      const raw = await api.genePair(g1, g2, { page: 1, perPage: 50, sortBy: orderBy })
      if (generation.current === requestId) setPairData(flatten(raw, g1, g2))
    } catch (err) {
      if (generation.current === requestId) setError(err.message)
    } finally {
      if (generation.current === requestId) setLoading(false)
    }
  }

  useEffect(() => {
    if (restoreToken > 0 && (restoreToken !== entryRestoreToken.current || !searchParams.get('gene1') || !searchParams.get('gene2'))) {
      resetRequests()
      setGene1(recipe.pair?.[0] ?? '')
      setGene2(recipe.pair?.[1] ?? '')
      setPairData(null)
      setPairTrends(null)
      setSearchParams({}, { replace: true })
    } else {
      const g1 = searchParams.get('gene1')?.toUpperCase() ?? ''
      const g2 = searchParams.get('gene2')?.toUpperCase() ?? ''
      setGene1(g1)
      setGene2(g2)
      if (g1 && g2) runPair(g1, g2)
    }
    return () => { generation.current += 1 }
  }, [restoreToken]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e, explicitGene1, explicitGene2) {
    e?.preventDefault()
    const g1 = (explicitGene1 ?? gene1).trim().toUpperCase()
    const g2 = (explicitGene2 ?? gene2).trim().toUpperCase()
    if (g1 && g2) runPair(g1, g2)
  }

  function editGene(setter, value) {
    resetRequests()
    setPairData(null)
    setPairTrends(null)
    setter(value)
  }

  function handleSwap() {
    const g1 = gene2.trim().toUpperCase()
    const g2 = gene1.trim().toUpperCase()
    setGene1(g1)
    setGene2(g2)
    if (g1 && g2) runPair(g1, g2)
    else resetRequests()
  }

  async function loadMore() {
    if (!pairData || loadingMore || pairData.interactions.length >= 500) return
    const requestId = generation.current
    const data = pairData
    setLoadingMore(true)
    setError(null)
    try {
      const raw = await api.genePair(data.gene1, data.gene2, { page: data.page + 1, perPage: 50, sortBy, includeSummary: false })
      if (generation.current === requestId) {
        // fetchedAt tracks the newest fetch so snapshots are never older than the latest row
        setPairData({ ...data, page: raw?.data?.page ?? data.page + 1, interactions: [...data.interactions, ...(raw?.interactions ?? [])].slice(0, 500), fetchedAt: new Date().toISOString() })
      }
    } catch (err) {
      if (generation.current === requestId) setError(err.message)
    } finally {
      if (generation.current === requestId) setLoadingMore(false)
    }
  }

  async function handlePredict() {
    if (!pairData) return
    const { gene1: g1, gene2: g2 } = pairData
    const requestId = resetRequests()
    setPredicting(true)
    try {
      const result = await api.predictPair(g1, g2)
      if (generation.current !== requestId) return
      setPredictResult(result)
      // Refresh every page the user had loaded, not just page 1
      const loaded = pairData.page
      let merged = flatten(await api.genePair(g1, g2, { page: 1, perPage: 50, sortBy }), g1, g2)
      for (let page = 2; page <= loaded && merged.interactions.length < 500; page++) {
        if (generation.current !== requestId) return
        const raw = await api.genePair(g1, g2, { page, perPage: 50, sortBy, includeSummary: false })
        merged = { ...merged, page: raw?.data?.page ?? page, interactions: [...merged.interactions, ...(raw?.interactions ?? [])].slice(0, 500), fetchedAt: new Date().toISOString() }
      }
      if (generation.current === requestId) setPairData(merged)
    } catch (err) {
      if (generation.current === requestId) setPredictResult({ error: err.message })
    } finally {
      if (generation.current === requestId) setPredicting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy mb-1">GenePair Analysis</h1>
        <p className="text-gray-500 text-xs">
          Enter two gene symbols to predict their interaction and review co-occurrence evidence.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-28">
          <GeneAutocomplete
            label="Gene 1"
            value={gene1}
            onChange={(e) => editGene(setGene1, e.target.value)}
            onSelect={(sym) => editGene(setGene1, sym)}
            placeholder="e.g. IFNG"
            inputClassName="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            debounceMs={300}
          />
        </div>
        <button
          type="button"
          onClick={handleSwap}
          title="Swap gene 1 and gene 2"
          aria-label="Swap gene 1 and gene 2"
          className="shrink-0 mb-0.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded px-2.5 py-1.5 text-sm transition-colors"
        >
          &#8644;
        </button>
        <div className="flex-1 min-w-28">
          <GeneAutocomplete
            label="Gene 2"
            value={gene2}
            onChange={(e) => editGene(setGene2, e.target.value)}
            onSelect={(sym) => editGene(setGene2, sym)}
            placeholder="e.g. TNF"
            inputClassName="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            debounceMs={300}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-navy hover:bg-navy-dark disabled:opacity-50 text-white font-semibold px-5 py-1.5 rounded text-sm transition-colors"
        >
          Predict
        </button>
      </form>

      <WorkspaceControls />
      <ErrorMessage message={error} />

      {loading && <LoadingSpinner message="Running interaction prediction..." />}

      {!pairData && !loading && !error && (
        <div className="text-center py-12 space-y-4">
          <p className="text-gray-500 text-sm">Enter two gene symbols to explore their interaction evidence.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[['BRCA1', 'TP53'], ['IFNG', 'TNF'], ['IL6', 'STAT3']].map(([g1, g2]) => (
              <button
                key={`${g1}-${g2}`}
                type="button"
                onClick={() => { setGene1(g1); setGene2(g2); handleSubmit(null, g1, g2) }}
                className="bg-blue-50 text-navy text-xs font-medium px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                {g1} + {g2}
              </button>
            ))}
          </div>
        </div>
      )}

      {pairData && (() => {
        const pmids = [...new Set((pairData.interactions ?? []).map((r) => r.pmid).filter(Boolean))]
        return (
          <div className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-navy">{pairData.total ?? 0}</div>
                <div className="text-xs text-gray-500">Base evidence records</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-navy">{pmids.length}</div>
                <div className="text-xs text-gray-500">Unique loaded PMIDs</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-navy">
                  {pairData.gene1} &mdash; {pairData.gene2}
                </div>
                <div className="text-xs text-gray-500">Gene Pair</div>
              </div>
            </div>

            {/* Focused two-node interaction graph */}
            <section className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-navy text-sm mb-2">Interaction</h3>
              <p className="text-xs text-gray-400 mb-2">
                Edge thickness reflects the amount of co-occurrence evidence. Click a node to open its gene report.
              </p>
              <NetworkGraph
                elements={buildPairElements(pairData.gene1, pairData.gene2, pairData.total)}
                onNodeClick={(nodeData) => {
                  const id = typeof nodeData === 'string' ? nodeData : nodeData?.id
                  if (id) navigate(`/gene?q=${encodeURIComponent(id)}`)
                }}
              />
            </section>

            {/* Evidence over time trend chart (non-blocking) */}
            {pairTrendsLoading
              ? (
                <div className="bg-white border border-gray-200 rounded-lg p-4 h-24 flex items-center">
                  <span className="text-xs text-gray-400 animate-pulse">Loading evidence trend...</span>
                </div>
              )
              : pairTrends !== null && (
                <TrendChart
                  data={pairTrends}
                  valueKey="cooc"
                  title="Evidence over time"
                  color="#7c3aed"
                />
              )
            }

            {/* BioBERT Prediction Summary */}
            {pairData?.prediction_summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-navy text-sm">Whole-pair BioBERT summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-navy">{pairData.prediction_summary.scored_sentences}</div>
                    <div className="text-xs text-gray-500">Scored Sentences</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-navy">
                      {pairData.prediction_summary.avg_confidence != null
                        ? pairData.prediction_summary.avg_confidence.toFixed(3)
                        : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">Avg model score</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-accent">{pairData.prediction_summary.high_confidence_count}</div>
                    <div className="text-xs text-gray-500">Model score ({'>'} 0.8)</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-600">{pairData.prediction_summary.total_sentences}</div>
                    <div className="text-xs text-gray-500">Total Sentences</div>
                  </div>
                </div>
              </div>
            )}

            {/* PMID links */}
            {pmids.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs font-medium text-gray-600 mb-2">PubMed References</div>
                <div className="flex flex-wrap gap-1">
                  {pmids.slice(0, 20).map((pmid) => (
                    <a
                      key={pmid}
                      href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors"
                    >
                      {pmid}
                    </a>
                  ))}
                  {pmids.length > 20 && (
                    <span className="text-[11px] text-gray-400">+{pmids.length - 20} more</span>
                  )}
                </div>
              </div>
            )}

            <EvidenceWorkbench key={`${pairData.gene1}:${pairData.gene2}`} data={pairData} loadingMore={loadingMore} onLoadMore={loadMore} sortBy={sortBy} onSort={value => { setSortBy(value); runPair(pairData.gene1, pairData.gene2, value) }} predicting={predicting} onPredict={handlePredict} predictResult={predictResult} />
          </div>
        )
      })()}
    </div>
  )
}
