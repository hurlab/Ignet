import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

const navLinks = [
  { label: 'Network Search', to: '/network' },
  { label: 'Analyze Text', to: '/analyze', badge: 'NEW' },
  { label: 'Gene', to: '/gene' },
  { label: 'GenePair', to: '/genepair' },
  { label: 'BioSummarAI', to: '/biosummarai' },
  { label: 'Explore', to: '/explore', badge: 'NEW' },
]

export default function Header() {
  const [pubmedQuery, setPubmedQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  function handlePubmed(e) {
    e.preventDefault()
    if (pubmedQuery.trim()) {
      navigate(`/network?q=${encodeURIComponent(pubmedQuery.trim())}`)
      setPubmedQuery('')
    }
  }

  return (
    <header className="bg-navy text-white flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Brand */}
        <Link
          to="/"
          className="text-white font-bold text-lg tracking-tight hover:text-orange-200 transition-colors flex-shrink-0"
        >
          Ignet
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1 overflow-hidden">
          {navLinks.map(({ label, to, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`
              }
            >
              {label}
              {badge && (
                <span className="bg-accent text-white text-[10px] px-1 py-0.5 rounded font-semibold leading-none">
                  {badge}
                </span>
              )}
            </NavLink>
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
          <a
            href="/ignet_legacy/"
            className="text-blue-300 text-[11px] hover:text-white transition-colors"
          >
            v1.0
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
          {/* Nav links */}
          {navLinks.map(({ label, to, badge }) => (
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
              {badge && (
                <span className="bg-accent text-white text-[10px] px-1 py-0.5 rounded font-semibold leading-none">
                  {badge}
                </span>
              )}
            </NavLink>
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
