const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sqlite3 = require('sqlite3')
const { v4: uuidv4 } = require('uuid')

const app = express()
app.use(cors())
app.use(express.json())

// Database setup
const db = new sqlite3.Database('./athlete.db')

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    exercise TEXT,
    sets INTEGER,
    reps INTEGER,
    weight INTEGER,
    date DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS basketball_metrics (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    type TEXT,
    value REAL,
    date DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS injuries (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    body_part TEXT,
    severity INTEGER,
    description TEXT,
    status TEXT,
    date DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS weekly_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    day TEXT,
    plan TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`)
})

const JWT_SECRET = 'your_super_secret_key_change_this_in_production'

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' })
    req.userId = decoded.userId
    next()
  })
}

// ============ AUTH ROUTES ============
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const id = uuidv4()
  
  db.run('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
    [id, email, hashedPassword, name],
    (err) => {
      if (err) return res.status(400).json({ error: 'Email already exists' })
      const token = jwt.sign({ userId: id }, JWT_SECRET)
      res.json({ token, user: { id, email, name } })
    })
})

app.post('/api/login', (req, res) => {
  const { email, password } = req.body
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'User not found' })
    
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ error: 'Invalid password' })
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET)
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
  })
})

// ============ WORKOUT ROUTES ============
app.get('/api/workouts', verifyToken, (req, res) => {
  db.all('SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC', [req.userId], (err, rows) => {
    res.json(rows)
  })
})

app.post('/api/workouts', verifyToken, (req, res) => {
  const { exercise, sets, reps, weight, date } = req.body
  const id = uuidv4()
  
  db.run('INSERT INTO workouts (id, user_id, exercise, sets, reps, weight, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.userId, exercise, sets, reps, weight, date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ id, exercise, sets, reps, weight, date })
    })
})

// ============ BASKETBALL METRICS ============
app.get('/api/metrics', verifyToken, (req, res) => {
  db.all('SELECT * FROM basketball_metrics WHERE user_id = ? ORDER BY date DESC', [req.userId], (err, rows) => {
    res.json(rows)
  })
})

app.post('/api/metrics', verifyToken, (req, res) => {
  const { type, value, date } = req.body
  const id = uuidv4()
  
  db.run('INSERT INTO basketball_metrics (id, user_id, type, value, date) VALUES (?, ?, ?, ?, ?)',
    [id, req.userId, type, value, date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ id, type, value, date })
    })
})

// ============ INJURIES ============
app.get('/api/injuries', verifyToken, (req, res) => {
  db.all('SELECT * FROM injuries WHERE user_id = ? ORDER BY date DESC', [req.userId], (err, rows) => {
    res.json(rows)
  })
})

app.post('/api/injuries', verifyToken, (req, res) => {
  const { body_part, severity, description, status, date } = req.body
  const id = uuidv4()
  
  db.run('INSERT INTO injuries (id, user_id, body_part, severity, description, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.userId, body_part, severity, description, status, date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ id, body_part, severity, description, status, date })
    })
})

app.put('/api/injuries/:id', verifyToken, (req, res) => {
  const { status } = req.body
  db.run('UPDATE injuries SET status = ? WHERE id = ? AND user_id = ?',
    [status, req.params.id, req.userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    })
})

// ============ WEEKLY PLANS ============
app.get('/api/plans', verifyToken, (req, res) => {
  db.all('SELECT * FROM weekly_plans WHERE user_id = ?', [req.userId], (err, rows) => {
    res.json(rows)
  })
})

app.post('/api/plans', verifyToken, (req, res) => {
  const { day, plan } = req.body
  const id = uuidv4()
  
  db.run('INSERT OR REPLACE INTO weekly_plans (id, user_id, day, plan) VALUES (?, ?, ?, ?)',
    [id, req.userId, day, plan],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ id, day, plan })
    })
})

const PORT = 5000
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`))