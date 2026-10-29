import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkspace } from '../WorkspaceContext.jsx'

export default function WorkspaceControls() {
  const workspace = useWorkspace()
  const [name, setName] = useState('')
  const [exportError, setExportError] = useState(null)
  if (!workspace) return null

  function exportCurrent() {
    try {
      const blob = new Blob([workspace.exportWorkspace()], { type: 'application/json' })
      const url = URL.createObjectURL(blob), link = document.createElement('a')
      link.href = url
      link.download = 'ignet-workspace.json'
      link.click()
      URL.revokeObjectURL(url)
      setExportError(null)
    } catch (error) { setExportError(error.message) }
  }

  return (
    <section className="border border-gray-200 rounded-lg bg-white p-4 space-y-3" aria-label="Workspace controls">
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-sm text-gray-700">Workspace name
          <input value={name} onChange={event => setName(event.target.value)} maxLength={120} className="block border rounded px-2 py-1 mt-1" placeholder="My research question" />
        </label>
        <button className="px-3 py-1.5 rounded bg-navy text-white text-sm" onClick={() => workspace.saveWorkspace(name)} disabled={!name.trim()}>Save workspace</button>
        <button className="px-3 py-1.5 rounded border text-sm" onClick={exportCurrent}>Export current workspace</button>
        <Link className="text-blue-700 underline text-sm" to="/workspace">Manage workspaces</Link>
      </div>
      <p className="text-xs text-gray-600" role="status">
        {workspace.persistence.state === 'saved' ? `Saved in this browser at ${workspace.persistence.savedAt}.` : 'Current changes are not saved automatically. Save or export to keep them.'}
      </p>
      {(workspace.persistence.message || exportError) && <p className="text-sm text-red-700" role="alert">{exportError || workspace.persistence.message}</p>}
    </section>
  )
}
