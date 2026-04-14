import { useState } from 'react'

function Section({ title, color, items, onItemClick, activeItem }) {
  const [expanded, setExpanded] = useState(true)
  if (!items?.length) return null

  const colorMap = {
    green: { bg: 'bg-green-50', text: 'text-green-800', active: 'bg-green-200', hover: 'hover:bg-green-100' },
    red: { bg: 'bg-red-50', text: 'text-red-800', active: 'bg-red-200', hover: 'hover:bg-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-800', active: 'bg-purple-200', hover: 'hover:bg-purple-100' },
  }
  const c = colorMap[color] || colorMap.green

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-xs font-semibold text-gray-600 uppercase tracking-wide py-1"
      >
        <span>{title} ({items.length})</span>
        <span>{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>
      {expanded && (
        <div className="flex flex-wrap gap-1 mt-1">
          {items.slice(0, 20).map(item => (
            <button
              key={item.term}
              onClick={() => onItemClick?.(item.term)}
              className={`text-xs px-1.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                activeItem === item.term
                  ? c.active + ' ' + c.text + ' font-bold'
                  : c.bg + ' ' + c.text + ' ' + c.hover
              }`}
              title={`${item.term}: ${item.cnt} occurrences. Click to highlight associated genes.`}
            >
              {item.term}
              <span className="opacity-50 ml-0.5">{item.cnt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function EntitySidebar({ entities, loading, onHighlight, activeHighlight, onClearHighlight, visibleCategories, onToggleCategory }) {
  if (loading) {
    return (
      <div className="text-xs text-gray-400 py-4 text-center">
        Loading entities...
      </div>
    )
  }

  if (!entities) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-navy uppercase tracking-wide">Network Entities</h3>
        {activeHighlight && (
          <button
            onClick={onClearHighlight}
            className="text-[10px] text-gray-400 hover:text-gray-600 underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Category toggle switches */}
      <div className="flex flex-col gap-1 mb-2">
        {[
          { key: 'drugs', label: 'Drugs', color: 'bg-green-500' },
          { key: 'diseases', label: 'Diseases', color: 'bg-red-500' },
          { key: 'ino', label: 'INO Types', color: 'bg-purple-500' },
        ].map(({ key, label, color }) => (
          <label key={key} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <button
              onClick={() => onToggleCategory?.(key)}
              className={`relative w-8 h-4 rounded-full transition-colors ${
                visibleCategories?.[key] ? color : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                visibleCategories?.[key] ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </button>
            {label}
            <span className="text-gray-400">({
              key === 'drugs' ? entities?.drugs?.length || 0 :
              key === 'diseases' ? entities?.diseases?.length || 0 :
              entities?.ino_distribution?.length || 0
            })</span>
          </label>
        ))}
      </div>

      {activeHighlight && (
        <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-xs text-yellow-700">
          Highlighting: <strong>{activeHighlight}</strong>
        </div>
      )}

      <Section
        title="Drugs"
        color="green"
        items={entities.drugs}
        onItemClick={(term) => onHighlight?.('drug', term)}
        activeItem={activeHighlight}
      />

      <Section
        title="Diseases"
        color="red"
        items={entities.diseases}
        onItemClick={(term) => onHighlight?.('disease', term)}
        activeItem={activeHighlight}
      />

      <Section
        title="INO Types"
        color="purple"
        items={entities.ino_distribution}
        onItemClick={(term) => onHighlight?.('ino', term)}
        activeItem={activeHighlight}
      />
    </div>
  )
}
