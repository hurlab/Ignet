// @MX:ANCHOR: [AUTO] TrendChart — shared inline-SVG bar chart for gene and pair trend data
// @MX:REASON: fan_in >= 3 (Gene.jsx, GenePair.jsx, potential future callers); zero-dependency SVG contract must not change silently

/**
 * TrendChart — compact inline-SVG bar chart for "Evidence over time" data.
 *
 * Props:
 *   data      {Array<{year: number, cooc: number, pmids?: number}>}  Trends array from API (may be empty)
 *   valueKey  {string}   Key to read from each datum (default: 'cooc')
 *   title     {string}   Card title shown above the SVG
 *   color     {string}   Bar fill color (default: '#2563eb')
 *   height    {number}   viewBox height in SVG units (default: 120)
 *
 * The component is self-contained and dependency-free (no charting library).
 */

const VIEW_W = 600
const PAD_LEFT = 36   // space for y-axis label
const PAD_RIGHT = 8
const PAD_TOP = 18    // space for max-value label
const PAD_BOTTOM = 22 // space for x-axis year labels

export default function TrendChart({ data = [], valueKey = 'cooc', title, color = '#2563eb', height = 120 }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {title && <h3 className="text-sm font-semibold text-navy mb-2">{title}</h3>}
        <p className="text-xs text-gray-400 italic">No dated evidence available.</p>
      </div>
    )
  }

  const VIEW_H = height

  const values = data.map((d) => d[valueKey] ?? 0)
  const maxVal = Math.max(...values, 1)
  const n = data.length

  // Compute bar geometry
  const plotW = VIEW_W - PAD_LEFT - PAD_RIGHT
  const plotH = VIEW_H - PAD_TOP - PAD_BOTTOM
  const barW = Math.max(1, plotW / n - 1)
  const gap = plotW / n

  // Thin x-axis labels: always show first + last; pick ~5 evenly-spaced interior indices
  const MAX_LABELS = 7
  const labelIndices = new Set()
  labelIndices.add(0)
  labelIndices.add(n - 1)
  if (n > 2) {
    const step = Math.max(1, Math.floor((n - 1) / (MAX_LABELS - 1)))
    for (let i = step; i < n - 1; i += step) {
      labelIndices.add(i)
      if (labelIndices.size >= MAX_LABELS) break
    }
  }

  // Accessibility summary
  const firstYear = data[0].year
  const lastYear = data[n - 1].year
  const peakIdx = values.indexOf(maxVal)
  const peakYear = data[peakIdx]?.year ?? lastYear
  const ariaLabel = `Evidence over time: ${n} year${n !== 1 ? 's' : ''} from ${firstYear} to ${lastYear}, peak ${maxVal} in ${peakYear}`

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {title && <h3 className="text-sm font-semibold text-navy mb-2">{title}</h3>}

      {/* Accessible SVG bar chart */}
      <svg
        role="img"
        aria-label={ariaLabel}
        width="100%"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Max-value label top-left */}
        <text
          x={PAD_LEFT - 2}
          y={PAD_TOP - 4}
          textAnchor="end"
          fontSize="9"
          fill="#9ca3af"
        >
          {maxVal.toLocaleString()}
        </text>

        {/* Light top reference line */}
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP}
          x2={VIEW_W - PAD_RIGHT}
          y2={PAD_TOP}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />

        {/* Bars */}
        {data.map((d, i) => {
          const val = d[valueKey] ?? 0
          const barH = Math.max(1, (val / maxVal) * plotH)
          const x = PAD_LEFT + i * gap
          const y = PAD_TOP + plotH - barH

          return (
            <g key={d.year}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill={color}
                fillOpacity={val === maxVal ? 1 : 0.72}
                rx="1"
              >
                <title>{d.year}: {val.toLocaleString()} co-occurrences</title>
              </rect>
            </g>
          )
        })}

        {/* X-axis year labels (thinned) */}
        {data.map((d, i) => {
          if (!labelIndices.has(i)) return null
          const x = PAD_LEFT + i * gap + barW / 2
          const y = PAD_TOP + plotH + 13
          return (
            <text
              key={d.year}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize="9"
              fill="#6b7280"
            >
              {d.year}
            </text>
          )
        })}
      </svg>

      {/* Visually-hidden data table — screen reader text alternative (mirrors NetworkGraph.jsx pattern) */}
      <div className="sr-only">
        <p>{ariaLabel}</p>
        <table>
          <caption>Co-occurrence evidence by year</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Co-occurrences</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year}>
                <td>{d.year}</td>
                <td>{d[valueKey] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
