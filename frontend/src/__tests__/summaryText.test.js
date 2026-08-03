import { describe, it, expect } from 'vitest'
import { extractSummaryText } from '../summaryText.js'

// The exact envelope the live service returned for IFNG, trimmed. The bug was
// that Gene.jsx rendered this whole object; the first test is the regression.
const LIVE_ENVELOPE = {
  Summary: {
    conversation_history: [
      { role: 'system', content: 'You are a helpful assistant discussing biomedical literature.' },
      { role: 'user', content: 'Summarize the provided data' },
      { role: 'assistant', content: 'IFNG is frequently mentioned...' },
    ],
    reply: 'IFNG is frequently mentioned...',
  },
  entities: {
    diseases: [{ count: 23, term: 'melanoma' }],
    drugs: [{ count: 76, term: 'il-4' }],
    genes: [{ count: 62, term: 'IFNG, TNF' }],
  },
}

describe('extractSummaryText', () => {
  it('pulls reply out of the live Summary envelope', () => {
    expect(extractSummaryText(LIVE_ENVELOPE)).toBe('IFNG is frequently mentioned...')
  })

  it('never returns conversation_history or entity counts', () => {
    const out = extractSummaryText(LIVE_ENVELOPE)
    expect(out).not.toMatch(/conversation_history|melanoma|role/)
  })

  it('prefers data.reply over Summary.reply when a response carries both', () => {
    expect(extractSummaryText({ data: { reply: 'wrapped' }, Summary: { reply: 'inner' } }))
      .toBe('wrapped')
  })

  it('accepts the flatter shapes other callers see', () => {
    expect(extractSummaryText({ reply: 'r' })).toBe('r')
    expect(extractSummaryText({ summary: 's' })).toBe('s')
    expect(extractSummaryText({ text: 't' })).toBe('t')
  })

  it('passes a bare string through', () => {
    expect(extractSummaryText('already text')).toBe('already text')
  })

  it('returns null rather than an object when the shape moves again', () => {
    expect(extractSummaryText({ Summary: { reply: { nested: 'oops' } } })).toBe(null)
    expect(extractSummaryText({ entities: {} })).toBe(null)
    expect(extractSummaryText(null)).toBe(null)
    expect(extractSummaryText(undefined)).toBe(null)
  })

  it('treats blank text as absent so the caller can show an error', () => {
    expect(extractSummaryText({ Summary: { reply: '   ' } })).toBe(null)
  })
})
