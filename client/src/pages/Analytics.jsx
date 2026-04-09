import { useEffect, useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Download } from 'lucide-react'

export default function Analytics({ token }) {
  const [workouts, setWorkouts] = useState([])
  const [metrics, setMetrics] = useState([])
  const [selectedExercise, setSelectedExercise] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` }
    const [workoutsRes, metricsRes] = await Promise.all([
      axios.get('http://localhost:5000/api/workouts', { headers }),
      axios.get('http://localhost:5000/api/metrics', { headers })
    ])
    setWorkouts(workoutsRes.data)
    setMetrics(metricsRes.data)
    if (workoutsRes.data.length > 0) setSelectedExercise(workoutsRes.data[0].exercise)
  }

  const exerciseData = workouts
    .filter(w => w.exercise === selectedExercise)
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .map(w => ({ date: new Date(w.date).toLocaleDateString(), weight: w.weight }))

  const verticalData = metrics
    .filter(m => m.type === 'vertical')
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .map(m => ({ date: new Date(m.date).toLocaleDateString(), inches: m.value }))

  const speedData = metrics
    .filter(m => m.type === 'speed')
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .map(m => ({ date: new Date(m.date).toLocaleDateString(), seconds: m.value }))

  const exportCSV = () => {
    let csv = "Exercise,Sets,Reps,Weight,Date\n"
    workouts.forEach(w => {
      csv += `${w.exercise},${w.sets},${w.reps},${w.weight},${w.date}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workout-data-${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition">
          <Download size={18} /> Export CSV
        </button>
      </div>
      
      {workouts.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <label className="text-gray-300 mr-4">Select Exercise:</label>
          <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white">
            {[...new Set(workouts.map(w => w.exercise))].map(ex => <option key={ex}>{ex}</option>)}
          </select>
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">📈 {selectedExercise || 'Exercise'} Progress</h2>
        {exerciseData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={exerciseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />
              <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={2} name="Weight (lbs)" />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-gray-400">No data available</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">🏀 Vertical Jump</h2>
          {verticalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={verticalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />
                <Line type="monotone" dataKey="inches" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400">No vertical jump data yet</p>}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">⚡ Speed (3/4 court)</h2>
          {speedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" reversed />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />
                <Line type="monotone" dataKey="seconds" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400">No speed data yet</p>}
        </div>
      </div>
    </div>
  )
}