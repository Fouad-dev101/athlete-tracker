import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LogWorkout from './pages/LogWorkout'
import Analytics from './pages/Analytics'
import Planner from './pages/Planner'
import Injuries from './pages/Injuries'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  if (!token) {
    return <Login onLogin={setToken} />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900">
        <nav className="bg-gray-800 border-b border-gray-700 fixed w-full z-10 top-0">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xl">🏀 ATHLETE TRACKER</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => window.location.href='/'} className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-lg transition">Dashboard</button>
                <button onClick={() => window.location.href='/log'} className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-lg transition">Log</button>
                <button onClick={() => window.location.href='/analytics'} className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-lg transition">Analytics</button>
                <button onClick={() => window.location.href='/planner'} className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-lg transition">Planner</button>
                <button onClick={() => window.location.href='/injuries'} className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-lg transition">Injuries</button>
                <button onClick={() => { setToken(null); localStorage.clear(); window.location.href='/' }} className="text-red-400 hover:bg-gray-700 px-3 py-2 rounded-lg transition">Logout</button>
              </div>
            </div>
          </div>
        </nav>
        <div className="pt-20 pb-8 px-4">
          <Routes>
            <Route path="/" element={<Dashboard token={token} />} />
            <Route path="/log" element={<LogWorkout token={token} />} />
            <Route path="/analytics" element={<Analytics token={token} />} />
            <Route path="/planner" element={<Planner token={token} />} />
            <Route path="/injuries" element={<Injuries token={token} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App