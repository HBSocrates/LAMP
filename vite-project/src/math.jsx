import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MathGameApp from './pages/MathGameApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MathGameApp />
  </StrictMode>,
)
