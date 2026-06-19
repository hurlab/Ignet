import { describe, it, expect } from 'vitest'
import {
  pairKey, mergeCohortEdges, buildCohortDiffElements, COHORT_COLORS,
  mergeCohorts, sharedCountColor, buildNCohortElements,
} from '../cohortDiff.js'

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

describe('mergeCohorts (N cohorts, SPEC-COHORT-004)', () => {
  // 3 cohorts. TP53-BRCA1 in all three; IL6-TNF in cohorts 0 & 2; EGFR-KRAS only in 1.
  const sets = [
    [{ gene1: 'TP53', gene2: 'BRCA1', evidence_count: 5 }, { gene1: 'IL6', gene2: 'TNF', evidence_count: 3 }],
    [{ gene1: 'BRCA1', gene2: 'TP53', evidence_count: 2 }, { gene1: 'EGFR', gene2: 'KRAS', evidence_count: 4 }],
    [{ gene1: 'TP53', gene2: 'BRCA1', evidence_count: 1 }, { gene1: 'TNF', gene2: 'IL6', evidence_count: 7 }],
  ]
  const merged = mergeCohorts(sets)
  const by = Object.fromEntries(merged.map(e => [pairKey(e.gene1, e.gene2), e]))

  it('records per-cohort weights, membership set, and shared count', () => {
    expect(by['BRCA1|TP53'].weights).toEqual([5, 2, 1])
    expect(by['BRCA1|TP53'].members.sort()).toEqual([0, 1, 2])
    expect(by['BRCA1|TP53'].sharedCount).toBe(3)
    expect(by['IL6|TNF'].weights).toEqual([3, 0, 7])
    expect(by['IL6|TNF'].sharedCount).toBe(2)
    expect(by['EGFR|KRAS'].members).toEqual([1])
    expect(by['EGFR|KRAS'].sharedCount).toBe(1)
  })
  it('weight is the max across cohorts', () => {
    expect(by['IL6|TNF'].weight).toBe(7)
  })
})

describe('mergeCohortEdges delegates to mergeCohorts (N=2 backward compat, AC3)', () => {
  it('still yields A-only/B-only/shared with weightA/weightB', () => {
    const out = mergeCohortEdges(
      [{ gene1: 'TP53', gene2: 'BRCA1', evidence_count: 5 }],
      [{ gene1: 'BRCA1', gene2: 'TP53', evidence_count: 2 }, { gene1: 'EGFR', gene2: 'KRAS', evidence_count: 4 }],
    )
    const by = Object.fromEntries(out.map(e => [pairKey(e.gene1, e.gene2), e]))
    expect(by['BRCA1|TP53']).toMatchObject({ membership: 'shared', weightA: 5, weightB: 2 })
    expect(by['EGFR|KRAS']).toMatchObject({ membership: 'B-only', weightA: 0, weightB: 4 })
  })
})

describe('sharedCountColor', () => {
  it('maps count 1 to the light end and count N to the deep end', () => {
    expect(sharedCountColor(1, 4)).toBe('#93c5fd')
    expect(sharedCountColor(4, 4)).toBe('#4c1d95')
  })
  it('is monotone between the ends', () => {
    const c2 = sharedCountColor(2, 4)
    expect(c2).not.toBe('#93c5fd')
    expect(c2).not.toBe('#4c1d95')
  })
})

describe('buildNCohortElements', () => {
  it('colors edges by shared count and labels them n/N', () => {
    const merged = mergeCohorts([
      [{ gene1: 'A', gene2: 'B', evidence_count: 1 }],
      [{ gene1: 'A', gene2: 'B', evidence_count: 1 }, { gene1: 'C', gene2: 'D', evidence_count: 2 }],
      [{ gene1: 'A', gene2: 'B', evidence_count: 1 }],
    ])
    const els = buildNCohortElements(merged, 3)
    const edges = els.filter(e => e.data.source)
    const ab = edges.find(e => e.data.id === 'e_A|B')
    const cd = edges.find(e => e.data.id === 'e_C|D')
    expect(ab.data.ino_category).toBe('3/3 cohorts')
    expect(ab.data.ino_color).toBe(sharedCountColor(3, 3))
    expect(cd.data.ino_category).toBe('1/3 cohorts')
  })
})
