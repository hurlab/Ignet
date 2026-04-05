import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'
import NotFound from './pages/NotFound.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const Dignet = lazy(() => import('./pages/Dignet.jsx'))
const Gene = lazy(() => import('./pages/Gene.jsx'))
const GenePair = lazy(() => import('./pages/GenePair.jsx'))
const BioSummarAI = lazy(() => import('./pages/BioSummarAI.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const AnalyzeText = lazy(() => import('./pages/AnalyzeText.jsx'))
const Explore = lazy(() => import('./pages/Explore.jsx'))
const GeneSet = lazy(() => import('./pages/GeneSet.jsx'))
const ApiDocs = lazy(() => import('./pages/ApiDocs.jsx'))
const Compare = lazy(() => import('./pages/Compare.jsx'))
const Enrichment = lazy(() => import('./pages/Enrichment.jsx'))
const InoExplorer = lazy(() => import('./pages/InoExplorer.jsx'))
const Assistant = lazy(() => import('./pages/Assistant.jsx'))
const Report = lazy(() => import('./pages/Report.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Faqs = lazy(() => import('./pages/Faqs.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Links = lazy(() => import('./pages/Links.jsx'))
const Disclaimer = lazy(() => import('./pages/Disclaimer.jsx'))
const Acknowledgements = lazy(() => import('./pages/Acknowledgements.jsx'))
const Manual = lazy(() => import('./pages/Manual.jsx'))

function usePageTracking() {
  const location = useLocation()
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: '/ignet' + location.pathname + location.search,
      })
    }
  }, [location])
}

function App() {
  usePageTracking()
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dignet" element={<Dignet />} />
            <Route path="gene" element={<Gene />} />
            <Route path="genepair" element={<GenePair />} />
            <Route path="biosummarai" element={<BioSummarAI />} />
            <Route path="login" element={<Login />} />
            <Route path="analyze" element={<AnalyzeText />} />
            <Route path="explore" element={<Explore />} />
            <Route path="geneset" element={<GeneSet />} />
            <Route path="compare" element={<Compare />} />
            <Route path="enrichment" element={<Enrichment />} />
            <Route path="ino" element={<InoExplorer />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="report" element={<Report />} />
            <Route path="api-docs" element={<ApiDocs />} />
            <Route path="about" element={<About />} />
            <Route path="faqs" element={<Faqs />} />
            <Route path="contact" element={<Contact />} />
            <Route path="links" element={<Links />} />
            <Route path="disclaimer" element={<Disclaimer />} />
            <Route path="acknowledgements" element={<Acknowledgements />} />
            <Route path="manual" element={<Manual />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
