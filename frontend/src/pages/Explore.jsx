import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function Explore() {
  const [topGenes, setTopGenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/genes/top?limit=100'),
      api.stats(),
    ])
      .then(([genesData, statsData]) => {
        setTopGenes(genesData?.genes ?? [])
        setStats(statsData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const maxCount = topGenes[0]?.pair_count ?? 1

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy mb-1">Explore Networks</h1>
        <p className="text-gray-500 text-xs">
          Browse the most connected genes in the Ignet database and explore their interaction networks.
        </p>
      </div>

      <ErrorMessage message={error} />
      {loading && <LoadingSpinner message="Loading top genes..." />}

      {/* Database overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Genes', value: stats.total_genes },
            { label: 'Gene Pairs', value: stats.total_interactions },
            { label: 'PMIDs', value: stats.total_pmids },
            { label: 'Sentences', value: stats.total_sentences },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-navy">{value?.toLocaleString() ?? '...'}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Top genes */}
      {topGenes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-700">
            Top {topGenes.length} Most Connected Genes
          </h2>

          {/* Gene cloud */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-wrap gap-1.5">
              {topGenes.map(({ gene, pair_count }) => {
                const ratio = pair_count / maxCount
                const size = ratio > 0.5 ? 'text-base font-bold' : ratio > 0.2 ? 'text-sm font-semibold' : 'text-xs font-medium'
                const bg = ratio > 0.5 ? 'bg-navy text-white' : ratio > 0.2 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                return (
                  <Link
                    key={gene}
                    to={`/gene?q=${encodeURIComponent(gene)}`}
                    className={`${size} ${bg} px-2 py-0.5 rounded hover:opacity-80 transition-opacity`}
                    title={`${gene}: ${pair_count.toLocaleString()} co-occurrences`}
                  >
                    {gene}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Gene table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Rank</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Gene</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Co-occurrences</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Bar</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topGenes.slice(0, 50).map(({ gene, pair_count }, i) => (
                  <tr key={gene} className="hover:bg-blue-50 transition-colors">
                    <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-1.5 font-medium text-navy">{gene}</td>
                    <td className="px-3 py-1.5 text-right text-gray-600">{pair_count.toLocaleString()}</td>
                    <td className="px-3 py-1.5 w-32">
                      <div className="bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-navy h-1.5 rounded-full"
                          style={{ width: `${(pair_count / maxCount) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-1.5">
                      <Link
                        to={`/gene?q=${encodeURIComponent(gene)}`}
                        className="text-blue-600 hover:underline text-[11px]"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Future features */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500">Coming Soon</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: 'Pathway Explorer', desc: 'Navigate networks by biological pathways.' },
            { title: 'Disease Networks', desc: 'Gene networks for specific diseases.' },
            { title: 'Network Comparison', desc: 'Compare networks across conditions.' },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-white border border-dashed border-gray-300 rounded-lg p-3 opacity-60">
              <h3 className="font-semibold text-gray-600 text-xs mb-0.5">{title}</h3>
              <p className="text-gray-400 text-[11px]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
