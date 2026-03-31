import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import AddToSetButton from '../components/AddToSetButton.jsx'

export default function Explore() {
  const [topGenes, setTopGenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [inoTerms, setInoTerms] = useState([])
  const [geneFilter, setGeneFilter] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/genes/top?limit=100'),
      api.stats(),
      api.inoTerms(30).catch(() => null),
    ])
      .then(([genesData, statsData, inoData]) => {
        setTopGenes(genesData?.data ?? genesData?.genes ?? [])
        const stats = statsData?.data ?? statsData
        setStats(stats)
        if (inoData) {
          setInoTerms(inoData?.data ?? [])
        }
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

      {/* INO Interaction Type term cloud */}
      {inoTerms.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-navy">Interaction Types (INO)</h2>
          <p className="text-sm text-gray-500">
            Most frequent interaction types in the Ignet database, classified by the
            <a href="https://bioportal.bioontology.org/ontologies/INO" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
              Interaction Network Ontology (INO)
            </a>. Click a term to explore gene pairs with that interaction type.
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-wrap gap-2">
              {inoTerms.map(t => {
                const maxCount = inoTerms[0]?.count || 1
                const relSize = Math.max(0.7, Math.min(1.8, 0.7 + (t.count / maxCount) * 1.1))
                return (
                  <Link
                    key={t.term}
                    to={`/ino?term=${encodeURIComponent(t.term)}`}
                    style={{ fontSize: `${relSize}rem` }}
                    className="inline-flex items-baseline gap-1 px-2 py-1 rounded-full bg-purple-50 text-purple-800 hover:bg-purple-100 transition-colors"
                  >
                    {t.term}
                    <span className="text-purple-400" style={{ fontSize: '0.65rem' }}>
                      {t.count >= 1000 ? `${(t.count / 1000).toFixed(0)}k` : t.count}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Top 10 INO terms table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Rank</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Interaction Type</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Occurrences</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Bar</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inoTerms.slice(0, 10).map((t, i) => {
                  const maxCount = inoTerms[0]?.count || 1
                  return (
                    <tr key={t.term} className="hover:bg-purple-50 transition-colors">
                      <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-1.5 font-medium text-purple-800">{t.term}</td>
                      <td className="px-3 py-1.5 text-right text-gray-600">{t.count.toLocaleString()}</td>
                      <td className="px-3 py-1.5 w-32">
                        <div className="bg-gray-100 rounded-full h-2">
                          <div className="bg-purple-400 rounded-full h-2" style={{ width: `${(t.count / maxCount) * 100}%` }} />
                        </div>
                      </td>
                      <td className="px-3 py-1.5">
                        <Link
                          to={`/ino?term=${encodeURIComponent(t.term)}`}
                          className="text-purple-600 hover:underline text-xs"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Top genes */}
      {topGenes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-base font-semibold text-gray-700">
              Top {topGenes.length} Most Connected Genes
            </h2>
            <AddToSetButton genes={topGenes.map(g => g.gene)} label="Add all to set" />
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Browse the most connected genes in the Ignet database, ranked by interaction partner count.
            Click a gene to explore its network.
          </p>

          {/* Gene cloud */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="mb-3">
              <input
                type="text"
                value={geneFilter}
                onChange={e => setGeneFilter(e.target.value)}
                placeholder="Search genes..."
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-48"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topGenes.map(({ gene, pair_count }) => {
                const isMatch = !geneFilter || gene.toLowerCase().includes(geneFilter.toLowerCase())
                const ratio = pair_count / maxCount
                const size = ratio > 0.5 ? 'text-base font-bold' : ratio > 0.2 ? 'text-sm font-semibold' : 'text-xs font-medium'
                const bg = ratio > 0.5 ? 'bg-navy text-white' : ratio > 0.2 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                return (
                  <Link
                    key={gene}
                    to={`/gene?q=${encodeURIComponent(gene)}`}
                    className={`${size} ${bg} px-2 py-0.5 rounded hover:opacity-80 transition-opacity ${isMatch ? 'opacity-100' : 'opacity-20'}`}
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
                  <th className="px-2 py-2 w-8"></th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...topGenes.slice(0, 50)].sort((a, b) => {
                  const aMatch = !geneFilter || a.gene.toLowerCase().includes(geneFilter.toLowerCase())
                  const bMatch = !geneFilter || b.gene.toLowerCase().includes(geneFilter.toLowerCase())
                  if (aMatch && !bMatch) return -1
                  if (!aMatch && bMatch) return 1
                  return 0
                }).map(({ gene, pair_count }, i) => {
                  const isRowMatch = !geneFilter || gene.toLowerCase().includes(geneFilter.toLowerCase())
                  return (
                  <tr key={gene} className={`hover:bg-blue-50 transition-colors ${!isRowMatch && geneFilter ? 'opacity-30' : ''}`}>
                    <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                    <td className={`px-3 py-1.5 font-medium ${isRowMatch && geneFilter ? 'text-blue-700' : 'text-navy'}`}>{gene}</td>
                    <td className="px-3 py-1.5 text-right text-gray-600">{pair_count.toLocaleString()}</td>
                    <td className="px-3 py-1.5 w-32">
                      <div className="bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-navy h-1.5 rounded-full"
                          style={{ width: `${(pair_count / maxCount) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <AddToSetButton gene={gene} />
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
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
