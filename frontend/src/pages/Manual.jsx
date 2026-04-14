import { useState, useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderMarkdownLine(line) {
  // Bold
  line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Italic
  line = line.replace(/\*(.+?)\*/g, '<em>$1</em>')
  // Inline code
  line = line.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>')
  // Links [text](url)
  line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
  return line
}

function renderMarkdown(text) {
  if (!text) return null

  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip image lines (screenshots won't be available)
    if (line.match(/^!\[.*\]\(.*\)/)) {
      i++
      continue
    }

    // Horizontal rule
    if (line.match(/^---+\s*$/)) {
      elements.push(<hr key={i} className="my-6 border-gray-200" />)
      i++
      continue
    }

    // Headers
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={i} className="text-base font-semibold text-gray-800 mt-5 mb-2">
          {line.slice(5)}
        </h4>
      )
      i++
      continue
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-lg font-semibold text-navy mt-6 mb-2">
          {line.slice(4)}
        </h3>
      )
      i++
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl font-bold text-navy mt-8 mb-3 pb-1 border-b border-gray-200">
          {line.slice(3)}
        </h2>
      )
      i++
      continue
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-2xl font-bold text-navy mt-6 mb-4">
          {line.slice(2)}
        </h1>
      )
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines = []
      let j = i
      while (j < lines.length && lines[j].startsWith('> ')) {
        quoteLines.push(lines[j].slice(2))
        j++
      }
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-blue-300 bg-blue-50 px-4 py-2 my-3 text-sm text-gray-700 italic"
          dangerouslySetInnerHTML={{ __html: quoteLines.map(l => renderMarkdownLine(escapeHtml(l))).join('<br/>') }}
        />
      )
      i = j
      continue
    }

    // Unordered list items
    if (line.match(/^[-*] /)) {
      const listItems = []
      let j = i
      while (j < lines.length && lines[j].match(/^[-*] /)) {
        // Skip image-only list items
        if (!lines[j].match(/^[-*] !\[/)) {
          listItems.push(lines[j].replace(/^[-*] /, ''))
        }
        j++
      }
      elements.push(
        <ul key={i} className="list-disc list-outside ml-6 my-2 space-y-1">
          {listItems.map((item, idx) => (
            <li
              key={idx}
              className="text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdownLine(escapeHtml(item)) }}
            />
          ))}
        </ul>
      )
      i = j
      continue
    }

    // Indented list items (e.g., "  - sub item")
    if (line.match(/^\s+[-*] /)) {
      const listItems = []
      let j = i
      while (j < lines.length && lines[j].match(/^\s+[-*] /)) {
        listItems.push(lines[j].replace(/^\s+[-*] /, ''))
        j++
      }
      elements.push(
        <ul key={i} className="list-disc list-outside ml-10 my-1 space-y-0.5">
          {listItems.map((item, idx) => (
            <li
              key={idx}
              className="text-sm text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdownLine(escapeHtml(item)) }}
            />
          ))}
        </ul>
      )
      i = j
      continue
    }

    // Numbered list
    if (line.match(/^\d+\.\s+/)) {
      const listItems = []
      let j = i
      while (j < lines.length && lines[j].match(/^\d+\.\s+/)) {
        listItems.push(lines[j].replace(/^\d+\.\s+/, ''))
        j++
      }
      elements.push(
        <ol key={i} className="list-decimal list-outside ml-6 my-2 space-y-1">
          {listItems.map((item, idx) => (
            <li
              key={idx}
              className="text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdownLine(escapeHtml(item)) }}
            />
          ))}
        </ol>
      )
      i = j
      continue
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={i} className="h-2" />)
      i++
      continue
    }

    // Regular paragraph
    elements.push(
      <p
        key={i}
        className="text-sm text-gray-700 leading-relaxed mb-1"
        dangerouslySetInnerHTML={{ __html: renderMarkdownLine(escapeHtml(line)) }}
      />
    )
    i++
  }

  return elements
}

export default function Manual() {
  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/ignet/USER_MANUAL.md')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load user manual')
        return r.text()
      })
      .then(text => {
        setContent(text)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    document.title = 'User Manual - Ignet'
  }, [])

  if (loading) return <LoadingSpinner message="Loading user manual..." />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-10">
        <div className="prose prose-sm max-w-none">
          {renderMarkdown(content)}
        </div>
      </div>
    </div>
  )
}
