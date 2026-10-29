import { describe, expect, it } from 'vitest'
import { createWorkspace, validateWorkspace, validateWorkspaceEdit, parseWorkspace, serializeWorkspace, loadWorkspaceLibrary, writeWorkspaceLibrary, MAX_WORKSPACE_BYTES, WORKSPACE_STORAGE_KEY } from '../workspace.js'

const excerpt = () => ({ schemaVersion: 1, pair: ['MDM2', 'TP53'], sentenceId: '12', pmid: '123', sentenceText: 'Exact γ and β evidence.', scores: [], inoAnnotations: [], origin: null, sourceRevision: null, modelVersion: null, fetchedAt: '2026-10-28T12:00:00.000Z' })
function storage() {
  const data = new Map([['ignet_geneset_saved', 'legacy']])
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), data }
}

describe('portable workspaces', () => {
  it('round-trips exact Unicode evidence and reconstructs independent objects', () => {
    const draft = createWorkspace()
    draft.selectedEvidence = [excerpt()]
    const restored = parseWorkspace(serializeWorkspace(draft))
    expect(restored.selectedEvidence[0].sentenceText).toBe('Exact γ and β evidence.')
    expect(restored).toEqual(draft)
    expect(restored.recipe).not.toBe(draft.recipe)
  })

  it('rejects future versions, unknown imported fields and unsafe display values', () => {
    const draft = createWorkspace()
    expect(() => validateWorkspace({ ...draft, version: 2 })).toThrow(/version/i)
    expect(() => validateWorkspace({ ...draft, token: 'secret' })).toThrow(/field/i)
    expect(() => validateWorkspace({ ...draft, recipe: { ...draft.recipe, display: { colorScheme: 'experiment', log2FCMax: Infinity } } })).toThrow(/range/i)
    expect(() => parseWorkspace('{"__proto__":{}}')).toThrow()
  })

  it('rejects duplicate identities and excessive excerpt counts', () => {
    const draft = createWorkspace()
    expect(() => validateWorkspace({ ...draft, selectedEvidence: [excerpt(), excerpt()] })).toThrow(/duplicate/i)
    expect(() => validateWorkspace({ ...draft, selectedEvidence: Array(101).fill(excerpt()) })).toThrow(/100/)
  })

  it('bounds UTF-8 import bytes and validates gene inputs without coercion', () => {
    expect(() => parseWorkspace('γ'.repeat(MAX_WORKSPACE_BYTES))).toThrow(/2 MiB/)
    const draft = createWorkspace()
    expect(() => validateWorkspace({ ...draft, recipe: { ...draft.recipe, genes: ['TP53', 'TP53'] } })).toThrow(/duplicate/i)
    expect(() => validateWorkspace({ ...draft, recipe: { ...draft.recipe, pair: ['TP53', 1] } })).toThrow()
  })

  it('uses the existing API symbol shape for restored inputs and rejects overlong symbols', () => {
    const draft = createWorkspace()
    const recipe = { ...draft.recipe, genes: ['.TP53', 'A'.repeat(60)], pair: ['.TP53', 'TP53'] }
    expect(validateWorkspace({ ...draft, recipe }).recipe).toEqual(recipe)
    expect(() => validateWorkspace({ ...draft, recipe: { ...recipe, genes: ['A'.repeat(61)] } })).toThrow(/gene symbol/i)
  })

  it('keeps the experiment identity on recipe-only edits so analysis does not cancel itself', () => {
    const draft = validateWorkspace({ ...createWorkspace(), experiment: { schema: 'ignet-experiment-v1', name: 'Study', importedAt: '2026-10-28T12:00:00.000Z', rows: [{ gene: 'TP53', inputSymbol: 'TP53', log2FC: 1, padj: 0.01 }] } })
    const edited = validateWorkspaceEdit(draft, { ...draft, recipe: { ...draft.recipe, genes: ['TP53'] } })
    expect(edited.experiment).toBe(draft.experiment)
    expect(edited.recipe.genes).toEqual(['TP53'])
    const replacement = { ...draft.experiment, name: 'Different study' }
    expect(validateWorkspaceEdit(draft, { ...draft, experiment: replacement }).experiment).not.toBe(draft.experiment)
  })

  it('exports every admitted near-limit draft without pretty-print expansion', () => {
    const selectedEvidence = Array.from({ length: 100 }, (_, index) => ({
      ...excerpt(), sentenceId: String(index + 1), sentenceText: 'x'.repeat(20000),
      inoAnnotations: [{ inoId: 'INO:0001', matchingPhrase: 'p'.repeat(600) }],
    }))
    const draft = validateWorkspace({ ...createWorkspace(), selectedEvidence })
    expect(new TextEncoder().encode(JSON.stringify(draft)).length).toBeLessThanOrEqual(MAX_WORKSPACE_BYTES)
    const exported = serializeWorkspace(draft)
    expect(new TextEncoder().encode(exported).length).toBeLessThanOrEqual(MAX_WORKSPACE_BYTES)
    expect(parseWorkspace(exported)).toEqual(draft)
  })
})

describe('bounded explicit workspace library persistence', () => {
  it('writes and loads a library without changing legacy gene sets', () => {
    const store = storage(), draft = createWorkspace()
    const raw = writeWorkspaceLibrary(store, [draft], null)
    expect(loadWorkspaceLibrary(store)).toEqual({ workspaces: [draft], raw })
    expect(store.getItem('ignet_geneset_saved')).toBe('legacy')
  })

  it('preserves previous bytes when storage throws or another tab changed them', () => {
    const store = storage(), draft = createWorkspace()
    const raw = writeWorkspaceLibrary(store, [draft], null)
    const changed = createWorkspace()
    expect(() => writeWorkspaceLibrary(store, [changed], null)).toThrow(/another tab/i)
    expect(store.getItem(WORKSPACE_STORAGE_KEY)).toBe(raw)
    store.setItem = () => { throw new Error('QuotaExceeded') }
    expect(() => writeWorkspaceLibrary(store, [changed], raw)).toThrow('QuotaExceeded')
    expect(store.getItem(WORKSPACE_STORAGE_KEY)).toBe(raw)
  })

  it('rejects a corrupted library and prevents silent eviction above twenty saves', () => {
    const store = storage()
    store.data.set(WORKSPACE_STORAGE_KEY, '{broken')
    expect(() => loadWorkspaceLibrary(store)).toThrow()
    expect(() => writeWorkspaceLibrary(storage(), Array.from({ length: 21 }, createWorkspace), null)).toThrow(/20/)
  })
})
