const FIELDS = ['schemaVersion', 'pair', 'sentenceId', 'pmid', 'sentenceText', 'scores', 'inoAnnotations', 'origin', 'sourceRevision', 'modelVersion', 'fetchedAt']
const symbol = /^[A-Z0-9._-]{1,60}$/
const decimal = /^[1-9]\d{0,19}$/
export const MAX_EVIDENCE_ANNOTATIONS = 5000

function record(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== fields.length || fields.some(field => !Object.hasOwn(value, field)) || Object.keys(value).some(field => !fields.includes(field))) throw new Error('Invalid evidence fields.')
}

function nullableText(value, max) {
  if (value === null) return null
  if (typeof value !== 'string' || value.length > max) throw new Error('Invalid evidence text.')
  return value
}

function pairSymbols(pair) {
  if (!Array.isArray(pair) || pair.length !== 2 || pair.some(gene => typeof gene !== 'string' || !symbol.test(gene))) throw new Error('Invalid evidence gene pair.')
  return [...pair].sort()
}

export function evidenceKey(value) {
  return JSON.stringify([pairSymbols(value.pair), value.sentenceId, value.pmid, value.sentenceText])
}

export function validateEvidenceSnapshot(value) {
  record(value, FIELDS)
  if (value.schemaVersion !== 1) throw new Error('Unsupported evidence version.')
  const pair = pairSymbols(value.pair)
  for (const field of ['sentenceId', 'pmid']) {
    if (value[field] !== null && (typeof value[field] !== 'string' || !decimal.test(value[field]))) throw new Error('Invalid evidence identifier.')
  }
  const sentenceText = nullableText(value.sentenceText, 20000)
  if (!Array.isArray(value.scores) || value.scores.length > 100 || value.scores.some(score => !Number.isFinite(score) || score < 0 || score > 1)) throw new Error('Invalid evidence scores.')
  if (!Array.isArray(value.inoAnnotations) || value.inoAnnotations.length > MAX_EVIDENCE_ANNOTATIONS) throw new Error(`Evidence selection supports at most ${MAX_EVIDENCE_ANNOTATIONS} annotations per excerpt; none will be truncated.`)
  const inoAnnotations = value.inoAnnotations.map(annotation => {
    record(annotation, ['inoId', 'matchingPhrase'])
    return { inoId: nullableText(annotation.inoId, 100), matchingPhrase: nullableText(annotation.matchingPhrase, 1000) }
  })
  if (value.origin !== null || value.sourceRevision !== null || value.modelVersion !== null) throw new Error('Evidence provenance is unknown in this version.')
  if (typeof value.fetchedAt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value.fetchedAt) || !Number.isFinite(Date.parse(value.fetchedAt)) || new Date(value.fetchedAt).toISOString().slice(0, 19) !== value.fetchedAt.slice(0, 19)) throw new Error('Invalid evidence timestamp.')
  return { schemaVersion: 1, pair, sentenceId: value.sentenceId, pmid: value.pmid, sentenceText, scores: [...new Set(value.scores)].sort((a, b) => a - b), inoAnnotations, origin: null, sourceRevision: null, modelVersion: null, fetchedAt: value.fetchedAt }
}

function identifier(value) {
  const text = typeof value === 'number' && Number.isSafeInteger(value) ? String(value) : value
  return typeof text === 'string' && decimal.test(text) ? text : null
}

function normalizeRow(row, pair, fetchedAt) {
  const annotations = row.ino_annotations ?? [{ ino_id: row.ino_id ?? null, matching_phrase: row.matching_phrase ?? null }]
  return validateEvidenceSnapshot({ schemaVersion: 1, pair, sentenceId: identifier(row.sentence_id), pmid: identifier(row.pmid), sentenceText: typeof row.sentence_text === 'string' ? row.sentence_text : null, scores: Number.isFinite(row.score) && row.score >= 0 && row.score <= 1 ? [row.score] : [], inoAnnotations: annotations.filter(a => a.ino_id != null || a.matching_phrase != null).map(a => ({ inoId: a.ino_id ?? null, matchingPhrase: a.matching_phrase ?? null })), origin: null, sourceRevision: null, modelVersion: null, fetchedAt })
}

export function normalizeEvidence(rows, pair, fetchedAt, onInvalid) {
  const found = new Map()
  for (const row of rows) {
    let item
    try { item = normalizeRow(row, pair, fetchedAt) }
    catch (error) {
      if (!onInvalid) throw error
      onInvalid(row, error)
      continue
    }
    const key = evidenceKey(item)
    const previous = found.get(key)
    if (!previous) found.set(key, item)
    else {
      previous.scores = [...new Set([...previous.scores, ...item.scores])].sort((a, b) => a - b)
      previous.inoAnnotations = [...new Map([...previous.inoAnnotations, ...item.inoAnnotations].map(a => [JSON.stringify(a), a])).values()]
    }
  }
  return [...found.values()].filter(item => {
    try { validateEvidenceSnapshot(item); return true }
    catch (error) {
      if (!onInvalid) throw error
      onInvalid(item, error)
      return false
    }
  })
}

export function prepareEvidenceReview(rows, pair, fetchedAt) {
  const unselectable = []
  const items = normalizeEvidence(rows, pair, fetchedAt, (row, error) => {
    const sentenceText = row?.sentence_text ?? row?.sentenceText
    const annotations = row?.ino_annotations ?? row?.inoAnnotations
    unselectable.push({ sentenceText: typeof sentenceText === 'string' ? sentenceText : null, pmid: identifier(row?.pmid), annotationCount: Array.isArray(annotations) ? annotations.length : null, reason: error.message })
  })
  return { items, unselectable }
}

export function groupEvidence(items) {
  const groups = new Map()
  for (const item of items) {
    if (!groups.has(item.pmid)) groups.set(item.pmid, { pmid: item.pmid, items: [] })
    groups.get(item.pmid).items.push(item)
  }
  return [...groups.values()]
}

function csvCell(value) {
  let text = value == null ? '' : String(value)
  if (/^[=+\-@]/.test(text.trimStart()) || (text.length && text.charCodeAt(0) < 32)) text = "'" + text
  return '"' + text.replaceAll('"', '""') + '"'
}

export function evidenceCSV(items) {
  const header = ['Gene1', 'Gene2', 'Sentence_ID', 'PMID', 'Sentence', 'Model_scores', 'Detected_INO_phrases', 'Fetched_at', 'Origin', 'Scope']
  return [header, ...items.map(item => {
    const value = validateEvidenceSnapshot(item)
    return [...value.pair, value.sentenceId, value.pmid, value.sentenceText, value.scores.join('; '), value.inoAnnotations.map(a => a.matchingPhrase ?? a.inoId).join('; '), value.fetchedAt, 'unknown', 'selected retrieved evidence; incomplete literature coverage']
  })].map(row => row.map(csvCell).join(',')).join('\r\n')
}

export function downloadEvidence(items, format) {
  const values = items.map(validateEvidenceSnapshot)
  const data = format === 'csv' ? evidenceCSV(values) : JSON.stringify({ format: 'ignet-selected-evidence', version: 1, scope: 'Selected retrieved snapshots; not a complete literature review.', selectedEvidence: values }, null, 2)
  const url = URL.createObjectURL(new Blob([data], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `ignet-selected-evidence.${format}`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
