import { useState } from 'react'
import { API_CATEGORIES, API_ENDPOINTS } from '../data/apiEndpoints.js'

// Method badge colors
const METHOD_COLORS = {
  GET: 'bg-green-100 text-green-800 border border-green-200',
  POST: 'bg-blue-100 text-blue-800 border border-blue-200',
  PUT: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  DELETE: 'bg-red-100 text-red-800 border border-red-200',
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function CodeSnippetTabs({ snippets }) {
  const tabs = Object.keys(snippets)
  const [active, setActive] = useState(tabs[0])

  return (
    <div className="mt-3">
      <div className="flex gap-1 mb-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-3 py-1 text-xs font-medium rounded-t border-b-0 transition-colors ${
              active === tab
                ? 'bg-gray-800 text-white border border-gray-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300 border border-gray-300'
            }`}
          >
            {tab === 'curl' ? 'cURL' : tab === 'python' ? 'Python' : 'R'}
          </button>
        ))}
      </div>
      <div className="bg-gray-800 rounded-b rounded-tr p-3 flex items-start justify-between gap-2">
        <pre className="text-green-300 text-xs overflow-x-auto flex-1 whitespace-pre-wrap break-all">
          {snippets[active]}
        </pre>
        <CopyButton text={snippets[active]} />
      </div>
    </div>
  )
}

function ParamsTable({ params }) {
  if (!params || params.length === 0) return null

  return (
    <div className="mt-3">
      <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Parameters</h5>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 border-b border-gray-200">Name</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 border-b border-gray-200">Type</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 border-b border-gray-200">Required</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 border-b border-gray-200">Description</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p, i) => (
              <tr key={p.name} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 font-mono text-xs text-blue-700 border-b border-gray-100">{p.name}</td>
                <td className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">{p.type}</td>
                <td className="px-3 py-2 border-b border-gray-100">
                  {p.required ? (
                    <span className="text-xs text-red-600 font-medium">required</span>
                  ) : (
                    <span className="text-xs text-gray-400">optional</span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-gray-600 border-b border-gray-100">{p.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EndpointCard({ endpoint }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
        aria-expanded={open}
      >
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono ${METHOD_COLORS[endpoint.method] || 'bg-gray-100 text-gray-700'}`}>
          {endpoint.method}
        </span>
        <span className="font-mono text-sm text-gray-800 flex-1">{endpoint.path}</span>
        {endpoint.auth && (
          <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded">
            Auth required
          </span>
        )}
        <span className="text-gray-400 text-xs ml-2">{open ? '▲' : '▼'}</span>
      </button>

      {/* Collapsible detail panel */}
      {open && (
        <div className="px-4 pb-4 pt-2 bg-white border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>

          <ParamsTable params={endpoint.params} />

          {endpoint.example && (
            <div className="mt-3">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Example</h5>
              {endpoint.example.request && (
                <div className="mb-2">
                  <span className="text-xs text-gray-400 mr-1">Request:</span>
                  <code className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                    {endpoint.example.request}
                  </code>
                </div>
              )}
              {endpoint.example.response && (
                <div className="bg-gray-800 rounded p-3 flex items-start justify-between gap-2">
                  <pre className="text-green-300 text-xs overflow-x-auto flex-1 whitespace-pre-wrap break-all">
                    {endpoint.example.response}
                  </pre>
                  <CopyButton text={endpoint.example.response} />
                </div>
              )}
            </div>
          )}

          {endpoint.snippets && <CodeSnippetTabs snippets={endpoint.snippets} />}
        </div>
      )}
    </div>
  )
}

function CategorySection({ category }) {
  const endpoints = API_ENDPOINTS.filter((e) => e.category === category.id)
  if (endpoints.length === 0) return null

  return (
    <section id={`category-${category.id}`} className="mb-10">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{category.label}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
      </div>
      {endpoints.map((ep) => (
        <EndpointCard key={ep.id} endpoint={ep} />
      ))}
    </section>
  )
}

export default function ApiDocs() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ignet REST API Documentation</h1>
        <p className="text-gray-500 mb-3">
          Programmatic access to gene interaction data, PubMed network analysis, and AI summarization.
        </p>
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded px-3 py-2">
          <span className="text-xs text-gray-500 font-medium">Base URL</span>
          <code className="text-sm font-mono text-gray-800">https://ignet.org/api/v1</code>
          <CopyButton text="https://ignet.org/api/v1" />
        </div>
      </div>

      {/* Quick navigation */}
      <div className="mb-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-blue-800 mb-3 uppercase tracking-wide">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {API_CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={`#category-${cat.id}`}
              className="text-sm text-blue-700 hover:text-blue-900 bg-white border border-blue-200 rounded px-3 py-1 transition-colors"
            >
              {cat.label}
            </a>
          ))}
        </div>
      </div>

      {/* Authentication note */}
      <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-yellow-800 mb-1">Authentication</h3>
        <p className="text-sm text-yellow-700">
          Most endpoints are publicly accessible. Endpoints marked <span className="font-medium">Auth required</span> need
          a JWT token obtained via <code className="font-mono text-xs bg-yellow-100 px-1 rounded">/api/v1/auth/login</code>.
          Pass the token in the <code className="font-mono text-xs bg-yellow-100 px-1 rounded">Authorization: Bearer &lt;token&gt;</code> header.
        </p>
      </div>

      {/* Endpoint sections */}
      {API_CATEGORIES.map((cat) => (
        <CategorySection key={cat.id} category={cat} />
      ))}

      {/* Footer note */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
        All responses are JSON. The API uses standard HTTP status codes.
        Rate limits apply to AI endpoints.
      </div>
    </div>
  )
}
