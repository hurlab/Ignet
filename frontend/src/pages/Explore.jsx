const domains = [
  {
    title: 'Pathway Explorer',
    description: 'Navigate gene networks organized by biological pathways and functional categories.',
    icon: '🔀',
  },
  {
    title: 'Disease Networks',
    description: 'Explore gene interaction networks associated with specific diseases and phenotypes.',
    icon: '🏥',
  },
  {
    title: 'Tissue Expression',
    description: 'Filter networks by tissue-specific gene expression patterns.',
    icon: '🔬',
  },
  {
    title: 'Network Comparison',
    description: 'Compare gene interaction networks across species or experimental conditions.',
    icon: '⚖️',
  },
  {
    title: 'Subgraph Analysis',
    description: 'Identify densely connected subgraphs and community structures within networks.',
    icon: '🕸️',
  },
  {
    title: 'Timeline View',
    description: 'Track how gene interaction knowledge has evolved over time in the literature.',
    icon: '📅',
  },
]

export default function Explore() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
          COMING SOON
        </span>
        <h1 className="text-xl font-bold text-navy">Explore Networks</h1>
        <p className="text-gray-500 text-sm max-w-xl mx-auto">
          Advanced interactive exploration tools for navigating large gene interaction
          networks. Part of the upcoming Ignet 2.0 release.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map(({ title, description, icon }) => (
          <div
            key={title}
            className="bg-white border border-dashed border-gray-300 rounded-lg p-5 opacity-75"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <h3 className="font-semibold text-gray-700 text-sm mb-1">{title}</h3>
            <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
