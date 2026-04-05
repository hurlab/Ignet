import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'

function buildStylesheet(elements) {
  const nodes = elements.filter(e => !e.data.source)
  const edges = elements.filter(e => e.data.source)

  const degrees = {}
  edges.forEach(({ data: { source, target } }) => {
    degrees[source] = (degrees[source] || 0) + 1
    degrees[target] = (degrees[target] || 0) + 1
  })
  const maxDegree = Math.max(...Object.values(degrees), 1)
  const minDegree = Math.min(...Object.values(degrees), 1)

  const hasCentrality = nodes.some(n => n.data.centrality_d > 0)
  const hasIno = edges.some(e => e.data.ino_color && e.data.ino_color !== '#a0aec0')

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
        'background-color': hasCentrality
          ? 'mapData(centrality_d, 0, 1, #bfdbfe, #1e3a5f)'
          : `mapData(degree, ${minDegree}, ${Math.max(maxDegree, minDegree + 1)}, #93c5fd, #1e3a5f)`,
        width: `mapData(degree, ${minDegree}, ${Math.max(maxDegree, minDegree + 1)}, 25, 60)`,
        height: `mapData(degree, ${minDegree}, ${Math.max(maxDegree, minDegree + 1)}, 25, 60)`,
        'border-width': 1.5,
        'border-color': '#1a365d',
        'border-opacity': 0.6,
      },
    },
    {
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
    {
      selector: 'node[nodeType="drug"]',
      style: {
        'background-color': '#38a169',
        'shape': 'diamond',
        width: 20, height: 20,
        'border-color': '#276749',
        'border-width': 1.5,
        'font-size': '8px',
        color: '#276749',
      },
    },
    {
      selector: 'node[nodeType="disease"]',
      style: {
        'background-color': '#e53e3e',
        'shape': 'triangle',
        width: 20, height: 20,
        'border-color': '#9b2c2c',
        'border-width': 1.5,
        'font-size': '8px',
        color: '#9b2c2c',
      },
    },
    {
      selector: 'node[nodeType="ino"]',
      style: {
        'background-color': '#9f7aea',
        'shape': 'hexagon',
        width: 18, height: 18,
        'border-color': '#6b46c1',
        'border-width': 1.5,
        'font-size': '7px',
        color: '#6b46c1',
      },
    },
    {
      selector: 'edge[edgeType="entity"]',
      style: {
        'line-style': 'dashed',
        'line-color': '#cbd5e0',
        width: 1,
        opacity: 0.4,
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
  const [fullscreen, setFullscreen] = useState(false)
  const cyRef = useRef(null)
  const containerRef = useRef(null)

  const nodeCount = useMemo(() => elements?.filter(e => !e.data.source).length || 0, [elements])
  const stylesheet = useMemo(() => buildStylesheet(elements || []), [elements])
  const layout = useMemo(() => buildLayout(nodeCount), [nodeCount])

  // Handle ESC to exit fullscreen
  useEffect(() => {
    if (!fullscreen) return
    function onKey(e) { if (e.key === 'Escape') setFullscreen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen])

  // Refit graph when toggling fullscreen
  useEffect(() => {
    if (cyRef.current) {
      setTimeout(() => {
        cyRef.current.resize()
        cyRef.current.fit(undefined, 30)
      }, 100)
    }
  }, [fullscreen])

  function exportPNG() {
    if (!cyRef.current) return
    const dataUrl = cyRef.current.png({ bg: '#ffffff', full: true, scale: 2 })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'ignet-network.png'
    a.click()
  }

  function exportCytoscapeJSON() {
    if (!cyRef.current) return
    const json = cyRef.current.json()
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'ignet-network.cyjs'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function exportXGMML() {
    if (!cyRef.current) return
    const cy = cyRef.current
    const nodes = cy.nodes().map(n => {
      const pos = n.position()
      return `    <node id="${n.id()}" label="${n.data('label') || n.id()}">
      <att name="degree" type="integer" value="${n.degree()}"/>
      <graphics x="${pos.x.toFixed(1)}" y="${pos.y.toFixed(1)}"/>
    </node>`
    })
    const edges = cy.edges().map(e => {
      const parts = [`    <edge source="${e.data('source')}" target="${e.data('target')}"`]
      if (e.data('label')) parts.push(` label="${e.data('label')}"`)
      parts.push('>')
      if (e.data('weight')) parts.push(`      <att name="weight" type="real" value="${e.data('weight')}"/>`)
      if (e.data('score') != null) parts.push(`      <att name="score" type="real" value="${e.data('score')}"/>`)
      if (e.data('ino_category')) parts.push(`      <att name="ino_category" type="string" value="${e.data('ino_category')}"/>`)
      parts.push('    </edge>')
      return parts.join('\n')
    })
    const xgmml = `<?xml version="1.0" encoding="UTF-8"?>
<graph label="Ignet Network" xmlns="http://www.cs.rpi.edu/XGMML">
${nodes.join('\n')}
${edges.join('\n')}
</graph>`
    const blob = new Blob([xgmml], { type: 'application/xml' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'ignet-network.xgmml'
    a.click()
    URL.revokeObjectURL(a.href)
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
        if (weight > 1) parts.push(`${weight} PMIDs`)
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

  const wrapperClass = fullscreen
    ? 'fixed inset-0 z-[9999] bg-white flex flex-col'
    : 'relative border border-gray-200 rounded-md overflow-hidden bg-white'

  return (
    <div ref={containerRef} className={wrapperClass}>
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        layout={layout}
        style={{ width: '100%', height: fullscreen ? 'calc(100vh - 44px)' : '500px' }}
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
      <div className="flex gap-2 p-2 border-t border-gray-100 flex-wrap items-center bg-white">
        <button
          onClick={() => setFullscreen(f => !f)}
          className="text-xs bg-navy hover:bg-navy-dark text-white px-2.5 py-1 rounded transition-colors font-medium"
          title={fullscreen ? 'Exit fullscreen (Esc)' : 'Expand to fullscreen'}
        >
          {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <button onClick={fitGraph}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors">
          Fit
        </button>
        <button onClick={exportPNG}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors">
          PNG
        </button>
        <button onClick={exportCytoscapeJSON}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors">
          Cytoscape JSON
        </button>
        <button onClick={exportXGMML}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors">
          XGMML
        </button>
        <div className="text-[10px] text-gray-400 ml-auto">
          {fullscreen ? 'Press Esc to exit · ' : ''}Scroll to zoom · Drag to pan · Click node for details
        </div>
      </div>
    </div>
  )
}
