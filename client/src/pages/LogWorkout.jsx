import { useState } from 'react'
import axios from 'axios'

export default function LogWorkout({ token }) {
  const [exercise, setExercise] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [verticalJump, setVerticalJump] = useState('')
  const [speed, setSpeed] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const headers = { Authorization: `Bearer ${token}` }
    const date = new Date().toISOString()
    
    if (exercise && sets && reps) {
      await axios.post('http://localhost:5000/api/workouts', 
        { exercise, sets: parseInt(sets), reps: parseInt(reps), weight: parseInt(weight) || 0, date }, 
        { headers }
      )
    }
    
    if (verticalJump) {
      await axios.post('http://localhost:5000/api/metrics',
        { type: 'vertical', value: parseInt(verticalJump), date },
        { headers }
      )
    }
    
    if (speed) {
      await axios.post('http://localhost:5000/api/metrics',
        { type: 'speed', value: parseFloat(speed), date },
        { headers }
      )
    }
    
    alert('Workout logged! 🔥')
    setExercise('')
    setSets('')
    setReps('')
    setWeight('')
    setVerticalJump('')
    setSpeed('')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Log Workout</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">💪 Strength Training</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Exercise</label>
              <select value={exercise} onChange={(e) => setExercise(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white">
                <option value="">Select exercise</option>
                <option>Squat</option>
                <option>Bench Press</option>
                <option>Deadlift</option>
                <option>Pull Ups</option>
                <option>Push Ups</option>
                <option>Lunges</option>
                <option>Shoulder Press</option>
                <option>Rows</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Sets</label>
              <input type="number" value={sets} onChange={(e) => setSets(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Reps</label>
              <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Weight (lbs)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">🏀 Basketball Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Vertical Jump (inches)</label>
              <input type="number" value={verticalJump} onChange={(e) => setVerticalJump(e.target.value)} placeholder="e.g., 28" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Speed (3/4 court sprint seconds)</label>
              <input type="number" step="0.01" value={speed} onChange={(e) => setSpeed(e.target.value)} placeholder="e.g., 3.2" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
            </div>
          </div>
        </div>
        
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
          LOG WORKOUT 🔥
        </button>
      </form>
    </div>
  )
}