import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
