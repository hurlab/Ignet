export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wide">
              Resources
            </h4>
            <ul className="space-y-1">
              {['About', 'Documents', 'Help', 'FAQs', 'Links', 'Contact Us'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-navy text-xs transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wide">
              Legal
            </h4>
            <ul className="space-y-1">
              {['Disclaimer', 'Acknowledgements'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-navy text-xs transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* University logos */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wide">
              Affiliated Institutions
            </h4>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400 font-semibold">UM</span>
              <span className="text-xs text-gray-400 font-semibold">UND</span>
              <span className="text-xs text-gray-400 font-semibold">Bogazici</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-center text-gray-400 text-xs">
            Copyright &copy; 2016&ndash;2026 Ignet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
