import { useState, useRef, useEffect } from 'react'
import { api } from '../api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { renderMarkdown } from '../markdownUtils.jsx'

// Cap: send at most the last N messages from conversationHistory to the backend.
// Keeps the full transcript visible on screen; only bounds the transmitted payload.
const HISTORY_CAP = 10

const EXAMPLE_QUESTIONS = [
  'What is the role of TNF in vaccine adjuvants?',
  'How do BRCA1 and TP53 interact?',
  'What drugs target IL6?',
]

export default function Assistant() {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [conversationHistory, setConversationHistory] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleAsk(e, explicitQuestion) {
    if (e) e.preventDefault()
    const q = (explicitQuestion ?? question).trim()
    if (!q || loading) return

    setQuestion('')
    setError(null)
    setMessages((prev) => [...prev, { role: 'user', content: q }])
    setLoading(true)

    try {
      const cappedHistory = conversationHistory.slice(-HISTORY_CAP)
      const data = await api.assistantAsk(q, cappedHistory)
      setConversationHistory(data.conversation_history ?? [])
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          answer: data.answer,
          cited_pmids: data.cited_pmids ?? [],
          evidence: data.evidence ?? [],
          genes_detected: data.genes_detected ?? [],
          evidence_count: data.evidence_count ?? 0,
        },
      ])
    } catch (err) {
      setError(err.message)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', answer: `Error: ${err.message}`, error: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleExampleClick(q) {
    setQuestion(q)
    handleAsk(null, q)
  }

  function handleNewChat() {
    setMessages([])
    setConversationHistory([])
    setError(null)
    setQuestion('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 3.5rem - 2.5rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Literature Assistant</h1>
          <p className="text-gray-500 text-xs">
            Ask questions about gene interactions. Answers are grounded in Ignet's PubMed evidence database and cited with PMIDs.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleNewChat}
            className="text-xs text-gray-500 hover:text-navy border border-gray-300 px-2 py-1 rounded transition-colors"
          >
            New Chat
          </button>
        )}
      </div>

      {/* Example questions — show when no messages */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <p className="text-gray-500 text-sm">Try one of these questions:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleExampleClick(q)}
                className="bg-blue-50 text-navy text-xs font-medium px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user' ? 'bg-navy text-white' : 'bg-white border border-gray-200'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                      {renderMarkdown(msg.answer)}
                    </div>

                    {/* Genes detected */}
                    {msg.genes_detected?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {msg.genes_detected.map((gene) => (
                          <span key={gene} className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-medium">
                            {gene}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Cited PMIDs */}
                    {msg.cited_pmids?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-gray-100">
                        {msg.cited_pmids.map((pmid) => (
                          <a
                            key={pmid}
                            href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded hover:bg-blue-100"
                          >
                            PMID:{pmid}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Evidence panel */}
                    {msg.evidence?.length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-400 hover:text-gray-600">
                          {msg.evidence.length} evidence sentences
                        </summary>
                        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                          {msg.evidence.map((e, j) => (
                            <div key={j} className="border-l-2 border-purple-200 pl-2 text-gray-500">
                              <strong>{e.gene1}---{e.gene2}</strong>: {e.sentence}
                              <a
                                href={`https://pubmed.ncbi.nlm.nih.gov/${e.pmid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 ml-1"
                              >
                                PMID:{e.pmid}
                              </a>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <LoadingSpinner message="Searching literature and generating answer..." />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <ErrorMessage message={error} />

      {/* Input */}
      <form onSubmit={handleAsk} className="flex gap-2 flex-shrink-0">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about gene interactions..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-navy hover:bg-navy-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          Ask
        </button>
      </form>
    </div>
  )
}
