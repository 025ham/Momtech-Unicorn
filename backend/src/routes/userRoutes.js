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

  // Build dynamic update query - only update fields that are explicitly provided
  const fields = [];
  const values = [];

  if (name !== undefined) { fields.push('name = ?'); values.push(name); }
  if (age !== undefined) { fields.push('age = ?'); values.push(age); }
  if (pregnancy_week !== undefined) { fields.push('pregnancy_week = ?'); values.push(pregnancy_week); }
  if (due_date !== undefined) { fields.push('due_date = ?'); values.push(due_date); }
  if (hospital !== undefined) { fields.push('hospital = ?'); values.push(hospital); }
  if (doctor !== undefined) { fields.push('doctor = ?'); values.push(doctor); }
  if (blood_type !== undefined) { fields.push('blood_type = ?'); values.push(blood_type); }
  if (allergies !== undefined) { fields.push('allergies = ?'); values.push(allergies); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);

  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  const result = db.prepare(query).run(...values);
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
