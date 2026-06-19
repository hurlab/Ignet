import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

// Score badge: mirrors GenePair.jsx color thresholds
function ScoreBadge({ score }) {
  if (typeof score !== 'number') return <span className="text-gray-400">—</span>
  const cls =
    score > 0.8
      ? 'bg-green-100 text-green-700'
      : score > 0.5
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-gray-100 text-gray-600'
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${cls}`}>
      {(score * 100).toFixed(0)}%
    </span>
  )
}

// @MX:ANCHOR: [AUTO] Shared evidence popup entry point — called by Gene.jsx, Dignet.jsx, Enrichment.jsx
// @MX:REASON: fan_in >= 3; handles async API call, focus management, and keyboard/backdrop close in one place

/**
 * EvidencePopup
 * Props: gene1 (string), gene2 (string), onClose (fn)
 *
 * Renders a modal dialog with the mined evidence sentences for the given gene pair.
 * Accessible: role="dialog", aria-modal, focus management, Escape + backdrop close.
 */
export default function EvidencePopup({ gene1, gene2, onClose }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pairData, setPairData] = useState(null)

  // Focus management: remember the element that was focused before the dialog opened
  const previousFocusRef = useRef(null)
  const dialogRef = useRef(null)

  // Capture previous focus, move focus into dialog, and restore on unmount.
  // previousFocusRef is captured as the very first statement so it is always
  // the element that was active when the popup mounted.
  useEffect(() => {
    previousFocusRef.current = document.activeElement
    const timer = setTimeout(() => {
      dialogRef.current?.focus()
    }, 0)
    return () => {
      clearTimeout(timer)
      previousFocusRef.current?.focus()
    }
  }, [])

  // Close on Escape; trap Tab/Shift+Tab inside the dialog.
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const dialog = dialogRef.current
      if (!dialog) return
      const focusable = Array.from(
        dialog.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null) // skip hidden elements
      if (focusable.length === 0) { e.preventDefault(); return }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent background scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Fetch evidence on mount (and if gene1/gene2 change)
  useEffect(() => {
    if (!gene1 || !gene2) return
    setLoading(true)
    setError(null)
    setPairData(null)

    api.genePair(gene1, gene2)
      .then((raw) => {
        const interactions = raw?.interactions ?? []
        const total = raw?.total ?? 0
        const prediction_summary = raw?.prediction_summary ?? null
        const meta = raw?.data ?? {}
        setPairData({ ...meta, interactions, total, prediction_summary })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [gene1, gene2])

  // Top 10 interactions sorted by score desc
  const topInteractions = pairData
    ? [...(pairData.interactions ?? [])]
        .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
        .slice(0, 10)
    : []

  const titleId = 'evidence-popup-title'

  return (
    // Backdrop — click closes the dialog
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      aria-hidden="true"
    >
      {/* Dialog panel — stop propagation so clicks inside don't close it */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 id={titleId} className="text-sm font-bold text-navy">
              Evidence: {gene1} &#8596; {gene2}
            </h2>
            {pairData != null && (
              <p className="text-xs text-gray-500 mt-0.5">
                {pairData.total} sentence{pairData.total !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close evidence panel"
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-700 text-lg leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-3">
          {/* Loading state */}
          {loading && (
            <div className="py-8 text-center text-sm text-gray-400">
              Loading evidence…
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="py-6 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && pairData && pairData.total === 0 && (
            <div className="py-6 text-center text-sm text-gray-400">
              No evidence sentences found for this gene pair.
            </div>
          )}

          {/* Prediction summary (mirrors GenePair style) */}
          {!loading && !error && pairData?.prediction_summary && (
            <div className="bg-blue-50 border border-blue-100 rounded px-3 py-2 text-xs text-gray-600 flex flex-wrap gap-3">
              <span>
                <span className="font-medium text-navy">{pairData.prediction_summary.scored_sentences}</span>
                {' / '}{pairData.prediction_summary.total_sentences} scored
              </span>
              {pairData.prediction_summary.avg_confidence != null && (
                <span>
                  Avg confidence:{' '}
                  <span className="font-medium text-navy">
                    {(pairData.prediction_summary.avg_confidence * 100).toFixed(1)}%
                  </span>
                </span>
              )}
              <span>
                High confidence:{' '}
                <span className="font-medium text-accent">{pairData.prediction_summary.high_confidence_count}</span>
              </span>
            </div>
          )}

          {/* Evidence rows — top 10 by score */}
          {!loading && !error && topInteractions.length > 0 && (
            <div className="space-y-2">
              {topInteractions.map((row, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded p-2.5 space-y-1 text-xs"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <ScoreBadge score={row.score} />
                    {row.pmid && (
                      Number.isInteger(Number(row.pmid)) ? (
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(row.pmid)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-mono"
                        >
                          PMID:{row.pmid}
                        </a>
                      ) : (
                        <span className="font-mono text-gray-500">PMID:{row.pmid}</span>
                      )
                    )}
                    {row.matching_phrase && (
                      <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                        {row.matching_phrase}
                      </span>
                    )}
                  </div>
                  {row.sentence_text && (
                    <p className="text-gray-700 leading-relaxed">{row.sentence_text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <Link
            to={`/genepair?gene1=${encodeURIComponent(gene1)}&gene2=${encodeURIComponent(gene2)}`}
            className="text-xs text-blue-600 hover:underline font-medium"
            onClick={onClose}
          >
            View full pair &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
