// Pure logic for the two-cohort differential network (SPEC-COHORT-003).
// Extracted from Dignet.jsx so it can be unit-tested without the component.

// Edge membership colors: unique to cohort A, unique to B, or shared by both.
export const COHORT_COLORS = { 'A-only': '#2563eb', 'B-only': '#dc2626', shared: '#7c3aed' }

export function pairKey(g1, g2) {
  return g1 < g2 ? `${g1}|${g2}` : `${g2}|${g1}`
}

// Merge two server-aggregated edge sets into one differential edge list, tagging
// each unordered gene pair A-only / B-only / shared.
export function mergeCohortEdges(edgesA, edgesB) {
  const map = new Map()
  for (const e of edgesA || []) {
    map.set(pairKey(e.gene1, e.gene2),
      { gene1: e.gene1, gene2: e.gene2, weightA: e.evidence_count ?? 1, weightB: 0 })
  }
  for (const e of edgesB || []) {
    const k = pairKey(e.gene1, e.gene2)
    const ex = map.get(k)
    if (ex) ex.weightB = e.evidence_count ?? 1
    else map.set(k, { gene1: e.gene1, gene2: e.gene2, weightA: 0, weightB: e.evidence_count ?? 1 })
  }
  const out = []
  for (const v of map.values()) {
    const membership = v.weightA > 0 && v.weightB > 0 ? 'shared' : v.weightA > 0 ? 'A-only' : 'B-only'
    out.push({ ...v, membership, weight: Math.max(v.weightA, v.weightB) })
  }
  return out
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
