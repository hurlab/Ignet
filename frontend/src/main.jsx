import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'
import { GeneSetProvider } from './GeneSetContext.jsx'
import { WorkspaceProvider } from './WorkspaceContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/ignet">
      <AuthProvider>
        <GeneSetProvider>
          <WorkspaceProvider>
            <App />
          </WorkspaceProvider>
        </GeneSetProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
