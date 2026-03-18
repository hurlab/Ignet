import { useState, useCallback } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'

const stylesheet = [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'font-size': '9px',
      'text-valign': 'center',
      'text-halign': 'center',
      color: '#fff',
      'background-color': '#2b6cb0',
      width: 'mapData(degree, 1, 20, 20, 50)',
      height: 'mapData(degree, 1, 20, 20, 50)',
      'border-width': 2,
      'border-color': '#1a365d',
    },
  },
  {
    selector: 'node[?highDegree]',
    style: {
      'background-color': '#1a365d',
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
      width: 'mapData(weight, 1, 50, 1, 4)',
      'line-color': '#a0aec0',
      opacity: 0.7,
      'curve-style': 'bezier',
    },
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#ed8936',
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

  const handleCy = useCallback(
    (cyInstance) => {
      setCy(cyInstance)
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
    </div>
  )
}
