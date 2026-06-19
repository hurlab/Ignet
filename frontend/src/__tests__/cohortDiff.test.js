import { describe, it, expect } from 'vitest'
import { pairKey, mergeCohortEdges, buildCohortDiffElements, COHORT_COLORS } from '../cohortDiff.js'

describe('pairKey', () => {
  it('is order-independent', () => {
    expect(pairKey('TP53', 'BRCA1')).toBe(pairKey('BRCA1', 'TP53'))
    expect(pairKey('A', 'B')).toBe('A|B')
  })
})

describe('mergeCohortEdges', () => {
  const A = [{ gene1: 'TP53', gene2: 'BRCA1', evidence_count: 5 }, { gene1: 'IL6', gene2: 'TNF', evidence_count: 3 }]
  const B = [{ gene1: 'BRCA1', gene2: 'TP53', evidence_count: 2 }, { gene1: 'EGFR', gene2: 'KRAS', evidence_count: 4 }]
  const merged = mergeCohortEdges(A, B)
  const by = Object.fromEntries(merged.map(e => [pairKey(e.gene1, e.gene2), e]))

  it('tags an edge in both cohorts as shared with both weights', () => {
    expect(by['BRCA1|TP53'].membership).toBe('shared')
    expect(by['BRCA1|TP53'].weightA).toBe(5)
    expect(by['BRCA1|TP53'].weightB).toBe(2)
  })
  it('tags cohort-unique edges A-only / B-only', () => {
    expect(by['IL6|TNF'].membership).toBe('A-only')
    expect(by['IL6|TNF'].weightB).toBe(0)
    expect(by['EGFR|KRAS'].membership).toBe('B-only')
    expect(by['EGFR|KRAS'].weightA).toBe(0)
  })
  it('produces the union of edges', () => {
    expect(merged).toHaveLength(3)
  })
  it('handles empty / missing inputs', () => {
    expect(mergeCohortEdges([], [])).toEqual([])
    expect(mergeCohortEdges(null, null)).toEqual([])
    expect(mergeCohortEdges(A, [])).toHaveLength(2)
  })
})

describe('buildCohortDiffElements', () => {
  it('colors edges by membership and builds the gene node set', () => {
    const diff = mergeCohortEdges(
      [{ gene1: 'TP53', gene2: 'BRCA1', evidence_count: 5 }],
      [{ gene1: 'BRCA1', gene2: 'TP53', evidence_count: 2 }, { gene1: 'EGFR', gene2: 'KRAS', evidence_count: 4 }],
    )
    const els = buildCohortDiffElements(diff)
    const nodes = els.filter(e => !e.data.source)
    const edges = els.filter(e => e.data.source)
    expect(nodes.map(n => n.data.id).sort()).toEqual(['BRCA1', 'EGFR', 'KRAS', 'TP53'])
    expect(edges).toHaveLength(2)
    const shared = edges.find(e => e.data.ino_category === 'shared')
    expect(shared.data.ino_color).toBe(COHORT_COLORS.shared)
  })
  it('returns [] for no edges', () => {
    expect(buildCohortDiffElements([])).toEqual([])
  })
})
