import { test, expect } from '@playwright/test'
import { Buffer } from 'node:buffer'

async function setup(page) {
  const analyses = []
  await page.route('**/api/v1/**', route => {
    const request = route.request(), url = new URL(request.url())
    if (url.pathname.endsWith('/enrichment/analyze/stream')) return route.fulfill({ status: 503, json: {} })
    if (url.pathname.endsWith('/enrichment/analyze')) { analyses.push(JSON.parse(request.postData())); return route.fulfill({ json: { input_genes: analyses.at(-1).genes, interactions: [], ino_distribution: [], drugs: [], diseases: [], coverage: 0 } }) }
    return route.fulfill({ json: {} })
  })
  return analyses
}
const draft = () => ({ format: 'ignet-workspace', version: 1, id: 'fixture', name: 'Imported fixture', createdAt: '2026-10-29T00:00:00.000Z', updatedAt: '2026-10-29T00:00:00.000Z', recipe: { genes: ['TP53', 'MDM2'], pair: null, display: { colorScheme: 'none', log2FCMax: 2 } }, experiment: null, selectedEvidence: [] })
async function restore(page, value) {
  await page.goto('workspace')
  await page.getByLabel('Import workspace file').setInputFiles({ name: 'fixture.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) })
  await page.getByRole('button', { name: 'Preview import', exact: true }).click()
  await page.getByRole('button', { name: 'Replace current workspace', exact: true }).click()
}
async function spa(page, path) {
  await page.evaluate(path => { history.pushState({}, '', `/ignet/${path}`); window.dispatchEvent(new PopStateEvent('popstate')) }, path)
}
test('rejected experiment apply retains import and explains workspace size failure', async ({ page }) => {
  await setup(page)
  const value = draft()
  value.selectedEvidence = Array.from({ length: 100 }, (_, i) => ({ schemaVersion: 1, pair: ['MDM2', 'TP53'], sentenceId: String(i + 1), pmid: '123', sentenceText: 'a'.repeat(20000), scores: [], inoAnnotations: [], origin: null, sourceRevision: null, modelVersion: null, fetchedAt: '2026-10-29T00:00:00.000Z' }))
  await restore(page, value)
  await spa(page, 'geneset')
  const table = 'gene,log2FC\n' + Array.from({ length: 500 }, (_, i) => `G${String(i).padStart(59, '0')},1`).join('\n')
  await page.getByLabel('Experiment CSV or TSV', { exact: true }).fill(table)
  await page.getByRole('button', { name: 'Preview experiment', exact: true }).click()
  await page.getByRole('button', { name: 'Apply experiment', exact: true }).click()
  await expect(page.getByLabel('Experiment CSV or TSV', { exact: true })).toHaveValue(table)
  await expect(page.getByRole('button', { name: 'Apply experiment', exact: true })).toBeVisible()
  await expect(page.getByRole('alert').filter({ hasText: /2 MiB/ }).first()).toBeVisible()
})
test('ordinary deep links analyze initially and after a workspace restore', async ({ page }) => {
  const analyses = await setup(page)
  await page.goto('enrichment?genes=TP53,MDM2')
  await expect.poll(() => analyses.length).toBeGreaterThan(0)
  await expect(page.getByLabel('Gene Symbols')).toHaveValue('TP53, MDM2')
  await restore(page, draft())
  const before = analyses.length
  await spa(page, 'enrichment?genes=EGFR,STAT3')
  await expect.poll(() => analyses.length).toBeGreaterThan(before)
  expect(analyses.at(-1).genes).toEqual(['EGFR', 'STAT3'])
  await expect(page.getByLabel('Gene Symbols')).toHaveValue('EGFR, STAT3')
})
test('invalid recipe input never dispatches analysis and duplicate symbols normalize before dispatch', async ({ page }) => {
  const analyses = await setup(page)
  await page.goto('enrichment')
  await page.getByLabel('Gene Symbols').fill('TP53 BAD$')
  await page.getByRole('button', { name: 'Analyze', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Unsupported gene symbols')
  expect(analyses).toHaveLength(0)
  await expect(page.getByLabel('Gene Symbols')).toHaveValue('TP53 BAD$')
  await page.getByLabel('Gene Symbols').fill('tp53 TP53 mdm2')
  await page.getByRole('button', { name: 'Analyze', exact: true }).click()
  await expect.poll(() => analyses.length).toBeGreaterThan(0)
  expect(analyses.at(-1).genes).toEqual(['TP53', 'MDM2'])
})
test('over-cap recipe update preserves input and never dispatches analysis', async ({ page }) => {
  const analyses = await setup(page)
  const value = draft()
  value.selectedEvidence = Array.from({ length: 100 }, (_, i) => ({ schemaVersion: 1, pair: ['MDM2', 'TP53'], sentenceId: String(i + 1), pmid: '123', sentenceText: 'a'.repeat(20000), scores: [], inoAnnotations: [{ inoId: null, matchingPhrase: 'b'.repeat(500) }], origin: null, sourceRevision: null, modelVersion: null, fetchedAt: '2026-10-29T00:00:00.000Z' }))
  expect(Buffer.byteLength(JSON.stringify(value))).toBeLessThan(2 * 1024 * 1024)
  await restore(page, value)
  await spa(page, 'enrichment')
  const genes = Array.from({ length: 500 }, (_, i) => `G${String(i).padStart(59, '0')}`).join(' ')
  await page.getByLabel('Gene Symbols').fill(genes)
  await page.getByRole('button', { name: 'Analyze', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Analysis was not started')
  expect(analyses).toHaveLength(0)
  expect(await page.getByLabel('Gene Symbols').inputValue()).toBe(genes)
})
