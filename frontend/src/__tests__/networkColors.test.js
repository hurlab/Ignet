import { describe, it, expect } from 'vitest'
import { lerpColor, degreeColor, isGeneNodeData, geneNodeIds, DEGREE_LOW, DEGREE_HIGH } from '../networkColors.js'

describe('lerpColor', () => {
  it('returns the endpoints at t=0 and t=1', () => {
    expect(lerpColor('#000000', '#ffffff', 0)).toBe('#000000')
    expect(lerpColor('#000000', '#ffffff', 1)).toBe('#ffffff')
  })
  it('interpolates the midpoint', () => {
    expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('#808080')
  })
})

describe('degreeColor', () => {
  it('maps min degree to the low color and max to the high color', () => {
    expect(degreeColor(1, 1, 10)).toBe(DEGREE_LOW)
    expect(degreeColor(10, 1, 10)).toBe(DEGREE_HIGH)
  })
  it('clamps out-of-range and handles a flat range', () => {
    expect(degreeColor(0, 1, 10)).toBe(DEGREE_LOW)
    expect(degreeColor(99, 1, 10)).toBe(DEGREE_HIGH)
    expect(degreeColor(5, 5, 5)).toBe(DEGREE_LOW) // span guarded to >= 1
  })
})

describe('isGeneNodeData / geneNodeIds', () => {
  it('treats nodes without source/nodeType as gene nodes', () => {
    expect(isGeneNodeData({ id: 'TP53' })).toBe(true)
    expect(isGeneNodeData({ id: 'd', nodeType: 'drug' })).toBe(false)
    expect(isGeneNodeData({ source: 'A', target: 'B' })).toBe(false)
  })
  it('extracts only gene-node ids from a mixed element list', () => {
    const els = [
      { data: { id: 'TP53' } },
      { data: { id: 'aspirin', nodeType: 'drug' } },
      { data: { id: 'BRCA1' } },
      { data: { id: 'e1', source: 'TP53', target: 'BRCA1' } },
    ]
    expect(geneNodeIds(els).sort()).toEqual(['BRCA1', 'TP53'])
  })
})
