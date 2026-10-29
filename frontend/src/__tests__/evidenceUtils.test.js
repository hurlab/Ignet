import { describe, expect, it } from 'vitest'
import { evidenceKey, validateEvidenceSnapshot, normalizeEvidence, prepareEvidenceReview, groupEvidence, evidenceCSV } from '../evidenceUtils.js'

const snapshot = () => ({ schemaVersion: 1, pair: ['B', 'A'], sentenceId: '1', pmid: '12', sentenceText: 'α binds β.', scores: [0.8], inoAnnotations: [], origin: null, sourceRevision: null, modelVersion: null, fetchedAt: '2026-10-29T00:00:00Z' })

describe('trusted evidence snapshots', () => {
  it('reconstructs canonical identity, retaining exact text differences', () => {
    const value = validateEvidenceSnapshot(snapshot())
    expect(value.pair).toEqual(['A', 'B'])
    expect(evidenceKey(value)).toBe(evidenceKey({ ...value, pair: ['B', 'A'] }))
    expect(evidenceKey(value)).not.toBe(evidenceKey({ ...value, sentenceText: value.sentenceText + ' ' }))
  })
  it('rejects unknown fields, malformed metadata, oversized text and invalid scores', () => {
    for (const bad of [{ key: 'forged' }, { scores: [NaN] }, { scores: [1.1] }, { sentenceText: 'a'.repeat(20001) }, { origin: 'body' }, { fetchedAt: 'yesterday' }, { pmid: '=SUM(1)' }]) {
      expect(() => validateEvidenceSnapshot({ ...snapshot(), ...bad })).toThrow()
    }
  })
  it('accepts the API gene-symbol boundary while rejecting longer symbols', () => {
    expect(validateEvidenceSnapshot({ ...snapshot(), pair: ['.TP53', 'A'.repeat(60)] }).pair).toEqual(['.TP53', 'A'.repeat(60)])
    expect(() => validateEvidenceSnapshot({ ...snapshot(), pair: ['B', 'A'.repeat(61)] })).toThrow()
  })
  it('merges annotations and observed score conflicts only for exact snapshots', () => {
    const rows = [
      { sentence_id: 1, pmid: 12, sentence_text: 'same', score: 0.8, matching_phrase: 'binds', ino_id: 'INO:1' },
      { sentence_id: 1, pmid: 12, sentence_text: 'same', score: 0.7, matching_phrase: 'regulates', ino_id: 'INO:2' },
      { sentence_id: 1, pmid: 12, sentence_text: 'same ', score: null },
      { sentence_id: null, pmid: null, sentence_text: null, score: Infinity },
    ]
    const result = normalizeEvidence(rows, ['B', 'A'], snapshot().fetchedAt)
    expect(result).toHaveLength(3)
    expect(result[0].scores).toEqual([0.7, 0.8])
    expect(result[0].inoAnnotations).toHaveLength(2)
    expect(groupEvidence(result).map(group => [group.pmid, group.items.length])).toEqual([['12', 2], [null, 1]])
  })
  it('exports quoted UTF-8 text safely without changing snapshot content', () => {
    const value = { ...snapshot(), sentenceText: '=SUM(1)\n"α"' }
    const csv = evidenceCSV([value])
    expect(csv).toContain('"\'=SUM(1)\n""α"""')
    expect(value.sentenceText).toBe('=SUM(1)\n"α"')
  })
  it('preserves all 101 annotations and another sentence for review and selection', () => {
    const annotations = Array.from({ length: 101 }, (_, i) => ({ ino_id: `INO:${i}`, matching_phrase: `phrase ${i}` }))
    const result = normalizeEvidence([
      { sentence_id: 1, pmid: 12, sentence_text: 'many annotations', ino_annotations: annotations },
      { sentence_id: 2, pmid: 12, sentence_text: 'another sentence', ino_annotations: [] },
    ], ['A', 'B'], snapshot().fetchedAt)
    expect(result).toHaveLength(2)
    expect(result[0].inoAnnotations).toHaveLength(101)
    expect(validateEvidenceSnapshot(result[0]).inoAnnotations.at(-1).matchingPhrase).toBe('phrase 100')
    expect(validateEvidenceSnapshot(result[1]).sentenceText).toBe('another sentence')
  })
  it('keeps an oversized annotation entry reviewable but unselectable without blanking valid evidence', () => {
    const annotations = Array.from({ length: 5001 }, (_, i) => ({ ino_id: `INO:${i}`, matching_phrase: `phrase ${i}` }))
    const review = prepareEvidenceReview([
      { sentence_id: 1, pmid: 12, sentence_text: 'oversized annotations', ino_annotations: annotations },
      { sentence_id: 2, pmid: 12, sentence_text: 'valid sentence', ino_annotations: [] },
    ], ['A', 'B'], snapshot().fetchedAt)
    expect(review.items).toHaveLength(1)
    expect(review.items[0].sentenceText).toBe('valid sentence')
    expect(review.unselectable).toHaveLength(1)
    expect(review.unselectable[0]).toMatchObject({ sentenceText: 'oversized annotations', annotationCount: 5001 })
    expect(review.unselectable[0].reason).toContain('5000')
  })
})
