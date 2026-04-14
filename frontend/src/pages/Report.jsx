import { useState, useRef } from 'react'
import { useGeneSet } from '../GeneSetContext.jsx'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderMarkdown(text) {
  if (!text) return null
  return escapeHtml(text).split('\n').map((line, i) => {
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    line = line.replace(/\*(.+?)\*/g, '<em>$1</em>')
    line = line.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
    if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-navy mt-3 mb-1 text-sm">{line.slice(4)}</h4>
    if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-navy mt-4 mb-1">{line.slice(3)}</h3>
    const numMatch = line.match(/^(\d+)\.\s+(.*)/)
    if (numMatch) return <p key={i} className="ml-4 mb-1" dangerouslySetInnerHTML={{ __html: `<span class="text-gray-400 mr-1">${numMatch[1]}.</span>${numMatch[2]}` }} />
    if (line.startsWith('- ') || line.startsWith('* ')) return <p key={i} className="ml-4 mb-1" dangerouslySetInnerHTML={{ __html: `<span class="text-gray-400 mr-1">&bull;</span>${line.slice(2)}` }} />
    if (!line.trim()) return <div key={i} className="h-2" />
    return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: line }} />
  })
}

function parseGeneInput(text) {
  return text.split(/[\n,\t ]+/).map(g => g.trim().toUpperCase()).filter(g => g.length > 0)
}

