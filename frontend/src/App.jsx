import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import NetworkSearch from './pages/NetworkSearch.jsx'
import Gene from './pages/Gene.jsx'
import GenePair from './pages/GenePair.jsx'
import BioSummarAI from './pages/BioSummarAI.jsx'
import Login from './pages/Login.jsx'
import AnalyzeText from './pages/AnalyzeText.jsx'
import Explore from './pages/Explore.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="network" element={<NetworkSearch />} />
        <Route path="gene" element={<Gene />} />
        <Route path="genepair" element={<GenePair />} />
        <Route path="biosummarai" element={<BioSummarAI />} />
        <Route path="login" element={<Login />} />
        <Route path="analyze" element={<AnalyzeText />} />
        <Route path="explore" element={<Explore />} />
      </Route>
    </Routes>
  )
}

export default App
