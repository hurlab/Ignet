import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../WorkspaceContext.jsx'
import { MAX_EXPERIMENT_BYTES, parseExperimentTable } from '../experimentData.js'

const EXAMPLE = 'gene,log2FC,padj\nTP53,-1.2,0.03\nBRCA1,0.7,0.01\nEGFR,NA,0.2'
export default function ExperimentImport() {
  const { experiment, setExperiment, persistence } = useWorkspace()
  const navigate = useNavigate()
  const [text, setText] = useState(''), [name, setName] = useState('My experiment')
  const [preview, setPreview] = useState(null), [error, setError] = useState('')
  const [applyFailed, setApplyFailed] = useState(false)
  const invalidate = () => { setPreview(null); setError(''); setApplyFailed(false) }
  function validate(textValue) {
    setApplyFailed(false)
    try { setPreview(parseExperimentTable(textValue)); setError('') }
    catch (err) { setPreview(null); setError(err.message) }
  }
  async function readFile(event) {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file) return
    if (file.size > MAX_EXPERIMENT_BYTES) { setError('Maximum file size is 2 MiB.'); setPreview(null); return }
    try { const value = await file.text(); setText(value); validate(value) }
    catch { setError('Could not read experiment file.'); setPreview(null) }
  }
  function apply() {
    try {
      const applied = setExperiment({ schema: 'ignet-experiment-v1', name: name.trim(), importedAt: new Date().toISOString(), rows: preview.rows })
      if (applied === false) { setApplyFailed(true); return }
      setApplyFailed(false)
      setPreview(null); setText(''); setError('')
    } catch (err) { setError(err.message) }
  }
  return <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3" aria-labelledby="experiment-title">
    <h2 id="experiment-title" className="font-semibold text-sm">Experiment values</h2>
    <p className="text-xs text-gray-600">Import a gene column plus log2FC and/or padj (CSV, TSV or semicolon-separated; up to 500 genes and 2 MiB). Accepted headers include gene/symbol, log2FoldChange/logFC, and padj/FDR/adj.P.Val; other columns such as baseMean or pvalue are ignored. Values stay in memory until you explicitly save or export a workspace. Analyzing sends gene symbols to Ignet, not measurements. Symbols are matched exactly; aliases are not converted.</p>
    <label className="block text-sm">Experiment name<input aria-label="Experiment name" value={name} maxLength={120} onChange={e => setName(e.target.value)} className="border rounded px-2 py-1 ml-2" /></label>
    <label className="block text-sm">Experiment CSV or TSV<textarea aria-label="Experiment CSV or TSV" rows={4} value={text} onChange={e => { setText(e.target.value); invalidate() }} className="block w-full border rounded p-2 font-mono text-xs" /></label>
    <div className="flex gap-3 flex-wrap items-center text-sm">
      <label>Import experiment file<input aria-label="Import experiment file" type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" onChange={readFile} className="block text-xs" /></label>
      <button type="button" onClick={() => validate(text)} className="border rounded px-3 py-1">Preview experiment</button>
      <button type="button" onClick={() => { setText(EXAMPLE); validate(EXAMPLE) }} className="text-blue-700">Use example experiment</button>
    </div>
    {(error || applyFailed) && <p role="alert" className="text-red-700 text-sm">{applyFailed ? persistence.message || 'Experiment could not be applied; your preview is preserved.' : error}</p>}
    {preview && <div className="text-sm space-y-2">
      <p>{preview.rows.length} genes validated; {preview.duplicates} identical duplicates collapsed.</p>
      <table className="text-xs"><caption>Experiment preview (first 5 rows)</caption><thead><tr><th>Gene</th><th>log2FC</th><th>Adjusted p</th></tr></thead><tbody>{preview.rows.slice(0, 5).map(row => <tr key={row.gene}><td className="pr-4">{row.gene}</td><td className="pr-4">{row.log2FC ?? 'Missing'}</td><td>{row.padj ?? 'Missing'}</td></tr>)}</tbody></table>
      <button type="button" onClick={apply} disabled={!name.trim()} className="bg-navy text-white rounded px-3 py-1 disabled:opacity-40">Apply experiment</button>
    </div>}
    {experiment && <div className="border-t pt-2 text-sm space-x-3">
      <span>Active: {experiment.name} ({experiment.rows.length} genes)</span>
      <button type="button" disabled={experiment.rows.length < 2} onClick={() => navigate('/enrichment')} className="text-blue-700 disabled:opacity-40">Analyze these genes</button>
      <button type="button" onClick={() => setExperiment(null)} className="text-red-700">Clear experiment</button>
    </div>}
  </section>
}
