import { useState } from 'react'

function Section({ title, color, items, onItemClick, activeItem }) {
  const [expanded, setExpanded] = useState(true)
  if (!items?.length) return null

  const colorMap = {
    green: { bg: 'bg-green-50', text: 'text-green-800', active: 'bg-green-200', hover: 'hover:bg-green-100' },
    red: { bg: 'bg-red-50', text: 'text-red-800', active: 'bg-red-200', hover: 'hover:bg-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-800', active: 'bg-purple-200', hover: 'hover:bg-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-800', active: 'bg-orange-200', hover: 'hover:bg-orange-100' },
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

export default function EntitySidebar({ entities, loading, onHighlight, activeHighlight, onClearHighlight, visibleCategories, onToggleCategory, covCount = 0, covLoading = false, inoItems = [], inoLoading = false, ontologyLoading = false, ontologyStats = null }) {
  if (loading) {
    return (
      <div className="text-xs text-gray-400 py-4 text-center">
        Loading entities...
      </div>
    )
  }

  // Render the toggle controls even when there are no drug/disease/INO entities,
  // so the CoV-protein overlay toggle stays reachable.
  const safeEntities = entities || { drugs: [], diseases: [], vaccines: [] }
  entities = safeEntities

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
      <div className="flex flex-col gap-1 mb-2" role="group" aria-label="Network entity category visibility">
        {[
          { key: 'drugs', label: 'Drugs', color: 'bg-green-500' },
          { key: 'diseases', label: 'Diseases', color: 'bg-red-500' },
          { key: 'vaccines', label: 'Vaccines', color: 'bg-orange-500' },
          { key: 'ino', label: 'INO Types', color: 'bg-purple-500' },
          { key: 'cov', label: 'CoV proteins', color: 'bg-teal-500' },
        ].map(({ key, label, color }) => {
          const isOn = !!visibleCategories?.[key]
          const count = key === 'drugs' ? entities?.drugs?.length || 0
            : key === 'diseases' ? entities?.diseases?.length || 0
            : key === 'vaccines' ? entities?.vaccines?.length || 0
            : key === 'cov' ? (covLoading ? '…' : covCount)
            // INO loads on demand, so show nothing until it has been requested.
            : (inoLoading ? '…' : (isOn ? inoItems.length : '–'))
          const switchId = `toggle-${key}`
          const labelId = `label-${key}`
          return (
            <div key={key} className="flex items-center gap-2 text-xs text-gray-600">
              <button
                id={switchId}
                role="switch"
                aria-checked={isOn}
                aria-labelledby={labelId}
                onClick={() => onToggleCategory?.(key)}
                className={`relative shrink-0 w-8 h-4 rounded-full transition-colors focus:outline-2 focus:outline-offset-1 focus:outline-blue-500 ${
                  isOn ? color : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                  isOn ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
              <span id={labelId} className="cursor-default select-none" onClick={() => onToggleCategory?.(key)}>
                {label}
              </span>
              <span className="text-gray-400">({count})</span>
            </div>
          )
        })}
      </div>

      {/* Gene-ontology model: real per-cohort co-occurrence instead of the
          default decorative term-to-top-gene edges. */}
      <div className="border-t border-gray-100 pt-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <button
            id="toggle-ontology"
            role="switch"
            aria-checked={!!visibleCategories?.ontology}
            aria-labelledby="label-ontology"
            onClick={() => onToggleCategory?.('ontology')}
            className={`relative shrink-0 w-8 h-4 rounded-full transition-colors focus:outline-2 focus:outline-offset-1 focus:outline-blue-500 ${
              visibleCategories?.ontology ? 'bg-navy' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
              visibleCategories?.ontology ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </button>
          <span id="label-ontology" className="cursor-default select-none font-medium" onClick={() => onToggleCategory?.('ontology')}>
            Gene–ontology links
          </span>
          {ontologyLoading && <span className="text-gray-400">…</span>}
        </div>
        <p className="text-[11px] text-gray-400 mt-1">
          {visibleCategories?.ontology
            ? (ontologyStats
                ? `Drug and disease nodes are linked to genes they actually co-occur with in this cohort (${ontologyStats.papers_with_entities ?? 0} annotated papers). Edge weight = papers.`
                : 'Loading co-occurrence links…')
            : 'Off: drug/disease nodes attach to the top-degree genes for layout only. Turn on to link them by real per-paper co-occurrence, including papers with only one gene.'}
        </p>
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
        title="Vaccines"
        color="orange"
        items={entities.vaccines}
        onItemClick={(term) => onHighlight?.('vaccine', term)}
        activeItem={activeHighlight}
      />

      {/* INO is fetched only when its toggle is switched on — aggregating it
          costs far more than the other categories. */}
      {inoLoading && (
        <div className="text-xs text-gray-400 py-1" role="status">
          Loading INO types…
        </div>
      )}
      {!inoLoading && !visibleCategories?.ino && (
        <p className="text-[11px] text-gray-400">
          Turn on <strong>INO Types</strong> above to load interaction types for this network.
        </p>
      )}
      <Section
        title="INO Types"
        color="purple"
        items={inoItems}
        onItemClick={(term) => onHighlight?.('ino', term)}
        activeItem={activeHighlight}
      />
    </div>
  )
}
