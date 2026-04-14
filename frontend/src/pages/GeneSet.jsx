import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGeneSet } from '../GeneSetContext.jsx'

function parseGeneInput(text) {
  return text.split(/[\n,\t ]+/).map(g => g.trim().toUpperCase()).filter(g => g.length > 0)
}

export default function GeneSet() {
  const gs = useGeneSet()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('')
  const [saveName, setSaveName] = useState('')
  const [showSave, setShowSave] = useState(false)

  if (!gs) return null

  const filtered = filter
    ? gs.genes.filter(g => g.toLowerCase().includes(filter.toLowerCase()))
    : gs.genes

  function handleAdd() {
    const parsed = parseGeneInput(input)
    if (parsed.length > 0) {
      const added = gs.addGenes(parsed)
      setInput('')
      if (added === 0) alert(`No new genes added. ${gs.genes.length >= gs.MAX_GENES ? 'Set is full (500 max).' : 'All genes already in set.'}`)
    }
  }

  function handleSave() {
    const name = saveName.trim()
    if (!name) return
    gs.saveCurrentSet(name)
    setSaveName('')
    setShowSave(false)
  }

  function sendToEnrichment() {
    if (gs.genes.length === 0) return
    // For large sets, use localStorage to avoid URL length limits
    if (gs.genes.length > 50) {
      localStorage.setItem('ignet_geneset_transfer', gs.genes.join(','))
      navigate('/enrichment?from=geneset')
    } else {
      navigate(`/enrichment?genes=${encodeURIComponent(gs.genes.join(','))}`)
    }
  }

  function exportPlainText() {
    const blob = new Blob([gs.genes.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'ignet-geneset.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  function exportCSV() {
    const csv = 'Symbol\n' + gs.genes.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'ignet-geneset.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-navy">Gene Set Builder</h1>
          <p className="text-gray-500 text-xs">
            Collect genes from any page, then analyze or export them.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">{gs.genes.length} / {gs.MAX_GENES} genes</span>
          {gs.genes.length > 0 && (
            <>
              <button onClick={() => setShowSave(true)} className="text-blue-600 hover:text-blue-800 font-medium">Save As</button>
              <button onClick={gs.clearGenes} className="text-red-500 hover:text-red-700 font-medium">Clear All</button>
            </>
          )}
        </div>
      </div>

      {/* Save dialog */}
      {showSave && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
          <input
            type="text"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            placeholder="Set name..."
            className="border border-gray-300 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button onClick={handleSave} className="bg-navy text-white text-xs font-medium px-3 py-1.5 rounded">Save</button>
          <button onClick={() => setShowSave(false)} className="text-gray-500 text-xs">Cancel</button>
        </div>
      )}

      {/* Add genes input */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
        <label className="text-xs font-medium text-gray-600">Add Genes</label>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() }}}
            placeholder={"Paste gene symbols (comma, space, or newline separated)\ne.g. TNF, IL6, IFNG, BRCA1, TP53"}
            rows={2}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="bg-navy hover:bg-navy-dark disabled:opacity-40 text-white font-medium text-sm px-4 rounded transition-colors self-end"
          >
            Add
          </button>
        </div>
      </div>

      {/* Gene chips */}
      {gs.genes.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter genes..."
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-48"
            />
            {filter && <span className="text-xs text-gray-400">{filtered.length} matching</span>}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-wrap gap-1.5">
              {filtered.map(gene => (
                <span key={gene} className="inline-flex items-center gap-1 bg-blue-50 text-navy text-xs font-medium px-2 py-1 rounded-full group">
                  <Link to={`/gene?q=${encodeURIComponent(gene)}`} className="hover:text-blue-700">{gene}</Link>
                  <button
                    onClick={() => gs.removeGene(gene)}
                    className="text-gray-400 hover:text-red-500 text-[10px] leading-none"
                    title="Remove"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={sendToEnrichment}
              className="bg-navy hover:bg-navy-dark text-white text-xs font-medium px-4 py-2 rounded transition-colors"
            >
              Send to Enrichment
            </button>
            <Link
              to="/compare"
              className="border border-navy text-navy hover:bg-navy hover:text-white text-xs font-medium px-4 py-2 rounded transition-colors"
            >
              Send to Compare
            </Link>
            <button onClick={exportPlainText} className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-medium px-4 py-2 rounded transition-colors">
              Export TXT
            </button>
            <button onClick={exportCSV} className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-medium px-4 py-2 rounded transition-colors">
              Export CSV
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 space-y-3">
          <p className="text-gray-400 text-sm">Your gene set is empty.</p>
          <p className="text-gray-300 text-xs">Add genes from the Gene, Explore, or Dignet pages using the + buttons.</p>
          <div className="flex justify-center gap-2">
            <Link to="/gene" className="text-xs text-blue-600 hover:underline">Gene Search</Link>
            <Link to="/explore" className="text-xs text-blue-600 hover:underline">Explore Top Genes</Link>
            <Link to="/dignet" className="text-xs text-blue-600 hover:underline">Dignet Network</Link>
          </div>
        </div>
      )}

      {/* Saved Sets */}
      {gs.savedSets.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Saved Sets</h2>
          <div className="space-y-1.5">
            {gs.savedSets.map(s => (
              <div key={s.name} className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-3">
                <span className="font-medium text-navy text-sm flex-1">{s.name}</span>
                <span className="text-xs text-gray-400">{s.genes.length} genes</span>
                <button onClick={() => gs.loadSet(s.name)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Load</button>
                <button onClick={() => gs.deleteSet(s.name)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
