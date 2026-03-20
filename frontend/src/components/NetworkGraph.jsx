import { useState, useCallback, useRef, useMemo } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'

function buildStylesheet(elements) {
  // Compute actual ranges from the data for meaningful visual mapping
  const nodes = elements.filter(e => !e.data.source)
  const edges = elements.filter(e => e.data.source)

  const degrees = {}
  edges.forEach(({ data: { source, target } }) => {
    degrees[source] = (degrees[source] || 0) + 1
    degrees[target] = (degrees[target] || 0) + 1
  })
  const maxDegree = Math.max(...Object.values(degrees), 1)
  const minDegree = Math.min(...Object.values(degrees), 1)

  // Check if we have real centrality data
  const hasCentrality = nodes.some(n => n.data.centrality_d > 0)

  // Check if we have INO colors
  const hasIno = edges.some(e => e.data.ino_color && e.data.ino_color !== '#a0aec0')

  // Compute weight range for edge thickness
  const weights = edges.map(e => e.data.weight || 1).filter(w => w > 0)
  const maxWeight = Math.max(...weights, 1)
  const minWeight = Math.min(...weights, 1)

  return [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        'font-size': nodes.length > 50 ? '8px' : nodes.length > 20 ? '10px' : '12px',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 4,
        color: '#1a202c',
        'font-weight': '500',
        'text-outline-color': '#ffffff',
        'text-outline-width': 2,
        'min-zoomed-font-size': 6,
        // Node color: use centrality if available, otherwise degree-based
        'background-color': hasCentrality
          ? 'mapData(centrality_d, 0, 1, #bfdbfe, #1e3a5f)'
          : `mapData(degree, ${minDegree}, ${Math.max(maxDegree, minDegree + 1)}, #93c5fd, #1e3a5f)`,
        // Node size: proportional to degree with meaningful range
        width: `mapData(degree, ${minDegree}, ${Math.max(maxDegree, minDegree + 1)}, 25, 60)`,
        height: `mapData(degree, ${minDegree}, ${Math.max(maxDegree, minDegree + 1)}, 25, 60)`,
        'border-width': 1.5,
        'border-color': '#1a365d',
        'border-opacity': 0.6,
      },
    },
    {
      // Hub nodes (top 20% by degree) get special styling
      selector: `node[degree >= ${Math.floor(maxDegree * 0.8)}]`,
      style: {
        'border-width': 3,
        'border-color': '#ed8936',
        'font-weight': '700',
        'font-size': nodes.length > 50 ? '10px' : '13px',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'background-color': '#ed8936',
        'border-color': '#c05621',
        'border-width': 3,
      },
    },
    {
      selector: 'edge',
      style: {
        'line-color': hasIno ? 'data(ino_color)' : '#94a3b8',
        'target-arrow-color': hasIno ? 'data(ino_color)' : '#94a3b8',
        // Edge width proportional to weight with meaningful range
        width: maxWeight > minWeight
          ? `mapData(weight, ${minWeight}, ${maxWeight}, 1, 5)`
          : 1.5,
        opacity: 0.5,
        'curve-style': edges.length > 200 ? 'haystack' : 'bezier',
      },
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': '#ed8936',
        'target-arrow-color': '#ed8936',
        opacity: 1,
        width: 3,
      },
    },
  ]
}

function buildLayout(elementCount) {
  const nodeCount = elementCount
  return {
    name: 'cose',
    animate: nodeCount < 100,
    animationDuration: 400,
    nodeRepulsion: nodeCount > 100 ? 8192 : 4096,
    idealEdgeLength: nodeCount > 50 ? 80 : 60,
    gravity: nodeCount > 100 ? 0.5 : 0.8,
    numIter: nodeCount > 100 ? 300 : 200,
    padding: 30,
    nodeDimensionsIncludeLabels: true,
  }
}

export default function NetworkGraph({ elements, onNodeClick, onCyReady }) {
  const [tooltip, setTooltip] = useState(null)
  const cyRef = useRef(null)

  const nodeCount = useMemo(() => elements?.filter(e => !e.data.source).length || 0, [elements])
  const stylesheet = useMemo(() => buildStylesheet(elements || []), [elements])
  const layout = useMemo(() => buildLayout(nodeCount), [nodeCount])

  function exportPNG() {
    if (!cyRef.current) return
    const dataUrl = cyRef.current.png({ bg: '#ffffff', full: true, scale: 2 })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'ignet-network.png'
    a.click()
  }

  function fitGraph() {
    if (cyRef.current) cyRef.current.fit(undefined, 30)
  }

  const handleCy = useCallback(
    (cyInstance) => {
      cyRef.current = cyInstance
      if (onCyReady) onCyReady(cyInstance)

      cyInstance.on('tap', 'node', (evt) => {
        const node = evt.target
        if (onNodeClick) {
          onNodeClick({
            id: node.id(),
            label: node.data('label'),
            degree: node.degree(),
            neighbors: node.neighborhood('node').map((n) => n.data('label')),
          })
        }
      })

      cyInstance.on('mouseover', 'edge', (evt) => {
        const edge = evt.target
        const cat = edge.data('ino_category')
        const weight = edge.data('weight')
        const parts = []
        if (cat && cat !== 'unknown') parts.push(cat.replace(/_/g, ' '))
        if (weight > 1) parts.push(`${weight} evidence`)
        if (parts.length > 0) {
          const renderedPos = evt.renderedPosition
          setTooltip({ x: renderedPos.x, y: renderedPos.y, label: parts.join(' | ') })
        }
      })

      cyInstance.on('mouseout', 'edge', () => setTooltip(null))

      cyInstance.on('mouseover', 'node', (evt) => {
        const node = evt.target
        const degree = node.degree()
        const label = node.data('label')
        const renderedPos = evt.renderedPosition
        setTooltip({ x: renderedPos.x, y: renderedPos.y, label: `${label} (${degree} connections)` })
      })

      cyInstance.on('mouseout', 'node', () => setTooltip(null))
    },
    [onNodeClick],
  )

  if (!elements || elements.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-md border border-gray-200 text-gray-400 text-sm">
        No network data to display
      </div>
    )
  }

  return (
    <div className="relative border border-gray-200 rounded-md overflow-hidden bg-white">
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        layout={layout}
        style={{ width: '100%', height: '500px' }}
        cy={handleCy}
      />
      {tooltip && (
        <div
          className="absolute z-10 bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none capitalize shadow-lg"
          style={{ left: tooltip.x + 10, top: tooltip.y - 28 }}
        >
          {tooltip.label}
        </div>
      )}
      <div className="flex gap-2 p-2 border-t border-gray-100">
        <button
          onClick={fitGraph}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
        >
          Fit to Screen
        </button>
        <button
          onClick={exportPNG}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
        >
          Export PNG
        </button>
      </div>
    </div>
  )
}
