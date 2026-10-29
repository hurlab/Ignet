import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkspace } from '../WorkspaceContext.jsx'
import WorkspaceControls from '../components/WorkspaceControls.jsx'
import { parseWorkspace, serializeWorkspace, MAX_WORKSPACE_BYTES } from '../workspace.js'
import { evidenceKey } from '../evidenceUtils.js'

export default function Workspaces() {
  const workspace = useWorkspace()
  const [fileText, setFileText] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const reading = useRef(0)
  if (!workspace) return null

  async function chooseFile(event) {
    const file = event.target.files?.[0], generation = ++reading.current
    setPreview(null)
    setFileText(null)
    setError(null)
    if (!file) return
    if (file.size > MAX_WORKSPACE_BYTES) { setError('Workspace file exceeds 2 MiB.'); return }
    try {
      const text = await file.text()
      if (reading.current === generation) setFileText(text)
    } catch (failure) { if (reading.current === generation) setError(failure.message) }
  }
  function previewImport() {
    try { setPreview(parseWorkspace(fileText)); setError(null) }
    catch (failure) { setPreview(null); setError(failure.message) }
  }
  function restore(value) {
    if (workspace.restoreWorkspace(value)) {
      setNotice('Workspace restored without running an analysis. Open the relevant page and explicitly run with current data.')
      setPreview(null)
    }
  }
  function exportSaved(value) {
    try {
      const url = URL.createObjectURL(new Blob([serializeWorkspace(value)], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'ignet-workspace.json'
      link.click()
      URL.revokeObjectURL(url)
      setError(null)
    } catch (failure) { setError(failure.message) }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-navy">Research workspaces</h1>
        <p className="text-gray-600 mt-2">Save inputs, experimental overlay settings and selected evidence excerpts. Re-analysis uses current database contents and may change results; this file does not freeze a database generation or network layout.</p>
        <p className="text-sm text-gray-600 mt-2">Workspaces stay in this browser until you export a file. Exported files contain your research data. Running an analysis sends the required gene symbols to Ignet, but does not send experimental measurement values. Unsaved changes are lost on reload.</p>
      </header>
      <WorkspaceControls />
      <div className="flex flex-wrap gap-3 items-center text-sm">
        <button className="border rounded px-3 py-1.5" onClick={() => { workspace.clearWorkspace(); setNotice('New empty workspace. Saved workspaces and legacy gene sets are unchanged.') }}>New workspace</button>
        <button className="border rounded px-3 py-1.5" onClick={() => workspace.reloadLibrary()}>Reload saved library</button>
        <Link className="text-blue-700 underline" to="/enrichment">Open enrichment inputs</Link>
        {workspace.recipe.pair && <Link className="text-blue-700 underline" to="/genepair">Open selected gene pair</Link>}
      </div>
      {notice && <p role="status" className="text-sm text-green-800">{notice}</p>}
      <section className="border rounded-lg bg-white p-4 space-y-3" aria-label="Import workspace">
        <h2 className="font-semibold">Import a workspace</h2>
        <label className="block text-sm">Import workspace file
          <input className="block mt-2" type="file" accept=".json,application/json" onChange={chooseFile} />
        </label>
        <button className="border rounded px-3 py-1.5 text-sm" onClick={previewImport} disabled={fileText === null}>Preview import</button>
        {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
        {preview && <div className="bg-gray-50 border rounded p-3 space-y-2">
          <p className="font-medium">{preview.name}</p>
          <p className="text-sm">{preview.recipe.genes.length} input genes · {preview.experiment?.rows.length ?? 0} experimental values · {preview.selectedEvidence.length} selected excerpts.</p>
          <p className="text-sm">Replacing changes only the current draft. It does not save the import or run an analysis.</p>
          <button className="border rounded px-3 py-1.5 text-sm" onClick={() => restore(preview)}>Replace current workspace</button>
        </div>}
      </section>
      <section aria-label="Saved workspaces" className="space-y-3">
        <h2 className="text-lg font-semibold">Saved in this browser ({workspace.savedWorkspaces.length}/20)</h2>
        {!workspace.savedWorkspaces.length && <p className="text-gray-600">No saved workspaces. Existing saved gene sets are managed separately.</p>}
        {workspace.savedWorkspaces.map(value => <div key={value.id} className="border rounded-lg bg-white p-4 flex flex-wrap gap-3 items-center">
          <div className="grow"><p className="font-medium">{value.name}</p><p className="text-xs text-gray-600">{value.updatedAt} · {value.recipe.genes.length} genes · {value.selectedEvidence.length} excerpts</p></div>
          <button className="border rounded px-2 py-1 text-sm" aria-label={`Load ${value.name}`} onClick={() => { if (workspace.loadWorkspace(value.id)) setNotice('Workspace loaded without running an analysis.') }}>Load</button>
          <button className="border rounded px-2 py-1 text-sm" aria-label={`Export ${value.name}`} onClick={() => exportSaved(value)}>Export</button>
          <button className="border rounded px-2 py-1 text-sm" aria-label={`Delete ${value.name}`} onClick={() => workspace.deleteWorkspace(value.id)}>Delete</button>
        </div>)}
      </section>
      <section aria-label="Selected evidence snapshots" className="space-y-3">
        <div className="flex justify-between gap-3"><h2 className="text-lg font-semibold">Selected evidence ({workspace.selectedEvidence.length}/100)</h2><button className="text-sm text-red-700" disabled={!workspace.selectedEvidence.length} onClick={workspace.clearEvidence}>Clear selected evidence</button></div>
        <p className="text-sm text-gray-600">Exact captured excerpts are available here without a new request. Missing source, revision and model metadata remain unknown. Model scores and co-occurrence do not establish causation.</p>
        {!workspace.selectedEvidence.length && <p className="text-gray-600">Select evidence on a gene-pair page to keep it in the current workspace.</p>}
        {workspace.selectedEvidence.map(value => <details key={evidenceKey(value)} className="border rounded-lg bg-white p-3">
          <summary className="cursor-pointer font-medium">{value.pair.join(' – ')} · PMID {value.pmid ?? 'unknown'}</summary>
          <p className="whitespace-pre-wrap break-words mt-3">{value.sentenceText ?? 'Sentence text unavailable.'}</p>
          <p className="text-sm text-gray-700 mt-2">Observed model scores: {value.scores.length ? value.scores.join(', ') : 'unscored'}. Detected phrases: {value.inoAnnotations.length ? value.inoAnnotations.map(item => item.matchingPhrase ?? item.inoId ?? 'unknown').join('; ') : 'none reported'}.</p>
          <p className="text-xs text-gray-600 mt-2">Captured {value.fetchedAt} · sentence {value.sentenceId ?? 'unknown'} · source {value.origin ?? 'unknown'} · revision {value.sourceRevision ?? 'unknown'} · model {value.modelVersion ?? 'unknown'}</p>
          <button className="mt-2 text-sm text-red-700" onClick={() => workspace.toggleEvidence(value)}>Remove excerpt</button>
        </details>)}
      </section>
    </div>
  )
}
