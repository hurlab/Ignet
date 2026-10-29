import { useMemo, useState } from 'react'
import { useWorkspace } from '../WorkspaceContext.jsx'
import { downloadEvidence, evidenceKey, groupEvidence, prepareEvidenceReview } from '../evidenceUtils.js'

export default function EvidenceWorkbench({ data, loadingMore, onLoadMore, sortBy, onSort, predicting, onPredict, predictResult }) {
  const { selectedEvidence, toggleEvidence, clearEvidence, persistence } = useWorkspace()
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const normalized = useMemo(() => {
    try { return { ...prepareEvidenceReview(data.interactions, [data.gene1, data.gene2], data.fetchedAt), error: '' } }
    catch (err) { return { items: [], unselectable: [], error: err.message } }
  }, [data])
  const keys = new Set(selectedEvidence.map(evidenceKey))
  const filtered = normalized.items.filter(item => !search || (item.sentenceText ?? '').toLowerCase().includes(search.toLowerCase()))
  const groups = groupEvidence(filtered)
  const loaded = data.interactions.length
  function toggle(item) {
    try {
      const accepted = toggleEvidence(item)
      setError(accepted === false ? 'Selection could not be changed. Check the workspace error below; export or clear selected excerpts before retrying.' : '')
    }
    catch (err) { setError(err.message) }
  }
  function exportSelected(format) {
    try { downloadEvidence(selectedEvidence, format); setError('') }
    catch (err) { setError(err.message) }
  }
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3" aria-labelledby="review-evidence-title">
      <h2 id="review-evidence-title" className="font-semibold text-navy">Review evidence</h2>
      <p className="text-xs text-gray-600">{loaded} loaded base records of {data.total}; {normalized.items.length} distinct loaded excerpts. Grouping covers retrieved records only, not all literature.</p>
      <p className="text-xs text-gray-500">BioBERT model scores are not calibrated probabilities or proof of a biological interaction. Detected INO phrases describe the sentence. Source origin, revision and model version are unknown.</p>
      <div className="flex flex-wrap items-end gap-3 text-xs">
        <label>Search loaded evidence<input className="block border rounded px-2 py-1" value={search} onChange={e => setSearch(e.target.value)} /></label>
        <label>Evidence order<select className="block border rounded px-2 py-1" value={sortBy} onChange={e => onSort(e.target.value)}><option value="score">Model score</option><option value="pmid">PMID</option></select></label>
        <button type="button" onClick={onPredict} disabled={predicting || loadingMore} className="border rounded px-2 py-1 disabled:opacity-50">{predicting ? 'Predicting...' : 'Re-predict Unscored'}</button>
      </div>
      {predictResult && <p role="status" className="text-xs">{predictResult.error ?? predictResult.message}</p>}
      {(error || normalized.error) && <p role="alert" className="text-xs text-red-700">{error || normalized.error}</p>}
      {persistence?.state === 'error' && <p role="alert" className="text-xs text-red-700">{persistence.message}</p>}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span>{selectedEvidence.length}/100 excerpts selected across workspace</span>
        <button type="button" disabled={!selectedEvidence.length} onClick={() => exportSelected('csv')} className="border rounded px-2 py-1 disabled:opacity-50">Export selected CSV</button>
        <button type="button" disabled={!selectedEvidence.length} onClick={() => exportSelected('json')} className="border rounded px-2 py-1 disabled:opacity-50">Export selected JSON</button>
        <button type="button" disabled={!selectedEvidence.length} onClick={clearEvidence} className="border rounded px-2 py-1 disabled:opacity-50">Clear selected evidence</button>
      </div>
      {!groups.length && <p className="text-sm text-gray-500">No loaded evidence matches.</p>}
      {groups.map(group => (
        <div key={group.pmid ?? 'unknown'} className="border rounded p-3 space-y-3">
          <h3 className="text-sm font-medium">{group.pmid ? <a href={`https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(group.pmid)}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">PMID {group.pmid}</a> : 'Paper unavailable'} <span className="font-normal text-gray-500">({group.items.length} loaded excerpts)</span></h3>
          {group.items.map((item, index) => (
            <div key={evidenceKey(item)} className="border-t pt-2 text-xs space-y-1">
              <label className="flex gap-2 items-center"><input type="checkbox" checked={keys.has(evidenceKey(item))} onChange={() => toggle(item)} aria-label={`Select evidence ${index + 1} from ${group.pmid ? `PMID ${group.pmid}` : 'unknown paper'}`} />Select excerpt</label>
              <p className="whitespace-pre-wrap break-words text-gray-800">{item.sentenceText ?? 'Sentence text unavailable.'}</p>
              <p>Model score: {item.scores.length ? item.scores.join(', ') : 'Not scored'}{item.scores.length > 1 ? ' (multiple recorded scores)' : ''}</p>
              <p>Detected INO phrases: {item.inoAnnotations.map(a => a.matchingPhrase ?? a.inoId).join('; ') || 'None recorded'}</p>
              {!item.sentenceId && <p className="text-amber-700">Sentence identifier unavailable; this is an incomplete snapshot.</p>}
            </div>
          ))}
        </div>
      ))}
      {normalized.unselectable.map((item, index) => (
        <div key={`unselectable-${index}`} className="border border-amber-300 rounded p-3 space-y-1 text-xs">
          <p className="font-medium">Loaded entry {index + 1} cannot be selected{item.pmid ? ` (PMID ${item.pmid})` : ''}.</p>
          <p className="whitespace-pre-wrap break-words">{item.sentenceText ?? 'Sentence text unavailable.'}</p>
          <p role="status">{item.reason} {item.annotationCount !== null ? `${item.annotationCount} annotations were returned.` : ''} This entry will not be saved or exported; other loaded evidence remains available.</p>
        </div>
      ))}
      {loaded < data.total && loaded < 500 && <button type="button" onClick={onLoadMore} disabled={loadingMore || predicting} className="border rounded px-3 py-1 text-sm disabled:opacity-50">{loadingMore ? 'Loading next page...' : 'Load next page'}</button>}
      {loaded >= 500 && loaded < data.total && <p className="text-xs text-amber-700">Review limit reached: 500 loaded records per pair. Existing selections are preserved.</p>}
    </section>
  )
}
