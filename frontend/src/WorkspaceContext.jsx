import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { validateExperiment } from './experimentData.js'
import { validateEvidenceSnapshot, evidenceKey } from './evidenceUtils.js'
import { createWorkspace, validateWorkspace, validateWorkspaceEdit, validateRecipe, serializeWorkspace, loadWorkspaceLibrary, writeWorkspaceLibrary, WORKSPACE_STORAGE_KEY, MAX_SELECTED_EVIDENCE } from './workspace.js'

const WorkspaceContext = createContext(null)

function initialState() {
  const state = { draft: createWorkspace(), savedWorkspaces: [], raw: null, restoreToken: 0, persistence: { state: 'dirty', savedAt: null, message: null } }
  try {
    const library = loadWorkspaceLibrary(window.localStorage)
    return { ...state, savedWorkspaces: library.workspaces, raw: library.raw }
  } catch (error) {
    return { ...state, persistence: { ...state.persistence, state: 'error', message: `Saved library unavailable: ${error.message}. Export the current draft before recovery.` } }
  }
}

export function WorkspaceProvider({ children }) {
  const [state, setState] = useState(initialState)
  const current = useRef(state)
  function commit(next) {
    current.current = next
    setState(next)
  }
  function fail(error) {
    const previous = current.current
    commit({ ...previous, persistence: { ...previous.persistence, state: 'error', message: error.message } })
    return false
  }
  function edit(change) {
    try {
      const previous = current.current
      const draft = validateWorkspaceEdit(previous.draft, { ...change(previous.draft), updatedAt: new Date().toISOString() })
      commit({ ...previous, draft, persistence: { state: 'dirty', savedAt: previous.persistence.savedAt, message: null } })
      return true
    } catch (error) { return fail(error) }
  }

  useEffect(() => {
    function onStorage(event) {
      if (event.key === WORKSPACE_STORAGE_KEY || event.key === null) {
        fail(new Error('Workspace library changed in another tab. Export your draft, then reload the saved library before saving.'))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function setExperiment(value) {
    try {
      const experiment = value === null ? null : validateExperiment(value)
      return edit(draft => ({ ...draft, experiment, recipe: { ...draft.recipe, genes: experiment ? experiment.rows.map(row => row.gene) : [] } }))
    } catch (error) { return fail(error) }
  }
  function setRecipe(partial) {
    if (!partial || typeof partial !== 'object' || Array.isArray(partial) || Object.keys(partial).some(key => !['genes', 'pair', 'display'].includes(key))) return fail(new Error('Unknown recipe field.'))
    return edit(draft => ({ ...draft, recipe: validateRecipe({ ...draft.recipe, ...partial }) }))
  }
  function toggleEvidence(value) {
    try {
      const snapshot = validateEvidenceSnapshot(value), key = evidenceKey(snapshot)
      return edit(draft => {
        const found = draft.selectedEvidence.some(item => evidenceKey(item) === key)
        if (!found && draft.selectedEvidence.length >= MAX_SELECTED_EVIDENCE) throw new Error('Select at most 100 evidence excerpts. Remove one before adding another.')
        return { ...draft, selectedEvidence: found ? draft.selectedEvidence.filter(item => evidenceKey(item) !== key) : [...draft.selectedEvidence, snapshot] }
      })
    } catch (error) { return fail(error) }
  }
  function restoreWorkspace(value) {
    try {
      const draft = validateWorkspace(value), previous = current.current
      commit({ ...previous, draft, restoreToken: previous.restoreToken + 1, persistence: { state: 'dirty', savedAt: null, message: null } })
      return true
    } catch (error) { return fail(error) }
  }
  function loadWorkspace(id) {
    const saved = current.current.savedWorkspaces.find(item => item.id === id)
    return saved ? restoreWorkspace(saved) : fail(new Error('Saved workspace not found.'))
  }
  function saveWorkspace(name) {
    try {
      const previous = current.current
      const draft = validateWorkspaceEdit(previous.draft, { ...previous.draft, name: typeof name === 'string' ? name.trim() : name, updatedAt: new Date().toISOString() })
      const values = [...previous.savedWorkspaces.filter(item => item.id !== draft.id), draft]
      const raw = writeWorkspaceLibrary(window.localStorage, values, previous.raw)
      commit({ ...previous, draft, savedWorkspaces: values, raw, persistence: { state: 'saved', savedAt: draft.updatedAt, message: null } })
      return true
    } catch (error) { return fail(error) }
  }
  function deleteWorkspace(id) {
    try {
      const previous = current.current, values = previous.savedWorkspaces.filter(item => item.id !== id)
      const raw = writeWorkspaceLibrary(window.localStorage, values, previous.raw)
      commit({ ...previous, savedWorkspaces: values, raw })
      return true
    } catch (error) { return fail(error) }
  }
  function reloadLibrary() {
    try {
      const previous = current.current, library = loadWorkspaceLibrary(window.localStorage)
      commit({ ...previous, savedWorkspaces: library.workspaces, raw: library.raw, persistence: { ...previous.persistence, state: 'dirty', message: null } })
      return true
    } catch (error) { return fail(error) }
  }
  function clearWorkspace() {
    return restoreWorkspace(createWorkspace())
  }

  return <WorkspaceContext.Provider value={{
    experiment: state.draft.experiment, selectedEvidence: state.draft.selectedEvidence,
    recipe: state.draft.recipe, restoreToken: state.restoreToken,
    savedWorkspaces: state.savedWorkspaces, persistence: state.persistence,
    setExperiment, setRecipe, toggleEvidence,
    clearEvidence: () => edit(draft => ({ ...draft, selectedEvidence: [] })),
    saveWorkspace, loadWorkspace, restoreWorkspace,
    exportWorkspace: () => serializeWorkspace(current.current.draft),
    deleteWorkspace, clearWorkspace, reloadLibrary,
  }}>{children}</WorkspaceContext.Provider>
}

// Context and its consumer hook share this module, matching GeneSetContext.
// eslint-disable-next-line react-refresh/only-export-components
export function useWorkspace() {
  return useContext(WorkspaceContext)
}
