import { validateExperiment } from './experimentData.js'
import { validateEvidenceSnapshot, evidenceKey } from './evidenceUtils.js'

export const WORKSPACE_STORAGE_KEY = 'ignet_workspaces_v1'
export const MAX_WORKSPACE_BYTES = 2 * 1024 * 1024
export const MAX_SELECTED_EVIDENCE = 100

function requireValue(condition, message) {
  if (!condition) throw new Error(message)
}

function object(value, fields) {
  requireValue(value !== null && typeof value === 'object' && !Array.isArray(value), 'Expected an object.')
  requireValue(Object.keys(value).length === fields.length && fields.every(key => Object.hasOwn(value, key)) && Object.keys(value).every(key => fields.includes(key)), 'Unknown or missing workspace field.')
}

function boundedText(value, name, limit) {
  requireValue(typeof value === 'string' && value.trim().length > 0 && value.length <= limit, `Invalid ${name}.`)
  return value
}

function timestamp(value) {
  boundedText(value, 'timestamp', 32)
  requireValue(Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value, 'Invalid timestamp.')
  return value
}

function gene(value) {
  requireValue(typeof value === 'string' && /^[A-Z0-9._-]{1,60}$/.test(value), 'Invalid gene symbol.')
  return value
}

export function validateRecipe(value) {
  object(value, ['genes', 'pair', 'display'])
  requireValue(Array.isArray(value.genes) && value.genes.length <= 500, 'At most 500 gene inputs allowed.')
  const genes = value.genes.map(gene)
  requireValue(new Set(genes).size === genes.length, 'Duplicate gene inputs.')
  requireValue(value.pair === null || (Array.isArray(value.pair) && value.pair.length === 2), 'Invalid selected pair.')
  const pair = value.pair === null ? null : value.pair.map(gene)
  object(value.display, ['colorScheme', 'log2FCMax'])
  requireValue(['none', 'experiment'].includes(value.display.colorScheme), 'Invalid display color scheme.')
  const range = value.display.log2FCMax
  requireValue(typeof range === 'number' && Number.isFinite(range) && range >= 0.01 && range <= 100, 'Display range must be 0.01–100.')
  return { genes, pair, display: { colorScheme: value.display.colorScheme, log2FCMax: range } }
}

function checkBytes(text) {
  requireValue(typeof text === 'string' && new TextEncoder().encode(text).length <= MAX_WORKSPACE_BYTES, 'Workspace exceeds 2 MiB.')
}

export function validateWorkspace(value) {
  object(value, ['format', 'version', 'id', 'name', 'createdAt', 'updatedAt', 'recipe', 'experiment', 'selectedEvidence'])
  requireValue(value.format === 'ignet-workspace' && value.version === 1, 'Unsupported workspace format/version.')
  const id = boundedText(value.id, 'workspace ID', 120)
  requireValue(/^[A-Za-z0-9_-]+$/.test(id), 'Invalid workspace ID.')
  const name = boundedText(value.name, 'workspace name', 120)
  requireValue(Array.isArray(value.selectedEvidence) && value.selectedEvidence.length <= MAX_SELECTED_EVIDENCE, 'Select at most 100 evidence excerpts.')
  const selectedEvidence = value.selectedEvidence.map(validateEvidenceSnapshot)
  requireValue(new Set(selectedEvidence.map(evidenceKey)).size === selectedEvidence.length, 'Duplicate evidence identity.')
  const workspace = {
    format: 'ignet-workspace', version: 1, id, name,
    createdAt: timestamp(value.createdAt), updatedAt: timestamp(value.updatedAt),
    recipe: validateRecipe(value.recipe),
    experiment: value.experiment === null ? null : validateExperiment(value.experiment), selectedEvidence,
  }
  checkBytes(JSON.stringify(workspace))
  return workspace
}

export function createWorkspace() {
  const now = new Date().toISOString()
  return { format: 'ignet-workspace', version: 1, id: crypto.randomUUID(), name: 'Untitled workspace', createdAt: now, updatedAt: now, recipe: { genes: [], pair: null, display: { colorScheme: 'none', log2FCMax: 2 } }, experiment: null, selectedEvidence: [] }
}

export function validateWorkspaceEdit(previous, candidate) {
  const draft = validateWorkspace(candidate)
  // Context consumers use replacement identity to invalidate in-flight analyses.
  // A recipe/display/evidence edit must not manufacture a replacement experiment.
  if (candidate.experiment === previous.experiment) draft.experiment = previous.experiment
  return draft
}

export function parseWorkspace(text) {
  checkBytes(text)
  return validateWorkspace(JSON.parse(text))
}

export function serializeWorkspace(value) {
  const text = JSON.stringify(validateWorkspace(value))
  checkBytes(text)
  return text
}

export function loadWorkspaceLibrary(storage) {
  const raw = storage.getItem(WORKSPACE_STORAGE_KEY)
  if (raw === null) return { workspaces: [], raw }
  checkBytes(raw)
  const value = JSON.parse(raw)
  object(value, ['format', 'version', 'workspaces'])
  requireValue(value.format === 'ignet-workspace-library' && value.version === 1, 'Unsupported library version.')
  return { workspaces: validateLibrary(value.workspaces), raw }
}

function validateLibrary(values) {
  requireValue(Array.isArray(values) && values.length <= 20, 'Save at most 20 workspaces; delete or export an existing save first.')
  const workspaces = values.map(validateWorkspace)
  requireValue(new Set(workspaces.map(value => value.id)).size === workspaces.length, 'Duplicate workspace ID.')
  return workspaces
}

export function writeWorkspaceLibrary(storage, values, expectedRaw) {
  const workspaces = validateLibrary(values)
  const raw = JSON.stringify({ format: 'ignet-workspace-library', version: 1, workspaces })
  checkBytes(raw)
  requireValue(storage.getItem(WORKSPACE_STORAGE_KEY) === expectedRaw, 'Workspace library changed in another tab. Reload the library before saving; export your current draft first.')
  storage.setItem(WORKSPACE_STORAGE_KEY, raw)
  return raw
}
