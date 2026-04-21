import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()
        setHealth(data)
      } catch (err) {
        setError(err.message)
      }
    }

    fetchHealth()
  }, [])

  return (
    <main className="app">
      <h1>BKU Smart Parking IoT</h1>
      <p>Express + React foundation is ready.</p>

      <section className="card">
        <h2>Backend Health Check</h2>
        {!health && !error && <p>Checking API...</p>}

        {health && (
          <div>
            <p>Status: {health.status}</p>
            <p>Message: {health.message}</p>
            <p>Timestamp: {health.timestamp}</p>
          </div>
        )}

        {error && <p className="error">Failed to call backend: {error}</p>}
      </section>
    </main>
  )
}

export default App
