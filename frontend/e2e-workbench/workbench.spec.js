import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { Buffer } from 'node:buffer'

const experiment = 'gene,log2FC,padj\nTP53,-1.23456789,0.0314159\nMDM2,2.7182818,0.0002718'
const network = {
  input_genes: ['TP53', 'MDM2'], coverage: 2, coverage_pct: 100, total_interactions: 1,
  interactions: [{ gene1: 'TP53', gene2: 'MDM2', evidence_count: 3, unique_pmids: 2, max_score: 0.9 }],
  ino_distribution: [], drugs: [], diseases: [],
}

async function mockApi(page, options = {}) {
  const requests = []
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    return url.hostname === '127.0.0.1' ? route.continue() : route.abort()
  })
  await page.route('**/api/v1/**', async route => {
    const request = route.request()
    requests.push({ url: request.url(), body: request.postData() || '' })
    const url = new URL(request.url())
    let body = {}
    if (url.pathname.endsWith('/stats')) body = { data_last_updated: '2026-10-28' }
    else if (url.pathname.includes('/enrichment') && url.pathname.includes('stream')) {
      return route.fulfill({ status: 503, json: { message: 'Use fixture fallback' } })
    } else if (url.pathname.endsWith('/enrichment/analyze')) {
      if (options.onAnalysis) return options.onAnalysis(route)
      body = network
    } else if (url.pathname.includes('/trends')) body = { trends: [] }
    else if (/\/pairs\/[^/]+\/[^/]+$/.test(url.pathname)) {
      const second = Number(url.searchParams.get('page') || 1) === 2
      body = {
        data: { gene1: 'TP53', gene2: 'MDM2', page: second ? 2 : 1, per_page: 50 },
        total: 51,
        interactions: Array.from({ length: second ? 1 : 50 }, (_, i) => ({
          id: second ? 51 : i + 1, sentence_id: second ? 151 : 100 + i,
          pmid: second ? 13 : 12, score: 0.8,
          sentence_text: second ? 'Second paper: TP53 and MDM2.' : `Evidence ${i + 1}: TP53 and MDM2 — exact text.`,
          ino_annotations: [{ ino_id: 'INO:1', matching_phrase: 'interaction' }],
        })),
      }
    }
    return route.fulfill({ json: body })
  })
  return requests
}

async function importExperiment(page) {
  await page.goto('geneset')
  await page.getByLabel('Experiment CSV or TSV', { exact: true }).fill(experiment)
  await page.getByRole('button', { name: 'Preview experiment', exact: true }).click()
  await page.getByRole('button', { name: 'Apply experiment', exact: true }).click()
}

async function openWorkspaces(page) {
  const menu = page.getByRole('button', { name: 'Gene Sets', exact: true })
  await menu.hover()
  await page.getByRole('menuitem', { name: /^Workspaces / }).click()
}

test('experiment values stay local; explicit workspace save survives reload and exports exact values', async ({ page }) => {
  const requests = await mockApi(page)
  await importExperiment(page)
  // Applying a private experiment must not silently save it.
  expect(await page.evaluate(() => Object.values(localStorage).join(''))).not.toContain('1.23456789')
  await page.getByRole('button', { name: 'Analyze these genes', exact: true }).click()
  await expect(page).toHaveURL(/\/enrichment$/)
  expect(requests.filter(r => r.url.endsWith('/enrichment/analyze'))).toHaveLength(0)
  await page.getByRole('button', { name: 'Analyze', exact: true }).click()
  await expect(page.getByLabel('Color genes by experimental log2FC')).toBeVisible()
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('div')].some(el => el._cyreg?.cy))).toBe(true)
  // Wait for the existing mount fit/animated layout before testing a user view.
  await page.waitForFunction(() => {
    const cy = [...document.querySelectorAll('div')].find(el => el._cyreg?.cy)?._cyreg.cy
    if (!cy) return false
    const value = JSON.stringify({ pan: cy.pan(), zoom: cy.zoom() })
    if (window.workbenchLastView !== value) {
      window.workbenchLastView = value
      window.workbenchStableSince = performance.now()
    }
    return performance.now() - window.workbenchStableSince > 250 && !cy.animated() && cy.nodes().every(n => !n.animated())
  })
  const geometry = await page.evaluate(() => {
    const cy = [...document.querySelectorAll('div')].find(el => el._cyreg?.cy)._cyreg.cy
    cy.stop()
    cy.nodes().stop()
    cy.nodes().positions((node, index) => ({ x: 100 + index * 100, y: 100 }))
    cy.zoom(1.2)
    cy.pan({ x: 30, y: 45 })
    cy.edges().first().select()
    return { positions: cy.nodes().map(n => n.position()), zoom: cy.zoom(), pan: cy.pan(), selected: cy.$(':selected').map(e => e.id()), edges: cy.edges().map(e => e.data()) }
  })
  await page.getByLabel('Color genes by experimental log2FC').check()
  await expect(page.getByLabel('log2FC color limit')).toBeVisible()
  const afterOverlay = await page.evaluate(() => {
    const cy = [...document.querySelectorAll('div')].find(el => el._cyreg?.cy)._cyreg.cy
    return { positions: cy.nodes().map(n => n.position()), zoom: cy.zoom(), pan: cy.pan(), selected: cy.$(':selected').map(e => e.id()), edges: cy.edges().map(e => e.data()) }
  })
  expect(afterOverlay).toEqual(geometry)
  for (const request of requests) {
    expect(request.url + request.body).not.toContain('1.23456789')
    expect(request.url + request.body).not.toContain('0.0314159')
  }
  await openWorkspaces(page)
  await page.getByLabel('Workspace name', { exact: true }).fill('Experiment review')
  await page.getByRole('button', { name: 'Save workspace', exact: true }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Load Experiment review', exact: true }).click()
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export current workspace', exact: true }).click()
  const download = await downloadEvent
  const saved = JSON.parse(await readFile(await download.path(), 'utf8'))
  expect(saved.experiment.rows[0]).toMatchObject({ gene: 'TP53', log2FC: -1.23456789, padj: 0.0314159 })
  expect(saved.recipe.display.colorScheme).toBe('experiment')
  await page.screenshot({ path: '/tmp/ignet-workbench-workspace.png', fullPage: true })
})

