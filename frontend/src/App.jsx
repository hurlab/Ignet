import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
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
const ApiDocs = lazy(() => import('./pages/ApiDocs.jsx'))

function App() {
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
            <Route path="api-docs" element={<ApiDocs />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
