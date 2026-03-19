import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
              Resources
            </h4>
            <ul className="space-y-1">
              {[
                { label: 'About', to: '/about' },
                { label: 'FAQs', to: '/faqs' },
                { label: 'Links', to: '/links' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'API Docs', to: '/api-docs' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-gray-500 hover:text-navy text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
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
                { label: 'Disclaimer', to: '/disclaimer' },
                { label: 'Acknowledgements', to: '/acknowledgements' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-gray-500 hover:text-navy text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
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

        <div className="border-t border-gray-200 pt-4">
          <p className="text-center text-gray-400 text-sm">
            Copyright &copy; 2016&ndash;2026 Ignet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
