import { useState, useCallback } from 'react'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

// @MX:NOTE: Gene symbol regex targets uppercase tokens 2-10 chars like TP53, BRCA1, EGFR
// Deliberately conservative to avoid false positives from common English words
const GENE_REGEX = /\b([A-Z][A-Z0-9]{1,9})\b/g

const SAMPLE_TEXT = `BRCA1 and BRCA2 are tumor suppressor genes that play critical roles in DNA damage repair. Mutations in BRCA1 increase the risk of breast and ovarian cancer. TP53, also known as the guardian of the genome, interacts with BRCA1 to regulate apoptosis. EGFR signaling pathway is frequently activated in lung cancer cells, and its interaction with KRAS mutations leads to treatment resistance. Studies have shown that MYC amplification cooperates with RAS activation to drive cell proliferation.`

// Common English uppercase abbreviations to exclude from gene detection
const EXCLUDE_WORDS = new Set([
  'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'HIS',
  'ONE', 'HAS', 'HAD', 'ITS', 'WAS', 'WHO', 'OUR', 'OUT', 'DAY', 'GET', 'USE',
  'TWO', 'MAY', 'NOW', 'SAY', 'NEW', 'OLD', 'ANY', 'SEE', 'HOW', 'WAY', 'TOP',
  'DNA', 'RNA', 'PCR', 'MRI', 'NMR', 'ATP', 'ADP', 'GTP', 'GDP',
])

function detectGenes(text) {
  const matches = new Set()
  const raw = text.match(GENE_REGEX) ?? []
  for (const token of raw) {
    if (!EXCLUDE_WORDS.has(token)) {
      matches.add(token)
    }
  }
  return [...matches]
}

function tokenizeSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10)
}

