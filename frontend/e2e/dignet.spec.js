import { test, expect } from '@playwright/test'
import { NFE2L2_PMIDS } from './fixtures.js'

// Build a PMID-mode Dignet network once, then assert on its entity sidebar.
async function buildNetwork(page) {
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

  // Relative (no leading slash) so it resolves under the baseURL's /ignet path.
  await page.goto('dignet', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /PMID/i }).first().click()
  await page.locator('textarea').first().fill(NFE2L2_PMIDS)
  await page.getByRole('button', { name: /search/i }).first().click()
  await page.waitForSelector('canvas', { timeout: 120_000 })
  await page.waitForTimeout(5000)
  return errors
}

// Geometry of every entity toggle: the knob (an absolutely-positioned span)
// must stay inside its track in BOTH states. Regression guard for the bug where
// the ON-state knob escaped the track and covered its label's first character.
async function toggleGeometry(page) {
  return page.evaluate(() => {
    const rows = []
    for (const sw of document.querySelectorAll('[role="switch"]')) {
      const lbl = document.getElementById(sw.getAttribute('aria-labelledby'))
      const knob = sw.querySelector('span')
      if (!lbl || !knob) continue
      const t = sw.getBoundingClientRect()
      const k = knob.getBoundingClientRect()
      const l = lbl.getBoundingClientRect()
      rows.push({
        label: lbl.textContent.trim(),
        checked: sw.getAttribute('aria-checked'),
        knobPastTrack: +(k.right - t.right).toFixed(1),
        knobOverLabel: +(k.right - l.left).toFixed(1),
      })
    }
    return rows
  })
}

test('entity toggles: knob stays inside the track and never covers its label', async ({ page }) => {
  await buildNetwork(page)

  // Drugs/Diseases/Vaccines default ON; INO/CoV/ontology default OFF — so this
  // exercises both knob positions in one pass.
  const rows = await toggleGeometry(page)
  expect(rows.length, 'entity toggles rendered').toBeGreaterThanOrEqual(5)

  for (const r of rows) {
    expect(r.knobPastTrack, `"${r.label}" (${r.checked}) knob past track edge`).toBeLessThanOrEqual(0)
    expect(r.knobOverLabel, `"${r.label}" (${r.checked}) knob over label`).toBeLessThan(0)
  }
})

test('entity sidebar exposes Drugs, Diseases, Vaccines and Gene-ontology controls', async ({ page }) => {
  await buildNetwork(page)
  const labels = (await toggleGeometry(page)).map((r) => r.label)

  expect(labels).toEqual(
    expect.arrayContaining(['Drugs', 'Diseases', 'Vaccines', 'INO Types', 'CoV proteins'])
  )
  await expect(page.locator('#toggle-ontology')).toHaveCount(1)
})

// The "Edges: N" chip renders the label and its value in sibling spans, so read
// the whole chip and pull the number out.
async function edgeCount(page) {
  const txt = await page.getByText('Edges:').locator('..').innerText()
  const m = txt.replace(/,/g, '').match(/Edges:\s*(\d+)/i)
  return m ? Number(m[1]) : null
}

test('gene-ontology overlay loads on demand and adds real co-occurrence edges', async ({ page }) => {
  const errors = await buildNetwork(page)

  const before = await edgeCount(page)
  expect(before, 'edge count is a number before overlay').toBeGreaterThan(0)

  await page.locator('#toggle-ontology').click()
  await expect(page.locator('#toggle-ontology')).toHaveAttribute('aria-checked', 'true')
  // Sidebar reports the annotated-paper denominator once the overlay resolves.
  await expect(page.locator('#label-ontology').locator('xpath=../..'))
    .toContainText(/annotated papers/i, { timeout: 30_000 })

  await page.waitForTimeout(4000)
  const after = await edgeCount(page)
  expect(after, `edge count changed after overlay (${before} -> ${after})`).not.toEqual(before)
  expect(errors, 'no console errors').toEqual([])
})

test('INO types load only when toggled', async ({ page }) => {
  await buildNetwork(page)

  const inoSwitch = page.locator('[role="switch"][aria-labelledby="label-ino"]')
  await expect(inoSwitch).toHaveAttribute('aria-checked', 'false')

  await inoSwitch.click()
  await expect(page.locator('text=/INO Types \\(\\d+\\)/i').first()).toBeVisible({ timeout: 30_000 })
})
