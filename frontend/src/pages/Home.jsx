import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

const coreTools = [
  {
    title: 'Dignet',
    description: 'Search PubMed abstracts for gene co-occurrence networks and visualize interactions.',
    to: '/dignet',
    icon: '🔬',
  },
  {
    title: 'Gene',
    description: 'Look up a gene symbol to find its top interacting partners and co-occurrence scores.',
    to: '/gene',
    icon: '🧬',
  },
  {
    title: 'GenePair',
    description: 'Query a pair of genes to assess their interaction probability and co-occurrence evidence.',
    to: '/genepair',
    icon: '🔗',
  },
  {
    title: 'BioSummarAI',
    description: 'AI-powered summarization of gene interactions from biomedical literature.',
    to: '/biosummarai',
    icon: '🤖',
  },
  {
    title: 'Analyze Text',
    description: 'Paste biomedical text to detect genes and predict interactions with BioBERT.',
    to: '/analyze',
    icon: '📝',
    badge: 'NEW',
  },
  {
    title: 'Explore',
    description: 'Browse the most connected genes and explore interaction networks.',
    to: '/explore',
    icon: '🌐',
    badge: 'NEW',
  },
  {
    title: 'Enrichment',
    description: 'Paste a gene list to analyze pairwise interactions, INO types, and associated drugs and diseases.',
    to: '/enrichment',
    icon: '📊',
    badge: 'NEW',
  },
  {
    title: 'Compare Networks',
    description: 'Compare two PubMed-driven gene networks side by side with overlap analysis.',
    to: '/compare',
    icon: '⚖️',
    badge: 'NEW',
  },
  {
    title: 'INO Explorer',
    description: 'Browse 800+ interaction types from the Interaction Network Ontology.',
    to: '/ino',
    icon: '🔖',
    badge: 'NEW',
  },
  {
    title: 'AI Assistant',
    description: 'Ask questions about gene interactions and get answers grounded in PubMed evidence.',
    to: '/assistant',
    icon: '💬',
    badge: 'NEW',
  },
]

const apiInfo = {
  title: 'REST API',
  description: 'Programmatic access to all Ignet data and analyses via a JSON REST API with 19 endpoints.',
  href: '/api/v1/health',
}

function StatCard({ label, value, loading }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
      <div className="text-2xl font-bold text-navy">
        {loading ? (
          <span className="text-gray-300">—</span>
        ) : (
          value?.toLocaleString() ?? '—'
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}

export default function Home() {
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    api.stats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Under Construction Banner */}
      <section className="bg-amber-50 border-2 border-dashed border-amber-400 rounded-xl p-6 text-center space-y-3">
        <div className="text-6xl">🚧</div>
        <h2 className="text-lg font-bold text-amber-800">
          Ignet 2.0 is Under Active Development
        </h2>
        <p className="text-amber-700 text-sm max-w-xl mx-auto">
          We are rebuilding Ignet with a modern interface, new AI-powered tools, and a REST API.
          Some features may be incomplete or behave unexpectedly during this transition.
        </p>
        <a
          href="/ignet_legacy/"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm shadow-sm"
        >
          <span className="text-lg">📦</span>
          Go to Previous Version (Ignet 1.0)
        </a>
      </section>

      {/* Hero */}
      <section className="text-center py-10 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight">
          Integrative Gene Interaction Network
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm">
          Discover gene co-occurrence and interaction networks from PubMed biomedical literature
          using natural language processing and machine learning.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/dignet"
            className="bg-accent hover:bg-orange-500 text-white font-semibold px-5 py-2 rounded transition-colors text-sm"
          >
            Search PubMed Networks
          </Link>
          <Link
            to="/gene"
            className="border border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold px-5 py-2 rounded transition-colors text-sm"
          >
            Explore Genes
          </Link>
        </div>
      </section>

      {/* Live stats */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Database Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Genes" value={stats?.total_genes} loading={statsLoading} />
          <StatCard label="Gene Pairs" value={stats?.total_interactions} loading={statsLoading} />
          <StatCard label="PMIDs" value={stats?.total_pmids} loading={statsLoading} />
          <StatCard label="Sentences" value={stats?.total_sentences} loading={statsLoading} />
        </div>
      </section>

      {/* Core tools */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreTools.map(({ title, description, to, icon, badge }) => (
            <Link
              key={to}
              to={to}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all group relative"
            >
              {badge && (
                <span className="absolute top-3 right-3 bg-accent text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  {badge}
                </span>
              )}
              <div className="text-2xl mb-2">{icon}</div>
              <h3 className="font-semibold text-navy group-hover:text-blue-700 text-sm mb-1">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* REST API */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Developer Access</h2>
        <a
          href={apiInfo.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <h3 className="font-semibold text-navy group-hover:text-blue-700 text-sm mb-1">{apiInfo.title}</h3>
          <p className="text-gray-500 text-xs leading-relaxed">{apiInfo.description}</p>
          <code className="text-[11px] text-blue-600 mt-2 block">/api/v1/genes/search?q=BRCA1</code>
        </a>
      </section>

      {/* About */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="font-semibold text-navy mb-2 text-sm">About Ignet</h2>
        <p className="text-gray-600 text-xs leading-relaxed">
          Ignet is an integrative gene interaction network database built from co-occurrence mining
          of PubMed biomedical abstracts. It provides researchers with tools to explore gene
          relationships, predict novel interactions using BioBERT-based models, and generate
          AI-powered summaries of gene functions from literature. Ignet covers hundreds of
          thousands of gene pairs across multiple species.
        </p>
      </section>

      {/* Citation */}
      <section>
        <blockquote className="border-l-4 border-navy pl-4 py-2 bg-blue-50 rounded-r-md">
          <p className="text-xs text-gray-600 italic leading-relaxed">
            If you use Ignet in your research, please cite: <strong>Ignet: An integrative gene interaction
            network database from PubMed literature mining.</strong> University of Michigan / UND / Bogazici
            University, 2016&ndash;2026.
          </p>
        </blockquote>
      </section>
    </div>
  )
}