test('paper-grouped review loads another server page and exports selected exact excerpts', async ({ page }) => {
  const requests = await mockApi(page)
  await page.goto('genepair?gene1=TP53&gene2=MDM2')
  await expect(page.getByRole('heading', { name: 'Review evidence', exact: true })).toBeVisible()
  await page.getByRole('checkbox', { name: 'Select evidence 1 from PMID 12', exact: true }).check()
  await page.getByRole('button', { name: 'Load next page', exact: true }).click()
  await page.getByRole('checkbox', { name: 'Select evidence 1 from PMID 13', exact: true }).check()
  expect(requests.some(r => new URL(r.url).searchParams.get('page') === '2')).toBe(true)
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export selected JSON', exact: true }).click()
  const download = await downloadEvent
  const text = await readFile(await download.path(), 'utf8')
  expect(text).toContain('Evidence 1: TP53 and MDM2 — exact text.')
  expect(text).toContain('Second paper: TP53 and MDM2.')
  await openWorkspaces(page)
  await page.locator('summary').filter({ hasText: 'PMID 13' }).click()
  await expect(page.getByText('Second paper: TP53 and MDM2.', { exact: true })).toBeVisible()
})

test('import restores inputs without querying and a late fallback cannot overwrite the restored workspace', async ({ page }) => {
  let release, started, fulfilled
  const gate = new Promise(resolve => { release = resolve })
  const requestStarted = new Promise(resolve => { started = resolve })
  const requestFulfilled = new Promise(resolve => { fulfilled = resolve })
  const requests = await mockApi(page, { onAnalysis: async route => {
    started()
    await gate
    await route.fulfill({ json: network })
    fulfilled()
  } })
  await page.goto('enrichment?genes=TP53,MDM2')
  await requestStarted
  await openWorkspaces(page)
  const restored = {
    format: 'ignet-workspace', version: 1, id: 'restored-test', name: 'Restored recipe',
    createdAt: '2026-10-28T00:00:00.000Z', updatedAt: '2026-10-28T00:00:00.000Z',
    recipe: { genes: ['BRCA1', 'EGFR'], pair: null, display: { colorScheme: 'none', log2FCMax: 2 } },
    experiment: null, selectedEvidence: [],
  }
  await page.getByLabel('Import workspace file', { exact: true }).setInputFiles({
    name: 'restored.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(restored)),
  })
  await page.getByRole('button', { name: 'Preview import', exact: true }).click()
  await page.getByRole('button', { name: 'Replace current workspace', exact: true }).click()
  await page.getByRole('link', { name: 'Open enrichment inputs', exact: true }).click()
  const input = page.getByRole('textbox', { name: /Gene Symbols/ })
  await expect(input).toHaveValue('BRCA1\nEGFR')
  release()
  await requestFulfilled
  await expect(input).toHaveValue('BRCA1\nEGFR')
  await expect(page.getByText('Genes Found', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Analyze', exact: true })).toBeEnabled()
  expect(requests.filter(r => r.url.endsWith('/enrichment/analyze'))).toHaveLength(1)
})