function GeneTag({ symbol, confirmed, onToggle, onRemove }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
        confirmed
          ? 'bg-blue-100 text-blue-800 border-blue-200'
          : 'bg-gray-100 text-gray-500 border-gray-200 line-through'
      }`}
    >
      <button
        onClick={() => onToggle(symbol)}
        className="hover:opacity-70 transition-opacity"
        title={confirmed ? 'Click to exclude' : 'Click to include'}
        aria-pressed={confirmed}
      >
        {symbol}
      </button>
      <button
        onClick={() => onRemove(symbol)}
        className="hover:text-red-600 transition-colors font-bold ml-0.5"
        aria-label={`Remove ${symbol}`}
      >
        &times;
      </button>
    </span>
  )
}

function highlightGenes(sentence, gene1, gene2) {
  if (!sentence) return '—'
  // Build a regex that matches either gene (case-sensitive, whole word)
  const genes = [gene1, gene2].filter(Boolean).flat().map(String)
  if (genes.length === 0) return sentence
  const escaped = genes.map(g => g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'g')
  const parts = []
  let lastIndex = 0
  let match
  while ((match = regex.exec(sentence)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: sentence.slice(lastIndex, match.index), highlight: false })
    }
    const isGene1 = gene1 && (Array.isArray(gene1) ? gene1.includes(match[1]) : match[1] === gene1)
    parts.push({ text: match[1], highlight: true, isFirst: isGene1 })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < sentence.length) {
    parts.push({ text: sentence.slice(lastIndex), highlight: false })
  }
  return parts
}

function ResultRow({ result, index }) {
  const interacts = result.Labels === 1
  const confidence = typeof result.ConfidenceScore === 'number'
    ? (result.ConfidenceScore * 100).toFixed(1)
    : 'N/A'
  // Entity_1 and Entity_2 are integer IDs; AllEntities maps IDs to gene name arrays
  const allEntities = result.AllEntities ?? {}
  const entity1 = allEntities[result.Entity_1] ?? (Array.isArray(result.Entity_1) ? result.Entity_1 : [String(result.Entity_1)].filter(Boolean))
  const entity2 = allEntities[result.Entity_2] ?? (Array.isArray(result.Entity_2) ? result.Entity_2 : [String(result.Entity_2)].filter(Boolean))
  const sentence = result.OrigSent ?? result.PreProcessedSent ?? ''
  const highlighted = highlightGenes(sentence, entity1, entity2)
  const interactionWords = result.Interaction_words ?? result.interaction_words ?? []

  return (
    <tr className={`border-t border-gray-100 text-xs ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
      <td className="px-3 py-2 text-gray-700" style={{ maxWidth: '500px' }}>
        <div className="leading-relaxed">
          {Array.isArray(highlighted) ? highlighted.map((part, i) => (
            part.highlight ? (
              <mark key={i} className={`font-bold px-0.5 rounded ${part.isFirst ? 'bg-blue-200 text-blue-900' : 'bg-orange-200 text-orange-900'}`}>
                {part.text}
              </mark>
            ) : (
              <span key={i}>{part.text}</span>
            )
          )) : highlighted}
        </div>
        {interactionWords.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {interactionWords.map((w, i) => (
              <span key={i} className="bg-purple-50 text-purple-700 text-[10px] px-1 py-0.5 rounded">{w}</span>
            ))}
          </div>
        )}
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <span className="font-mono font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">{entity1.join(', ')}</span>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <span className="font-mono font-bold text-orange-800 bg-orange-100 px-1.5 py-0.5 rounded">{entity2.join(', ')}</span>
      </td>
      <td className="px-3 py-2 text-center whitespace-nowrap">
        <span
          className={`inline-block px-2 py-0.5 rounded-full font-semibold ${
            interacts
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {interacts ? 'Interacts' : 'No interaction'}
        </span>
      </td>
      <td className="px-3 py-2 text-center whitespace-nowrap">
        <span className={`font-semibold ${
          confidence !== 'N/A' && parseFloat(confidence) > 80 ? 'text-green-700' :
          confidence !== 'N/A' && parseFloat(confidence) > 50 ? 'text-yellow-700' : 'text-gray-500'
        }`}>
          {confidence}%
        </span>
      </td>
    </tr>
  )
}

export default function AnalyzeText() {
  const [text, setText] = useState('')
  const [detectedGenes, setDetectedGenes] = useState([])
  const [confirmedGenes, setConfirmedGenes] = useState(new Set())
  const [genesDetected, setGenesDetected] = useState(false)

  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [analyzeError, setAnalyzeError] = useState(null)

  const [summarizing, setSummarizing] = useState(false)
  const [summary, setSummary] = useState(null)
  const [summarizeError, setSummarizeError] = useState(null)

  const handleTextChange = useCallback((e) => {
    setText(e.target.value)
    // Reset downstream state when text changes
    setGenesDetected(false)
    setDetectedGenes([])
    setConfirmedGenes(new Set())
    setResults(null)
    setSummary(null)
    setAnalyzeError(null)
    setSummarizeError(null)
  }, [])

  function handleLoadSample() {
    setText(SAMPLE_TEXT)
    setGenesDetected(false)
    setDetectedGenes([])
    setConfirmedGenes(new Set())
    setResults(null)
    setSummary(null)
    setAnalyzeError(null)
    setSummarizeError(null)
  }

  function handleDetectGenes() {
    const genes = detectGenes(text)
    setDetectedGenes(genes)
    setConfirmedGenes(new Set(genes))
    setGenesDetected(true)
    setResults(null)
    setSummary(null)
    setAnalyzeError(null)
  }

  function toggleGene(symbol) {
    setConfirmedGenes((prev) => {
      const next = new Set(prev)
      if (next.has(symbol)) {
        next.delete(symbol)
      } else {
        next.add(symbol)
      }
      return next
    })
  }

  function removeGene(symbol) {
    setDetectedGenes((prev) => prev.filter((g) => g !== symbol))
    setConfirmedGenes((prev) => {
      const next = new Set(prev)
      next.delete(symbol)
      return next
    })
  }

  async function handleAnalyze() {
    const activeGenes = detectedGenes.filter((g) => confirmedGenes.has(g))
    if (activeGenes.length < 2) return

    setAnalyzing(true)
    setAnalyzeError(null)
    setResults(null)

    try {
      const sentences = tokenizeSentences(text)
      const inputItems = []
      let idCounter = 1

      for (const sentence of sentences) {
        const sentenceGenes = activeGenes.filter((g) => sentence.includes(g))
        if (sentenceGenes.length < 2) continue
        for (const gene of sentenceGenes) {
          inputItems.push({
            Sentence: sentence,
            ID: idCounter++,
            MatchTerm: gene,
          })
        }
      }

      if (inputItems.length === 0) {
        setAnalyzeError(
          'No sentences found containing 2 or more of your confirmed genes. Try adding more text or confirming more genes.'
        )
        return
      }

      const data = await api.post('/predict', inputItems)
      const resultsArray = Array.isArray(data) ? data : []

      if (resultsArray.length === 0) {
        setAnalyzeError('The model returned no predictions. Ensure your text contains gene pairs in the same sentence.')
        return
      }

      setResults(resultsArray)
    } catch (err) {
      setAnalyzeError(err.message ?? 'Failed to run prediction.')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleSummarize() {
    setSummarizing(true)
    setSummarizeError(null)
    setSummary(null)
    try {
      const data = await api.post('/summarize', { raw_sentences: text })
      setSummary(data?.Summary?.reply ?? data?.summary ?? data?.text ?? JSON.stringify(data))
    } catch (err) {
      setSummarizeError(err.message ?? 'Failed to generate summary.')
    } finally {
      setSummarizing(false)
    }
  }

  const activeGenes = detectedGenes.filter((g) => confirmedGenes.has(g))
  const interactingCount = results ? results.filter((r) => r.Labels === 1).length : 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-navy mb-1">Analyze Your Text</h1>
        <p className="text-gray-500 text-xs">
          Paste biomedical text containing gene mentions. The BioBERT model will predict
          gene-gene interactions from your text.
        </p>
      </div>

      {/* Step 1: Text input */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700 text-sm">
            Step 1 — Paste Biomedical Text
          </h2>
          <button
            onClick={handleLoadSample}
            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded transition-colors"
            type="button"
          >
            Try Sample Text
          </button>
        </div>

        <textarea
          value={text}
          onChange={handleTextChange}
          rows={7}
          placeholder="Paste a biomedical abstract or paragraph here..."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-y font-mono leading-relaxed"
          aria-label="Biomedical text input"
        />

        <button
          onClick={handleDetectGenes}
          disabled={text.trim().length < 20}
          className="bg-navy hover:bg-navy-dark disabled:opacity-50 text-white font-semibold px-5 py-1.5 rounded text-sm transition-colors"
          type="button"
        >
          Detect Genes
        </button>
      </div>

      {/* Step 2: Confirm genes */}
      {genesDetected && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-gray-700 text-sm">
            Step 2 — Confirm Gene Symbols
          </h2>

          {detectedGenes.length === 0 ? (
            <p className="text-gray-500 text-xs">
              No gene symbols detected. Gene symbols must match the pattern{' '}
              <code className="bg-gray-100 px-1 rounded">[A-Z][A-Z0-9]+</code>{' '}
              (2–10 characters). Try the sample text or add more uppercase gene names.
            </p>
          ) : (
            <>
              <p className="text-gray-500 text-xs">
                {detectedGenes.length} gene candidate{detectedGenes.length !== 1 ? 's' : ''} found.
                Click a gene to toggle inclusion. You need at least 2 confirmed genes that appear
                together in a sentence.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {detectedGenes.map((g) => (
                  <GeneTag
                    key={g}
                    symbol={g}
                    confirmed={confirmedGenes.has(g)}
                    onToggle={toggleGene}
                    onRemove={removeGene}
                  />
                ))}
              </div>
              {activeGenes.length < 2 && (
                <p className="text-amber-600 text-xs">
                  Confirm at least 2 genes to run prediction.
                </p>
              )}
            </>
          )}

          {activeGenes.length >= 2 && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="bg-accent hover:bg-orange-500 disabled:opacity-50 text-white font-semibold px-5 py-1.5 rounded text-sm transition-colors"
              type="button"
            >
              {analyzing ? 'Analyzing...' : `Analyze (${activeGenes.length} genes)`}
            </button>
          )}
        </div>
      )}

      <ErrorMessage message={analyzeError} />

      {analyzing && <LoadingSpinner message="Running BioBERT interaction prediction..." />}

      {/* Results */}
      {results && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold text-gray-700 text-sm">
              Prediction Results
            </h2>
            <span className="text-xs text-gray-500">
              <span className="font-semibold text-green-700">{interactingCount}</span> of{' '}
              <span className="font-semibold">{results.length}</span> pairs predicted to interact
            </span>
          </div>

          <div className="overflow-x-auto rounded border border-gray-100">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-3 py-2 font-medium">Sentence</th>
                  <th className="px-3 py-2 font-medium">Gene 1</th>
                  <th className="px-3 py-2 font-medium">Gene 2</th>
                  <th className="px-3 py-2 font-medium text-center">Prediction</th>
                  <th className="px-3 py-2 font-medium text-center">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, i) => (
                  <ResultRow key={i} result={result} index={i} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Summarize button */}
          <div className="border-t border-gray-100 pt-3 flex items-center gap-3 flex-wrap">
            <button
              onClick={handleSummarize}
              disabled={summarizing}
              className="bg-navy hover:bg-navy-dark disabled:opacity-50 text-white font-semibold px-5 py-1.5 rounded text-sm transition-colors"
              type="button"
            >
              {summarizing ? 'Summarizing...' : 'Generate AI Summary'}
            </button>
            <span className="text-xs text-gray-400">
              Optional — summarize the full text with BioSummarAI
            </span>
          </div>
        </div>
      )}

      <ErrorMessage message={summarizeError} />

      {summarizing && <LoadingSpinner message="Generating AI summary from biomedical literature..." />}

      {/* AI Summary */}
      {summary && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
          <h2 className="font-semibold text-gray-700 text-sm">AI Summary</h2>
          <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      )}
    </div>
  )
}
