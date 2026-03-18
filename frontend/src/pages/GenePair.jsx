import { useState } from 'react'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function ConfidenceBar({ score }) {
  const pct = Math.round((score ?? 0) * 100)
  const color = pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Confidence</span>
        <span className="font-semibold text-gray-700">{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function GenePair() {
  const [gene1, setGene1] = useState('')
  const [gene2, setGene2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [pairData, setPairData] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const g1 = gene1.trim().toUpperCase()
    const g2 = gene2.trim().toUpperCase()
    if (!g1 || !g2) return
    setLoading(true)
    setError(null)
    setPrediction(null)
    setPairData(null)

    try {
      const [pred, pair] = await Promise.allSettled([
        api.predict(g1, g2),
        api.genePair(g1, g2),
      ])
      if (pred.status === 'fulfilled') setPrediction(pred.value)
      else if (!prediction) setError(pred.reason?.message)
      if (pair.status === 'fulfilled') setPairData(pair.value)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const interacts = prediction?.label === 'interacts' || prediction?.interacts === true || prediction?.prediction === 1
  const confidence = prediction?.score ?? prediction?.confidence ?? prediction?.probability ?? null

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
          <input
            type="text"
            value={gene1}
            onChange={(e) => setGene1(e.target.value)}
            placeholder="e.g. IFNG"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex-1 min-w-28">
          <label className="block text-xs font-medium text-gray-600 mb-1">Gene 2</label>
          <input
            type="text"
            value={gene2}
            onChange={(e) => setGene2(e.target.value)}
            placeholder="e.g. TNF"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
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

      <ErrorMessage message={error} />

      {loading && <LoadingSpinner message="Running interaction prediction..." />}

      {(prediction || pairData) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prediction result */}
          {prediction && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
              <h2 className="font-semibold text-gray-700 text-sm">Interaction Prediction</h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                interacts ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <span>{interacts ? '✓' : '✗'}</span>
                <span>{interacts ? 'Interacts' : 'No Interaction'}</span>
              </div>
              {confidence !== null && <ConfidenceBar score={confidence} />}
              <div className="text-xs text-gray-400">
                Pair: <strong>{gene1.trim().toUpperCase()} &mdash; {gene2.trim().toUpperCase()}</strong>
              </div>
            </div>
          )}

          {/* Co-occurrence data */}
          {pairData && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
              <h2 className="font-semibold text-gray-700 text-sm">Co-occurrence Evidence</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-3 text-center">
                  <div className="text-xl font-bold text-navy">
                    {pairData.count ?? pairData.cooccurrence ?? '—'}
                  </div>
                  <div className="text-xs text-gray-500">Co-occurrences</div>
                </div>
                <div className="bg-gray-50 rounded p-3 text-center">
                  <div className="text-xl font-bold text-navy">
                    {pairData.pmids?.length ?? pairData.pmid_count ?? '—'}
                  </div>
                  <div className="text-xs text-gray-500">PMIDs</div>
                </div>
              </div>
              {pairData.pmids?.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">PMIDs</div>
                  <div className="flex flex-wrap gap-1">
                    {pairData.pmids.slice(0, 10).map((pmid) => (
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
                    {pairData.pmids.length > 10 && (
                      <span className="text-[11px] text-gray-400">+{pairData.pmids.length - 10} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
