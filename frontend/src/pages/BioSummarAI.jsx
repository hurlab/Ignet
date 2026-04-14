import { useState, useRef, useEffect } from 'react'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function renderMarkdown(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    // Bold
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    line = line.replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    line = line.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')

    // Headers
    if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-navy mt-3 mb-1 text-sm">{line.slice(4)}</h4>
    if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-navy mt-4 mb-1">{line.slice(3)}</h3>
    if (line.startsWith('# ')) return <h2 key={i} className="text-lg font-bold text-navy mt-4 mb-2">{line.slice(2)}</h2>

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.*)/)
    if (numMatch) return <p key={i} className="ml-4 mb-1" dangerouslySetInnerHTML={{ __html: `<span class="text-gray-400 mr-1">${numMatch[1]}.</span>${numMatch[2]}` }} />

    // Bullet list
    if (line.startsWith('- ') || line.startsWith('* ')) return <p key={i} className="ml-4 mb-1" dangerouslySetInnerHTML={{ __html: `<span class="text-gray-400 mr-1">&bull;</span>${line.slice(2)}` }} />

    // Empty line = paragraph break
    if (!line.trim()) return <div key={i} className="h-2" />

    // Regular paragraph
    return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: line }} />
  })
}

function GeneTag({ symbol, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
      {symbol}
      <button
        onClick={() => onRemove(symbol)}
        className="hover:text-red-600 transition-colors ml-0.5 font-bold"
        aria-label={`Remove ${symbol}`}
      >
        &times;
      </button>
    </span>
  )
}

