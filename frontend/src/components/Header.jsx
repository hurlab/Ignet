import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { useGeneSet } from '../GeneSetContext.jsx'

const navGroups = [
  {
    label: 'Explore',
    items: [
      { label: 'Dignet', to: '/dignet', desc: 'Full-text literature search' },
      { label: 'Gene', to: '/gene', desc: 'Gene profile and network' },
      { label: 'GenePair', to: '/genepair', desc: 'Pairwise gene evidence' },
      { label: 'Explore', to: '/explore', desc: 'Browse top genes' },
    ],
  },
  {
    label: 'Analyze',
    items: [
      { label: 'Enrichment', to: '/enrichment', desc: 'Gene set enrichment' },
      { label: 'Compare', to: '/compare', desc: 'Compare two gene sets' },
      { label: 'INO', to: '/ino', desc: 'Interaction Network Ontology' },
      { label: 'Report', to: '/report', desc: 'Generate analysis report' },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { label: 'BioSummarAI', to: '/biosummarai', desc: 'AI literature summary' },
      { label: 'Analyze Text', to: '/analyze', desc: 'Extract genes from text' },
      { label: 'Assistant', to: '/assistant', desc: 'AI research assistant' },
    ],
  },
]

const allLinks = navGroups.flatMap(g => g.items)

function Dropdown({ group }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const closeTimer = useRef(null)
  const location = useLocation()
  const isGroupActive = group.items.some(item => location.pathname.startsWith(item.to))

  // Close on navigation
  useEffect(() => { setOpen(false) }, [location.pathname])

  function handleEnter() {
    clearTimeout(closeTimer.current)
    setOpen(true)
  }

  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
          isGroupActive
            ? 'bg-blue-700 text-white'
            : 'text-blue-100 hover:bg-blue-800 hover:text-white'
        }`}
      >
        {group.label}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 pt-1 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px]">
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-navy font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-navy'
                  }`
                }
              >
                <div className="font-medium">{item.label}</div>
                {item.desc && <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const [pubmedQuery, setPubmedQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()
  const geneSet = useGeneSet()
  const geneCount = geneSet?.genes?.length ?? 0

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  function handlePubmed(e) {
    e.preventDefault()
    if (pubmedQuery.trim()) {
      navigate(`/dignet?q=${encodeURIComponent(pubmedQuery.trim())}`)
      setPubmedQuery('')
    }
  }

  return (
    <header className="bg-navy text-white flex-shrink-0 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-bold text-lg tracking-tight hover:text-orange-200 transition-colors flex-shrink-0"
        >
          <img src="/ignet/favicon.svg" alt="" className="w-6 h-6" />
          Ignet
        </Link>

        {/* Nav dropdown groups */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navGroups.map(group => (
            <Dropdown key={group.label} group={group} />
          ))}
        </nav>

        {/* PubMed search */}
        <form onSubmit={handlePubmed} className="hidden lg:flex items-center gap-1 flex-shrink-0">
          <input
            type="text"
            value={pubmedQuery}
            onChange={(e) => setPubmedQuery(e.target.value)}
            placeholder="PubMed search..."
            className="bg-blue-800 text-white placeholder-blue-300 text-sm px-2 py-1 rounded border border-blue-600 focus:outline-none focus:border-blue-400 w-36"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded transition-colors"
          >
            Go
          </button>
        </form>

        {/* Hamburger button — mobile only */}
        <button
          className="md:hidden flex flex-col justify-center items-center gap-1 ml-auto p-1"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className="block w-6 h-0.5 bg-white" />
          <span className="block w-6 h-0.5 bg-white" />
          <span className="block w-6 h-0.5 bg-white" />
        </button>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0 md:ml-0">
          {geneCount > 0 && (
            <Link
              to="/geneset"
              className="bg-blue-700 text-white text-[11px] font-medium px-2 py-0.5 rounded-full hover:bg-blue-600 transition-colors"
            >
              Set ({geneCount})
            </Link>
          )}
          <a
            href="/ignet_legacy/"
            className="text-blue-300 text-[11px] hover:text-white transition-colors"
          >
            v2.1
          </a>
          {auth?.user ? (
            <>
              <span className="text-blue-100 text-sm truncate max-w-[120px]">
                {auth.user.username ?? auth.user.email}
              </span>
              <button
                onClick={() => auth.logout()}
                className="border border-blue-400 text-blue-100 hover:bg-blue-700 hover:text-white text-sm font-medium px-3 py-1 rounded transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="border border-blue-400 text-blue-100 hover:bg-blue-700 hover:text-white text-sm font-medium px-3 py-1 rounded transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div className="md:hidden bg-navy border-t border-blue-800 px-4 py-3 flex flex-col gap-1">
          {/* Nav groups */}
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider px-3 py-1 mt-2 first:mt-0">
                {group.label}
              </div>
              {group.items.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          ))}

          {/* PubMed search */}
          <form onSubmit={(e) => { handlePubmed(e); setMenuOpen(false) }} className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={pubmedQuery}
              onChange={(e) => setPubmedQuery(e.target.value)}
              placeholder="PubMed search..."
              className="flex-1 bg-blue-800 text-white placeholder-blue-300 text-sm px-3 py-2 rounded border border-blue-600 focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              className="bg-accent hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
            >
              Go
            </button>
          </form>

          {/* Gene Set badge */}
          {geneCount > 0 && (
            <Link
              to="/geneset"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors text-blue-100 hover:bg-blue-800 hover:text-white"
            >
              <span className="bg-blue-700 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
                Set ({geneCount})
              </span>
              Gene Set
            </Link>
          )}

          {/* Auth */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-800">
            {auth?.user ? (
              <>
                <span className="text-blue-100 text-sm flex-1 truncate">
                  {auth.user.username ?? auth.user.email}
                </span>
                <button
                  onClick={() => { auth.logout(); setMenuOpen(false) }}
                  className="border border-blue-400 text-blue-100 hover:bg-blue-700 hover:text-white text-sm font-medium px-3 py-1.5 rounded transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="border border-blue-400 text-blue-100 hover:bg-blue-700 hover:text-white text-sm font-medium px-3 py-1.5 rounded transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
