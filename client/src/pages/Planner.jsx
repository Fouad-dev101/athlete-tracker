import { useState, useEffect } from 'react'
import axios from 'axios'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function Planner({ token }) {
  const [plans, setPlans] = useState({})
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [workout, setWorkout] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState('')

  useEffect(() => {
    fetchPlans()
    generateAISuggestion()
  }, [])

  const fetchPlans = async () => {
    const headers = { Authorization: `Bearer ${token}` }
    const res = await axios.get('http://localhost:5000/api/plans', { headers })
    const plansMap = {}
    res.data.forEach(p => { plansMap[p.day] = p.plan })
    setPlans(plansMap)
  }

  const generateAISuggestion = async () => {
    const headers = { Authorization: `Bearer ${token}` }
    const workoutsRes = await axios.get('http://localhost:5000/api/workouts', { headers })
    const workouts = workoutsRes.data
    const lastWorkout = workouts[workouts.length - 1]
    
    if (!lastWorkout) {
      setAiSuggestion("Start with upper body strength training this week 💪")
    } else {
      const daysSince = (new Date() - new Date(lastWorkout.date)) / (1000 * 3600 * 24)
      if (daysSince > 3) {
        setAiSuggestion("You haven't trained in a while. Focus on light cardio and mobility first 🧘")
      } else if (lastWorkout.exercise.includes('Squat') || lastWorkout.exercise.includes('Deadlift')) {
        setAiSuggestion("Great leg day yesterday! Today focus on upper body and core 🔥")
      } else {
        setAiSuggestion("Add plyometrics and vertical jump training this week 🏀")
      }
    }
  }

  const savePlan = async () => {
    const headers = { Authorization: `Bearer ${token}` }
    await axios.post('http://localhost:5000/api/plans', { day: selectedDay, plan: workout }, { headers })
    setPlans({ ...plans, [selectedDay]: workout })
    alert('Plan saved!')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Weekly Training Planner</h1>
      
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-8">
        <p className="text-white text-sm opacity-90 mb-1">🤖 AI Suggestion</p>
        <p className="text-white text-xl font-bold">{aiSuggestion}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-3">Days</h2>
          <div className="space-y-2">
            {days.map(day => (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day)
                  setWorkout(plans[day] || '')
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${selectedDay === day ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                {day}
                {plans[day] && <span className="ml-2 text-xs text-green-400">✓</span>}
              </button>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">{selectedDay}</h2>
          <textarea
            value={workout}
            onChange={(e) => setWorkout(e.target.value)}
            placeholder="e.g., Squat 4x8, Bench 3x10, 20 min cardio, 10 sets vertical jumps..."
            className="w-full h-40 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white mb-4 focus:outline-none focus:border-blue-500"
          />
          <button onClick={savePlan} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition">
            Save Plan
          </button>
        </div>
      </div>
      
      <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Full Week Overview</h2>
        <div className="space-y-3">
          {days.map(day => (
            <div key={day} className="p-3 bg-gray-700 rounded-lg">
              <div className="font-bold text-blue-400">{day}</div>
              <div className="text-gray-300 text-sm mt-1">{plans[day] || 'No plan set'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}