export default function BioSummarAI() {
  const [geneInput, setGeneInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedGenes, setSelectedGenes] = useState([])
  const [summarizing, setSummarizing] = useState(false)
  const [summary, setSummary] = useState(null)
  const [entities, setEntities] = useState(null)
  const [error, setError] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  function handleGeneInputChange(e) {
    const val = e.target.value
    setGeneInput(val)
    clearTimeout(debounceRef.current)
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await api.searchGenes(val.trim())
          setSuggestions(Array.isArray(res) ? res.slice(0, 8) : (res?.data ?? res?.genes ?? []))
        } catch {
          setSuggestions([])
        }
      }, 300)
    } else {
      setSuggestions([])
    }
  }

  function addGene(sym) {
    const s = (typeof sym === 'string' ? sym : sym?.Symbol ?? sym?.symbol ?? sym?.gene ?? String(sym)).toUpperCase()
    if (s && !selectedGenes.includes(s)) {
      setSelectedGenes((prev) => [...prev, s])
    }
    setGeneInput('')
    setSuggestions([])
  }

  function removeGene(sym) {
    setSelectedGenes((prev) => prev.filter((g) => g !== sym))
  }

  function handleGeneKeyDown(e) {
    if (e.key === 'Enter' && geneInput.trim()) {
      e.preventDefault()
      addGene(geneInput.trim())
    }
  }

  async function handleSummarize() {
    if (selectedGenes.length === 0) return
    setSummarizing(true)
    setError(null)
    setSummary(null)
    setEntities(null)
    setChatMessages([])
    try {
      const data = await api.summarize(selectedGenes)
      setSummary(data?.data?.reply ?? data?.Summary?.reply ?? data?.reply ?? data?.summary ?? data?.text ?? JSON.stringify(data))
      setEntities(data?.entities ?? data?.data?.entities ?? null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSummarizing(false)
    }
  }

  async function handleChatSend(e) {
    e?.preventDefault()
    const msg = chatInput.trim()
    if (!msg) return
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', content: msg }])
    setChatLoading(true)
    try {
      const history = [
        { role: 'system', content: `Context about genes ${selectedGenes.join(', ')}: ${summary}` },
        ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
      ]
      const res = await api.chat(history, msg)
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res?.Summary?.reply ?? res?.reply ?? res?.response ?? res?.message ?? JSON.stringify(res) },
      ])
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}`, error: true },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy mb-1">BioSummarAI</h1>
        <p className="text-gray-500 text-xs">
          AI-powered summarization of gene interactions from biomedical literature.
        </p>
      </div>

      {/* Example gene sets */}
      {selectedGenes.length === 0 && !summary && (
        <div className="text-center py-6 space-y-3">
          <p className="text-gray-400 text-sm">Select genes to generate an AI-powered literature summary.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Immune signaling', genes: ['IFNG', 'TNF', 'IL6', 'STAT1'] },
              { label: 'Tumor suppressors', genes: ['BRCA1', 'TP53', 'RB1'] },
              { label: 'Vaccine targets', genes: ['TLR4', 'CD80', 'IL12A'] },
            ].map(({ label, genes }) => (
              <button key={label} onClick={() => genes.forEach(g => addGene(g))}
                className="bg-blue-50 text-navy text-xs font-medium px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gene selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm">Select Genes</h2>

        <div className="relative">
          <input
            type="text"
            value={geneInput}
            onChange={handleGeneInputChange}
            onKeyDown={handleGeneKeyDown}
            placeholder="Type a gene symbol and press Enter..."
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-0.5 max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => {
                const sym = typeof s === 'string' ? s : s?.Symbol ?? s?.symbol ?? s?.gene ?? String(s)
                return (
                  <button
                    key={i}
                    onClick={() => addGene(s)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 transition-colors"
                  >
                    {typeof s === 'object' && s !== null
                      ? <><span className="font-medium">{s.Symbol}</span>{s.description ? <span className="text-gray-500 ml-1">— {s.description}</span> : null}</>
                      : sym}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {selectedGenes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedGenes.map((g) => (
              <GeneTag key={g} symbol={g} onRemove={removeGene} />
            ))}
          </div>
        )}

        <button
          onClick={handleSummarize}
          disabled={selectedGenes.length === 0 || summarizing}
          className="bg-navy hover:bg-navy-dark disabled:opacity-50 text-white font-semibold px-5 py-1.5 rounded text-sm transition-colors"
        >
          {summarizing ? 'Summarizing...' : 'Summarize'}
        </button>
        <p className="text-[10px] text-gray-400 mt-1">AI summary generation may take 10-30 seconds</p>
      </div>

      <ErrorMessage message={error} />

      {summarizing && <LoadingSpinner message="Generating AI summary from literature..." />}

      {summary && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm">Summary</h2>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-1">
            {renderMarkdown(summary)}
          </div>

          {entities && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {entities.genes?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-navy text-sm mb-2">Top Genes</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {entities.genes.slice(0, 15).map(g => (
                      <span key={g.term} className="bg-blue-50 text-navy text-xs px-2 py-1 rounded-full">
                        {g.term} <span className="text-gray-400">({g.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {entities.drugs?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-navy text-sm mb-2">Top Drugs</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {entities.drugs.slice(0, 15).map(d => (
                      <span key={d.term} className="bg-green-50 text-green-800 text-xs px-2 py-1 rounded-full">
                        {d.term} <span className="text-gray-400">({d.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {entities.diseases?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-navy text-sm mb-2">Top Diseases</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {entities.diseases.slice(0, 15).map(d => (
                      <span key={d.term} className="bg-red-50 text-red-800 text-xs px-2 py-1 rounded-full">
                        {d.term} <span className="text-gray-400">({d.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <h3 className="font-medium text-gray-600 text-xs">Follow-up Questions</h3>

            {chatMessages.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-100 rounded p-3 bg-gray-50">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-xs p-2 rounded ${
                      msg.role === 'user'
                        ? 'bg-blue-100 text-blue-900 ml-4'
                        : msg.error
                        ? 'bg-red-50 text-red-700'
                        : 'bg-white text-gray-700 mr-4 border border-gray-100'
                    }`}
                  >
                    <span className="font-semibold mr-1">
                      {msg.role === 'user' ? 'You:' : 'AI:'}
                    </span>
                    {msg.content}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            <form onSubmit={handleChatSend} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                disabled={chatLoading}
                className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="bg-accent hover:bg-orange-500 disabled:opacity-50 text-white font-semibold px-3 py-1.5 rounded text-xs transition-colors"
              >
                {chatLoading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
