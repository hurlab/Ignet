import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'

function downloadCsv(term, rows) {
  const header = 'gene1,gene2,evidence_count,unique_pmids\n'
  const body = rows.map((r) => `${r.gene1},${r.gene2},${r.evidence_count},${r.unique_pmids}`).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ino_${term.replace(/\s+/g, '_')}_genes.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function InoExplorer() {
  const [searchParams] = useSearchParams()

  const [terms, setTerms] = useState([])
  const [termFilter, setTermFilter] = useState('')
  const [termsLoading, setTermsLoading] = useState(true)
  const [termsError, setTermsError] = useState(null)

  const [selectedTerm, setSelectedTerm] = useState(null)
  const [termData, setTermData] = useState(null)
  const [termLoading, setTermLoading] = useState(false)
  const [termError, setTermError] = useState(null)
  const [page, setPage] = useState(1)

  // Load top INO terms on mount
  useEffect(() => {
    let cancelled = false
    setTermsLoading(true)
    setTermsError(null)
    api.inoTerms(50)
      .then((res) => {
        if (!cancelled) setTerms(res.data ?? [])
      })
      .catch((err) => {
        if (!cancelled) setTermsError(err.message)
      })
      .finally(() => {
        if (!cancelled) setTermsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Load gene pairs when a term is selected or page changes
  const loadTermGenes = useCallback((term, pg) => {
    setTermLoading(true)
    setTermError(null)
    api.inoTermGenes(term, pg)
      .then((res) => {
        setTermData(res)
      })
      .catch((err) => {
        setTermError(err.message)
      })
      .finally(() => {
        setTermLoading(false)
      })
  }, [])

  // Auto-select term from ?term= URL parameter on mount
  useEffect(() => {
    const termParam = searchParams.get('term')
    if (termParam && !selectedTerm) {
      setSelectedTerm(termParam)
      loadTermGenes(termParam, 1)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function selectTerm(term) {
    setSelectedTerm(term)
    setPage(1)
    loadTermGenes(term, 1)
  }

  function changePage(newPage) {
    setPage(newPage)
    loadTermGenes(selectedTerm, newPage)
  }

  const totalPages = termData ? Math.ceil(termData.total / termData.per_page) : 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-navy">INO Interaction Type Explorer</h1>
      <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
        The <strong>Interaction Network Ontology (INO)</strong> provides a standardized vocabulary for
        biological interaction types extracted from biomedical literature. Browse the most frequent
        interaction terms below and explore the gene pairs associated with each type.
      </p>

      {/* Term cloud */}
      {termsLoading && <p className="text-gray-500 text-sm">Loading INO terms...</p>}
      {termsError && <p className="text-red-600 text-sm">Error: {termsError}</p>}

      {!termsLoading && !termsError && terms.length > 0 && (
        <>
          <div className="mb-3">
            <input
              type="text"
              value={termFilter}
              onChange={e => setTermFilter(e.target.value)}
              placeholder="Filter interaction types..."
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            />
            {termFilter && (
              <p className="text-xs text-gray-400 mt-1">
                Showing {terms.filter(t => t.term.toLowerCase().includes(termFilter.toLowerCase())).length} of {terms.length} terms
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
          {terms.filter(t => !termFilter || t.term.toLowerCase().includes(termFilter.toLowerCase())).map((t) => {
            const size = Math.max(12, Math.min(24, 12 + Math.log2(t.count) * 2))
            return (
              <button
                key={t.term}
                onClick={() => selectTerm(t.term)}
                style={{ fontSize: `${size}px` }}
                className={`px-2 py-1 rounded-full transition-colors ${
                  selectedTerm === t.term
                    ? 'bg-navy text-white'
                    : 'bg-blue-50 text-navy hover:bg-blue-100'
                }`}
              >
                {t.term} <span className="text-gray-400 text-xs">({t.count})</span>
              </button>
            )
          })}
          </div>
        </>
      )}

      {/* Detail panel */}
      {selectedTerm && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-bold text-navy">{selectedTerm}</h3>
              {termData && (
                <p className="text-sm text-gray-500">
                  {termData.total} gene pair{termData.total !== 1 ? 's' : ''} with this interaction type
                </p>
              )}
            </div>
            {termData?.data?.length > 0 && (
              <button
                onClick={() => downloadCsv(selectedTerm, termData.data)}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
              >
                Export CSV
              </button>
            )}
          </div>

          {termLoading && <p className="text-gray-500 text-sm">Loading gene pairs...</p>}
          {termError && <p className="text-red-600 text-sm">Error: {termError}</p>}

          {!termLoading && termData && (
            <>
              {/* Gene pair table */}
              {termData.data?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 rounded">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Gene 1</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Gene 2</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-700">Evidence</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-700">PMIDs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {termData.data.map((row, i) => (
                        <tr key={`${row.gene1}-${row.gene2}`} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-1.5 font-mono text-navy">{row.gene1}</td>
                          <td className="px-3 py-1.5 font-mono text-navy">{row.gene2}</td>
                          <td className="px-3 py-1.5 text-right">{row.evidence_count}</td>
                          <td className="px-3 py-1.5 text-right">{row.unique_pmids}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No gene pairs found for this term.</p>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-sm">
                  <button
                    disabled={page <= 1}
                    onClick={() => changePage(page - 1)}
                    className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  <span className="text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => changePage(page + 1)}
                    className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Example sentences */}
              {termData.examples?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">Example Evidence</h4>
                  {termData.examples.map((ex, i) => (
                    <div key={i} className="text-xs text-gray-600 border-l-2 border-purple-300 pl-3 py-1">
                      <strong>{ex.gene1} &mdash; {ex.gene2}</strong>: {ex.sentence}
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${ex.pmid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 ml-1 hover:underline"
                      >
                        PMID:{ex.pmid}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
