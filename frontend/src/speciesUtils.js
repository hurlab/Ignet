/**
 * speciesUtils.js
 * Utilities for host-vs-pathogen species disambiguation in Ignet.
 *
 * The gene table is human (host) only. The Dignet CoV overlay adds viral
 * (SARS-CoV-2) protein nodes. A small set of human gene symbols or aliases
 * collide with viral names — this module identifies and describes those
 * collisions so the UI can warn users without discarding valid human-gene data.
 *
 * Source: docs/KNOWN_LIMITATIONS.md (curated list — do not invent new entries).
 */

// @MX:ANCHOR: [AUTO] SARS_COLLISIONS is the single source of truth for host/pathogen
// @MX:REASON: imported by Gene.jsx and potentially other report pages; changes here propagate everywhere
export const SARS_COLLISIONS = {
  SARS: {
    humanGene: 'seryl-tRNA synthetase (also known as SARS1)',
    pathogen: 'the SARS-CoV / SARS-CoV-2 virus',
  },
  SARS1: {
    humanGene: 'seryl-tRNA synthetase',
    pathogen: 'the SARS-CoV / SARS-CoV-2 virus',
  },
  SARS2: {
    humanGene: 'seryl-tRNA synthetase 2, mitochondrial',
    pathogen: 'the SARS-CoV / SARS-CoV-2 virus',
  },
  SH2D3C: {
    humanGene: 'SH2 domain containing 3C',
    pathogen: 'coronavirus NSP3 (human alias "NSP3")',
  },
  SH2D3A: {
    humanGene: 'SH2 domain containing 3A',
    pathogen: 'coronavirus NSP1 (human alias "NSP1")',
  },
  BCAR3: {
    humanGene: 'breast cancer anti-estrogen resistance 3',
    pathogen: 'coronavirus NSP2 (human alias "NSP2")',
  },
}

/**
 * Returns the collision entry for a given gene symbol, or null if none exists.
 * Comparison is case-insensitive and trims surrounding whitespace.
 *
 * @param {string} symbol - Gene symbol to look up.
 * @returns {{ humanGene: string, pathogen: string } | null}
 */
export function getCollisionWarning(symbol) {
  if (!symbol || typeof symbol !== 'string') return null
  const key = symbol.trim().toUpperCase()
  return SARS_COLLISIONS[key] ?? null
}

/**
 * Builds a human-readable tooltip/explanation string for a colliding symbol.
 * Suitable for use as a `title` attribute or inline warning text.
 *
 * @param {string} symbol - Gene symbol (will be uppercased).
 * @returns {string} Explanation string, or empty string if no collision found.
 */
export function collisionTooltip(symbol) {
  const entry = getCollisionWarning(symbol)
  if (!entry) return ''
  const sym = symbol.trim().toUpperCase()
  return (
    `Name collision: the human gene ${sym} (${entry.humanGene}) shares its name or alias ` +
    `with ${entry.pathogen}. Some literature mentions of the pathogen may be conflated into ` +
    `this human gene — Ignet maps to the human gene.`
  )
}
