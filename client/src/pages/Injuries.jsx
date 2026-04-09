import { useState, useEffect } from 'react'
import axios from 'axios'
import { AlertTriangle, CheckCircle } from 'lucide-react'

export default function Injuries({ token }) {
  const [injuries, setInjuries] = useState([])
  const [bodyPart, setBodyPart] = useState('')
  const [severity, setSeverity] = useState('3')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchInjuries()
  }, [])

  const fetchInjuries = async () => {
    const headers = { Authorization: `Bearer ${token}` }
    const res = await axios.get('http://localhost:5000/api/injuries', { headers })
    setInjuries(res.data)
  }

  const addInjury = async (e) => {
    e.preventDefault()
    const headers = { Authorization: `Bearer ${token}` }
    const date = new Date().toISOString()
    await axios.post('http://localhost:5000/api/injuries', 
      { body_part: bodyPart, severity: parseInt(severity), description, status: 'active', date }, 
      { headers }
    )
    fetchInjuries()
    setBodyPart('')
    setSeverity('3')
    setDescription('')
  }

  const markRecovered = async (id) => {
    const headers = { Authorization: `Bearer ${token}` }
    await axios.put(`http://localhost:5000/api/injuries/${id}`, { status: 'recovered' }, { headers })
    fetchInjuries()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Injury Tracker</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Report Injury</h2>
        <form onSubmit={addInjury} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Body Part</label>
              <select value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white">
                <option value="">Select</option>
                <option>Lower Back</option>
                <option>Elbow</option>
                <option>Knee</option>
                <option>Ankle</option>
                <option>Shoulder</option>
                <option>Hamstring</option>
                <option>Wrist</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Severity (1-5)</label>
              <input type="range" min="1" max="5" value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full" />
              <div className="text-center text-white mt-1">Severity: {severity} / 5</div>
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" rows="3" placeholder="How did it happen? Symptoms?" />
          </div>
          <button type="submit" className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold transition">
            Log Injury
          </button>
        </form>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Injury History</h2>
        <div className="space-y-3">
          {injuries.length === 0 && <p className="text-gray-400">No injuries logged. Stay healthy! 💪</p>}
          {injuries.map(injury => (
            <div key={injury.id} className={`p-4 rounded-lg border ${injury.status === 'active' ? 'bg-red-900/30 border-red-700' : 'bg-gray-700 border-gray-600'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    {injury.status === 'active' ? <AlertTriangle className="text-red-500" size={18} /> : <CheckCircle className="text-green-500" size={18} />}
                    <span className="font-bold text-white">{injury.body_part}</span>
                    <span className="text-sm text-gray-400">Severity {injury.severity}/5</span>
                  </div>
                  <p className="text-gray-300 mt-1">{injury.description}</p>
                  <p className="text-gray-500 text-sm mt-1">{new Date(injury.date).toLocaleDateString()}</p>
                </div>
                {injury.status === 'active' && (
                  <button onClick={() => markRecovered(injury.id)} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition">
                    Recovered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}