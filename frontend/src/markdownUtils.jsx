import DOMPurify from 'dompurify'

// @MX:ANCHOR: [AUTO] Shared markdown renderer used by Assistant, BioSummarAI, and Gene
// @MX:REASON: Fan-in >= 3 call sites; any change here affects all LLM output rendering

// Explicit DOMPurify allowlist — registered once at module load so future default
// changes in DOMPurify cannot silently widen the permitted tag/attribute set.
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['strong', 'em', 'code', 'span', 'a', 'br'],
  ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
}

// Ensure every surviving <a> element is safe for external links.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

/**
 * Renders LLM markdown output as React elements.
 * All HTML strings passed to dangerouslySetInnerHTML are sanitized via DOMPurify
 * with an explicit allowlist (PURIFY_CONFIG) to prevent future default changes
 * from widening the output.
 */
export function renderMarkdown(text) {
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
    if (numMatch) return <p key={i} className="ml-4 mb-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`<span class="text-gray-400 mr-1">${numMatch[1]}.</span>${numMatch[2]}`, PURIFY_CONFIG) }} />

    // Bullet list
    if (line.startsWith('- ') || line.startsWith('* ')) return <p key={i} className="ml-4 mb-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`<span class="text-gray-400 mr-1">&bull;</span>${line.slice(2)}`, PURIFY_CONFIG) }} />

    // Empty line = paragraph break
    if (!line.trim()) return <div key={i} className="h-2" />

    // Regular paragraph
    return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(line, PURIFY_CONFIG) }} />
  })
}
