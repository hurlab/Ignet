import { useState, useCallback, useRef } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'

const stylesheet = [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'font-size': '10px',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 5,
      color: '#374151',
      'text-outline-color': '#ffffff',
      'text-outline-width': 2,
      'min-zoomed-font-size': 8,
      // Node color mapped by degree centrality: light blue (low) to dark navy (high)
      'background-color': 'mapData(centrality_d, 0, 1, #93c5fd, #1e3a5f)',
      width: 'mapData(degree, 1, 20, 20, 50)',
      height: 'mapData(degree, 1, 20, 20, 50)',
      'border-width': 2,
      'border-color': '#1a365d',
    },
  },
  {
    selector: 'node:selected',
    style: {
      'background-color': '#ed8936',
      'border-color': '#c05621',
    },
  },
  {
    selector: 'edge',
    style: {
      // Edge color driven by INO category color from backend
      'line-color': 'data(ino_color)',
      'target-arrow-color': 'data(ino_color)',
      width: 'mapData(weight, 1, 50, 1, 4)',
      opacity: 0.7,
      'curve-style': 'bezier',
    },
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#ed8936',
      'target-arrow-color': '#ed8936',
      opacity: 1,
    },
  },
]

const layout = {
  name: 'cose',
  animate: true,
  animationDuration: 500,
  nodeRepulsion: 4096,
  gravity: 1,
  padding: 20,
}

export default function NetworkGraph({ elements, onNodeClick }) {
  const [cy, setCy] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const cyRef = useRef(null)

  function exportPNG() {
    if (!cyRef.current) return
    const dataUrl = cyRef.current.png({ bg: '#ffffff', full: true, scale: 2 })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'ignet-network.png'
    a.click()
  }

  const handleCy = useCallback(
    (cyInstance) => {
      setCy(cyInstance)
      cyRef.current = cyInstance

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

      // Show INO category tooltip on edge hover
      cyInstance.on('mouseover', 'edge', (evt) => {
        const edge = evt.target
        const cat = edge.data('ino_category') || 'unknown'
        const renderedPos = evt.renderedPosition
        setTooltip({ x: renderedPos.x, y: renderedPos.y, label: cat.replace(/_/g, ' ') })
      })

      cyInstance.on('mouseout', 'edge', () => {
        setTooltip(null)
      })
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
          className="absolute z-10 bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none capitalize"
          style={{ left: tooltip.x + 8, top: tooltip.y - 24 }}
        >
          {tooltip.label}
        </div>
      )}
      <div className="flex gap-2 p-2 border-t border-gray-100">
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
