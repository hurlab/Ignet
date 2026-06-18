// Display-side cleanup for mined drug/disease (HDO/DrugBank) term groupings.
// The pipeline stores co-occurring term SETS as comma-joined strings, e.g.
// "covid-19, disease, severe acute respiratory syndrome, syndrome". For display
// we drop generic noise tokens and de-duplicate, while keeping the full original
// string available for the tooltip. Falls back to the original if everything
// would be stripped.

const NOISE_TOKENS = new Set([
  'disease', 'diseases', 'syndrome', 'syndromes', 'disorder', 'disorders',
])

export function cleanTermLabel(term) {
  if (!term || typeof term !== 'string') return term
  const seen = new Set()
  const out = []
  for (const raw of term.split(',')) {
    const part = raw.trim()
    if (!part) continue
    const low = part.toLowerCase()
    if (NOISE_TOKENS.has(low) || seen.has(low)) continue
    seen.add(low)
    out.push(part)
  }
  return out.length ? out.join(', ') : term
}
