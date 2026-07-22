import { Router } from 'express';
import db from '../db/connection.js';
import crypto from 'crypto';

const router = Router();

// GET /api/users
router.get('/', (req, res) => {
  const users = db.prepare('SELECT id, name, email, age, pregnancy_week, due_date, hospital, doctor, blood_type, allergies, created_at FROM users').all();
  res.json(users);
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT id, name, email, age, pregnancy_week, due_date, hospital, doctor, blood_type, allergies, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /api/users/register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, password are required' });
  }
  const password_hash = crypto.createHash('sha256').update(password).digest('hex');
  try {
    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
    ).run(name, email, password_hash);
    res.status(201).json({ id: result.lastInsertRowid, name, email });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// POST /api/users/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const password_hash = crypto.createHash('sha256').update(password).digest('hex');
  const user = db.prepare('SELECT id, name, email FROM users WHERE email = ? AND password_hash = ?').get(email, password_hash);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ message: 'Login successful', user });
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
  const { name, age, pregnancy_week, due_date, hospital, doctor, blood_type, allergies } = req.body;
  const result = db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      age = COALESCE(?, age),
      pregnancy_week = COALESCE(?, pregnancy_week),
      due_date = COALESCE(?, due_date),
      hospital = COALESCE(?, hospital),
      doctor = COALESCE(?, doctor),
      blood_type = COALESCE(?, blood_type),
      allergies = COALESCE(?, allergies),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, age, pregnancy_week, due_date, hospital, doctor, blood_type, allergies, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ id: req.params.id, message: 'Profile updated successfully' });
});

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User deleted successfully' });
});

export default router;
