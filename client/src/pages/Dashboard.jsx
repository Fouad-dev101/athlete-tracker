import { useEffect, useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard({ token }) {
  const [workouts, setWorkouts] = useState([])
  const [metrics, setMetrics] = useState([])
  const [injuries, setInjuries] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` }
    const [workoutsRes, metricsRes, injuriesRes] = await Promise.all([
      axios.get('http://localhost:5000/api/workouts', { headers }),
      axios.get('http://localhost:5000/api/metrics', { headers }),
      axios.get('http://localhost:5000/api/injuries', { headers })
    ])
    setWorkouts(workoutsRes.data)
    setMetrics(metricsRes.data)
    setInjuries(injuriesRes.data)
  }

  const totalVolume = workouts.reduce((sum, w) => sum + (w.sets * w.reps * (w.weight || 0)), 0)
  const latestVert = metrics.filter(m => m.type === 'vertical').sort((a,b) => new Date(b.date) - new Date(a.date))[0]
  const activeInjuries = injuries.filter(i => i.status === 'active')

  const last5Workouts = [...workouts].slice(-5)

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Workouts</p>
          <p className="text-3xl font-bold text-white">{workouts.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Volume (lbs)</p>
          <p className="text-3xl font-bold text-white">{totalVolume.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Vertical Jump</p>
          <p className="text-3xl font-bold text-white">{latestVert ? `${latestVert.value}"` : 'N/A'}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm">Active Injuries</p>
          <p className="text-3xl font-bold text-red-500">{activeInjuries.length}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Recent Progress</h2>
        {last5Workouts.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last5Workouts.map(w => ({ name: w.exercise, weight: w.weight }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
              <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">Log some workouts to see progress!</p>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Recent Workouts</h2>
        {workouts.slice(-5).reverse().map((workout, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg mb-2">
            <div>
              <p className="text-white font-semibold">{workout.exercise}</p>
              <p className="text-gray-400 text-sm">{workout.sets} sets × {workout.reps} reps @ {workout.weight}lbs</p>
            </div>
            <p className="text-gray-400 text-sm">{new Date(workout.date).toLocaleDateString()}</p>
          </div>
        ))}
        {workouts.length === 0 && <p className="text-gray-400">No workouts logged yet</p>}
      </div>
    </div>
  )
}