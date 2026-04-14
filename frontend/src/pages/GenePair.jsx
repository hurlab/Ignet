import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function downloadCSV(interactions, gene1, gene2) {
  if (!interactions?.length) return
  const header = 'Gene1,Gene2,PMID,Sentence,BioBERT_Score,INO_Term\n'
  const rows = interactions.map(row =>
    [gene1, gene2, row.pmid || '', `"${(row.sentence_text || '').replace(/"/g, '""')}"`,
     row.score ?? '', row.ino_term || row.matching_phrase || ''].join(',')
  ).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ignet-pair-${gene1}-${gene2}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function GenePair() {
  const [gene1, setGene1] = useState('')
  const [gene2, setGene2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pairData, setPairData] = useState(null)
  const [suggestions1, setSuggestions1] = useState([])
  const [showDropdown1, setShowDropdown1] = useState(false)
  const [suggestions2, setSuggestions2] = useState([])
  const [showDropdown2, setShowDropdown2] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [predictResult, setPredictResult] = useState(null)
  const [sortBy, setSortBy] = useState('score') // 'score' or 'pmid'
  const [showCount, setShowCount] = useState(20)
  const debounceRef1 = useRef(null)
  const debounceRef2 = useRef(null)
  const [searchParams] = useSearchParams()

  // Auto-fill and auto-search from URL parameters on mount
  useEffect(() => {
    const g1 = searchParams.get('gene1')
    const g2 = searchParams.get('gene2')
    if (g1) setGene1(g1.toUpperCase())
    if (g2) setGene2(g2.toUpperCase())
    if (g1 && g2) {
      // Auto-submit using param values directly to avoid stale state closure
      const upper1 = g1.toUpperCase()
      const upper2 = g2.toUpperCase()
      setLoading(true)
      setError(null)
      setPairData(null)
      setPredictResult(null)
      api.genePair(upper1, upper2).then((raw) => {
        const interactions = raw?.interactions ?? []
        const total = raw?.total ?? 0
        const prediction_summary = raw?.prediction_summary ?? null
        const meta = raw?.data ?? {}
        setPairData({ ...meta, interactions, total, prediction_summary })
      }).catch((err) => {
        setError(err.message)
      }).finally(() => {
        setLoading(false)
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClickOutside() { setShowDropdown1(false); setShowDropdown2(false) }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  function handleGene1Change(e) {
    const val = e.target.value
    setGene1(val)
    if (debounceRef1.current) clearTimeout(debounceRef1.current)
    if (val.trim().length >= 2) {
      debounceRef1.current = setTimeout(async () => {
        try {
          const res = await api.autocompleteGenes(val.trim())
          setSuggestions1(res.data || res || [])
          setShowDropdown1(true)
        } catch { setSuggestions1([]) }
      }, 300)
    } else {
      setSuggestions1([])
      setShowDropdown1(false)
    }
  }

  function handleGene2Change(e) {
    const val = e.target.value
    setGene2(val)
    if (debounceRef2.current) clearTimeout(debounceRef2.current)
    if (val.trim().length >= 2) {
      debounceRef2.current = setTimeout(async () => {
        try {
          const res = await api.autocompleteGenes(val.trim())
          setSuggestions2(res.data || res || [])
          setShowDropdown2(true)
        } catch { setSuggestions2([]) }
      }, 300)
    } else {
      setSuggestions2([])
      setShowDropdown2(false)
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    const g1 = gene1.trim().toUpperCase()
    const g2 = gene2.trim().toUpperCase()
    if (!g1 || !g2) return
    setLoading(true)
    setError(null)
    setPairData(null)
    setPredictResult(null)

    try {
      const raw = await api.genePair(g1, g2)
      // Flatten: backend wraps in { data: {...}, interactions, total, prediction_summary }
      const interactions = raw?.interactions ?? []
      const total = raw?.total ?? 0
      const prediction_summary = raw?.prediction_summary ?? null
      const meta = raw?.data ?? {}
      setPairData({ ...meta, interactions, total, prediction_summary })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePredict() {
    const g1 = gene1.trim().toUpperCase()
    const g2 = gene2.trim().toUpperCase()
    if (!g1 || !g2) return
    setPredicting(true)
    setPredictResult(null)
    try {
      const result = await api.predictPair(g1, g2)
      setPredictResult(result)
      // Refresh pair data to reflect newly scored sentences
      const raw = await api.genePair(g1, g2)
      const interactions = raw?.interactions ?? []
      const total = raw?.total ?? 0
      const prediction_summary = raw?.prediction_summary ?? null
      const meta = raw?.data ?? {}
      setPairData({ ...meta, interactions, total, prediction_summary })
    } catch (err) {
      setPredictResult({ error: err.message })
    } finally {
      setPredicting(false)
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
          <label className="block text-xs font-medium text-gray-600 mb-1">Gene 1</label>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={gene1}
              onChange={handleGene1Change}
              onKeyDown={(e) => { if (e.key === 'Escape') setShowDropdown1(false) }}
              placeholder="e.g. IFNG"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            />
            {showDropdown1 && suggestions1.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                {suggestions1.map((s) => (
                  <li
                    key={s.symbol || s.gene_id}
                    onClick={() => { setGene1(s.symbol); setShowDropdown1(false) }}
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
        <div className="flex-1 min-w-28">
          <label className="block text-xs font-medium text-gray-600 mb-1">Gene 2</label>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={gene2}
              onChange={handleGene2Change}
              onKeyDown={(e) => { if (e.key === 'Escape') setShowDropdown2(false) }}
              placeholder="e.g. TNF"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            />
            {showDropdown2 && suggestions2.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                {suggestions2.map((s) => (
                  <li
                    key={s.symbol || s.gene_id}
                    onClick={() => { setGene2(s.symbol); setShowDropdown2(false) }}
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
          Predict
        </button>
      </form>

      <ErrorMessage message={error} />

      {loading && <LoadingSpinner message="Running interaction prediction..." />}

      {!pairData && !loading && !error && (
        <div className="text-center py-12 space-y-4">
          <p className="text-gray-400 text-sm">Enter two gene symbols to explore their interaction evidence.</p>
          <p className="text-gray-300 text-xs">Examples: BRCA1 + TP53, IFNG + TNF, IL6 + STAT3</p>
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
                <div className="text-xs text-gray-500">Evidence Sentences</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-navy">{pmids.length}</div>
                <div className="text-xs text-gray-500">Unique PMIDs</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-navy">
                  {pairData.gene1} &mdash; {pairData.gene2}
                </div>
                <div className="text-xs text-gray-500">Gene Pair</div>
              </div>
            </div>

            {/* BioBERT Prediction Summary */}
            {pairData?.prediction_summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-navy text-sm">BioBERT Prediction Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-navy">{pairData.prediction_summary.scored_sentences}</div>
                    <div className="text-xs text-gray-500">Scored Sentences</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-navy">
                      {pairData.prediction_summary.avg_confidence != null
                        ? (pairData.prediction_summary.avg_confidence * 100).toFixed(1) + '%'
                        : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">Avg Confidence</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-accent">{pairData.prediction_summary.high_confidence_count}</div>
                    <div className="text-xs text-gray-500">High Confidence ({'>'} 80%)</div>
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

            {/* Evidence table */}
            {pairData.interactions?.length > 0 && (() => {
              const sorted = [...(pairData?.interactions || [])].sort((a, b) => {
                if (sortBy === 'score') return (b.score ?? -1) - (a.score ?? -1)
                return (b.pmid ?? 0) - (a.pmid ?? 0)
              })
              return (
              <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-gray-600">Evidence Sentences</div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePredict}
                      disabled={predicting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
                    >
                      {predicting ? 'Predicting...' : 'Re-predict Unscored'}
                    </button>
                    <button
                      onClick={() => downloadCSV(pairData.interactions, pairData.gene1, pairData.gene2)}
                      className="bg-navy hover:bg-navy-dark text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
                    >
                      Download CSV
                    </button>
                  </div>
                </div>
                {predictResult && (
                  <div className={`text-xs mb-2 px-2 py-1 rounded ${predictResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {predictResult.error ? predictResult.error : predictResult.message}
                  </div>
                )}
                <div className="flex gap-2 text-xs mb-2">
                  <span className="text-gray-500">Sort by:</span>
                  <button onClick={() => setSortBy('score')} className={sortBy === 'score' ? 'font-bold text-navy' : 'text-gray-400'}>Confidence</button>
                  <button onClick={() => setSortBy('pmid')} className={sortBy === 'pmid' ? 'font-bold text-navy' : 'text-gray-400'}>PMID</button>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-1 pr-2">Score</th>
                      <th className="py-1 pr-2">PMID</th>
                      <th className="py-1 pr-2">Sentence</th>
                      <th className="py-1">INO Term</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.slice(0, showCount).map((row, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-1 pr-2 font-mono whitespace-nowrap">
                          {typeof row.score === 'number' ? (
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                              row.score > 0.8
                                ? 'bg-green-100 text-green-700'
                                : row.score > 0.5
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}>
                              {(row.score * 100).toFixed(0)}%
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-1 pr-2">
                          <a
                            href={`https://pubmed.ncbi.nlm.nih.gov/${row.pmid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {row.pmid}
                          </a>
                        </td>
                        <td className="py-1 pr-2 max-w-md">
                          <span className="truncate block">{row.sentence_text ?? '—'}</span>
                          {row.matching_phrase && (
                            <span className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              {row.matching_phrase}
                            </span>
                          )}
                        </td>
                        <td className="py-1">{row.ino_term ?? row.matching_phrase ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pairData.total > showCount && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">Showing {Math.min(showCount, sorted.length)} of {pairData.total} results</span>
                    <button
                      onClick={() => setShowCount(prev => prev + 20)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </div>
              )
            })()}
          </div>
        )
      })()}
    </div>
  )
}
