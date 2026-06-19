import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

const LIB_LABELS = {
  GO_Biological_Process: 'GO Biological Process',
  KEGG: 'KEGG',
  Reactome: 'Reactome',
}
const LIB_ORDER = ['GO_Biological_Process', 'KEGG', 'Reactome']

function fmtP(p) {
  if (p === 0) return '0'
  if (p < 0.001) return p.toExponential(1)
  return p.toFixed(3)
}

// On-demand pathway over-representation (GO / KEGG / Reactome) for a gene list.
// Computed server-side via local hypergeometric test (no external service).
export default function PathwayPanel({ genes }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [activeLib, setActiveLib] = useState('GO_Biological_Process')

  async function run() {
    if (!genes || genes.length < 2) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.pathwaysAnalyze(genes)
      setResults(data.results || {})
      const firstWith = LIB_ORDER.find((k) => data.results?.[k]?.length) || 'GO_Biological_Process'
      setActiveLib(firstWith)
    } catch (e) {
      setError(e.message || 'Pathway analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  const rows = results?.[activeLib] ?? []

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div>
          <h3 className="text-sm font-semibold text-navy">Pathway Enrichment</h3>
          <p className="text-xs text-gray-400">
            GO / KEGG / Reactome over-representation (hypergeometric test, BH-adjusted).
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading || !genes || genes.length < 2}
          className="bg-navy hover:bg-navy-dark disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
        >
          {loading ? 'Analyzing...' : results ? 'Re-run' : 'Run pathway analysis'}
        </button>
      </div>

      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}

      {results && (
        <>
          {/* Library tabs */}
          <div className="flex gap-1 border-b border-gray-200 mb-2" role="tablist" aria-label="Pathway library">
            {LIB_ORDER.map((lib) => (
              <button
                key={lib}
                role="tab"
                aria-selected={activeLib === lib}
                onClick={() => setActiveLib(lib)}
                className={`text-xs font-medium px-3 py-1.5 -mb-px border-b-2 transition-colors ${
                  activeLib === lib
                    ? 'border-navy text-navy'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {LIB_LABELS[lib]} ({results[lib]?.length ?? 0})
              </button>
            ))}
          </div>

          {rows.length === 0 ? (
            <p className="text-xs text-gray-500 py-3">No enriched terms in {LIB_LABELS[activeLib]} for this gene set.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-1 pr-2">Term</th>
                    <th className="py-1 pr-2 text-right">Overlap</th>
                    <th className="py-1 pr-2 text-right">p-value</th>
                    <th className="py-1 pr-2 text-right">FDR</th>
                    <th className="py-1">Genes</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.term} className="border-b border-gray-50 align-top">
                      <td className="py-1 pr-2 max-w-xs">{r.term}</td>
                      <td className="py-1 pr-2 text-right whitespace-nowrap font-mono">{r.overlap}/{r.term_size}</td>
                      <td className="py-1 pr-2 text-right whitespace-nowrap font-mono">{fmtP(r.pvalue)}</td>
                      <td className="py-1 pr-2 text-right whitespace-nowrap font-mono">
                        <span className={r.adj_pvalue < 0.05 ? 'text-green-700 font-medium' : 'text-gray-500'}>
                          {fmtP(r.adj_pvalue)}
                        </span>
                      </td>
                      <td className="py-1">
                        <div className="flex flex-wrap gap-0.5">
                          {r.genes.map((g) => (
                            <Link
                              key={g}
                              to={`/gene?q=${encodeURIComponent(g)}`}
                              className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 px-1 py-0.5 rounded"
                            >
                              {g}
                            </Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
