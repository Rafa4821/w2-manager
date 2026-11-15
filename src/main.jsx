import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initStorage } from './shared/persistence'
import { seedIfEmpty } from './shared/data/seedData'

// Initialize IndexedDB storage, then seed if empty, then render
initStorage().then(() => {
  seedIfEmpty()
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
