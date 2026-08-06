import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { formatLong } from '../hooks/useDataLastUpdated.js'
import { HOME_TOOL_GROUPS } from '../data/tools.js'

// Tool cards, their names, their order and their group tints all come from the
// shared catalogue (src/data/tools.js) -- the same list the header nav renders.
// This page used to keep its own copy, which is how four tools ended up with
// two names each and the AI group was labelled "AI" here but "AI Tools" there.
//
// Groups deliberately straddle rows: the group sizes do not align to a
// 3-column grid, and colour + tag carry the grouping instead of row breaks.


const apiInfo = {
  title: 'REST API',
  description: 'Programmatic access to all Ignet data and analyses via a JSON REST API with 19 endpoints.',
  to: '/api-docs',
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

// Same exact-date format Footer already shows ("Data through July 22, 2026"),
// so the two dates on the page agree instead of one being month-only.
function dataThroughLabel(isoDate) {
  if (!isoDate) return null
  const d = new Date(isoDate + 'T00:00:00Z')
  if (Number.isNaN(d.getTime())) return null
  return formatLong(d)
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

  const dataThrough = dataThroughLabel(stats?.data_last_updated)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Hero */}
      <section className="text-center py-4 space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight">
          Integrative Gene Network{' '}
          <span className="ml-2 text-base font-semibold text-blue-500 align-super">2.0</span>
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
        <h2 className="text-base font-semibold text-gray-700 mb-0">Database Statistics</h2>
        <p className="text-xs text-gray-400 mt-0.5 mb-3">
          {dataThrough ? `Based on PubMed literature through ${dataThrough}` : 'Based on PubMed literature'}
        </p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HOME_TOOL_GROUPS.flatMap(g =>
            g.tools.map(({ label, description, to, icon }) => (
              <Link
                key={to}
                to={to}
                className={`${g.card} border rounded-lg px-4 py-3 hover:shadow-md transition-all group flex items-start gap-3`}
              >
                <div className="text-xl flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-semibold text-navy text-sm">{label}</h3>
                    {/* Non-colour cue: tint alone would be invisible to
                        colourblind users and on washed-out projectors. */}
                    <span className={`${g.tag} text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 flex-shrink-0`}>
                      {g.label}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed mt-0.5">{description}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* REST API */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Developer Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            to={apiInfo.to}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <h3 className="font-semibold text-navy group-hover:text-blue-700 text-sm mb-1">{apiInfo.title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed">{apiInfo.description}</p>
            <code className="text-[11px] text-blue-600 mt-2 block">/api/v1/genes/search?q=BRCA1</code>
          </Link>
          <Link
            to="/mcp"
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all group"
          >
            <h3 className="font-semibold text-navy group-hover:text-purple-700 text-sm mb-1">MCP for AI Assistants</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Connect Claude, ChatGPT, or other AI assistants directly to Ignet and Vignet data using the Model Context Protocol.
            </p>
            <code className="text-[11px] text-purple-600 mt-2 block">https://ignet.org/api/v1/mcp</code>
          </Link>
        </div>
      </section>

      {/* Sister project */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Sister Project</h2>
        <a
          href="/vignet/"
          className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-400 hover:shadow-md transition-all group"
        >
          <img src="/vignet/favicon.svg" alt="Vignet" className="w-10 h-10 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-teal-700 group-hover:text-teal-600 text-sm mb-0.5">Vignet &mdash; Vaccine-focused Integrative Gene Network</h3>
            <p className="text-gray-500 text-xs leading-relaxed">Explore vaccine-gene interaction networks from PubMed literature using the Vaccine Ontology.</p>
          </div>
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
            network database from PubMed literature mining.</strong> University of North Dakota /
            University of Michigan / Bogazici University, 2016&ndash;2026.
          </p>
        </blockquote>
      </section>
    </div>
  )
}
