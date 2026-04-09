import { useState } from 'react'
import axios from 'axios'

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register'
      const payload = isLogin ? { email, password } : { email, password, name }
      const res = await axios.post(`http://localhost:5000${endpoint}`, payload)
      onLogin(res.data.token)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg w-96 border border-gray-700">
        <h1 className="text-3xl font-bold text-white text-center mb-6">🏀 ATHLETE TRACKER</h1>
        <h2 className="text-xl text-white mb-4">{isLogin ? 'Login' : 'Register'}</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-400 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 mb-3 text-white focus:outline-none focus:border-blue-500" 
              required 
            />
          )}
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 mb-3 text-white focus:outline-none focus:border-blue-500" 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 mb-4 text-white focus:outline-none focus:border-blue-500" 
            required 
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition mb-3">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-gray-400 hover:text-white text-sm transition">
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  )
}