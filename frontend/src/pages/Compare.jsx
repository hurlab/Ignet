import { useState, useCallback } from 'react'
import { api } from '../api.js'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function GeneTagCloud({ genes, color }) {
  if (!genes.length) return <p className="text-sm text-gray-400 italic">None</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {genes.map((g) => (
        <span
          key={g}
          className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}
        >
          {g}
        </span>
      ))}
    </div>
  )
}

function downloadCSV(data) {
  if (!data) return
  const rows = [['Category', 'Gene']]
  for (const g of data.shared_genes) rows.push(['Shared', g])
  for (const g of data.unique_a) rows.push([`Unique to ${data.query_a.keywords}`, g])
  for (const g of data.unique_b) rows.push([`Unique to ${data.query_b.keywords}`, g])

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `compare_${data.query_a.keywords}_vs_${data.query_b.keywords}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Compare() {
  const [queryA, setQueryA] = useState('')
  const [queryB, setQueryB] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCompare = useCallback(
    async (e) => {
      e.preventDefault()
      const a = queryA.trim()
      const b = queryB.trim()
      if (!a || !b) {
        setError('Please enter both queries.')
        return
      }
      setError('')
      setResult(null)
      setLoading(true)
      try {
        const data = await api.dignetCompare(a, b)
        setResult(data)
      } catch (err) {
        setError(err.message || 'Comparison failed.')
      } finally {
        setLoading(false)
      }
    },
    [queryA, queryB],
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Compare Networks</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter two PubMed search queries to compare gene interaction networks side by side.
      </p>

      {/* Search form */}
      <form onSubmit={handleCompare} className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-8">
        <div className="md:col-span-3">
          <label htmlFor="query-a" className="block text-xs font-medium text-gray-500 mb-1">
            Query A
          </label>
          <input
            id="query-a"
            type="text"
            value={queryA}
            onChange={(e) => setQueryA(e.target.value)}
            placeholder="e.g. influenza vaccine"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="md:col-span-3">
          <label htmlFor="query-b" className="block text-xs font-medium text-gray-500 mb-1">
            Query B
          </label>
          <input
            id="query-b"
            type="text"
            value={queryB}
            onChange={(e) => setQueryB(e.target.value)}
            placeholder="e.g. COVID-19 vaccine"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-4 py-2 rounded text-sm transition-colors"
          >
            {loading ? 'Comparing...' : 'Compare'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
          <p className="text-sm">Running PubMed searches and comparing results...</p>
        </div>
      )}

      {result && (
        <div className="space-y-8">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label={`Query A: ${result.query_a.keywords}`}
              value={result.query_a.gene_count}
              sub={`${result.query_a.pair_count} pairs / ${result.query_a.pmid_count} PMIDs`}
            />
            <StatCard
              label={`Query B: ${result.query_b.keywords}`}
              value={result.query_b.gene_count}
              sub={`${result.query_b.pair_count} pairs / ${result.query_b.pmid_count} PMIDs`}
            />
            <StatCard
              label="Shared Genes"
              value={result.overlap.shared}
            />
            <StatCard
              label="Jaccard Index"
              value={result.overlap.jaccard}
              sub={`${result.overlap.unique_a} unique A / ${result.overlap.unique_b} unique B`}
            />
          </div>

          {/* Venn diagram */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-4 text-center">Gene Overlap</h2>
            <div className="relative w-72 h-44 mx-auto">
              <div className="absolute left-2 top-4 w-36 h-36 rounded-full bg-blue-100 border-2 border-blue-400 opacity-70 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-700">{result.overlap.unique_a}</span>
              </div>
              <div className="absolute right-2 top-4 w-36 h-36 rounded-full bg-orange-100 border-2 border-orange-400 opacity-70 flex items-center justify-center">
                <span className="text-sm font-bold text-orange-700">{result.overlap.unique_b}</span>
              </div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <span className="text-base font-bold text-gray-700">{result.overlap.shared}</span>
              </div>
            </div>
            <div className="flex justify-center gap-8 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-300" />
                {result.query_a.keywords}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-orange-300" />
                {result.query_b.keywords}
              </span>
            </div>
          </div>

          {/* Gene lists */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Shared Genes ({result.shared_genes.length})
              </h3>
              <GeneTagCloud genes={result.shared_genes} color="bg-green-100 text-green-700" />
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-blue-600 mb-2">
                Unique to A ({result.unique_a.length})
              </h3>
              <GeneTagCloud genes={result.unique_a} color="bg-blue-100 text-blue-700" />
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-orange-600 mb-2">
                Unique to B ({result.unique_b.length})
              </h3>
              <GeneTagCloud genes={result.unique_b} color="bg-orange-100 text-orange-700" />
            </div>
          </div>

          {/* Export */}
          <div className="text-center">
            <button
              onClick={() => downloadCSV(result)}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-4 py-2 rounded transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
