import { describe, it, expect } from 'vitest'
import { getCollisionWarning, collisionTooltip } from '../speciesUtils.js'

describe('getCollisionWarning', () => {
  it('flags known SARS / NSP collision symbols (case-insensitive)', () => {
    expect(getCollisionWarning('SARS')).toBeTruthy()
    expect(getCollisionWarning('sars')).toBeTruthy()
    expect(getCollisionWarning('SH2D3A')).toBeTruthy()
    expect(getCollisionWarning('BCAR3')).toBeTruthy()
  })
  it('returns null for non-colliding or invalid symbols', () => {
    expect(getCollisionWarning('TP53')).toBeNull()
    expect(getCollisionWarning('')).toBeNull()
    expect(getCollisionWarning(null)).toBeNull()
  })
})

describe('collisionTooltip', () => {
  it('builds an explanatory string for a colliding symbol', () => {
    const t = collisionTooltip('SARS')
    expect(t).toMatch(/human gene SARS/)
    expect(t).toMatch(/SARS-CoV/)
  })
  it('returns empty string for a non-colliding symbol', () => {
    expect(collisionTooltip('TP53')).toBe('')
  })
})
