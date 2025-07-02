import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import WellnessPlanner from './WellnessPlanner.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WellnessPlanner />
  </StrictMode>,
)
