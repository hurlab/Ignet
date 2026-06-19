// Pure color helpers for NetworkGraph node color schemes (SPEC-COHORT-002).
// Extracted from NetworkGraph.jsx so the math is unit-testable without cytoscape.

export const SPECIES_COLORS = { host: '#1e3a5f', pathogen: '#0694a2' }
export const DEGREE_LOW = '#bfdbfe'
export const DEGREE_HIGH = '#1e3a5f'
export const INO_FALLBACK = '#cbd5e0'
export const FUNC_FALLBACK = '#c7c7c7' // matches the "Other" bucket color

// A gene node carries no nodeType (entity nodes set drug/disease/ino/cov).
export function isGeneNodeData(d) {
  return !d.source && !d.nodeType
}

export function geneNodeIds(elements) {
  return (elements || []).filter(e => isGeneNodeData(e.data)).map(e => e.data.id)
}

export function lerpColor(a, b, t) {
  const ah = a.replace('#', ''), bh = b.replace('#', '')
  const ar = parseInt(ah.slice(0, 2), 16), ag = parseInt(ah.slice(2, 4), 16), ab = parseInt(ah.slice(4, 6), 16)
  const br = parseInt(bh.slice(0, 2), 16), bg = parseInt(bh.slice(2, 4), 16), bb = parseInt(bh.slice(4, 6), 16)
  const r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bg - ag) * t), bl = Math.round(ab + (bb - ab) * t)
  return `#${[r, g, bl].map(x => x.toString(16).padStart(2, '0')).join('')}`
}

export function degreeColor(degree, minDeg, maxDeg) {
  const span = Math.max(maxDeg - minDeg, 1)
  return lerpColor(DEGREE_LOW, DEGREE_HIGH, Math.min(1, Math.max(0, (degree - minDeg) / span)))
}
