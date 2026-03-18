import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

const coreTools = [
  {
    title: 'Network Search',
    description: 'Search PubMed abstracts for gene co-occurrence networks and visualize interactions.',
    to: '/network',
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
]

const newTools = [
  {
    title: 'Analyze Your Text',
    description: 'Upload or paste your own biomedical text to extract gene interactions and build custom networks.',
    to: '/analyze',
  },
  {
    title: 'Explore Networks',
    description: 'Interactive exploration tools for navigating large gene interaction networks by domain and pathway.',
    to: '/explore',
  },
  {
    title: 'REST API',
    description: 'Programmatic access to all Ignet data and analyses via a JSON REST API.',
    href: '/api/v1',
  },
]

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
            to="/network"
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
          <StatCard label="Genes" value={stats?.gene_count} loading={statsLoading} />
          <StatCard label="Gene Pairs" value={stats?.pair_count} loading={statsLoading} />
          <StatCard label="PMIDs" value={stats?.pmid_count} loading={statsLoading} />
          <StatCard label="Abstracts" value={stats?.abstract_count ?? stats?.pmid_count} loading={statsLoading} />
        </div>
      </section>

      {/* Core tools */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Core Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreTools.map(({ title, description, to, icon }) => (
            <Link
              key={to}
              to={to}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <h3 className="font-semibold text-navy group-hover:text-blue-700 text-sm mb-1">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* New in Ignet 2.0 */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-1">New in Ignet 2.0</h2>
        <p className="text-gray-400 text-xs mb-3">Upcoming features currently in development</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {newTools.map(({ title, description, to, href }) => {
            const inner = (
              <div className="bg-white border border-dashed border-gray-300 rounded-lg p-4 relative opacity-80">
                <span className="absolute top-3 right-3 bg-accent text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  COMING SOON
                </span>
                <h3 className="font-semibold text-gray-700 text-sm mb-1 pr-16">{title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
              </div>
            )
            if (to) {
              return <Link key={title} to={to}>{inner}</Link>
            }
            return (
              <a key={title} href={href} target="_blank" rel="noopener noreferrer">
                {inner}
              </a>
            )
          })}
        </div>
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