export default function Report() {
  const gs = useGeneSet()
  const [geneInput, setGeneInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState(null)
  const [report, setReport] = useState(null)
  const reportRef = useRef(null)

  const inputGenes = geneInput.trim() ? parseGeneInput(geneInput) : []

  async function generateReport() {
    const genes = inputGenes.length > 0 ? inputGenes : gs?.genes ?? []
    if (genes.length === 0) return

    setLoading(true)
    setError(null)
    setReport(null)

    try {
      // Phase 1: Enrichment analysis
      setProgress('Analyzing gene set interactions...')
      const enrichment = await api.enrichment(genes).catch(() => null)

      // Phase 2: Individual gene reports (top 5 genes only for speed)
      setProgress('Fetching gene reports...')
      const topGenes = genes.slice(0, 5)
      const geneReports = await Promise.all(
        topGenes.map(g => api.geneReport(g).catch(() => null))
      )

      // Phase 3: AI summary (optional, may fail for anonymous users)
      setProgress('Generating AI summary...')
      const aiSummary = await api.summarize(genes.slice(0, 10)).catch(() => null)

      // Build report object
      const now = new Date()
      setReport({
        title: `Ignet Gene Set Analysis Report`,
        generatedAt: now.toISOString(),
        generatedAtDisplay: now.toLocaleString(),
        genes,
        enrichment,
        geneReports: topGenes.map((g, i) => ({ symbol: g, data: geneReports[i] })).filter(r => r.data),
        aiSummary: aiSummary?.Summary?.reply ?? aiSummary?.summary?.reply ?? aiSummary?.summary ?? aiSummary?.data ?? null,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  function downloadHTML() {
    if (!reportRef.current) return
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Ignet Analysis Report</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a202c; font-size: 14px; line-height: 1.6; }
  h1 { color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 8px; }
  h2 { color: #2b6cb0; margin-top: 24px; }
  h3 { color: #1a365d; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
  th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; }
  th { background: #f7fafc; font-weight: 600; }
  .tag { display: inline-block; background: #ebf4ff; color: #2b6cb0; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin: 2px; }
  .tag-red { background: #fff5f5; color: #c53030; }
  .tag-green { background: #f0fff4; color: #276749; }
  .stat { display: inline-block; background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 16px; margin: 4px; text-align: center; }
  .stat-value { font-size: 20px; font-weight: bold; color: #1a365d; }
  .stat-label { font-size: 11px; color: #718096; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #a0aec0; }
  .bar { background: #e2e8f0; border-radius: 4px; height: 8px; margin-top: 4px; }
  .bar-fill { background: #1a365d; border-radius: 4px; height: 8px; }
</style>
</head>
<body>
${reportRef.current.innerHTML}
<div class="footer">
  <p>Generated by <strong>Ignet</strong> (Integrative Gene Network) &mdash; <a href="https://ignet.org/ignet/">https://ignet.org/ignet/</a></p>
  <p>Data source: PubMed biomedical literature. For research use only.</p>
</div>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ignet-report-${new Date().toISOString().slice(0, 10)}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy mb-1">Analysis Report</h1>
        <p className="text-gray-500 text-xs">
          Generate a downloadable report summarizing gene set interactions, enrichment, and literature context.
        </p>
      </div>

      {/* Input */}
      {!report && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600">Gene List</label>
            {gs?.genes?.length > 0 && (
              <button
                type="button"
                onClick={() => setGeneInput(gs.genes.join('\n'))}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Load from Gene Set ({gs.genes.length})
              </button>
            )}
          </div>
          <textarea
            value={geneInput}
            onChange={e => setGeneInput(e.target.value)}
            placeholder="Enter gene symbols (comma, space, or newline separated)&#10;e.g. TNF, IL6, IFNG, BRCA1, TP53"
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={generateReport}
              disabled={loading || (inputGenes.length === 0 && (!gs?.genes?.length))}
              className="bg-navy hover:bg-navy-dark disabled:opacity-40 text-white font-semibold text-sm px-5 py-2 rounded transition-colors"
            >
              Generate Report
            </button>
            {inputGenes.length > 0 && (
              <span className="text-xs text-gray-400">{inputGenes.length} genes</span>
            )}
          </div>
        </div>
      )}

      {loading && <LoadingSpinner message={progress || 'Generating report...'} />}
      <ErrorMessage message={error} />

      {/* Report Preview */}
      {report && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={downloadHTML}
              className="bg-navy hover:bg-navy-dark text-white font-medium text-sm px-4 py-2 rounded transition-colors"
            >
              Download HTML Report
            </button>
            <button
              onClick={() => setReport(null)}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm px-4 py-2 rounded transition-colors"
            >
              New Report
            </button>
          </div>

          <div ref={reportRef} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 text-sm">
            <div>
              <h1 className="text-2xl font-bold text-navy border-b-2 border-navy pb-2">{report.title}</h1>
              <p className="text-xs text-gray-400 mt-1">Generated: {report.generatedAtDisplay}</p>
            </div>

            {/* Gene List */}
            <div>
              <h2 className="text-lg font-semibold text-blue-700 mt-4">Gene Set ({report.genes.length} genes)</h2>
              <div className="flex flex-wrap gap-1 mt-2">
                {report.genes.map(g => (
                  <span key={g} className="inline-block bg-blue-50 text-blue-800 text-xs px-2 py-0.5 rounded-full">{g}</span>
                ))}
              </div>
            </div>

            {/* Enrichment Summary */}
            {report.enrichment && (
              <div>
                <h2 className="text-lg font-semibold text-blue-700">Interaction Analysis</h2>
                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                    <div className="text-xl font-bold text-navy">{report.enrichment.coverage ?? 0}</div>
                    <div className="text-[10px] text-gray-500">Genes Found</div>
                  </div>
                  <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                    <div className="text-xl font-bold text-navy">{report.enrichment.coverage_pct ?? 0}%</div>
                    <div className="text-[10px] text-gray-500">Coverage</div>
                  </div>
                  <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                    <div className="text-xl font-bold text-navy">{report.enrichment.total_interactions ?? 0}</div>
                    <div className="text-[10px] text-gray-500">Interactions</div>
                  </div>
                </div>

                {/* Top interactions table */}
                {report.enrichment.interactions?.length > 0 && (
                  <div className="mt-3 overflow-x-auto">
                    <h3 className="text-sm font-semibold text-navy mb-1">Top Interactions</h3>
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-2 py-1 text-left">Gene 1</th>
                          <th className="border border-gray-200 px-2 py-1 text-left">Gene 2</th>
                          <th className="border border-gray-200 px-2 py-1 text-right">Evidence</th>
                          <th className="border border-gray-200 px-2 py-1 text-right">PMIDs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.enrichment.interactions.slice(0, 15).map((r, i) => (
                          <tr key={i}>
                            <td className="border border-gray-200 px-2 py-1">{r.gene1}</td>
                            <td className="border border-gray-200 px-2 py-1">{r.gene2}</td>
                            <td className="border border-gray-200 px-2 py-1 text-right">{r.evidence_count}</td>
                            <td className="border border-gray-200 px-2 py-1 text-right">{r.unique_pmids}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* INO distribution */}
                {report.enrichment.ino_distribution?.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-navy mb-1">Interaction Types (INO)</h3>
                    <div className="space-y-1">
                      {report.enrichment.ino_distribution.slice(0, 8).map(item => (
                        <div key={item.term} className="flex items-center gap-2 text-xs">
                          <span className="w-28 truncate text-gray-600">{item.term}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="bg-navy rounded-full h-2" style={{ width: `${(item.cnt / (report.enrichment.ino_distribution[0]?.cnt || 1)) * 100}%` }} />
                          </div>
                          <span className="text-gray-400 w-8 text-right">{item.cnt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drug associations */}
                {report.enrichment.drugs?.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-navy mb-1">Drug Associations</h3>
                    <div className="flex flex-wrap gap-1">
                      {report.enrichment.drugs.slice(0, 20).map(d => (
                        <span key={d.term} className="inline-block bg-blue-50 text-blue-800 text-[11px] px-2 py-0.5 rounded-full">
                          {d.term} ({d.cnt})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disease associations */}
                {report.enrichment.diseases?.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-navy mb-1">Disease Associations</h3>
                    <div className="flex flex-wrap gap-1">
                      {report.enrichment.diseases.slice(0, 20).map(d => (
                        <span key={d.term} className="inline-block bg-red-50 text-red-800 text-[11px] px-2 py-0.5 rounded-full">
                          {d.term} ({d.cnt})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Individual Gene Summaries */}
            {report.geneReports.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-blue-700">Gene Profiles</h2>
                {report.geneReports.map(gr => (
                  <div key={gr.symbol} className="mt-3 border border-gray-200 rounded-lg p-3">
                    <h3 className="font-semibold text-navy">{gr.symbol}</h3>
                    {gr.data.gene_info?.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{gr.data.gene_info.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs">
                      <span className="text-gray-600">Neighbors: <strong>{gr.data.raw_counts?.neighbors ?? 0}</strong></span>
                      <span className="text-gray-600">PMIDs: <strong>{gr.data.raw_counts?.pmids ?? 0}</strong></span>
                      <span className="text-gray-600">Sentences: <strong>{gr.data.raw_counts?.sentences ?? 0}</strong></span>
                    </div>
                    {gr.data.top_neighbors?.length > 0 && (
                      <div className="mt-1">
                        <span className="text-[10px] text-gray-400">Top partners: </span>
                        <span className="text-[10px] text-gray-600">{gr.data.top_neighbors.slice(0, 8).map(n => n.neighbor).join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* AI Summary */}
            {report.aiSummary && (
              <div>
                <h2 className="text-lg font-semibold text-blue-700">AI-Generated Summary</h2>
                <div className="mt-2 text-sm text-gray-700 leading-relaxed bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {renderMarkdown(report.aiSummary)}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Generated by GPT-4o via Ignet's BioSummarAI service. For research reference only.</p>
              </div>
            )}

            {/* Methodology */}
            <div>
              <h2 className="text-lg font-semibold text-blue-700">Methodology</h2>
              <div className="text-xs text-gray-600 space-y-1 mt-2">
                <p>Gene interactions are derived from co-occurrence analysis of PubMed biomedical abstracts using the SciMiner text-mining system.</p>
                <p>Interaction types are classified using the Interaction Network Ontology (INO). Drug and disease associations are identified from the biosummary25 annotation database.</p>
                <p>Centrality metrics (degree, eigenvector, closeness, betweenness) are computed on query-specific interaction networks.</p>
                <p>AI summaries are generated using GPT-4o with Ignet database context.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
