import { useEffect, useState } from 'react'

function useDataLastUpdated() {
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetch('/api/v1/stats')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.data_last_updated) {
          // Format "2026-03-26" -> "March 26, 2026"
          const d = new Date(data.data_last_updated + 'T00:00:00Z')
          setLastUpdated(d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }))
        }
      })
      .catch(() => {})
  }, [])

  return lastUpdated
}

export default function Footer() {
  const lastUpdated = useDataLastUpdated()

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
              Resources
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                { label: 'About', href: '/ignet/about' },
                { label: 'API Docs', href: '/ignet/api-docs' },
                { label: 'Links', href: '/ignet/links' },
                { label: 'MCP for AI', href: '/ignet/api-docs#mcp' },
                { label: 'FAQs', href: '/ignet/faqs' },
                { label: 'Contact Us', href: '/ignet/contact' },
                { label: 'User Manual', href: '/ignet/manual' },
                { label: 'Report an Issue', href: 'https://github.com/hurlab/Ignet/issues' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-navy text-sm transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
              Legal
            </h4>
            <ul className="space-y-1">
              {[
                { label: 'Disclaimer', href: '/ignet/disclaimer' },
                { label: 'Acknowledgements', href: '/ignet/acknowledgements' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-navy text-sm transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* University logos */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
              Affiliated Institutions
            </h4>
            <div className="flex items-center gap-5">
              <a href="https://und.edu" target="_blank" rel="noopener noreferrer" title="University of North Dakota">
                <img src="/ignet/images/UND_logo.svg" alt="University of North Dakota" className="h-10 opacity-70 hover:opacity-100 transition-opacity" />
              </a>
              <a href="https://umich.edu" target="_blank" rel="noopener noreferrer" title="University of Michigan">
                <img src="/ignet/images/UM_logo.svg.png" alt="University of Michigan" className="h-10 opacity-70 hover:opacity-100 transition-opacity" />
              </a>
              <a href="https://bogazici.edu.tr" target="_blank" rel="noopener noreferrer" title="Bogazici University">
                <img src="/ignet/images/1200px-Bogazici_University_logo.svg.png" alt="Bogazici University" className="h-10 opacity-70 hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <p className="text-center text-gray-400 text-xs leading-relaxed">
            Supported by NIH/NIAID{' '}
            <a href="https://reporter.nih.gov/search/OGGoe17zsEypH0sHLem22g/project-details/11109428" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">U24AI171008</a>{' '}
            VIOLIN 2.0: Vaccine Information and Ontology LInked kNowledgebase.
          </p>
          <p className="text-center text-gray-400 text-xs">
            {lastUpdated
              ? <>Database updated daily from PubMed &middot; Last updated {lastUpdated}</>
              : 'Database updated daily from PubMed'
            }
          </p>
          <p className="text-center text-gray-400 text-sm">
            Copyright &copy; 2016&ndash;2026 Ignet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
