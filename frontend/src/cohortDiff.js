// Pure logic for the N-cohort differential network (SPEC-COHORT-003/004).
// Extracted from Dignet.jsx so it can be unit-tested without the component.
import { lerpColor } from './networkColors.js'

// Two-cohort membership colors: unique to cohort A, unique to B, or shared.
export const COHORT_COLORS = { 'A-only': '#2563eb', 'B-only': '#dc2626', shared: '#7c3aed' }

export function pairKey(g1, g2) {
  return g1 < g2 ? `${g1}|${g2}` : `${g2}|${g1}`
}

// Generalized merge (SPEC-COHORT-004): merge N server-aggregated edge sets into
// one differential edge list. Per unordered gene pair, records the per-cohort
// weights (array of length N, 0 where absent), the membership set of cohort
// indices, and the shared count. `cohortEdgeSets` is an array of N edge arrays.
export function mergeCohorts(cohortEdgeSets) {
  const n = cohortEdgeSets.length
  const map = new Map()
  cohortEdgeSets.forEach((edges, idx) => {
    for (const e of edges || []) {
      const k = pairKey(e.gene1, e.gene2)
      let v = map.get(k)
      if (!v) {
        v = { gene1: e.gene1, gene2: e.gene2, weights: new Array(n).fill(0), members: [] }
        map.set(k, v)
      }
      if (v.weights[idx] === 0) v.members.push(idx)
      v.weights[idx] = e.evidence_count ?? 1
    }
  })
  const out = []
  for (const v of map.values()) {
    out.push({ ...v, sharedCount: v.members.length, weight: Math.max(...v.weights) })
  }
  return out
}

// Two-cohort merge (SPEC-COHORT-003 contract, preserved). Delegates to
// mergeCohorts and re-derives the A-only / B-only / shared label so the legacy
// view and cohortDiff.test.js stay unchanged.
export function mergeCohortEdges(edgesA, edgesB) {
  return mergeCohorts([edgesA, edgesB]).map((v) => {
    const inA = v.weights[0] > 0
    const inB = v.weights[1] > 0
    const membership = inA && inB ? 'shared' : inA ? 'A-only' : 'B-only'
    return { gene1: v.gene1, gene2: v.gene2, weightA: v.weights[0], weightB: v.weights[1], membership, weight: v.weight }
  })
}

// Graded edge color by how many of the N cohorts share an edge: light (unique to
// one) -> deep purple (shared by all).
export function sharedCountColor(count, n) {
  if (n <= 1) return '#7c3aed'
  const t = Math.min(1, Math.max(0, (count - 1) / (n - 1)))
  return lerpColor('#93c5fd', '#4c1d95', t)
}

// Build cytoscape elements from N-cohort differential edges, coloring each edge
// by its shared count (carried in ino_color so NetworkGraph styles it).
export function buildNCohortElements(diffEdges, n) {
  if (!diffEdges || diffEdges.length === 0) return []
  const genes = new Set()
  const edges = diffEdges.map((e) => {
    genes.add(e.gene1)
    genes.add(e.gene2)
    return {
      data: {
        id: `e_${pairKey(e.gene1, e.gene2)}`,
        source: e.gene1,
        target: e.gene2,
        weight: e.weight,
        ino_category: `${e.sharedCount}/${n} cohorts`,
        ino_color: sharedCountColor(e.sharedCount, n),
      },
    }
  })
  const degrees = {}
  edges.forEach(({ data: { source, target } }) => {
    degrees[source] = (degrees[source] ?? 0) + 1
    degrees[target] = (degrees[target] ?? 0) + 1
  })
  const maxDeg = Math.max(1, ...Object.values(degrees))
  const nodes = [...genes].map((g) => ({
    data: { id: g, label: g, degree: degrees[g] ?? 1, highDegree: (degrees[g] ?? 1) > maxDeg * 0.6, centrality_d: 0 },
  }))
  return [...nodes, ...edges]
}

// Build cytoscape elements from differential edges. Edge color = membership color
// (carried in ino_color so NetworkGraph's existing edge styling renders it; node
// color schemes from SPEC-COHORT-002 still operate on the gene nodes).
export function buildCohortDiffElements(diffEdges) {
  if (!diffEdges || diffEdges.length === 0) return []
  const genes = new Set()
  const edges = diffEdges.map((e) => {
    genes.add(e.gene1)
    genes.add(e.gene2)
    return {
      data: {
        id: `e_${pairKey(e.gene1, e.gene2)}`,
        source: e.gene1,
        target: e.gene2,
        weight: e.weight,
        ino_category: e.membership,
        ino_color: COHORT_COLORS[e.membership],
      },
    }
  })
  const degrees = {}
  edges.forEach(({ data: { source, target } }) => {
    degrees[source] = (degrees[source] ?? 0) + 1
    degrees[target] = (degrees[target] ?? 0) + 1
  })
  const maxDeg = Math.max(1, ...Object.values(degrees))
  const nodes = [...genes].map((g) => ({
    data: { id: g, label: g, degree: degrees[g] ?? 1, highDegree: (degrees[g] ?? 1) > maxDeg * 0.6, centrality_d: 0 },
  }))
  return [...nodes, ...edges]
}
