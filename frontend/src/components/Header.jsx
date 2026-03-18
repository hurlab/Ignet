import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()

  function handlePubmed(e) {
    e.preventDefault()
    if (pubmedQuery.trim()) {
      navigate(`/network?q=${encodeURIComponent(pubmedQuery.trim())}`)
      setPubmedQuery('')
    }
  }

  return (
    <header className="bg-navy text-white h-14 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-4">
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
                `flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
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
            className="bg-blue-800 text-white placeholder-blue-300 text-xs px-2 py-1 rounded border border-blue-600 focus:outline-none focus:border-blue-400 w-36"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded transition-colors"
          >
            Go
          </button>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto md:ml-0">
          <a
            href="/ignet_legacy/"
            className="text-blue-300 text-[11px] hover:text-white transition-colors"
          >
            v1.0
          </a>
          <Link
            to="/login"
            className="border border-blue-400 text-blue-100 hover:bg-blue-700 hover:text-white text-xs font-medium px-3 py-1 rounded transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  )
}
