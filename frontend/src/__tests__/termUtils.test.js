import { describe, it, expect } from 'vitest'
import { cleanTermLabel } from '../termUtils.js'

describe('cleanTermLabel', () => {
  it('drops generic noise tokens and de-duplicates', () => {
    expect(cleanTermLabel('covid-19, disease, severe acute respiratory syndrome, syndrome'))
      .toBe('covid-19, severe acute respiratory syndrome')
  })
  it('de-duplicates case-insensitively while keeping first casing', () => {
    expect(cleanTermLabel('Cancer, cancer, CANCER')).toBe('Cancer')
  })
  it('falls back to the original when everything would be stripped', () => {
    expect(cleanTermLabel('disease, syndrome')).toBe('disease, syndrome')
  })
  it('passes through non-strings unchanged', () => {
    expect(cleanTermLabel(null)).toBe(null)
    expect(cleanTermLabel(undefined)).toBe(undefined)
  })
})
