import { Link } from 'react-router-dom'
import CopyButton from '../components/CopyButton.jsx'

// Moved out of ApiDocs.jsx: MCP sat between the REST category nav and the REST
// endpoints it pointed at, under a page titled "REST API Documentation". The two
// serve different readers -- developers calling HTTP endpoints, and people
// pointing an AI assistant at Ignet -- and Home and the Footer already linked to
// them as separate destinations.
const MCP_CONFIG = `{
  "mcpServers": {
    "ignet": {
      "url": "https://ignet.org/api/v1/mcp"
    }
  }
}`

const TOOLS = [
  { name: 'ignet_search_genes', desc: 'Search genes by symbol or name' },
  { name: 'ignet_get_gene_neighbors', desc: 'Top interacting genes for a symbol' },
  { name: 'ignet_get_gene_pair_evidence', desc: 'Co-occurrence sentences + scores' },
  { name: 'ignet_get_stats', desc: 'Database statistics' },
  { name: 'ignet_get_enrichment', desc: 'Gene list enrichment analysis' },
  { name: 'vignet_search_vaccines', desc: 'Search vaccines by name or VO ID' },
  { name: 'vignet_get_vaccine_genes', desc: 'Genes associated with a vaccine' },
  { name: 'vignet_get_vaccine_stats', desc: 'Vaccine database statistics' },
]

export default function Mcp() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ignet MCP Server</h1>
        <p className="text-gray-500 mb-3">
          Connect Claude Desktop, Claude.ai, or any MCP-compatible AI assistant directly to Ignet and
          Vignet data using the{' '}
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-700 underline hover:text-purple-900"
          >
            Model Context Protocol
          </a>.
        </p>
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded px-3 py-2">
          <span className="text-xs text-gray-500 font-medium">MCP Endpoint</span>
          <code className="text-sm font-mono text-purple-800">https://ignet.org/api/v1/mcp</code>
          <CopyButton text="https://ignet.org/api/v1/mcp" />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Streamable HTTP transport &mdash; no installation required.
        </p>
      </div>

      {/* Setup */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Setup (Claude Desktop)</h2>
        <p className="text-sm text-gray-600 mb-3">
          Add the server to your MCP configuration, then restart the assistant.
        </p>
        <div className="bg-gray-800 rounded p-3 relative">
          <pre className="text-xs font-mono text-gray-200 overflow-auto whitespace-pre">{MCP_CONFIG}</pre>
          <div className="absolute top-2 right-2">
            <CopyButton text={MCP_CONFIG} />
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Available Tools <span className="text-gray-400 font-normal">({TOOLS.length})</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {TOOLS.map(t => (
            <div
              key={t.name}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded px-2.5 py-1.5"
            >
              <code className="text-[11px] font-mono text-purple-700 flex-shrink-0">{t.name}</code>
              <span className="text-[11px] text-gray-400">&mdash;</span>
              <span className="text-[11px] text-gray-500 truncate">{t.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Cross-link to the REST docs */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">Calling the API directly?</h3>
        <p className="text-sm text-blue-800">
          The{' '}
          <Link to="/api-docs" className="underline font-medium hover:text-blue-600">
            REST API documentation
          </Link>{' '}
          covers every endpoint, with request parameters and a live try-it console.
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
        The MCP server exposes the same data as the REST API. Rate limits apply to AI endpoints.
      </div>
    </div>
  )
}
