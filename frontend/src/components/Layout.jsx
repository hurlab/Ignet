import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  const location = useLocation()
  const mainRef = useRef(null)

  // Move keyboard focus to main content on SPA route change so screen-reader
  // users and keyboard-only users start at content, not back at the header.
  useEffect(() => {
    mainRef.current?.focus()
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip link — visible only on keyboard focus, hidden from mouse users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-white focus:text-navy focus:px-3 focus:py-2 focus:rounded focus:shadow"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
