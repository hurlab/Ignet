import { lerpColor } from './networkColors.js'

export const MAX_EXPERIMENT_BYTES = 2 * 1024 * 1024
const GENE = /^[A-Z0-9._-]{1,60}$/
const FIELDS = ['schema', 'name', 'importedAt', 'rows']
const ROW_FIELDS = ['gene', 'inputSymbol', 'log2FC', 'padj']
const ALIAS_LISTS = {
  gene: ['gene', 'symbol', 'gene_symbol', 'gene_name', 'genes', 'id', 'feature'],
  log2FC: ['log2fc', 'log2foldchange', 'log2_fold_change', 'logfc', 'log2fold'],
  padj: ['padj', 'adjusted_p', 'adj_p', 'fdr', 'adj.p.val', 'adj_p_val', 'qvalue', 'q_value', 'p.adjust', 'padjust'],
}
// Null-prototype map so headers like "constructor" or "__proto__" never resolve.
const aliases = Object.assign(Object.create(null), ...Object.entries(ALIAS_LISTS).map(([field, names]) => Object.fromEntries(names.map(name => [name, field]))))
function exact(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== fields.length || fields.some(key => !Object.hasOwn(value, key))) throw new Error('Unexpected experiment fields.')
}
function metric(value, probability = false) {
  if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || (probability && (value < 0 || value > 1)))) throw new Error('Measurements must be finite; adjusted p must be between 0 and 1.')
  return value
}
export function validateExperiment(value) {
  exact(value, FIELDS)
  if (value.schema !== 'ignet-experiment-v1' || typeof value.name !== 'string' || !value.name.trim() || value.name.length > 120 || typeof value.importedAt !== 'string' || value.importedAt.length > 40 || !/^\d{4}-\d\d-\d\dT/.test(value.importedAt) || !Number.isFinite(Date.parse(value.importedAt))) throw new Error('Invalid experiment metadata.')
  if (!Array.isArray(value.rows) || value.rows.length < 1 || value.rows.length > 500) throw new Error('Provide 1–500 experiment genes.')
  const seen = new Set()
  const rows = value.rows.map(row => {
    exact(row, ROW_FIELDS)
    if (typeof row.gene !== 'string' || !GENE.test(row.gene) || typeof row.inputSymbol !== 'string' || row.inputSymbol.length > 60 || row.inputSymbol.trim().toUpperCase() !== row.gene || seen.has(row.gene)) throw new Error('Invalid or duplicate experiment gene.')
    seen.add(row.gene)
    const log2FC = metric(row.log2FC), padj = metric(row.padj, true)
    if (log2FC === null && padj === null) throw new Error('Each gene needs at least one measurement.')
    return { gene: row.gene, inputSymbol: row.inputSymbol, log2FC, padj }
  })
  return { schema: value.schema, name: value.name, importedAt: value.importedAt, rows }
}

// Bounded CSV/TSV reader: quoted cells, escaped quotes, CRLF and multiline values.
function readTable(text, delimiter) {
  const rows = []; let row = [], cell = '', quoted = false, closed = false
  for (let i = 0; i <= text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') { quoted = false; closed = true }
      else if (c === undefined) throw new Error('Unclosed quoted field.')
      else cell += c
      continue
    }
    if (c === '"') {
      if (cell || closed) throw new Error('Unexpected quote in table.')
      quoted = true; continue
    }
    if (c === delimiter || c === '\n' || c === '\r' || c === undefined) {
      row.push(cell); cell = ''; closed = false
      if (c !== delimiter) {
        if (row.some(x => x.trim())) rows.push(row)
        row = []
        if (c === '\r' && text[i + 1] === '\n') i++
      }
    } else {
      if (closed) throw new Error('Unexpected text after quoted field.')
      cell += c
    }
  }
  return rows
}
function parseMetric(text) {
  const value = text.trim()
  if (!value || /^(NA|N\/A|NAN)$/i.test(value)) return null
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value) || !Number.isFinite(Number(value))) throw new Error('Invalid numeric measurement.')
  return Number(value)
}
export function parseExperimentTable(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_EXPERIMENT_BYTES) throw new Error('Experiment input exceeds 2 MiB.')
  text = text.replace(/^\uFEFF/, '')
  const headerText = text.split(/[\r\n]/, 1)[0]
  const delimiter = headerText.includes('\t') ? '\t' : headerText.includes(';') && !headerText.includes(',') ? ';' : ','
  const table = readTable(text, delimiter)
  if (table.length < 2) throw new Error('Provide a header and at least one data row.')
  const names = table.shift().map(x => x.trim())
  // Unrecognized columns are ignored; an unnamed first column (R rownames) is the gene column only if no other exists.
  const headers = names.map(x => aliases[x.toLowerCase()])
  if (!names[0] && !headers.includes('gene')) headers[0] = 'gene'
  const known = headers.filter(Boolean)
  if (new Set(known).size !== known.length) throw new Error(`Duplicate recognized columns: ${names.filter((_, i) => headers[i]).join(', ')}.`)
  if (!known.includes('gene') || !known.some(x => x === 'log2FC' || x === 'padj')) throw new Error(`Need a gene column and log2FC and/or padj; recognized: ${known.length ? known.join(', ') : 'none'} of [${names.slice(0, 10).join(', ')}${names.length > 10 ? ', …' : ''}].`)
  const rows = [], seen = new Map(); let duplicates = 0
  table.forEach((cells, index) => {
    try {
      if (cells.length !== headers.length) throw new Error('Column count differs from header.')
      const source = Object.fromEntries(headers.flatMap((key, i) => key ? [[key, cells[i]]] : []))
      const inputSymbol = source.gene.trim(), gene = inputSymbol.toUpperCase()
      const row = { gene, inputSymbol, log2FC: parseMetric(source.log2FC ?? ''), padj: parseMetric(source.padj ?? '') }
      validateExperiment({ schema: 'ignet-experiment-v1', name: 'preview', importedAt: new Date().toISOString(), rows: [row] })
      const previous = seen.get(gene)
      if (previous) {
        if (previous.log2FC !== row.log2FC || previous.padj !== row.padj) throw new Error('Conflicting duplicate gene.')
        duplicates++; return
      }
      seen.set(gene, row); rows.push(row)
      if (rows.length > 500) throw new Error('Maximum 500 experiment genes.')
    } catch (error) { throw new Error(`Row ${index + 2}: ${error.message}`) }
  })
  return { rows, duplicates }
}
export function experimentColor(value, range = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '#94a3b8'
  const t = Math.min(1, Math.abs(value) / range)
  return lerpColor('#f8fafc', value < 0 ? '#2563eb' : '#c2410c', t)
}
