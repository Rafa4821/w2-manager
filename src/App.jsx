import { AppRouter } from './router'
import { seedIfEmpty } from './shared/data/seedData'

// Register all templates before first render
import './templates'

// Seed on module load (before first render) — no effect needed
seedIfEmpty()

function App() {
  return <AppRouter />
}

export default App
